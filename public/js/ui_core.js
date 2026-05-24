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
        if (!document.getElementById('boutique-confirm')) {
            const confirm = document.createElement('div');
            confirm.id = 'boutique-confirm';
            confirm.style.display = 'none';
            confirm.style.position = 'fixed';
            confirm.style.inset = '0';
            confirm.style.background = 'rgba(0,0,0,0.8)';
            confirm.style.backdropFilter = 'blur(5px)';
            confirm.style.zIndex = '99999';
            confirm.style.placeItems = 'center';
            confirm.innerHTML = `
                <div class="popup-content" style="border-top: 5px solid #e74c3c; background: #fff; padding: 40px; border-radius: 2px; width: 90%; max-width: 500px; text-align: center; box-shadow: 0 40px 100px rgba(0,0,0,0.4); position: relative;">
                    <div class="popup-icon" style="color: #e74c3c; font-size: 3rem; margin-bottom: 20px;">⚠️</div>
                    <div class="popup-title" id="confirm-title" style="font-family: 'Unna', serif; font-size: 2rem; margin-bottom: 10px;">Are you sure?</div>
                    <div class="popup-msg" id="confirm-msg" style="color: #666; line-height: 1.6; margin-bottom: 30px;">This action cannot be undone.</div>
                    <div style="display: flex; gap: 15px; justify-content: center;">
                        <button class="btn-boutique accent" id="confirm-yes-btn" style="background: #e74c3c; border-color: #e74c3c; color: white; padding: 12px 30px; border-radius: 50px; font-weight: bold; cursor: pointer; border: none; transition: 0.3s;">Yes, Delete</button>
                        <button class="btn-boutique" onclick="UI.hideConfirm()" style="background: #eee; color: #333; padding: 12px 30px; border-radius: 50px; font-weight: bold; cursor: pointer; border: none; transition: 0.3s;">Cancel</button>
                    </div>
                </div>
            `;
            document.body.appendChild(confirm);
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

    confirm(title, msg, onYes) {
        document.getElementById('confirm-title').innerText = title;
        document.getElementById('confirm-msg').innerText = msg;
        const yesBtn = document.getElementById('confirm-yes-btn');
        yesBtn.onclick = () => {
            UI.hideConfirm();
            onYes();
        };
        document.getElementById('boutique-confirm').style.display = 'grid';
    },

    hideConfirm() {
        document.getElementById('boutique-confirm').style.display = 'none';
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
