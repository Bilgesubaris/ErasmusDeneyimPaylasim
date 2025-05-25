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
    }
} catch (error) {
    console.error('Firebase initialization error:', error);
    // showErrorAlert('Firebase başlatılırken bir hata oluştu. Lütfen sayfayı yenileyin.'); // Frontend uyarısı kaldırıldı
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Oturum kontrolü
        await checkAuth();
        
        // Sayfa içeriği yüklendikten sonra loading spinner'ı gizle
        document.getElementById('loadingSpinner').style.display = 'none';

    } catch (error) {
        console.error('Sayfa yüklenirken hata:', error);
        // showErrorAlert('Sayfa yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.'); // Frontend uyarısı kaldırıldı
        // Hata durumunda da spinner gizlensin
        document.getElementById('loadingSpinner').style.display = 'none';
    }
});

// Oturum kontrolü (admin-panel.js dosyasından kopyalandı)
async function checkAuth() {
    try {
        const user = await new Promise((resolve, reject) => {
            const unsubscribe = firebaseAuth.onAuthStateChanged(user => {
                unsubscribe();
                resolve(user);
            }, reject);
        });

        if (!user) {
            throw new Error('Oturum bulunamadı');
        }

        const doc = await firestoreDb
            .collection('admin_table')
            .doc(user.uid)
            .get();
        
        if (!doc.exists || doc.data().role !== 'admin' || doc.data().status !== 'active') {
            throw new Error('Yetkisiz erişim');
        }

        // Admin bilgilerini localStorage'a kaydet
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('adminName', doc.data().fullName);
        localStorage.setItem('adminId', doc.id);
        localStorage.setItem('adminEmail', doc.data().email);
        localStorage.setItem('adminPermissions', JSON.stringify(doc.data().permissions));
        
        // Admin adını göster
        // document.getElementById('adminName').textContent = doc.data().fullName; // Bu element bu sayfada olmayabilir

    } catch (error) {
        console.error('Oturum kontrolü hatası:', error);
        await firebaseAuth.signOut();
        clearLocalStorage();
        window.location.replace('login.html');
    }
}

// LocalStorage temizleme (admin-panel.js dosyasından kopyalandı)
function clearLocalStorage() {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminPermissions');
}

// Çıkış yap (admin-panel.js dosyasından kopyalandı)
function logout() {
    firebaseAuth.signOut().then(() => {
        clearLocalStorage();
        window.location.replace('login.html');
    }).catch((error) => {
        console.error('Çıkış hatası:', error);
    });
}

// Ayarlara özel fonksiyonlar buraya gelecek 