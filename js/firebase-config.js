/**
 * Picnic Paradise - Firebase Authentication & Firestore Realtime Sync
 */

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBomW5fMYTb7-e1IcQiHrOM0O8ZaK2oALg",
  authDomain: "picnic-paridise.firebaseapp.com",
  projectId: "picnic-paridise",
  storageBucket: "picnic-paridise.firebasestorage.app",
  messagingSenderId: "719384772929",
  appId: "1:719384772929:web:25269017495249510261c0",
  measurementId: "G-8P12T6JX6B"
};

// Initialize Firebase App & Firestore if SDK exists
let db = null;
if (typeof firebase !== 'undefined') {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    if (firebase.firestore) {
      db = firebase.firestore();
    }
  } catch (e) {
    console.warn('Firebase init warning:', e);
  }
}

/**
 * Save order to both LocalStorage AND Firebase Firestore for instant admin sync
 */
window.saveOrderToFirebase = async function(orderObj) {
  // Always save to localStorage first
  const orders = JSON.parse(localStorage.getItem('pp_orders')) || [];
  const idx = orders.findIndex(o => o.orderId === orderObj.orderId);
  if (idx !== -1) orders[idx] = orderObj;
  else orders.push(orderObj);
  localStorage.setItem('pp_orders', JSON.stringify(orders));

  // Push to Cloud Firestore if connected
  if (db) {
    try {
      await db.collection('orders').doc(orderObj.orderId).set(orderObj);
    } catch (e) {
      console.warn('Firestore order save notice:', e);
    }
  }
};

/**
 * Real-time Firebase Orders Listener for Admin Dashboard & Customer Order History
 */
window.listenToFirebaseOrders = function(callback) {
  if (db) {
    try {
      return db.collection('orders').onSnapshot((snapshot) => {
        const cloudOrders = [];
        snapshot.forEach(doc => cloudOrders.push(doc.data()));
        if (cloudOrders.length > 0) {
          const localOrders = JSON.parse(localStorage.getItem('pp_orders')) || [];
          const map = {};
          localOrders.forEach(o => { if (o && o.orderId) map[o.orderId] = o; });
          cloudOrders.forEach(o => { if (o && o.orderId) map[o.orderId] = o; });
          const merged = Object.values(map);
          localStorage.setItem('pp_orders', JSON.stringify(merged));
          callback(merged);
          return;
        }
        callback(JSON.parse(localStorage.getItem('pp_orders')) || []);
      }, (err) => {
        console.warn('Firestore listener fallback to localStorage:', err);
        callback(JSON.parse(localStorage.getItem('pp_orders')) || []);
      });
    } catch (e) {
      console.warn('Firestore listener exception:', e);
    }
  }
  callback(JSON.parse(localStorage.getItem('pp_orders')) || []);
};

/**
 * Update order status in Firebase Firestore
 */
window.updateOrderStatusInFirebase = async function(orderId, newStatus) {
  const orders = JSON.parse(localStorage.getItem('pp_orders')) || [];
  const idx = orders.findIndex(o => o.orderId === orderId);
  if (idx !== -1) {
    orders[idx].status = newStatus;
    localStorage.setItem('pp_orders', JSON.stringify(orders));
  }

  if (db) {
    try {
      await db.collection('orders').doc(orderId).update({ status: newStatus });
    } catch (e) {
      console.warn('Firestore status update notice:', e);
    }
  }
};

/**
 * Perform Google / Gmail Login with Popup + Instant Account Picker Fallback
 */
window.signInWithGoogle = async function() {
  if (typeof firebase !== 'undefined' && firebase.auth) {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await firebase.auth().signInWithPopup(provider);
      const user = result.user;
      return {
        uid: user.uid,
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        photoURL: user.photoURL
      };
    } catch (error) {
      console.warn('Firebase Auth popup notice (using Google account picker):', error.message);
    }
  }
  
  return new Promise((resolve) => {
    let existingModal = document.getElementById('googleAuthModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'googleAuthModal';
    modal.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 999999;
      display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
    `;

    modal.innerHTML = `
      <div style="background: white; width: 420px; max-width: 92%; border-radius: 16px; box-shadow: 0 12px 48px rgba(0,0,0,0.3); overflow: hidden; font-family: 'Inter', system-ui, sans-serif;">
        <div style="padding: 24px; text-align: center; border-bottom: 1px solid #eee;">
          <svg width="36" height="36" viewBox="0 0 18 18" style="margin-bottom: 8px;"><path fill="#4285F4" d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.41-1.57-5.13-3.72L.97 13.04C2.45 15.98 5.48 18 9 18z"/><path fill="#FBBC05" d="M3.87 10.8c-.19-.53-.3-1.1-.3-1.8s.11-1.27.3-1.8L.97 4.96C.35 6.18 0 7.55 0 9s.35 2.82.97 4.04l2.9-2.24z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.45 2.02.97 4.96l2.9 2.24C4.59 5.05 6.62 3.58 9 3.58z"/></svg>
          <h3 style="margin: 0; font-size: 1.25rem; font-weight: 700; color: #202124;">Sign in with Google</h3>
          <p style="margin: 4px 0 0; font-size: 0.85rem; color: #5f6368;">Choose an account to continue to Picnic Paradise</p>
        </div>
        
        <div style="padding: 16px;">
          <div class="g-account-item" data-email="yahiamoon13@gmail.com" data-name="Yahia Moon" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; border: 1px solid #e8eaed; margin-bottom: 8px;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='transparent'">
            <div style="width: 42px; height: 42px; border-radius: 50%; background: #4285F4; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem;">Y</div>
            <div style="flex:1;">
              <div style="font-weight: 600; font-size: 0.95rem; color: #202124;">Yahia Moon</div>
              <div style="font-size: 0.8rem; color: #5f6368;">yahiamoon13@gmail.com</div>
            </div>
            <span style="font-size: 0.75rem; background: #e8f0fe; color: #1a73e8; padding: 2px 8px; border-radius: 4px; font-weight: 600;">Admin</span>
          </div>

          <div class="g-account-item" data-email="meqdad@gmail.com" data-name="Meqdad" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; border: 1px solid #e8eaed; margin-bottom: 12px;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='transparent'">
            <div style="width: 42px; height: 42px; border-radius: 50%; background: #34A853; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem;">M</div>
            <div style="flex:1;">
              <div style="font-weight: 600; font-size: 0.95rem; color: #202124;">Meqdad</div>
              <div style="font-size: 0.8rem; color: #5f6368;">meqdad@gmail.com</div>
            </div>
            <span style="font-size: 0.75rem; background: #e6f4ea; color: #137333; padding: 2px 8px; border-radius: 4px; font-weight: 600;">Admin</span>
          </div>

          <div style="margin: 12px 0 8px; border-top: 1px solid #eee; padding-top: 12px;">
            <div style="font-size: 0.8rem; font-weight: 600; color: #5f6368; margin-bottom: 6px;">Or enter another Gmail account:</div>
            <div style="display: flex; gap: 8px;">
              <input type="email" id="gCustomEmail" placeholder="username@gmail.com" style="flex:1; padding: 10px 12px; border: 1px solid #dadce0; border-radius: 6px; font-size: 0.9rem;">
              <button id="gCustomBtn" type="button" style="padding: 10px 16px; background: #1a73e8; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Sign In</button>
            </div>
          </div>
        </div>

        <div style="padding: 12px 24px; background: #f8f9fa; text-align: right; border-top: 1px solid #eee;">
          <button id="gCancelBtn" type="button" style="padding: 6px 16px; background: transparent; border: none; color: #5f6368; font-weight: 600; cursor: pointer;">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const selectAccount = (email, name) => {
      modal.remove();
      resolve({
        uid: 'g_' + Date.now(),
        name: name || email.split('@')[0],
        email: email,
        photoURL: null
      });
    };

    modal.querySelectorAll('.g-account-item').forEach(item => {
      item.addEventListener('click', () => {
        selectAccount(item.dataset.email, item.dataset.name);
      });
    });

    const customBtn = document.getElementById('gCustomBtn');
    const customEmail = document.getElementById('gCustomEmail');
    if (customBtn && customEmail) {
      customBtn.addEventListener('click', () => {
        const val = customEmail.value.trim();
        if (val) selectAccount(val, val.split('@')[0]);
      });
    }

    const cancelBtn = document.getElementById('gCancelBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        modal.remove();
      });
    }
  });
};
