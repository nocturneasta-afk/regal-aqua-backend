// Shared auth flow for standalone login/signup pages.
(function () {
    const apiBaseUrl = window.location.origin;
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const passwordField = document.getElementById(signupForm ? 'signupPassword' : 'loginPassword');
    const pageConfig = signupForm
        ? {
            type: 'signup',
            submitButtonId: 'signupBtn',
            submitLabel: 'Create Account',
            submitLoadingLabel: 'Creating account...',
            successRedirect: 'index.html'
        }
        : {
            type: 'login',
            submitButtonId: 'loginBtn',
            submitLabel: 'Login to Account',
            submitLoadingLabel: 'Logging in...',
            successRedirect: 'index.html'
        };

    let otpState = null;
    let otpExpiryTimer = null;
    let otpResendTimer = null;
    const pendingGooglePhoneKey = 'regalAquaPendingGooglePhone';

    function getGoogleButton() {
        return document.getElementById('googleBtn') || document.querySelector('.btn-google');
    }

    function showError(message) {
        const errorMsg = document.getElementById('errorMsg');
        const errorText = document.getElementById('errorText');

        if (errorMsg && errorText) {
            errorText.textContent = message;
            errorMsg.style.display = 'flex';
        } else {
            window.alert(message);
        }
    }

    function hideError() {
        const errorMsg = document.getElementById('errorMsg');
        if (errorMsg) {
            errorMsg.style.display = 'none';
        }
    }

    function setButtonLoading(button, isLoading, loadingLabel, defaultLabel, defaultHtml) {
        if (!button) return;

        if (isLoading) {
            button.disabled = true;
            button.dataset.originalHtml = defaultHtml || button.innerHTML;
            button.textContent = loadingLabel;
            return;
        }

        button.disabled = false;
        if (defaultHtml) {
            button.innerHTML = defaultHtml;
        } else if (button.dataset.originalHtml) {
            button.innerHTML = button.dataset.originalHtml;
        } else {
            button.textContent = defaultLabel;
        }
    }

    function saveAuth(token, user) {
        if (window.secureStorage) {
            secureStorage.setToken(token);
            secureStorage.setUser(user);
        }

        localStorage.setItem('regalAquaAuth', JSON.stringify({ token, user }));
    }

    function clearAuth() {
        if (window.secureStorage) {
            secureStorage.removeSecure('auth_token');
            secureStorage.removeSecure('user_data');
        }
        localStorage.removeItem('regalAquaAuth');
    }

    function splitName(fullName) {
        const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
        const firstName = parts.shift() || '';
        const lastName = parts.join(' ') || 'User';
        return { firstName, lastName };
    }

    function normalizePhone(phone) {
        const cleaned = String(phone || '').replace(/[^\d+]/g, '');
        if (/^0\d{9}$/.test(cleaned)) return cleaned;
        if (/^254\d{9}$/.test(cleaned)) return cleaned;
        if (/^\+254\d{9}$/.test(cleaned)) return cleaned;
        return '';
    }

    function getSignupPhoneValue() {
        const signupPhoneInput = document.getElementById('signupPhone');
        return signupPhoneInput ? normalizePhone(signupPhoneInput.value.trim()) : '';
    }

    function getFriendlyFirebaseError(error) {
        if (typeof window.handleFirebaseError === 'function') {
            return window.handleFirebaseError(error);
        }
        return error && error.message ? error.message : 'Authentication failed. Please try again.';
    }

    async function fetchJson(url, options) {
        const response = await fetch(url, options);
        const data = await response.json().catch(() => ({
            success: false,
            error: 'Unexpected server response'
        }));

        if (!response.ok && !data.success) {
            return data;
        }

        return data;
    }

    async function verifyExistingSession() {
        let token = window.secureStorage ? secureStorage.getToken() : null;
        let user = window.secureStorage ? secureStorage.getUser() : null;

        if (!token) {
            const stored = localStorage.getItem('regalAquaAuth');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    token = parsed.token;
                    user = parsed.user;
                } catch (error) {
                    clearAuth();
                }
            }
        }

        if (!token || !user) return;

        try {
            const response = await fetch(`${apiBaseUrl}/api/auth/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                window.location.href = pageConfig.successRedirect;
            } else {
                clearAuth();
            }
        } catch (error) {
            clearAuth();
        }
    }

    function ensureOtpModal() {
        if (document.getElementById('otpModal')) return;

        const modal = document.createElement('div');
        modal.id = 'otpModal';
        modal.className = 'otp-modal';
        modal.innerHTML = `
            <div class="otp-dialog">
                <button type="button" class="otp-close" id="otpCloseBtn" aria-label="Close verification dialog">&times;</button>
                <h3>Verify Your Email</h3>
                <p class="otp-copy">Enter the 6-digit code sent to <span id="otpEmail"></span></p>
                <form id="otpForm">
                    <div class="otp-inputs">
                        <input type="text" id="otp1" maxlength="1" inputmode="numeric" autocomplete="one-time-code">
                        <input type="text" id="otp2" maxlength="1" inputmode="numeric">
                        <input type="text" id="otp3" maxlength="1" inputmode="numeric">
                        <input type="text" id="otp4" maxlength="1" inputmode="numeric">
                        <input type="text" id="otp5" maxlength="1" inputmode="numeric">
                        <input type="text" id="otp6" maxlength="1" inputmode="numeric">
                    </div>
                    <div class="otp-meta">
                        <span>Code expires in <strong id="otpTimer">15:00</strong></span>
                        <button type="button" class="otp-link" id="otpResendBtn">Resend code</button>
                    </div>
                    <p class="otp-help" id="otpHelpText"></p>
                    <button type="submit" class="btn-auth otp-submit" id="otpSubmitBtn">Verify Email</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const style = document.createElement('style');
        style.textContent = `
            .otp-modal {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.72);
                z-index: 9999;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .otp-dialog {
                width: 100%;
                max-width: 420px;
                background: linear-gradient(145deg, #0f1f3d 0%, #1a2d4d 100%);
                border: 1px solid rgba(212, 175, 55, 0.3);
                border-radius: 24px;
                padding: 32px 28px;
                position: relative;
                box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
                color: #e0e0e0;
            }

            .otp-dialog h3 {
                color: #D4AF37;
                margin-bottom: 10px;
                text-align: center;
            }

            .otp-copy {
                color: #a9b3c7;
                text-align: center;
                margin-bottom: 24px;
                font-size: 14px;
            }

            .otp-close {
                position: absolute;
                right: 16px;
                top: 12px;
                background: none;
                border: none;
                color: #D4AF37;
                font-size: 28px;
                cursor: pointer;
            }

            .otp-inputs {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                gap: 10px;
                margin-bottom: 18px;
            }

            .otp-inputs input {
                width: 100%;
                text-align: center;
                font-size: 20px;
                font-weight: 700;
                padding: 14px 0;
                border-radius: 12px;
                border: 1px solid rgba(212, 175, 55, 0.25);
                background: rgba(255, 255, 255, 0.06);
                color: #fff;
                outline: none;
            }

            .otp-inputs input:focus {
                border-color: #D4AF37;
                box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
            }

            .otp-meta {
                display: flex;
                justify-content: space-between;
                gap: 12px;
                align-items: center;
                margin-bottom: 14px;
                font-size: 13px;
                color: #a9b3c7;
            }

            .otp-link {
                background: none;
                border: none;
                color: #D4AF37;
                cursor: pointer;
                padding: 0;
                font-weight: 600;
            }

            .otp-link:disabled {
                color: #74819a;
                cursor: not-allowed;
            }

            .otp-help {
                min-height: 20px;
                margin-bottom: 14px;
                font-size: 13px;
                color: #a9b3c7;
            }

            .otp-help.error {
                color: #ff8a8a;
            }

            .otp-submit {
                width: 100%;
            }
        `;
        document.head.appendChild(style);

        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeOtpModal();
            }
        });

        document.getElementById('otpCloseBtn').addEventListener('click', closeOtpModal);
        document.getElementById('otpForm').addEventListener('submit', handleOtpVerification);
        document.getElementById('otpResendBtn').addEventListener('click', resendOtp);

        for (let index = 1; index <= 6; index += 1) {
            const input = document.getElementById(`otp${index}`);
            input.addEventListener('input', () => {
                input.value = input.value.replace(/\D/g, '').slice(0, 1);
                if (input.value && index < 6) {
                    document.getElementById(`otp${index + 1}`).focus();
                }
            });

            input.addEventListener('keydown', (event) => {
                if (event.key === 'Backspace' && !input.value && index > 1) {
                    document.getElementById(`otp${index - 1}`).focus();
                }
            });
        }
    }

    function openOtpModal(email) {
        ensureOtpModal();
        document.getElementById('otpEmail').textContent = email;
        document.getElementById('otpHelpText').textContent = 'Check your inbox and spam folder for the code.';
        document.getElementById('otpHelpText').className = 'otp-help';
        document.getElementById('otpModal').style.display = 'flex';
        clearOtpInputs();
        startOtpTimer();
        startResendCooldown();
        setTimeout(() => document.getElementById('otp1').focus(), 50);
    }

    function closeOtpModal() {
        const modal = document.getElementById('otpModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    function clearOtpInputs() {
        for (let index = 1; index <= 6; index += 1) {
            const input = document.getElementById(`otp${index}`);
            if (input) input.value = '';
        }
    }

    function getOtpValue() {
        const values = [];
        for (let index = 1; index <= 6; index += 1) {
            values.push((document.getElementById(`otp${index}`)?.value || '').trim());
        }
        return values.join('');
    }

    function startOtpTimer() {
        const timer = document.getElementById('otpTimer');
        let remaining = 15 * 60;

        if (otpExpiryTimer) clearInterval(otpExpiryTimer);

        const render = () => {
            const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
            const seconds = String(remaining % 60).padStart(2, '0');
            timer.textContent = `${minutes}:${seconds}`;
            remaining -= 1;

            if (remaining < 0) {
                clearInterval(otpExpiryTimer);
                timer.textContent = 'Expired';
                setOtpHelp('The verification code expired. Request a new one.', true);
            }
        };

        render();
        otpExpiryTimer = setInterval(render, 1000);
    }

    function startResendCooldown() {
        const resendButton = document.getElementById('otpResendBtn');
        let remaining = 60;

        resendButton.disabled = true;
        resendButton.textContent = `Resend in ${remaining}s`;

        if (otpResendTimer) clearInterval(otpResendTimer);

        otpResendTimer = setInterval(() => {
            remaining -= 1;
            if (remaining <= 0) {
                clearInterval(otpResendTimer);
                resendButton.disabled = false;
                resendButton.textContent = 'Resend code';
                return;
            }
            resendButton.textContent = `Resend in ${remaining}s`;
        }, 1000);
    }

    function setOtpHelp(message, isError) {
        const helpText = document.getElementById('otpHelpText');
        helpText.textContent = message;
        helpText.className = isError ? 'otp-help error' : 'otp-help';
    }

    async function handleOtpVerification(event) {
        event.preventDefault();

        if (!otpState) {
            setOtpHelp('Your verification session expired. Start again.', true);
            return;
        }

        const otp = getOtpValue();
        if (otp.length !== 6) {
            setOtpHelp('Enter the full 6-digit code.', true);
            return;
        }

        const verifyButton = document.getElementById('otpSubmitBtn');
        setButtonLoading(verifyButton, true, 'Verifying...', 'Verify Email');

        try {
            const data = await fetchJson(`${apiBaseUrl}/api/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: otpState.userId,
                    email: otpState.email,
                    otp
                })
            });

            if (!data.success) {
                setOtpHelp(data.error || 'Verification failed. Please try again.', true);
                return;
            }

            saveAuth(data.token, data.user);
            window.location.href = pageConfig.successRedirect;
        } catch (error) {
            setOtpHelp('Verification failed. Please try again.', true);
        } finally {
            setButtonLoading(verifyButton, false, '', 'Verify Email');
        }
    }

    async function resendOtp() {
        if (!otpState) {
            setOtpHelp('Start the signup flow again to request a new code.', true);
            return;
        }

        try {
            const data = await fetchJson(`${apiBaseUrl}/api/auth/resend-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: otpState.email
                })
            });

            if (!data.success) {
                setOtpHelp(data.error || 'Unable to resend the code.', true);
                return;
            }

            clearOtpInputs();
            startOtpTimer();
            startResendCooldown();
            setOtpHelp('A new verification code has been sent.', false);
        } catch (error) {
            setOtpHelp('Unable to resend the code right now.', true);
        }
    }

    function validateStrongPassword(password) {
        return (
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
        );
    }

    async function handleSignup(event) {
        event.preventDefault();
        hideError();

        const submitButton = document.getElementById(pageConfig.submitButtonId);
        const fullName = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const phone = document.getElementById('signupPhone').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirm').value;
        const terms = document.getElementById('terms');

        if (!fullName || !email || !password || !confirmPassword) {
            showError('Please fill in all required fields.');
            return;
        }

        if (!normalizePhone(phone)) {
            showError('Please enter a valid Safaricom phone number such as 0712345678 or 254712345678.');
            return;
        }

        if (terms && !terms.checked) {
            showError('Please accept the terms to continue.');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match.');
            return;
        }

        if (!validateStrongPassword(password)) {
            showError('Use at least 8 characters with uppercase, lowercase, number, and special character.');
            return;
        }

        const { firstName, lastName } = splitName(fullName);
        if (!firstName) {
            showError('Please enter your full name.');
            return;
        }

        setButtonLoading(submitButton, true, pageConfig.submitLoadingLabel, pageConfig.submitLabel);

        try {
            if (typeof window.getCSRFToken === 'function') {
                await getCSRFToken();
            }

            const headers = typeof window.addCSRFHeader === 'function'
                ? addCSRFHeader({ 'Content-Type': 'application/json' })
                : { 'Content-Type': 'application/json' };

            const data = await fetchJson(`${apiBaseUrl}/api/auth/register`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    email,
                    password,
                    firstName,
                    lastName,
                    phone
                })
            });

            if (!data.success) {
                showError(data.error || 'Registration failed. Please try again.');
                return;
            }

            otpState = {
                userId: data.userId,
                email,
                firstName
            };
            openOtpModal(email);
        } catch (error) {
            showError('Registration failed. Please try again.');
        } finally {
            setButtonLoading(submitButton, false, '', pageConfig.submitLabel);
        }
    }

    async function handleLogin(event) {
        event.preventDefault();
        hideError();

        const submitButton = document.getElementById(pageConfig.submitButtonId);
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            showError('Please enter your email and password.');
            return;
        }

        setButtonLoading(submitButton, true, pageConfig.submitLoadingLabel, pageConfig.submitLabel);

        try {
            if (typeof window.getCSRFToken === 'function') {
                await getCSRFToken();
            }

            const headers = typeof window.addCSRFHeader === 'function'
                ? addCSRFHeader({ 'Content-Type': 'application/json' })
                : { 'Content-Type': 'application/json' };

            const data = await fetchJson(`${apiBaseUrl}/api/auth/login`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    email,
                    password
                })
            });

            if (!data.success) {
                showError(data.error || 'Login failed. Please try again.');
                return;
            }

            saveAuth(data.token, data.user);
            window.location.href = pageConfig.successRedirect;
        } catch (error) {
            showError('Login failed. Please try again.');
        } finally {
            setButtonLoading(submitButton, false, '', pageConfig.submitLabel);
        }
    }

    async function signInWithGoogle() {
        hideError();
        const googleButton = getGoogleButton();
        const defaultHtml = googleButton ? googleButton.innerHTML : '';

        setButtonLoading(googleButton, true, 'Connecting to Google...', '', defaultHtml);

        try {
            if (!window.auth || !window.firebase) {
                throw new Error('Google sign-in is not available right now.');
            }

            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });

            const googlePhone = getSignupPhoneValue();

            if (pageConfig.type === 'signup' && !googlePhone) {
                throw new Error('Enter your phone number before continuing with Google sign up.');
            }

            let headers = {
                'Content-Type': 'application/json'
            };

            if (typeof window.getCSRFToken === 'function') {
                await getCSRFToken();
            }

            if (typeof window.addCSRFHeader === 'function') {
                headers = addCSRFHeader(headers);
            }

            const result = await auth.signInWithPopup(provider);
            await completeGoogleSignIn(result.user, googlePhone, headers);
        } catch (error) {
            if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/web-storage-unsupported') {
                try {
                    const googlePhone = getSignupPhoneValue();
                    if (pageConfig.type === 'signup' && !googlePhone) {
                        throw new Error('Enter your phone number before continuing with Google sign up.');
                    }

                    sessionStorage.setItem(pendingGooglePhoneKey, googlePhone);
                    const provider = new firebase.auth.GoogleAuthProvider();
                    provider.setCustomParameters({ prompt: 'select_account' });
                    await auth.signInWithRedirect(provider);
                    return;
                } catch (redirectError) {
                    showError(getFriendlyFirebaseError(redirectError));
                    return;
                }
            }

            showError(getFriendlyFirebaseError(error));
        } finally {
            setButtonLoading(googleButton, false, '', '', defaultHtml);
        }
    }

    async function completeGoogleSignIn(user, googlePhone, headers) {
        const data = await fetchJson(`${apiBaseUrl}/api/auth/google`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    email: user.email,
                    name: user.displayName || user.email,
                    googleId: user.uid,
                    phone: googlePhone || undefined
                })
            });

            if (!data.success) {
                if (pageConfig.type === 'login' && /phone number is required/i.test(data.error || '')) {
                    showError('New Google users should start on the sign up page so we can collect your phone number securely.');
                } else {
                    showError(data.error || 'Google sign-in failed. Please try again.');
                }
                return;
            }

            if (data.requiresVerification) {
                const name = user.displayName || user.email || '';
                otpState = {
                    userId: data.userId,
                    email: data.email || user.email,
                    firstName: splitName(name).firstName
                };
                openOtpModal(otpState.email);
                return;
            }

            saveAuth(data.token, data.user);
            window.location.href = pageConfig.successRedirect;
    }

    async function handleGoogleRedirectResult() {
        if (!window.auth || !window.firebase) return;

        try {
            const result = await auth.getRedirectResult();
            if (!result || !result.user) return;

            hideError();

            let headers = { 'Content-Type': 'application/json' };
            if (typeof window.getCSRFToken === 'function') {
                await getCSRFToken();
            }
            if (typeof window.addCSRFHeader === 'function') {
                headers = addCSRFHeader(headers);
            }

            const pendingPhone = normalizePhone(sessionStorage.getItem(pendingGooglePhoneKey) || '');
            sessionStorage.removeItem(pendingGooglePhoneKey);
            await completeGoogleSignIn(result.user, pendingPhone, headers);
        } catch (error) {
            showError(getFriendlyFirebaseError(error));
        }
    }

    function togglePassword() {
        if (!passwordField) return;

        const icon = document.getElementById('eyeIcon');
        const visible = passwordField.type === 'text';
        passwordField.type = visible ? 'password' : 'text';

        if (icon) {
            icon.innerHTML = visible
                ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>'
                : '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
        }
    }

    function showForgotPassword() {
        showError('Password reset is handled by support right now. Please contact Regal Aqua for help.');
    }

    document.addEventListener('DOMContentLoaded', () => {
        ensureOtpModal();
        verifyExistingSession();
        handleGoogleRedirectResult().catch(() => {});

        if (typeof window.getCSRFToken === 'function') {
            getCSRFToken().catch(() => {});
        }

        const googleButton = getGoogleButton();
        if (googleButton && !googleButton.id) {
            googleButton.id = 'googleBtn';
        }
    });

    window.handleSignup = handleSignup;
    window.handleLogin = handleLogin;
    window.signInWithGoogle = signInWithGoogle;
    window.togglePassword = togglePassword;
    window.showForgotPassword = showForgotPassword;
})();
