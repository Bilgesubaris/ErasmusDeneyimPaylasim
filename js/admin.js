// Firebase yapılandırması
const firebaseConfig = {
    apiKey: "AIzaSyB3jCeB9tFUGAbj1XSrjkRkSme98C4fGqc",
    authDomain: "webprojem-6fb9a.firebaseapp.com",
    projectId: "webprojem-6fb9a",
    storageBucket: "webprojem-6fb9a.firebasestorage.app",
    messagingSenderId: "571224024778",
    appId: "1:571224024778:web:77ab0b61a0a97e219f7633",
    measurementId: "G-M2JJY0MR0Q"
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);

// Admin girişi
document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const submitButton = this.querySelector('button[type="submit"]');
    
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Giriş Yapılıyor...';
    
    // Firebase Authentication ile giriş yap
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Firestore'dan kullanıcı rolünü kontrol et
            return firebase.firestore().collection('admin_table').doc(userCredential.user.uid).get();
        })
        .then((doc) => {
            if (doc.exists && doc.data().role === 'admin' && doc.data().status === 'active') {
                console.log('Admin girişi başarılı');
                // Kullanıcı bilgilerini localStorage'a kaydet
                localStorage.setItem('isAdminLoggedIn', 'true');
                localStorage.setItem('adminName', doc.data().fullName);
                localStorage.setItem('adminId', doc.id);
                localStorage.setItem('adminEmail', doc.data().email);
                localStorage.setItem('adminPermissions', JSON.stringify(doc.data().permissions));
                
                // Başarılı giriş
                Swal.fire({
                    icon: 'success',
                    title: 'Başarılı!',
                    text: 'Giriş başarıyla yapıldı.',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    // Admin paneline yönlendir
                    window.location.href = 'admin-panel.html';
                });
            } else {
                // Admin değilse veya hesap aktif değilse çıkış yap
                return firebase.auth().signOut().then(() => {
                    throw new Error('Bu hesap aktif bir admin hesabı değil!');
                });
            }
        })
        .catch((error) => {
            console.error('Giriş hatası:', error);
            Swal.fire({
                icon: 'error',
                title: 'Hata!',
                text: error.message || 'E-posta veya şifre hatalı!'
            });
            submitButton.disabled = false;
            submitButton.innerHTML = 'Giriş Yap';
        });
});

// Admin kaydı
document.getElementById('adminRegisterForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const submitButton = this.querySelector('button[type="submit"]');
    
    // Şifre kontrolü
    if (password !== passwordConfirm) {
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Şifreler eşleşmiyor!'
        });
        return;
    }
    
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Kayıt Yapılıyor...';
    
    // Firebase Auth ile kullanıcı oluştur
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Firestore'a admin bilgilerini kaydet
            return firebase.firestore().collection('admin_table').doc(userCredential.user.uid).set({
                fullName: fullName,
                email: email,
                role: 'admin',
                status: 'pending', // Yönetici onayı bekliyor
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                permissions: {
                    canManageUsers: false,
                    canManageExperiences: false,
                    canManageReports: false
                }
            });
        })
        .then(() => {
            // Başarılı kayıt
            Swal.fire({
                icon: 'success',
                title: 'Başarılı!',
                text: 'Kayıt başarıyla tamamlandı. Yönetici onayı bekleniyor.',
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                // Modal'ı kapat
                const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                modal.hide();
                // Formu temizle
                document.getElementById('adminRegisterForm').reset();
            });
        })
        .catch((error) => {
            console.error('Kayıt hatası:', error);
            Swal.fire({
                icon: 'error',
                title: 'Hata!',
                text: error.message || 'Kayıt işlemi başarısız oldu!'
            });
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Kayıt Ol';
        });
});

// Sayfa yüklendiğinde oturum kontrolü
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // Kullanıcı oturumu varsa Firestore'dan rol kontrolü yap
        firebase.firestore().collection('admin_table').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists && doc.data().role === 'admin' && doc.data().status === 'active') {
                    // Admin oturumu varsa admin paneline yönlendir
                    window.location.href = 'admin-panel.html';
                } else {
                    // Admin değilse veya hesap aktif değilse çıkış yap
                    firebase.auth().signOut();
                    clearLocalStorage();
                }
            })
            .catch((error) => {
                console.error('Oturum kontrolü hatası:', error);
                firebase.auth().signOut();
                clearLocalStorage();
            });
    }
});

// LocalStorage temizleme fonksiyonu
function clearLocalStorage() {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminPermissions');
}