// Firebase referanslarını al
let firestoreDb;
let firebaseAuth;

// Firebase'i başlat
function initializeFirebase() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            firebase.analytics();
        }
        firestoreDb = firebase.firestore();
        firebaseAuth = firebase.auth();
        console.log('Firebase başarıyla başlatıldı');
        return true;
    } catch (error) {
        console.error('Firebase başlatma hatası:', error);
        return false;
    }
}

// URL'den deneyim ID'sini ve koleksiyon adını al
function getExperienceInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        id: urlParams.get('id'),
        collection: urlParams.get('collection')
    };
}

// Deneyim detaylarını yükle
async function loadExperienceDetails() {
    try {
        console.log('Deneyim detayları yükleniyor...');
        
        // Firebase bağlantısını kontrol et ve gerekirse başlat
        if (!firestoreDb) {
            console.log('Firestore bağlantısı bulunamadı, yeniden başlatılıyor...');
            if (!initializeFirebase()) {
                throw new Error('Firebase başlatılamadı');
            }
        }

        const { id, collection } = getExperienceInfo();
        if (!id || !collection) {
            throw new Error('Deneyim bilgileri eksik');
        }

        // Deneyimi getir
        const experienceDoc = await firestoreDb.collection(collection).doc(id).get();
        
        if (!experienceDoc.exists) {
            throw new Error('Deneyim bulunamadı');
        }

        const experience = experienceDoc.data();
        console.log('Deneyim verisi:', experience);

        // Detayları sayfaya yerleştir
        document.getElementById('username').textContent = experience.username || 'Bilinmiyor';
        document.getElementById('comment').textContent = experience.comment || 'Yorum yok';
        
        // Tarihi formatla
        const date = experience.date ? new Date(experience.date.toDate()).toLocaleString('tr-TR') : 'Tarih belirtilmemiş';
        document.getElementById('date').textContent = date;

        // Görseli göster
        const imageContainer = document.getElementById('imageContainer');
        const experienceImage = document.getElementById('experienceImage');
        
        if (experience.image) {
            experienceImage.src = experience.image;
            experienceImage.style.display = 'block';
        } else {
            imageContainer.innerHTML = '<p class="text-muted">Görsel bulunmamaktadır</p>';
        }

        // Onay butonunu göster/gizle
        const approveButton = document.getElementById('approveButton');
        if (collection === 'deneyimler') {
            approveButton.style.display = 'inline-block';
        } else {
            approveButton.style.display = 'none';
        }

        console.log('Deneyim detayları başarıyla yüklendi');
    } catch (error) {
        console.error('Deneyim detayları yüklenirken hata oluştu:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Deneyim detayları yüklenirken bir hata oluştu: ' + error.message
        });
    }
}

// Deneyim onaylama fonksiyonu
async function approveExperience() {
    try {
        const { id } = getExperienceInfo();
        if (!id) {
            throw new Error('Deneyim ID\'si bulunamadı');
        }

        const result = await Swal.fire({
            title: 'Deneyimi Onayla',
            text: "Bu deneyimi onaylamak istediğinizden emin misiniz?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Evet, Onayla',
            cancelButtonText: 'İptal'
        });

        if (result.isConfirmed) {
            // Deneyimi getir
            const experienceDoc = await firestoreDb.collection('deneyimler').doc(id).get();
            const experience = experienceDoc.data();

            // Deneyimi experiences koleksiyonuna ekle
            await firestoreDb.collection('experiences').doc(id).set(experience);

            // Deneyimi deneyimler koleksiyonundan sil
            await firestoreDb.collection('deneyimler').doc(id).delete();
            
            Swal.fire({
                icon: 'success',
                title: 'Başarılı!',
                text: 'Deneyim başarıyla onaylandı.'
            }).then(() => {
                // Deneyimler sayfasına yönlendir
                window.location.href = 'admin-deneyimler.html';
            });
        }
    } catch (error) {
        console.error('Deneyim onaylanırken hata oluştu:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Deneyim onaylanırken bir hata oluştu: ' + error.message
        });
    }
}

// Deneyim silme fonksiyonu
async function deleteExperience() {
    try {
        const { id, collection } = getExperienceInfo();
        if (!id || !collection) {
            throw new Error('Deneyim bilgileri eksik');
        }

        const result = await Swal.fire({
            title: 'Emin misiniz?',
            text: "Bu deneyimi silmek istediğinizden emin misiniz?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Evet, sil!',
            cancelButtonText: 'İptal'
        });

        if (result.isConfirmed) {
            await firestoreDb.collection(collection).doc(id).delete();
            
            Swal.fire({
                icon: 'success',
                title: 'Başarılı!',
                text: 'Deneyim başarıyla silindi.'
            }).then(() => {
                // Deneyimler sayfasına yönlendir
                window.location.href = 'admin-deneyimler.html';
            });
        }
    } catch (error) {
        console.error('Deneyim silinirken hata oluştu:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Deneyim silinirken bir hata oluştu: ' + error.message
        });
    }
}

// Çıkış yap
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Çıkış hatası:', error);
    });
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Firebase'i başlat
        if (!initializeFirebase()) {
            throw new Error('Firebase başlatılamadı');
        }
        
        // Deneyim detaylarını yükle
        await loadExperienceDetails();
        
        // Loading spinner'ı gizle
        document.getElementById('loadingSpinner').style.display = 'none';
    } catch (error) {
        console.error('Sayfa yüklenirken hata:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Sayfa yüklenirken bir hata oluştu: ' + error.message
        });
    }
}); 