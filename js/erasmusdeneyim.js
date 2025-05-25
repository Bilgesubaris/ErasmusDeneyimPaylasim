import { auth, db, storage } from './firebase-config.js';

// Kullanıcı oturum durumunu kontrol et
auth.onAuthStateChanged((user) => {
    if (user) {
        // Kullanıcı giriş yapmış
        updateUIForLoggedInUser(user);
    } else {
        // Kullanıcı giriş yapmamış
        updateUIForLoggedOutUser();
    }
});

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Deneyimleri yükle
        await loadExperiences();
    } catch (error) {
        console.error('Sayfa yüklenirken hata:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Sayfa yüklenirken bir hata oluştu: ' + error.message
        });
    }
});

// Giriş yapmış kullanıcı için UI güncelleme
function updateUIForLoggedInUser(user) {
    const profileButton = document.querySelector('.profile-button');
    const profileName = document.querySelector('.profile-name');
    const profileImage = document.querySelector('.profile-image');

    if (profileButton && profileName && profileImage) {
        profileName.textContent = user.displayName || 'Kullanıcı';
        profileImage.src = user.photoURL || 'https://via.placeholder.com/40';
    }
}

// Giriş yapmamış kullanıcı için UI güncelleme
function updateUIForLoggedOutUser() {
    const profileButton = document.querySelector('.profile-button');
    const profileName = document.querySelector('.profile-name');
    const profileImage = document.querySelector('.profile-image');

    if (profileButton && profileName && profileImage) {
        profileName.textContent = 'Giriş Yap';
        profileImage.src = 'https://via.placeholder.com/40';
    }
}

// Çıkış yapma fonksiyonu
window.logout = async () => {
    try {
        await auth.signOut();
        window.location.href = 'svg-turkiye-haritasi.html';
    } catch (error) {
        console.error('Çıkış yapılırken hata oluştu:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Çıkış yapılırken bir hata oluştu.'
        });
    }
};

// Deneyim paylaşma butonuna tıklama olayı
document.querySelector('.btn-primary').addEventListener('click', () => {
    const addExperienceModal = new bootstrap.Modal(document.getElementById('addExperienceModal'));
    addExperienceModal.show();
});

// Deneyimleri yükle
async function loadExperiences() {
    try {
        console.log('Deneyimler yükleniyor...');
        
        const experiencesContainer = document.getElementById('experiencesContainer');
        if (!experiencesContainer) {
            console.error('Deneyimler container bulunamadı');
            return;
        }

        experiencesContainer.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';

        // Firebase bağlantısını kontrol et
        if (!db) {
            throw new Error('Firebase bağlantısı bulunamadı');
        }

        console.log('Firebase bağlantısı başarılı, deneyimler getiriliyor...');

        // Sadece onaylanmış deneyimleri getir
        const snapshot = await db.collection('experiences')
            .where('status', '==', 'approved')
            .orderBy('createdAt', 'desc')
            .get();

        console.log('Deneyimler:', snapshot.docs.length);

        if (snapshot.empty) {
            console.log('Deneyim bulunamadı');
            experiencesContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">Henüz onaylanmış deneyim bulunmuyor</p>
                </div>
            `;
            return;
        }

        experiencesContainer.innerHTML = ''; // Container'ı temizle

        // Deneyimleri göster
        snapshot.forEach(doc => {
            const experience = doc.data();
            console.log('Deneyim verisi:', experience);
            
            const experienceCard = document.createElement('div');
            experienceCard.className = 'col-md-6 col-lg-4 mb-4';
            
            experienceCard.innerHTML = `
                <div class="card h-100 experience-card" onclick="viewExperience('${doc.id}')">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title mb-0">${experience.university || 'Üniversite Belirtilmemiş'}</h5>
                        </div>
                        <div class="experience-info mb-3">
                            <div class="info-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${experience.city || ''}, ${experience.country || 'Ülke Belirtilmemiş'}</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-calendar-alt"></i>
                                <span>${experience.semester || 'Dönem Belirtilmemiş'}</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-graduation-cap"></i>
                                <span>${experience.department || 'Bölüm Belirtilmemiş'}</span>
                            </div>
                        </div>
                        <p class="card-text">${truncateText(experience.content || 'Açıklama yok', 150)}</p>
                    </div>
                    <div class="card-footer">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="user-info">
                                <span class="username">${experience.username || 'Anonim'}</span>
                            </div>
                            <div class="post-date">
                                <i class="fas fa-clock"></i>
                                ${formatDate(experience.createdAt)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            experiencesContainer.appendChild(experienceCard);
        });

        console.log('Deneyimler başarıyla yüklendi');
    } catch (error) {
        console.error('Deneyimler yüklenirken hata oluştu:', error);
        experiencesContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Deneyimler yüklenirken bir hata oluştu: ${error.message}
                </div>
            </div>
        `;
    }
}

// Yıldız derecelendirmesi oluştur
function generateRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
        }

    return stars;
}

// Metni kısalt
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Tarihi formatla
function formatDate(timestamp) {
    if (!timestamp) return 'Tarih belirtilmemiş';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now - date;
    
    // Son 24 saat içindeyse
    if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        if (hours === 0) {
            const minutes = Math.floor(diff / (60 * 1000));
            return `${minutes} dakika önce`;
        }
        return `${hours} saat önce`;
}

    // Son 7 gün içindeyse
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `${days} gün önce`;
    }
    
    // Daha eskiyse
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Deneyim detaylarını görüntüle
async function viewExperience(id) {
    try {
        const experienceDoc = await db.collection('experiences').doc(id).get();
        
        if (!experienceDoc.exists) {
            throw new Error('Deneyim bulunamadı');
        }

        const experience = experienceDoc.data();
        const modal = document.getElementById('viewExperienceModal');
        const details = modal.querySelector('.experience-details');
        
        // Deneyim detaylarını doldur
        details.dataset.experienceId = id;
        details.querySelector('.username').textContent = experience.username || 'Anonim';
        details.querySelector('.date').textContent = formatDate(experience.createdAt);
        details.querySelector('.rating').innerHTML = generateRatingStars(experience.rating || 0);
        details.querySelector('.experience-title').textContent = experience.title || 'Başlıksız Deneyim';
        details.querySelector('.university').textContent = experience.university || 'Belirtilmemiş';
        details.querySelector('.location').textContent = `${experience.city || ''}, ${experience.country || 'Belirtilmemiş'}`;
        details.querySelector('.semester').textContent = experience.semester || 'Belirtilmemiş';
        details.querySelector('.accommodation').textContent = experience.accommodation || 'Belirtilmemiş';
        details.querySelector('.expense').textContent = `${experience.monthlyExpense || 0} €`;
        details.querySelector('.experience-text').textContent = experience.content || 'Açıklama yok';
        details.querySelector('.recommendations-text').textContent = experience.recommendations || 'Tavsiye yok';

        // Modal'ı göster
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    } catch (error) {
        console.error('Deneyim detayları yüklenirken hata oluştu:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Deneyim detayları yüklenirken bir hata oluştu: ' + error.message
        });
    }
}

// Deneyim formunu dinle
document.getElementById('experienceForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
    const user = auth.currentUser;
    if (!user) {
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
                text: 'Deneyim paylaşmak için giriş yapmalısınız.'
        });
        return;
    }

        // Form verilerini topla
        const formData = {
            university: document.getElementById('university').value,
            country: document.getElementById('country').value,
            city: document.getElementById('city').value,
            semester: document.getElementById('semester').value,
            title: document.getElementById('title').value,
            content: document.getElementById('experience').value,
            rating: parseInt(document.getElementById('rating').value),
            accommodation: document.getElementById('accommodation').value,
            monthlyExpense: parseInt(document.getElementById('monthlyExpense').value),
            recommendations: document.getElementById('recommendations').value,
            userId: user.uid,
            username: user.displayName || 'Anonim Kullanıcı',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending', // Onay bekliyor durumu
            likes: [],
            comments: []
        };

        // Fotoğrafları yükle
        const photoFiles = document.getElementById('photos').files;
        if (photoFiles.length > 0) {
            const photoUrls = [];
            for (let i = 0; i < photoFiles.length; i++) {
                const file = photoFiles[i];
                const storageRef = storage.ref();
                const photoRef = storageRef.child(`experiences/${user.uid}/${Date.now()}_${file.name}`);
                await photoRef.put(file);
                const url = await photoRef.getDownloadURL();
                photoUrls.push(url);
            }
            formData.photos = photoUrls;
        }

        // Deneyimi Firestore'a kaydet
        await db.collection('experiences').add(formData);

        // Başarılı mesajı göster
        Swal.fire({
            icon: 'success',
            title: 'Başarılı!',
            text: 'Deneyiminiz admin onayına gönderildi. Onaylandıktan sonra yayınlanacaktır.'
        });

        // Formu temizle ve modalı kapat
        document.getElementById('experienceForm').reset();
        document.getElementById('photoPreview').innerHTML = '';
        bootstrap.Modal.getInstance(document.getElementById('addExperienceModal')).hide();

    } catch (error) {
        console.error('Deneyim paylaşılırken hata:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Deneyim paylaşılırken bir hata oluştu.'
        });
    }
});

// Fotoğraf önizleme
function previewPhotos(input) {
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = '';

    if (input.files) {
        for (let i = 0; i < input.files.length; i++) {
            const file = input.files[i];
            const reader = new FileReader();

            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-image';
                preview.appendChild(img);
            }

            reader.readAsDataURL(file);
        }
    }
}

// Scroll to experiences section
function scrollToExperiences() {
    const experiencesSection = document.querySelector('.experiences-grid');
    if (experiencesSection) {
        experiencesSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load countries
    loadCountries();
    
    // Load experiences
    loadExperiences();
});
