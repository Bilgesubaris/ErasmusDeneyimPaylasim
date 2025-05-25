import { initializeApp } from "https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/8.10.1/firebase-storage.js";

// Firebase yapılandırması
const firebaseConfig = {
    apiKey: "AIzaSyB3jCeB9tFUGAbj1XSrjkRkSme98C4fGqc",
    authDomain: "webprojem-6fb9a.firebaseapp.com",
    projectId: "webprojem-6fb9a",
    storageBucket: "webprojem-6fb9a.appspot.com",
    messagingSenderId: "571224024778",
    appId: "1:571224024778:web:77ab0b61a0a97e219f7633",
    measurementId: "G-M2JJY0MR0Q"
};

// Firebase'i başlat
let firestoreDb;
let firebaseAuth;

try {
    if (!firebase.apps.length) {
        const app = initializeApp(firebaseConfig);
        firestoreDb = getFirestore(app);
        firebaseAuth = getAuth(app);
        
        // Firestore ayarlarını yapılandır
        firestoreDb.settings({
            experimentalForceLongPolling: true
        });
    } else {
        // Firebase already initialized
        const app = firebase.app();
        firestoreDb = getFirestore(app);
        firebaseAuth = getAuth(app);
    }
} catch (error) {
    console.error('Firebase initialization error:', error);
    // Frontend uyarısı kaldırıldı
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async function() {
    // Profil sayfasına özel fonksiyonlar buraya gelecek
    console.log('Admin Profil Sayfası yüklendi');
    
    // Loading spinner'ı gizle (oturum kontrolü tamamlandıysa HTML scripti tarafından gizlenir, burada da hata durumunda gizlenmesi sağlanır)
    const loadingSpinner = document.getElementById('loadingSpinner');
    if(loadingSpinner) {
         loadingSpinner.style.display = 'none';
    }

});

// Oturum kontrolü, logout, clearLocalStorage fonksiyonları HTML içinde tanımlanmıştır. 