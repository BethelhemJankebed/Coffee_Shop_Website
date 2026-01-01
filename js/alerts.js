/* Abyssinia Coffee - Modern Notification System */

const styleAlerts = () => {
    const css = `
    #ab-toast-container {
        position: fixed;
        top: 25px;
        right: 25px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    .ab-toast {
        background: #2b1a14;
        color: #e6c9ad;
        padding: 16px 28px;
        border-radius: 12px;
        border-left: 6px solid #c08a58;
        box-shadow: 0 10px 30px rgba(0,0,0,0.6);
        min-width: 300px;
        font-family: "Georgia", serif;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        animation: abSlideIn 0.4s ease-out forwards;
        cursor: pointer;
    }
    .ab-toast.error { border-left-color: #ff6b6b; }
    .ab-toast.success { border-left-color: #2ecc71; }
    
    @keyframes abSlideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    .ab-fade-out {
        animation: abFade 0.5s ease-in forwards;
    }
    @keyframes abFade {
        to { opacity: 0; transform: translateY(-20px); }
    }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);
};

function showAbAlert(message) {
    let container = document.getElementById('ab-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'ab-toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const isError = message.includes('❌') || message.toLowerCase().includes('error') || message.toLowerCase().includes('fail');
    
    toast.className = `ab-toast ${isError ? 'error' : 'success'}`;
    toast.innerHTML = `<span>${message}</span>`;
    
    container.appendChild(toast);

    // Remove on click or after 4 seconds
    const removeToast = () => {
        toast.classList.add('ab-fade-out');
        setTimeout(() => toast.remove(), 500);
    };

    toast.onclick = removeToast;
    setTimeout(removeToast, 4000);
}

// THE MAGIC LINE: This replaces the ugly browser alert() globally
window.alert = function(message) {
    showAbAlert(message);
};

// Start styles
styleAlerts();