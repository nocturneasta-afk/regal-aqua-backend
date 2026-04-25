// Quick button test script
function testAllButtons() {
    const buttons = document.querySelectorAll('button, .btn, [class*="btn"], a[href]');
    console.log(`Found ${buttons.length} clickable elements`);
    
    buttons.forEach((btn, i) => {
        console.log(`${i + 1}.`, btn.textContent?.trim()?.substring(0, 30) || 'No text', 
                   '-', btn.className?.substring(0, 50) || 'No class');
        
        // Check if has click handler
        const hasClick = !!(btn.onclick || 
                        btn.getAttribute('onclick') || 
                        (btn.dataset && Object.keys(btn.dataset).length > 0));
        console.log('   Has handler:', hasClick ? '✅' : '❌');
    });
}

// Run test automatically when loaded in console
if (typeof window !== 'undefined') window.testAllButtons = testAllButtons;
