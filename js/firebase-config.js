/**
 * Picnic Paradise - Firebase Authentication Config & Helpers
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

// Initialize Firebase App & Auth if SDK exists
if (typeof firebase !== 'undefined') {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
  } catch (e) {
    console.warn('Firebase init warning:', e);
  }
}

/**
 * Perform REAL Google / Gmail Login with Firebase Popup
 */
window.signInWithGoogle = async function() {
  if (typeof firebase === 'undefined' || !firebase.auth) {
    throw new Error('Firebase Auth SDK is loading. Please try again in a moment.');
  }

  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  
  try {
    // Open genuine Google sign in popup window
    const result = await firebase.auth().signInWithPopup(provider);
    const user = result.user;
    return {
      uid: user.uid,
      name: user.displayName || user.email.split('@')[0],
      email: user.email,
      photoURL: user.photoURL
    };
  } catch (error) {
    console.error('Firebase Auth Error:', error);
    
    // Help user fix common Firebase settings if needed
    if (error.code === 'auth/operation-not-allowed') {
      alert('⚠️ Google Sign-In needs to be enabled in Firebase:\n\n1. Go to Firebase Console\n2. Click Authentication -> Sign-in method\n3. Click Google -> Enable -> Save');
    } else if (error.code === 'auth/unauthorized-domain') {
      alert('⚠️ This website domain needs to be authorized:\n\n1. Go to Firebase Console\n2. Click Authentication -> Settings -> Authorized Domains\n3. Add your website domain (e.g. localhost, vercel.app, or github.io)');
    } else if (error.code !== 'auth/popup-closed-by-user') {
      alert('Google Sign-In Notice: ' + error.message);
    }
    
    throw error;
  }
};
