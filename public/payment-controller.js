// ==========================================
// REGAL AQUA - PAYMENT CONTROLLER & HELPERS
// ==========================================

class PaymentController {
    constructor() {
        this.selectedMethod = 'mpesa';
        this.currentOrder = null;
        this.paymentStatusInterval = null;
        this.notificationTimer = null;
    }

    selectPayment(method) {
        if (!method) {
            return;
        }

        this.selectedMethod = method;

        document.querySelectorAll('.payment-method').forEach((el) => {
            el.classList.remove('selected');
        });

        document.querySelectorAll('.payment-check').forEach((el) => {
            el.style.display = 'none';
        });

        document.querySelectorAll('.payment-method').forEach((el) => {
            const title = el.querySelector('h4')?.textContent.toLowerCase() || '';
            const matchesMethod =
                (method === 'mpesa' && title.includes('m-pesa')) ||
                (method === 'bank' && title.includes('bank'));

            if (matchesMethod) {
                el.classList.add('selected');
                const check = el.querySelector('.payment-check');
                if (check) {
                    check.style.display = 'flex';
                }
            }
        });

        const mpesaForm = document.getElementById('mpesaForm');
        const bankForm = document.getElementById('bankForm');

        if (mpesaForm) {
            mpesaForm.style.display = method === 'mpesa' ? 'block' : 'none';
        }

        if (bankForm) {
            bankForm.style.display = method === 'bank' ? 'block' : 'none';
        }
    }

    validatePhoneNumber(phone) {
        let cleaned = String(phone || '').trim().replace(/[^\d+]/g, '');

        if (cleaned.startsWith('+254')) {
            cleaned = cleaned.substring(1);
        }

        if (cleaned.startsWith('0')) {
            cleaned = '254' + cleaned.substring(1);
        } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
            cleaned = '254' + cleaned;
        } else if (!cleaned.startsWith('254')) {
            return { valid: false, error: 'Phone number must start with +254, 254, 07, or 7' };
        }

        if (!/^254[0-9]{9}$/.test(cleaned)) {
            return {
                valid: false,
                error: 'Invalid phone number format. Use +254XXXXXXXXX, 254XXXXXXXXX, 07XXXXXXXX, or 7XXXXXXXX'
            };
        }

        return { valid: true, phone: cleaned };
    }

    validateAmount(amount) {
        const num = Number(amount);

        if (!Number.isFinite(num)) {
            return { valid: false, error: 'Amount must be a number' };
        }

        if (!Number.isInteger(num)) {
            return { valid: false, error: 'Amount must be a whole number' };
        }

        if (num < 1) {
            return { valid: false, error: 'Amount must be at least KSH 1' };
        }

        if (num > 150000) {
            return { valid: false, error: 'Maximum amount is KSH 150,000' };
        }

        return { valid: true, amount: num };
    }

    generateOrderId() {
        return 'RA-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
    }

    getCartTotal() {
        if (!Array.isArray(window.cart)) {
            return 0;
        }

        return window.cart.reduce((sum, item) => {
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 0;
            return sum + (price * quantity);
        }, 0);
    }

    syncPaymentAmounts() {
        const total = Math.round(this.getCartTotal());
        const value = total > 0 ? String(total) : '';

        const mpesaAmount = document.getElementById('mpesaAmount');
        const bankAmount = document.getElementById('bankAmount');

        if (mpesaAmount && !mpesaAmount.dataset.userEdited) {
            mpesaAmount.value = value;
        }

        if (bankAmount && !bankAmount.dataset.userEdited) {
            bankAmount.value = value;
        }
    }

    extractAmount(fieldId) {
        const field = document.getElementById(fieldId);
        const rawValue = field?.value || '';
        const cleaned = rawValue.replace(/[^0-9]/g, '');
        return cleaned ? Number(cleaned) : NaN;
    }

    async initiateMpesaPayment() {
        try {
            const phoneField = document.getElementById('mpesaPhone');
            const amountField = document.getElementById('mpesaAmount');
            const button = document.getElementById('mpesaBtn');
            const phoneInput = phoneField?.value || '';
            const amount = this.extractAmount('mpesaAmount');

            const phoneValidation = this.validatePhoneNumber(phoneInput);
            if (!phoneValidation.valid) {
                this.showError(phoneValidation.error);
                return;
            }

            const amountValidation = this.validateAmount(amount);
            if (!amountValidation.valid) {
                this.showError(amountValidation.error);
                return;
            }

            if (!Array.isArray(window.cart) || window.cart.length === 0) {
                this.showError('Your cart is empty. Add items before paying.');
                return;
            }

            const orderId = this.generateOrderId();
            this.currentOrder = {
                orderId,
                phone: phoneValidation.phone,
                amount: amountValidation.amount,
                method: 'M-Pesa',
                items: [...window.cart],
                createdAt: new Date().toISOString()
            };

            this.showLoading('Sending payment request...');

            const response = await fetch('/api/payment/mpesa/stkpush', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': this.getCsrfToken()
                },
                body: JSON.stringify({
                    phoneNumber: phoneValidation.phone,
                    amount: amountValidation.amount,
                    orderId,
                    description: `Regal Aqua Order ${orderId.slice(0, 12)}`
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.details || data.error || 'Payment initiation failed');
            }

            this.currentOrder.checkoutRequestId = data.checkoutRequestId;
            localStorage.setItem('currentOrder', JSON.stringify(this.currentOrder));

            this.showSuccess(
                'Payment Prompt Sent',
                data.mock
                    ? 'Sandbox mode is active. A test confirmation is being simulated.'
                    : 'Check your phone and enter your M-Pesa PIN to complete payment.'
            );

            // Start 60-second timer for PIN entry
            if (typeof startMpesaTimer === 'function') {
                startMpesaTimer();
            }

            if (phoneField) {
                phoneField.disabled = true;
                phoneField.value = phoneValidation.phone;
            }

            if (amountField) {
                amountField.disabled = true;
                amountField.value = String(amountValidation.amount);
            }

            if (button) {
                button.disabled = true;
            }

            this.pollPaymentStatus(data.checkoutRequestId);
        } catch (error) {
            console.error('M-Pesa Error:', error);
            this.showError('Payment Error', error.message);
            this.resetPaymentForm();
        }
    }

    async pollPaymentStatus(checkoutRequestId) {
        let attempts = 0;
        const maxAttempts = 120;

        if (this.paymentStatusInterval) {
            clearInterval(this.paymentStatusInterval);
        }

        this.paymentStatusInterval = setInterval(async () => {
            attempts += 1;

            if (attempts > maxAttempts) {
                clearInterval(this.paymentStatusInterval);
                this.paymentStatusInterval = null;
                this.showWarning(
                    'Payment confirmation timeout',
                    'Check your M-Pesa messages. Contact us if payment was deducted.'
                );
                this.resetPaymentForm();
                return;
            }

            try {
                const response = await fetch(`/api/payment/status/${checkoutRequestId}`);
                const data = await response.json();

                if (!response.ok || !data.success) {
                    return;
                }

                if (data.status === 'completed') {
                    this.handlePaymentSuccess(data);
                } else if (data.status === 'failed') {
                    this.handlePaymentFailure(data);
                }
            } catch (error) {
                console.error('Status check error:', error);
            }
        }, 5000);
    }

    handlePaymentSuccess(paymentData) {
        if (this.paymentStatusInterval) {
            clearInterval(this.paymentStatusInterval);
            this.paymentStatusInterval = null;
        }

        // Call M-Pesa success feedback UI
        if (typeof mpesaPaymentSuccess === 'function') {
            mpesaPaymentSuccess();
        }

        window.cart = [];
        if (typeof updateCart === 'function') {
            updateCart();
        }

        localStorage.removeItem('currentOrder');

        const modal = document.createElement('div');
        modal.className = 'payment-success-modal';

        const amount = paymentData.amountPaid || paymentData.amount || 0;
        const orderId = paymentData.orderId || this.currentOrder?.orderId || 'Regal Aqua order';
        const receipt = paymentData.mpesaReceipt || paymentData.orderTrackingId || 'Pending reference';

        modal.innerHTML = `
            <div class="payment-success-card">
                <div class="payment-success-hero">
                    <div class="payment-success-ring">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="payment-success-eyebrow">Order Confirmed</div>
                    <h2 class="payment-success-title">Congratulations, your payment was successful.</h2>
                    <p class="payment-success-copy">Thank you for trusting Regal Aqua. Your order is now confirmed and our team can proceed with delivery preparation immediately.</p>
                </div>
                <div class="payment-success-body">
                    <div class="payment-success-grid">
                        <div class="payment-success-stat">
                            <span>Receipt</span>
                            <strong>${receipt}</strong>
                        </div>
                        <div class="payment-success-stat">
                            <span>Amount</span>
                            <strong>KSH ${amount}</strong>
                        </div>
                        <div class="payment-success-stat">
                            <span>Order ID</span>
                            <strong>${orderId}</strong>
                        </div>
                        <div class="payment-success-stat">
                            <span>Status</span>
                            <strong>Paid and verified</strong>
                        </div>
                    </div>
                    <div class="payment-success-trust">
                        <i class="fas fa-shield-alt"></i>
                        <span>Your transaction has been recorded successfully. You can continue shopping with confidence.</span>
                    </div>
                    <div class="payment-success-actions">
                        <button type="button" class="payment-success-btn">Continue Shopping</button>
                        <button type="button" class="payment-success-ghost">Close</button>
                    </div>
                </div>
            </div>
        `;

        const [continueButton, closeButton] = modal.querySelectorAll('button');
        continueButton.addEventListener('click', () => {
            modal.remove();
            window.location.href = '/';
        });
        closeButton.addEventListener('click', () => {
            modal.remove();
        });

        document.body.appendChild(modal);
        if (typeof replaceIconsWithSVG === 'function') {
            replaceIconsWithSVG();
        }

        if (typeof showNotification === 'function') {
            showNotification('Payment confirmed. Your Regal Aqua order has been recorded.');
        }

        this.resetPaymentForm();
    }

    handlePaymentFailure(data) {
        if (this.paymentStatusInterval) {
            clearInterval(this.paymentStatusInterval);
            this.paymentStatusInterval = null;
        }

        // Call M-Pesa failure feedback UI
        if (typeof mpesaPaymentFailed === 'function') {
            mpesaPaymentFailed();
        }

        localStorage.removeItem('currentOrder');
        this.showError('Payment Failed', data.failureReason || 'Unknown error');
        this.resetPaymentForm();
    }

    async initiateBankPayment() {
        try {
            const email = document.getElementById('bankEmail')?.value.trim() || '';
            const name = document.getElementById('bankName')?.value.trim() || '';
            const amount = this.extractAmount('bankAmount');

            if (!email || !name || Number.isNaN(amount)) {
                this.showError('Please fill all required fields');
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                this.showError('Please enter a valid email address');
                return;
            }

            const amountValidation = this.validateAmount(amount);
            if (!amountValidation.valid) {
                this.showError(amountValidation.error);
                return;
            }

            if (!Array.isArray(window.cart) || window.cart.length === 0) {
                this.showError('Your cart is empty');
                return;
            }

            const orderId = this.generateOrderId();
            const nameParts = name.split(/\s+/).filter(Boolean);
            const phoneValidation = this.validatePhoneNumber(document.getElementById('mpesaPhone')?.value || '');
            const customerPhone = phoneValidation.valid ? phoneValidation.phone : '254700000000';

            this.showLoading('Redirecting to secure payment...');

            const response = await fetch('/api/payment/bank/pesapal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orderId,
                    amount: amountValidation.amount,
                    email,
                    firstName: nameParts[0] || 'Customer',
                    lastName: nameParts.slice(1).join(' ') || 'Customer',
                    phoneNumber: customerPhone,
                    description: 'Regal Aqua Water Purchase'
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success || !data.redirectUrl) {
                throw new Error(data.details || data.error || 'Failed to initiate payment');
            }

            localStorage.setItem('pendingBankOrder', JSON.stringify({
                orderId,
                amount: amountValidation.amount,
                trackingId: data.orderTrackingId,
                redirectUrl: data.redirectUrl
            }));

            window.location.href = data.redirectUrl;
        } catch (error) {
            console.error('Bank Payment Error:', error);
            this.showError('Payment Error', error.message);
        }
    }

    showError(message, details = '') {
        this.renderNotification('error', message, details, 5000);
    }

    showSuccess(title, message) {
        this.renderNotification('success', title, message, 5000);
    }

    showWarning(title, message) {
        this.renderNotification('warning', title, message, 5000);
    }

    showLoading(message) {
        this.renderNotification('loading', 'Processing payment', message, 0);
    }

    resetPaymentForm() {
        const phone = document.getElementById('mpesaPhone');
        const amount = document.getElementById('mpesaAmount');
        const button = document.getElementById('mpesaBtn');

        if (phone) {
            phone.disabled = false;
        }

        if (amount) {
            amount.disabled = false;
        }

        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-paper-plane"></i> Request M-Pesa Prompt';
        }

        this.syncPaymentAmounts();
    }

    createNotification() {
        const notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-icon"><i class="fas fa-check-circle"></i></div>
            <div class="notification-content">
                <strong class="notification-title"></strong>
                <span class="notification-message"></span>
            </div>
        `;
        document.body.appendChild(notification);
        return notification;
    }

    renderNotification(type, title, message, timeout) {
        const notification = document.getElementById('notification') || this.createNotification();
        const titleEl = notification.querySelector('.notification-title');
        const messageEl = notification.querySelector('.notification-message');
        const iconEl = notification.querySelector('.notification-icon');

        notification.classList.remove('success', 'error', 'warning', 'loading');
        notification.classList.add(type, 'show');

        if (titleEl) {
            titleEl.textContent = title;
        }

        if (messageEl) {
            messageEl.textContent = message || '';
        }

        if (iconEl) {
            const iconClass = type === 'error'
                ? 'fas fa-times'
                : type === 'warning'
                    ? 'fas fa-bolt'
                    : type === 'loading'
                        ? 'fas fa-mobile-alt'
                        : 'fas fa-check-circle';
            iconEl.innerHTML = `<i class="${iconClass}"></i>`;
        }

        if (typeof replaceIconsWithSVG === 'function') {
            replaceIconsWithSVG();
        }

        if (this.notificationTimer) {
            clearTimeout(this.notificationTimer);
            this.notificationTimer = null;
        }

        if (timeout > 0) {
            this.notificationTimer = setTimeout(() => {
                notification.classList.remove('show');
            }, timeout);
        }
    }

    getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]')?.content || '';
    }
}

const paymentController = new PaymentController();

function selectPayment(method) {
    paymentController.selectPayment(method);
}

function initiateMpesaPayment() {
    paymentController.initiateMpesaPayment();
}

function initiateBankPayment() {
    paymentController.initiateBankPayment();
}

function validatePhone(input) {
    const validation = paymentController.validatePhoneNumber(input.value);
    if (validation.valid) {
        input.style.borderColor = '#00ff00';
        input.value = validation.phone;
    } else {
        input.style.borderColor = 'var(--glass-border)';
    }
}

function validateAmount(input) {
    const cleaned = input.value.replace(/[^0-9]/g, '');
    input.value = cleaned;
    input.dataset.userEdited = cleaned ? 'true' : '';

    if (!cleaned) {
        input.style.borderColor = 'var(--glass-border)';
        return;
    }

    const validation = paymentController.validateAmount(Number(cleaned));
    input.style.borderColor = validation.valid ? '#00ff00' : '#ff4444';
}

window.addEventListener('load', () => {
    paymentController.syncPaymentAmounts();

    const pendingOrder = localStorage.getItem('pendingBankOrder');
    const params = new URLSearchParams(window.location.search);

    if (params.get('payment') === 'bank-success') {
        const orderId = params.get('orderId');
        localStorage.removeItem('pendingBankOrder');
        if (typeof showNotification === 'function') {
            showNotification(`Bank payment received for order ${orderId || ''}`.trim());
        }
    } else if (params.get('payment') === 'bank-error') {
        localStorage.removeItem('pendingBankOrder');
        paymentController.showError('Bank payment could not be completed');
    }

    if (pendingOrder) {
        const order = JSON.parse(pendingOrder);
        if (!params.get('payment') && typeof showNotification === 'function') {
            showNotification(`Order ${order.orderId} redirected to secure payment.`);
        }
    }
});
