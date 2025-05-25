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
if (!firebase.apps.length) {
firebase.initializeApp(firebaseConfig);
}

// Firestore ayarlarını güncelle
const db = firebase.firestore();
db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
    experimentalForceLongPolling: true,
    merge: true,
    ignoreUndefinedProperties: true
});

// CORS ayarlarını güncelle
db.enablePersistence()
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('Çoklu sekme desteği devre dışı');
        } else if (err.code === 'unimplemented') {
            console.warn('Tarayıcı persistence desteklemiyor');
        }
    });

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    // Ülkeleri yükle
    ulkeleriYukle();

    // Oturum kontrolü
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // Kullanıcı oturumu varsa Firestore'dan bilgileri al
            firebase.firestore().collection('users').doc(user.uid).get()
                .then((doc) => {
                    if (doc.exists && doc.data().role === 'student') {
                        // Kullanıcı bilgilerini göster
                        document.getElementById('welcome-message').innerHTML = `
                            <i class="fas fa-user-circle me-1"></i>
                            Hoş geldin, ${doc.data().username}!
                        `;
                        // Deneyimleri yükle
                        deneyimleriYukle();
                    } else {
                        // Öğrenci değilse çıkış yap
                        logout();
                    }
                });
        } else {
            // Oturum yoksa giriş sayfasına yönlendir
            window.location.href = './ogrencigiris.html';
        }
    });
});

// Ülkeleri yükle
function ulkeleriYukle() {
    const ulkeSelect = document.getElementById('ulke');
    
    // Önce ülkeleri Firestore'dan çek
    firebase.firestore().collection('ulkeler')
        .orderBy('name')
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                // Ülkeler yoksa ekle
                const ulkeler = [
                    { code: 'AT', name: 'Avusturya' },
                    { code: 'BE', name: 'Belçika' },
                    { code: 'BG', name: 'Bulgaristan' },
                    { code: 'HR', name: 'Hırvatistan' },
                    { code: 'CZ', name: 'Çek Cumhuriyeti' },
                    { code: 'DK', name: 'Danimarka' },
                    { code: 'EE', name: 'Estonya' },
                    { code: 'FI', name: 'Finlandiya' },
                    { code: 'FR', name: 'Fransa' },
                    { code: 'DE', name: 'Almanya' },
                    { code: 'GR', name: 'Yunanistan' },
                    { code: 'HU', name: 'Macaristan' },
                    { code: 'IS', name: 'İzlanda' },
                    { code: 'IE', name: 'İrlanda' },
                    { code: 'IT', name: 'İtalya' },
                    { code: 'LV', name: 'Letonya' },
                    { code: 'LI', name: 'Lihtenştayn' },
                    { code: 'LT', name: 'Litvanya' },
                    { code: 'LU', name: 'Lüksemburg' },
                    { code: 'MT', name: 'Malta' },
                    { code: 'NL', name: 'Hollanda' },
                    { code: 'NO', name: 'Norveç' },
                    { code: 'PL', name: 'Polonya' },
                    { code: 'PT', name: 'Portekiz' },
                    { code: 'RO', name: 'Romanya' },
                    { code: 'SK', name: 'Slovakya' },
                    { code: 'SI', name: 'Slovenya' },
                    { code: 'ES', name: 'İspanya' },
                    { code: 'SE', name: 'İsveç' },
                    { code: 'CH', name: 'İsviçre' },
                    { code: 'TR', name: 'Türkiye' },
                    { code: 'GB', name: 'Birleşik Krallık' }
                ];

                // Ülkeleri Firestore'a ekle
                const batch = firebase.firestore().batch();
                ulkeler.forEach(ulke => {
                    const docRef = firebase.firestore().collection('ulkeler').doc();
                    batch.set(docRef, ulke);
                });
                return batch.commit();
            }
        })
        .then(() => {
            // Ülkeleri tekrar çek ve select'e ekle
            return firebase.firestore().collection('ulkeler')
                .orderBy('name')
                .get();
        })
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const ulke = doc.data();
                const option = document.createElement('option');
                option.value = ulke.code;
                option.textContent = ulke.name;
                ulkeSelect.appendChild(option);
            });
        })
        .catch((error) => {
            console.error('Ülkeler yüklenirken hata:', error);
            Swal.fire({
                icon: 'error',
                title: 'Hata!',
                text: 'Ülkeler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.'
            });
        });
}

// Deneyimleri yükle
function deneyimleriYukle() {
    const deneyimlerListesi = document.getElementById('deneyimler-listesi');
    
    firebase.firestore().collection('deneyimler')
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                deneyimlerListesi.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-info animate__animated animate__fadeIn">
                            <i class="fas fa-info-circle me-2"></i>
                            Henüz hiç deneyim paylaşılmamış. İlk deneyimi siz paylaşın!
                        </div>
                    </div>
                `;
                return;
            }

            deneyimlerListesi.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const deneyim = doc.data();
                const deneyimCard = `
                    <div class="col-md-6 mb-4 animate__animated animate__fadeIn">
                        <div class="card h-100 experience-card">
                            <div class="card-body">
                                <h5 class="card-title">
                                    <i class="fas fa-university me-2"></i>${deneyim.universite}
                                </h5>
                                <h6 class="card-subtitle mb-3">
                                    <i class="fas fa-globe me-2"></i>${deneyim.ulke} - ${deneyim.sehir}
                                    <br>
                                    <i class="fas fa-graduation-cap me-2"></i>${deneyim.bolum}
                                    <br>
                                    <i class="fas fa-calendar-alt me-2"></i>${deneyim.donem}
                                </h6>
                                <div class="experience-content">
                                    <h6 class="section-title"><i class="fas fa-book me-2"></i>Alınan Dersler</h6>
                                    <p class="card-text">${deneyim.dersler}</p>
                                    
                                    <h6 class="section-title"><i class="fas fa-home me-2"></i>Konaklama</h6>
                                    <p class="card-text">${deneyim.konaklama}</p>
                                    
                                    <h6 class="section-title"><i class="fas fa-utensils me-2"></i>Yaşam Maliyetleri</h6>
                                    <p class="card-text">${deneyim.yasam}</p>
                                    
                                    <h6 class="section-title"><i class="fas fa-users me-2"></i>Sosyal Yaşam</h6>
                                    <p class="card-text">${deneyim.sosyal}</p>
                                    
                                    <h6 class="section-title"><i class="fas fa-book-open me-2"></i>Genel Deneyim</h6>
                                    <p class="card-text">${deneyim.deneyim}</p>
                                    
                                    <h6 class="section-title"><i class="fas fa-lightbulb me-2"></i>Öneriler</h6>
                                    <p class="card-text">${deneyim.oneri}</p>
                                </div>
                                <div class="experience-meta">
                                    <span>
                                        <i class="fas fa-user me-1"></i>
                                        ${deneyim.username}
                                    </span>
                                    <span>
                                        <i class="fas fa-calendar me-1"></i>
                                        ${deneyim.createdAt.toDate().toLocaleDateString('tr-TR')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                deneyimlerListesi.innerHTML += deneyimCard;
            });
        })
        .catch((error) => {
            console.error('Deneyimler yüklenirken hata:', error);
            deneyimlerListesi.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger animate__animated animate__fadeIn">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        Deneyimler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
                    </div>
                </div>
            `;
        });
}

// Deneyim paylaş
function deneyimPaylas() {
    const universite = document.getElementById('universite').value;
    const ulkeSelect = document.getElementById('ulke');
    const ulke = ulkeSelect.options[ulkeSelect.selectedIndex].text;
    const sehir = document.getElementById('sehir').value;
    const donem = document.getElementById('donem').value;
    const bolum = document.getElementById('bolum').value;
    const dersler = document.getElementById('dersler').value;
    const konaklama = document.getElementById('konaklama').value;
    const yasam = document.getElementById('yasam').value;
    const sosyal = document.getElementById('sosyal').value;
    const deneyim = document.getElementById('deneyim').value;
    const oneri = document.getElementById('oneri').value;

    if (!universite || !ulke || !sehir || !donem || !bolum || !dersler || !konaklama || !yasam || !sosyal || !deneyim || !oneri) {
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Lütfen tüm alanları doldurun.'
        });
        return;
    }

    const user = firebase.auth().currentUser;
    if (!user) {
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Oturumunuz sonlanmış. Lütfen tekrar giriş yapın.'
        });
        return;
    }

    // Kullanıcı bilgilerini al
    firebase.firestore().collection('users').doc(user.uid).get()
        .then((doc) => {
            if (!doc.exists) {
                throw new Error('Kullanıcı bilgileri bulunamadı.');
            }

            const userData = doc.data();
            
            // Deneyimi Firestore'a ekle
            return firebase.firestore().collection('experiences').add({
                university: universite,
                country: ulke,
                city: sehir,
                semester: donem,
                department: bolum,
                courses: dersler,
                accommodation: konaklama,
                living: yasam,
                social: sosyal,
                content: deneyim,
                recommendations: oneri,
                userId: user.uid,
                username: userData.username,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            // Deneyim sayısını güncelle
            return firebase.firestore().collection('users').doc(user.uid).update({
                experienceCount: firebase.firestore.FieldValue.increment(1)
            });
        })
        .then(() => {
            // Modal'ı kapat
            const modal = bootstrap.Modal.getInstance(document.getElementById('deneyimModal'));
            modal.hide();

            // Formu temizle
            document.getElementById('deneyim-form').reset();

            // Başarılı mesajı göster
            Swal.fire({
                icon: 'success',
                title: 'Başarılı!',
                text: 'Deneyiminiz başarıyla paylaşıldı.',
                showConfirmButton: false,
                timer: 1500
            });

            // Deneyimleri yeniden yükle
            deneyimleriYukle();
        })
        .catch((error) => {
            console.error('Deneyim paylaşılırken hata:', error);
            Swal.fire({
                icon: 'error',
                title: 'Hata!',
                text: 'Deneyim paylaşılırken bir hata oluştu. Lütfen tekrar deneyin.'
            });
        });
}

// Çıkış yap
function logout() {
    firebase.auth().signOut().then(() => {
        localStorage.removeItem('isStudentLoggedIn');
        localStorage.removeItem('studentUsername');
        window.location.href = './svg-turkiye-haritasi.html';
    }).catch((error) => {
        console.error('Çıkış hatası:', error);
    });
} 