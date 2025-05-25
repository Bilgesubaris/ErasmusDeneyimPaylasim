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
firebase.initializeApp(firebaseConfig);

// Ülke listesi
const countries = [
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

// Sayfa yüklendiğinde ülkeleri yükle
document.addEventListener('DOMContentLoaded', function() {
    loadCountries();
});

// Kullanıcı oturumunu kontrol et
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // Kullanıcı giriş yapmışsa profil bilgilerini yükle
        loadUserProfile(user.uid);
        loadUserStats(user.uid);
    } else {
        // Kullanıcı giriş yapmamışsa giriş sayfasına yönlendir
        window.location.href = 'ogrencigiris.html';
    }
});

// Ülkeleri yükle
function loadCountries() {
    console.log('Ülkeler yükleniyor...'); // Debug log
    const countrySelect = document.getElementById('country');
    if (!countrySelect) {
        console.error('Ülke seçim alanı bulunamadı!');
        return;
    }

    // Select elementini temizle
    countrySelect.innerHTML = '<option value="">Ülke Seçiniz</option>';

    // Ülkeleri alfabetik sıraya göre sırala
    const sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));

    // Ülkeleri select elementine ekle
    sortedCountries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = country.name;
        countrySelect.appendChild(option);
    });
    
    console.log('Ülkeler yüklendi:', sortedCountries.length); // Debug log
}

// Profil bilgilerini yükle
function loadUserProfile(userId) {
    firebase.firestore().collection('users').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                
                // Profil bilgilerini form alanlarına doldur
                document.getElementById('profileName').textContent = userData.fullName || 'Kullanıcı';
                document.getElementById('universityInfo').textContent = `${userData.university || ''} - ${userData.department || ''}`;
                document.getElementById('fullName').value = userData.fullName || '';
                document.getElementById('email').value = userData.email || '';
                document.getElementById('university').value = userData.university || '';
                document.getElementById('department').value = userData.department || '';
                document.getElementById('about').value = userData.about || '';
                document.getElementById('linkedin').value = userData.linkedin || '';
                document.getElementById('instagram').value = userData.instagram || '';
                
                // Profil fotoğrafını yükle
                if (userData.profilePhoto) {
                    document.getElementById('mainProfileImage').src = userData.profilePhoto;
                }

                // Sosyal medya linklerini güncelle
                if (userData.linkedin) {
                    document.getElementById('linkedinLink').href = userData.linkedin;
                }
                if (userData.instagram) {
                    document.getElementById('instagramLink').href = `https://instagram.com/${userData.instagram}`;
                }
            }
        })
        .catch((error) => {
            console.error("Profil yüklenirken hata:", error);
            showErrorAlert('Profil bilgileri yüklenirken bir hata oluştu.');
        });
}

// Kullanıcı istatistiklerini yükle
function loadUserStats(userId) {
    firebase.firestore().collection('users').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                document.getElementById('experienceCount').textContent = userData.experienceCount || 0;
                document.getElementById('commentCount').textContent = userData.commentCount || 0;
                document.getElementById('likeCount').textContent = userData.likeCount || 0;
            }
        })
        .catch((error) => {
            console.error("İstatistikler yüklenirken hata:", error);
        });
}

// Profil düzenleme işlevselliği
document.addEventListener('DOMContentLoaded', () => {
    const editProfileBtn = document.getElementById('editProfileBtn');
    const formActions = document.getElementById('formActions');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const successAlert = document.getElementById('successAlert');
    const profileForm = document.getElementById('profileForm');
    const inputs = profileForm.querySelectorAll('input, textarea');

    // Profil düzenleme butonuna tıklandığında
    editProfileBtn.addEventListener('click', () => {
        // Form alanlarını düzenlenebilir yap
        inputs.forEach(input => {
            if (input.id !== 'email') { // Email alanı her zaman readonly kalacak
                input.disabled = false;
            }
        });
        
        // Düzenleme butonlarını göster
        formActions.classList.remove('d-none');
        editProfileBtn.classList.add('d-none');
    });

    // İptal butonuna tıklandığında
    cancelEditBtn.addEventListener('click', () => {
        // Form alanlarını tekrar devre dışı bırak
        inputs.forEach(input => {
            input.disabled = true;
        });
        
        // Düzenleme butonlarını gizle
        formActions.classList.add('d-none');
        editProfileBtn.classList.remove('d-none');
        
        // Formu sıfırla
        profileForm.reset();
    });

    // Kaydet butonuna tıklandığında
    saveProfileBtn.addEventListener('click', async () => {
        try {
            // Form verilerini topla
            const formData = {
                fullName: document.getElementById('fullName').value,
                university: document.getElementById('university').value,
                department: document.getElementById('department').value,
                about: document.getElementById('about').value,
                linkedin: document.getElementById('linkedin').value,
                instagram: document.getElementById('instagram').value
            };

            // Firebase'den mevcut kullanıcıyı al
            const user = firebase.auth().currentUser;
            if (!user) {
                throw new Error('Kullanıcı oturumu bulunamadı');
            }

            // Firestore'da kullanıcı profilini güncelle
            await firebase.firestore().collection('users').doc(user.uid).update(formData);

            // Başarı mesajını göster
            successAlert.classList.remove('d-none');
            setTimeout(() => {
                successAlert.classList.add('d-none');
            }, 3000);

            // Form alanlarını devre dışı bırak
            inputs.forEach(input => {
                input.disabled = true;
            });

            // Düzenleme butonlarını gizle
            formActions.classList.add('d-none');
            editProfileBtn.classList.remove('d-none');

            // Profil bilgilerini güncelle
            updateProfileDisplay(formData);

        } catch (error) {
            console.error('Profil güncellenirken hata:', error);
            Swal.fire({
                icon: 'error',
                title: 'Hata!',
                text: 'Profil güncellenirken bir hata oluştu: ' + error.message
            });
        }
    });

    // Profil fotoğrafı değiştirme
    const photoInput = document.getElementById('photoInput');
    photoInput.addEventListener('change', async (e) => {
        try {
            const file = e.target.files[0];
            if (!file) return;

            // Dosya boyutu kontrolü (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('Dosya boyutu 5MB\'dan küçük olmalıdır');
            }

            // Dosya tipi kontrolü
            if (!file.type.startsWith('image/')) {
                throw new Error('Lütfen geçerli bir resim dosyası seçin');
            }

            const user = firebase.auth().currentUser;
            if (!user) {
                throw new Error('Kullanıcı oturumu bulunamadı');
            }

            // Storage'a yükle
            const storageRef = firebase.storage().ref();
            const photoRef = storageRef.child(`profile_photos/${user.uid}`);
            await photoRef.put(file);

            // Fotoğraf URL'sini al
            const photoURL = await photoRef.getDownloadURL();

            // Kullanıcı profilini güncelle
            await user.updateProfile({
                photoURL: photoURL
            });

            // Firestore'da profil bilgisini güncelle
            await firebase.firestore().collection('users').doc(user.uid).update({
                photoURL: photoURL
            });

            // Profil fotoğrafını güncelle
            document.getElementById('mainProfileImage').src = photoURL;

            Swal.fire({
                icon: 'success',
                title: 'Başarılı!',
                text: 'Profil fotoğrafınız güncellendi'
            });

        } catch (error) {
            console.error('Fotoğraf yüklenirken hata:', error);
            Swal.fire({
                icon: 'error',
                title: 'Hata!',
                text: 'Fotoğraf yüklenirken bir hata oluştu: ' + error.message
            });
        }
    });
});

// Profil bilgilerini görüntüleme alanlarını güncelle
function updateProfileDisplay(data) {
    document.getElementById('profileName').textContent = data.fullName;
    document.getElementById('universityInfo').textContent = `${data.university} - ${data.department}`;
    
    // LinkedIn ve Instagram linklerini güncelle
    const linkedinLink = document.getElementById('linkedinLink');
    const instagramLink = document.getElementById('instagramLink');
    
    if (data.linkedin) {
        linkedinLink.href = data.linkedin;
        linkedinLink.classList.remove('d-none');
    } else {
        linkedinLink.classList.add('d-none');
    }
    
    if (data.instagram) {
        instagramLink.href = `https://instagram.com/${data.instagram}`;
        instagramLink.classList.remove('d-none');
    } else {
        instagramLink.classList.add('d-none');
    }
}

// Profil fotoğrafı önizleme
function previewProfileImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('mainProfileImage').src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Çıkış yap
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'ogrencigiris.html';
    }).catch((error) => {
        console.error("Çıkış yapılırken hata:", error);
        showErrorAlert('Çıkış yapılırken bir hata oluştu.');
    });
}

// Başarı mesajı göster
function showSuccessAlert(message) {
    const alert = document.getElementById('successAlert');
    const messageSpan = document.getElementById('successMessage');
    messageSpan.textContent = message;
    alert.classList.remove('d-none');
    
    // 3 saniye sonra mesajı gizle
    setTimeout(() => {
        alert.classList.add('d-none');
    }, 3000);
}

// Hata mesajı göster
function showErrorAlert(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.innerHTML = `
        <i class="fas fa-exclamation-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.querySelector('.profile-card').insertBefore(alert, document.getElementById('profileForm'));
    
    // 5 saniye sonra mesajı kaldır
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Yükleme mesajı göster
function showLoadingAlert(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-info alert-dismissible fade show';
    alert.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="spinner-border spinner-border-sm me-2" role="status"></div>
            <span>${message}</span>
        </div>
    `;
    
    document.querySelector('.profile-card').insertBefore(alert, document.getElementById('profileForm'));
    
    // 3 saniye sonra mesajı kaldır
    setTimeout(() => {
        alert.remove();
    }, 3000);
}
