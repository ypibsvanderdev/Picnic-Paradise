/**
 * Picnic Paradise - Firebase Authentication Config & Helpers
 */

// Firebase SDK Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDemoKeyForPicnicParadise2026Auth",
  authDomain: "picnic-paradise-2026.firebaseapp.com",
  projectId: "picnic-paradise-2026",
  storageBucket: "picnic-paradise-2026.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:demo123456789"
};

// Initialize Firebase App & Auth
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
 * Perform Google / Gmail Login with Popup
 */
window.signInWithGoogle = async function() {
  if (typeof firebase === 'undefined' || !firebase.auth) {
    throw new Error('Firebase Auth SDK not loaded');
  }
  
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  
  try {
    const result = await firebase.auth().signInWithPopup(provider);
    const user = result.user;
    return {
      uid: user.uid,
      name: user.displayName || user.email.split('@')[0],
      email: user.email,
      photoURL: user.photoURL
    };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};
