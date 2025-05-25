import { initializeApp } from "https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/8.1.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/8.1.1/firebase-firestore.js";

// Firebase yapılandırması
const firebaseConfig = {
    apiKey: "AIzaSyB3jCeB9tFUGAbj1XSrjkRkSme98C4fGqc",
    authDomain: "webprojem-6fb9a.firebaseapp.com",
    projectId: "webprojem-6fb9a",
    storageBucket: "webprojem-6fb9a.firebasestorage.app", // Updated storage bucket
    messagingSenderId: "571224024778",
    appId: "1:571224024778:web:77ab0b61a0a97e219f7633",
    measurementId: "G-M2JJY0MR0Q"
};

// Firebase'i başlat
let auth;
let db;

try {
    if (!firebase.apps.length) {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    } else {
        // Firebase already initialized
        const app = firebase.app();
        auth = getAuth(app);
        db = getFirestore(app);
    }
} catch (error) {
    console.error('Firebase initialization error:', error);
    Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: 'Firebase bağlantısı kurulurken bir hata oluştu.'
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const email = document.getElementById('emailInput').value;
            const password = document.getElementById('passwordInput').value;

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Check if user is in admin_table and has admin role
                const adminDoc = await getDoc(doc(db, "admin_table", user.uid));

                if (adminDoc.exists() && adminDoc.data().role === 'admin' && adminDoc.data().status === 'active') {
                    // Admin logged in successfully
                    localStorage.setItem('isAdminLoggedIn', 'true');
                    localStorage.setItem('adminName', adminDoc.data().fullName);
                    localStorage.setItem('adminId', adminDoc.id);
                    localStorage.setItem('adminEmail', adminDoc.data().email);
                    localStorage.setItem('adminPermissions', JSON.stringify(adminDoc.data().permissions));

                    Swal.fire({
                        icon: 'success',
                        title: 'Başarılı!',
                        text: 'Giriş başarılı. Yönlendiriliyorsunuz...',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.replace('admin-panel.html');
                    });
                } else {
                    // Not an admin or inactive
                    await auth.signOut(); // Sign out the non-admin user
                    throw new Error('Yetkisiz erişim veya hesap aktif değil.');
                }

            } catch (error) {
                console.error('Login error:', error);
                let errorMessage = 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    errorMessage = 'Hatalı e-posta veya şifre.';
                } else if (error.message === 'Yetkisiz erişim veya hesap aktif değil.') {
                    errorMessage = 'Bu e-posta adresi ile admin girişi yapılamaz veya hesabınız aktif değil.';
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Hata!',
                    text: errorMessage
                });
            }
        });
    }
});

// LocalStorage temizleme fonksiyonu (login sonrası gerekmez ama logout için tutulabilir)
// function clearLocalStorage() {
//     localStorage.removeItem('isAdminLoggedIn');
//     localStorage.removeItem('adminName');
//     localStorage.removeItem('adminId');
//     localStorage.removeItem('adminEmail');
//     localStorage.removeItem('adminPermissions');
// }
