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
let firestoreDb;
let firebaseAuth;

try {
    console.log('Firebase başlatılıyor...');
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        firebase.analytics();
        firestoreDb = firebase.firestore();
        firebaseAuth = firebase.auth();
        console.log('Firebase başarıyla başlatıldı');
    } else {
        firestoreDb = firebase.firestore();
        firebaseAuth = firebase.auth();
        console.log('Firebase zaten başlatılmış');
    }
} catch (error) {
    console.error('Firebase başlatma hatası:', error);
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

// Kullanıcıları getir ve tabloya ekle
async function loadUsers() {
    try {
        console.log('Kullanıcılar yükleniyor...');
        
        // Firebase bağlantısını kontrol et
        if (!firestoreDb) {
            console.error('Firestore bağlantısı bulunamadı!');
            throw new Error('Firestore bağlantısı bulunamadı');
        }

        // Test sorgusu yap
        console.log('Test sorgusu yapılıyor...');
        const testQuery = await firestoreDb.collection('users').limit(1).get();
        console.log('Test sorgusu sonucu:', testQuery.empty ? 'Veri yok' : 'Veri var');

        // Kullanıcıları getir
        console.log('Kullanıcılar getiriliyor...');
        const usersSnapshot = await firestoreDb.collection('users').get();
        console.log('Firestore\'dan gelen veri:', usersSnapshot.docs.length, 'kullanıcı bulundu');

        const tbody = document.querySelector('#usersTable tbody');
        if (!tbody) {
            console.error('Tablo tbody elementi bulunamadı!');
            throw new Error('Tablo elementi bulunamadı');
        }

        tbody.innerHTML = ''; // Tabloyu temizle

        if (usersSnapshot.empty) {
            console.log('Kullanıcı koleksiyonu boş');
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">Henüz kullanıcı bulunmamaktadır.</td>
                </tr>
            `;
            return;
        }

        usersSnapshot.forEach(doc => {
            const user = doc.data();
            console.log('Kullanıcı verisi işleniyor:', user);
            
            const row = document.createElement('tr');
            
            // Tarih formatını düzenle
            const createdAt = user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString('tr-TR') : '-';
            
            row.innerHTML = `
                <td>${doc.id}</td>
                <td>${user.fullName || '-'}</td>
                <td>${user.email || '-'}</td>
                <td>
                    <span class="badge ${user.status === 'active' ? 'bg-success' : 'bg-danger'}">
                        ${user.status === 'active' ? 'Aktif' : 'Pasif'}
                    </span>
                </td>
                <td>${createdAt}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-primary" onclick="editUser('${doc.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser('${doc.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });

        console.log('Kullanıcılar başarıyla yüklendi');
    } catch (error) {
        console.error('Kullanıcılar yüklenirken hata oluştu:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Kullanıcılar yüklenirken bir hata oluştu: ' + error.message
        });
    }
}

// Kullanıcı düzenleme fonksiyonu
async function editUser(userId) {
    try {
        console.log('Kullanıcı düzenleme başlatılıyor:', userId);
        
        // Kullanıcı bilgilerini getir
        const userDoc = await firestoreDb.collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
            throw new Error('Kullanıcı bulunamadı');
        }

        const user = userDoc.data();
        
        // Düzenleme modalını göster
        const { value: formValues } = await Swal.fire({
            title: 'Kullanıcı Düzenle',
            html: `
                <div class="mb-3">
                    <label class="form-label">Ad Soyad</label>
                    <input id="fullName" class="form-control" value="${user.fullName || ''}">
                </div>
                <div class="mb-3">
                    <label class="form-label">E-posta</label>
                    <input id="email" class="form-control" value="${user.email || ''}" readonly>
                </div>
                <div class="mb-3">
                    <label class="form-label">Durum</label>
                    <select id="status" class="form-select">
                        <option value="active" ${user.status === 'active' ? 'selected' : ''}>Aktif</option>
                        <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Pasif</option>
                    </select>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Kaydet',
            cancelButtonText: 'İptal',
            preConfirm: () => {
                return {
                    fullName: document.getElementById('fullName').value,
                    status: document.getElementById('status').value
                }
            }
        });

        if (formValues) {
            // Kullanıcı bilgilerini güncelle
            await firestoreDb.collection('users').doc(userId).update({
                fullName: formValues.fullName,
                status: formValues.status,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            Swal.fire({
                icon: 'success',
                title: 'Başarılı!',
                text: 'Kullanıcı bilgileri güncellendi.'
            });

            // Tabloyu yenile
            loadUsers();
        }
    } catch (error) {
        console.error('Kullanıcı düzenlenirken hata oluştu:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Kullanıcı düzenlenirken bir hata oluştu: ' + error.message
        });
    }
}

// Kullanıcı silme fonksiyonu
async function deleteUser(userId) {
    try {
        const result = await Swal.fire({
            title: 'Emin misiniz?',
            text: "Bu kullanıcıyı silmek istediğinizden emin misiniz?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Evet, sil!',
            cancelButtonText: 'İptal'
        });

        if (result.isConfirmed) {
            // Kullanıcıyı sil
            await firestoreDb.collection('users').doc(userId).delete();
            
            Swal.fire({
                icon: 'success',
                title: 'Başarılı!',
                text: 'Kullanıcı başarıyla silindi.'
            });

            // Tabloyu yenile
            loadUsers();
        }
    } catch (error) {
        console.error('Kullanıcı silinirken hata oluştu:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Kullanıcı silinirken bir hata oluştu: ' + error.message
        });
    }
}

// Sayfa yüklendiğinde kullanıcıları getir
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Sayfa yüklendi, kullanıcılar getiriliyor...');
        // Önce Firebase bağlantısının hazır olmasını bekle
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Firebase bağlantısı kontrol ediliyor...');
        await loadUsers();
    } catch (error) {
        console.error('Sayfa yüklenirken hata:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Sayfa yüklenirken bir hata oluştu: ' + error.message
        });
    }
});

// Kullanıcılara özel fonksiyonlar buraya gelecek 