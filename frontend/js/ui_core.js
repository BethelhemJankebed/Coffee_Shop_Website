/**
 * Abyssinia Coffee - Core UI Engine
 * Enhanced Popups & Professional Feedback
 */

const UI = {
    init() {
        // Inject elements if not present
        if (!document.getElementById('boutique-popup')) {
            const popup = document.createElement('div');
            popup.id = 'boutique-popup';
            popup.innerHTML = `
                <div class="popup-content">
                    <div class="popup-icon" id="popup-icon">✦</div>
                    <div class="popup-title" id="popup-title">Boutique Alert</div>
                    <div class="popup-msg" id="popup-msg">Your ritual has been updated.</div>
                    <button class="btn-boutique accent" onclick="UI.hidePopup()">Continue</button>
                </div>
            `;
            document.body.appendChild(popup);
        }
        if (!document.getElementById('boutique-toast')) {
            const toast = document.createElement('div');
            toast.id = 'boutique-toast';
            toast.innerHTML = `<span id="toast-icon">☕</span> <span id="toast-msg">Success</span>`;
            document.body.appendChild(toast);
        }
    },

    popup(title, msg, icon = '✦') {
        document.getElementById('popup-title').innerText = title;
        document.getElementById('popup-msg').innerText = msg;
        document.getElementById('popup-icon').innerText = icon;
        document.getElementById('boutique-popup').style.display = 'grid';
    },

    hidePopup() {
        document.getElementById('boutique-popup').style.display = 'none';
    },

    toast(msg, icon = '☕') {
        const t = document.getElementById('boutique-toast');
        document.getElementById('toast-msg').innerText = msg;
        document.getElementById('toast-icon').innerText = icon;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
    }
};

UI.init();
window.alert = (msg) => UI.popup('System Update', msg);
