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

// Firebase referanslarını al
let firestoreDb;

// Firebase'i başlat
function initializeFirebase() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        firestoreDb = firebase.firestore();
        console.log('Firebase başarıyla başlatıldı');
        return true;
    } catch (error) {
        console.error('Firebase başlatma hatası:', error);
        return false;
    }
}

// Deneyimleri yükle
async function loadExperiences() {
    try {
        console.log('Deneyimler yükleniyor...');
        
        const experiencesContainer = document.getElementById('experiencesContainer');
        if (!experiencesContainer) {
            console.error('Deneyimler container bulunamadı');
            return;
        }

        experiencesContainer.innerHTML = ''; // Container'ı temizle

        // Onaylanmış deneyimleri getir
        const experiencesSnapshot = await firestoreDb.collection('experiences')
            .orderBy('date', 'desc')
            .limit(20)
            .get();

        console.log('Onaylanmış deneyimler:', experiencesSnapshot.docs.length);

        if (experiencesSnapshot.empty) {
            experiencesContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">Henüz onaylanmış deneyim bulunmamaktadır.</p>
                </div>
            `;
            return;
        }

        // Deneyimleri göster
        experiencesSnapshot.forEach(doc => {
            const experience = doc.data();
            
            const experienceCard = document.createElement('div');
            experienceCard.className = 'col-md-6 col-lg-4 mb-4';
            
            experienceCard.innerHTML = `
                <div class="card h-100 experience-card" onclick="viewExperience('${doc.id}')">
                    <div class="card-img-container">
                        ${experience.image ? 
                            `<img src="${experience.image}" class="card-img-top" alt="Deneyim Görseli">` : 
                            `<div class="no-image">
                                <i class="fas fa-image"></i>
                            </div>`
                        }
                    </div>
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title mb-0">${experience.title || 'Başlıksız Deneyim'}</h5>
                            <div class="rating">
                                ${generateRatingStars(experience.rating || 0)}
                            </div>
                        </div>
                        <div class="experience-info mb-3">
                            <div class="info-item">
                                <i class="fas fa-university"></i>
                                <span>${experience.university || 'Belirtilmemiş'}</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${experience.city || ''}, ${experience.country || 'Belirtilmemiş'}</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-calendar-alt"></i>
                                <span>${experience.semester || 'Belirtilmemiş'}</span>
                            </div>
                        </div>
                        <p class="card-text">${truncateText(experience.experience || 'Açıklama yok', 150)}</p>
                    </div>
                    <div class="card-footer">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="user-info">
                                <img src="${experience.userImage || 'https://via.placeholder.com/32'}" 
                                    alt="${experience.username}" class="user-avatar">
                                <span class="username">${experience.username || 'Anonim'}</span>
                            </div>
                            <div class="post-date">
                                <i class="fas fa-clock"></i>
                                ${formatDate(experience.date)}
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
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Deneyimler yüklenirken bir hata oluştu: ' + error.message
        });
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
        const experienceDoc = await firestoreDb.collection('experiences').doc(id).get();
        
        if (!experienceDoc.exists) {
            throw new Error('Deneyim bulunamadı');
        }

        const experience = experienceDoc.data();
        const modal = document.getElementById('viewExperienceModal');
        const details = modal.querySelector('.experience-details');
        
        // Deneyim detaylarını doldur
        details.dataset.experienceId = id;
        details.querySelector('.username').textContent = experience.username || 'Anonim';
        details.querySelector('.date').textContent = formatDate(experience.date);
        details.querySelector('.rating').innerHTML = generateRatingStars(experience.rating || 0);
        details.querySelector('.experience-title').textContent = experience.title || 'Başlıksız Deneyim';
        details.querySelector('.university').textContent = experience.university || 'Belirtilmemiş';
        details.querySelector('.location').textContent = `${experience.city || ''}, ${experience.country || 'Belirtilmemiş'}`;
        details.querySelector('.semester').textContent = experience.semester || 'Belirtilmemiş';
        details.querySelector('.accommodation').textContent = experience.accommodation || 'Belirtilmemiş';
        details.querySelector('.expense').textContent = `${experience.monthlyExpense || 0} €`;
        details.querySelector('.experience-text').textContent = experience.experience || 'Açıklama yok';
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

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Firebase'i başlat
        if (initializeFirebase()) {
            // Deneyimleri yükle
            await loadExperiences();
        }
    } catch (error) {
        console.error('Sayfa yüklenirken hata:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Sayfa yüklenirken bir hata oluştu: ' + error.message
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Deneyimleri yükle
    loadExperiences();
    
    // Filtreleme olaylarını dinle
    setupFilters();

    // Modal kapanınca currentExperienceId'yi sıfırla
    const experienceModal = document.getElementById('experienceModal');
    experienceModal.addEventListener('hidden.bs.modal', function() {
        currentExperienceId = null;
    });

    // Yorum ekleme butonunu dinle
    const addCommentBtn = document.getElementById('addCommentBtn');
    if (addCommentBtn) {
        addCommentBtn.addEventListener('click', addComment);
    }
});

let currentExperienceId = null;

function loadComments(experienceId) {
    const experiences = JSON.parse(localStorage.getItem('experiences')) || [];
    const experience = experiences.find(exp => exp.id === experienceId);
    const commentsList = document.getElementById('commentsList');
    
    if (!commentsList) return;
    
    if (!experience || !experience.comments || experience.comments.length === 0) {
        commentsList.innerHTML = '<div class="text-muted text-center py-3">Henüz yorum yapılmamış</div>';
        return;
    }
    
    commentsList.innerHTML = experience.comments.map(comment => `
        <div class="comment-item mb-3">
            <div class="d-flex justify-content-between align-items-start">
                <div class="d-flex gap-2">
                    <div class="comment-avatar">
                        <i class="fas fa-user-shield text-primary"></i>
                    </div>
                    <div>
                        <div class="fw-bold">Admin</div>
                        <div class="comment-text">${comment.text}</div>
                        <div class="text-muted small">${new Date(comment.date).toLocaleString('tr-TR')}</div>
                    </div>
                </div>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteComment('${experienceId}', '${comment.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function addComment() {
    if (!currentExperienceId) {
        console.error('No experience selected');
        return;
    }
    
    const commentText = document.getElementById('commentText').value.trim();
    if (!commentText) {
        showNotification('Yorum alanı boş olamaz', 'warning');
        return;
    }
    
    const experiences = JSON.parse(localStorage.getItem('experiences')) || [];
    const index = experiences.findIndex(exp => exp.id === currentExperienceId);
    
    if (index !== -1) {
        if (!experiences[index].comments) {
            experiences[index].comments = [];
        }
        
        const comment = {
            id: Date.now().toString(),
            text: commentText,
            date: new Date().toISOString()
        };
        
        experiences[index].comments.push(comment);
        localStorage.setItem('experiences', JSON.stringify(experiences));
        
        // Yorum alanını temizle
        document.getElementById('commentText').value = '';
        
        // Yorumları yeniden yükle
        loadComments(currentExperienceId);
        
        showNotification('Yorum başarıyla eklendi', 'success');
    }
}

function deleteComment(experienceId, commentId) {
    const experiences = JSON.parse(localStorage.getItem('experiences')) || [];
    const index = experiences.findIndex(exp => exp.id === experienceId);
    
    if (index !== -1 && experiences[index].comments) {
        experiences[index].comments = experiences[index].comments.filter(c => c.id !== commentId);
        localStorage.setItem('experiences', JSON.stringify(experiences));
        
        // Yorumları yeniden yükle
        loadComments(experienceId);
        
        showNotification('Yorum silindi', 'success');
    }
}

function updateStatus(id, status) {
    const experiences = JSON.parse(localStorage.getItem('experiences')) || [];
    const index = experiences.findIndex(exp => exp.id === id);
    
    if (index !== -1) {
        experiences[index].status = status;
        localStorage.setItem('experiences', JSON.stringify(experiences));
        
        // Tabloyu güncelle
        loadExperiences();
        
        // Bildirim göster
        showNotification(
            status === 'approved' ? 'Deneyim başarıyla onaylandı' : 'Deneyim reddedildi',
            status === 'approved' ? 'success' : 'danger'
        );
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification`;
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000; padding: 1rem; border-radius: 0.5rem;';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function setupFilters() {
    const searchInput = document.getElementById('searchExperience');
    const filterStatus = document.getElementById('filterStatus');
    
    if (searchInput) {
        searchInput.addEventListener('input', loadExperiences);
    }
    
    if (filterStatus) {
        filterStatus.addEventListener('change', loadExperiences);
    }
}

document.getElementById('experienceForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const formData = {
        id: Date.now().toString(),
        university: document.getElementById('university').value,
        country: document.getElementById('country').value,
        city: document.getElementById('city').value,
        semester: document.getElementById('semester').value,
        title: document.getElementById('title').value,
        experience: document.getElementById('experience').value,
        rating: document.getElementById('rating').value,
        accommodation: document.getElementById('accommodation').value,
        monthlyExpense: document.getElementById('monthlyExpense').value,
        date: new Date().toISOString(),
        status: 'pending', // Yeni eklenen deneyimlere 'pending' durumu atanıyor
        userName: JSON.parse(localStorage.getItem('kullanici')).ad,
        userEmail: JSON.parse(localStorage.getItem('kullanici')).email,
        userImage: JSON.parse(localStorage.getItem('kullanici')).profilResmi
    };
    
    // Mevcut deneyimleri al ve yenisini ekle
    const experiences = JSON.parse(localStorage.getItem('experiences') || '[]');
    experiences.push(formData);
    localStorage.setItem('experiences', JSON.stringify(experiences));
    
    // Modal'ı kapat ve başarı mesajı göster
    const modal = bootstrap.Modal.getInstance(document.getElementById('addExperienceModal'));
    modal.hide();
    
    showNotification('Deneyiminiz başarıyla paylaşıldı ve onay için gönderildi', 'success');
    
    // Deneyimleri yeniden yükle
    loadExperiences();
});
