// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    // Kullanıcı bilgilerini kontrol et ve yükle
    const kullanici = JSON.parse(localStorage.getItem('kullanici')) || {};
    
    // Navbar profil bilgilerini güncelle
    if (kullanici.profilResmi) {
        document.querySelector('.profile-image').src = kullanici.profilResmi;
    }
    document.querySelector('.profile-name').textContent = kullanici.ad || 'Kullanıcı Adı';

    // Form submit olayını dinle
    const experienceForm = document.getElementById('experienceForm');
    if (experienceForm) {
        experienceForm.addEventListener('submit', handleExperienceSubmit);
    }

    // Fotoğraf yükleme önizlemesi
    const photosInput = document.getElementById('photos');
    if (photosInput) {
        photosInput.addEventListener('change', handlePhotoPreview);
    }

    // Ülke seçeneklerini yükle
    populateCountries();

    // Deneyimleri yükle
    loadExperiences();

    // Enter tuşu ile yorum gönderme
    const commentText = document.getElementById('commentText');
    if (commentText) {
        commentText.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                addComment();
            }
        });
    }

    // Yorum gönderme butonu
    const addCommentBtn = document.getElementById('addCommentBtn');
    if (addCommentBtn) {
        addCommentBtn.addEventListener('click', addComment);
    }

    // Modal kapanınca currentExperienceId'yi sıfırla
    const experienceModal = document.getElementById('experienceModal');
    if (experienceModal) {
        experienceModal.addEventListener('hidden.bs.modal', function() {
            currentExperienceId = null;
        });
    }
});

// Fotoğraf önizleme fonksiyonu
function handlePhotoPreview(event) {
    const files = event.target.files;
    if (!files.length) return;

    // Önizleme div'ini oluştur veya temizle
    let previewDiv = document.getElementById('photoPreview');
    if (!previewDiv) {
        previewDiv = document.createElement('div');
        previewDiv.id = 'photoPreview';
        previewDiv.className = 'photo-preview mt-2 d-flex gap-2 flex-wrap';
        event.target.parentNode.appendChild(previewDiv);
    } else {
        previewDiv.innerHTML = '';
    }

    // Her fotoğraf için önizleme oluştur
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.createElement('div');
            preview.className = 'preview-item position-relative';
            preview.innerHTML = `
                <img src="${e.target.result}" class="img-thumbnail" style="height: 100px; object-fit: cover;">
            `;
            previewDiv.appendChild(preview);
        };
        reader.readAsDataURL(file);
    });
}

// Deneyim form gönderimi
async function handleExperienceSubmit(event) {
    event.preventDefault();
    
    // Form verilerini al
    const formData = new FormData(event.target);
    const experience = {
        id: Date.now().toString(),
        university: formData.get('university'),
        country: formData.get('country'),
        city: formData.get('city'),
        semester: formData.get('semester'),
        title: formData.get('title'),
        experience: formData.get('experience'),
        rating: formData.get('rating'),
        accommodation: formData.get('accommodation'),
        monthlyExpense: formData.get('monthlyExpense'),
        recommendations: formData.get('recommendations'),
        photos: [],
        date: new Date().toISOString(),
        userId: JSON.parse(localStorage.getItem('kullanici'))?.email,
        userName: JSON.parse(localStorage.getItem('kullanici'))?.ad,
        status: 'pending'
    };

    // Zorunlu alanları kontrol et
    const requiredFields = {
        university: 'Üniversite',
        country: 'Ülke',
        city: 'Şehir',
        semester: 'Dönem',
        title: 'Başlık',
        experience: 'Deneyim',
        rating: 'Değerlendirme',
        accommodation: 'Konaklama',
        monthlyExpense: 'Aylık Harcama'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
        if (!experience[field]) {
            showNotification(`${label} alanı zorunludur`, 'warning');
            return;
        }
    }

    // Fotoğrafları işle
    const photoFiles = formData.getAll('photos');
    if (photoFiles.length > 0) {
        try {
            for (const file of photoFiles) {
                if (file.size > 0) {
                    const base64 = await convertFileToBase64(file);
                    experience.photos.push(base64);
                }
            }
        } catch (error) {
            console.error('Fotoğraf yükleme hatası:', error);
            showNotification('Fotoğraf yüklenirken bir hata oluştu', 'error');
            return;
        }
    }

    // Mevcut deneyimleri al ve yeni deneyimi ekle
    const experiences = JSON.parse(localStorage.getItem('experiences')) || [];
    experiences.unshift(experience);
    localStorage.setItem('experiences', JSON.stringify(experiences));

    // Formu sıfırla
    event.target.reset();
    
    // Fotoğraf önizlemeyi temizle
    const previewDiv = document.getElementById('photoPreview');
    if (previewDiv) {
        previewDiv.innerHTML = '';
    }

    // Modalı kapat
    const modal = bootstrap.Modal.getInstance(document.getElementById('addExperienceModal'));
    modal.hide();

    // Deneyimleri yeniden yükle
    loadExperiences();

    // Başarı mesajı göster
    showNotification('Deneyiminiz başarıyla gönderildi ve onay bekliyor', 'success');
}

// Dosyayı Base64'e çevirme
function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// AB Ülkeleri listesi
const euCountries = [
    { code: 'AT', name: 'Avusturya' },
    { code: 'BE', name: 'Belçika' },
    { code: 'BG', name: 'Bulgaristan' },
    { code: 'HR', name: 'Hırvatistan' },
    { code: 'CY', name: 'Kıbrıs' },
    { code: 'CZ', name: 'Çek Cumhuriyeti' },
    { code: 'DK', name: 'Danimarka' },
    { code: 'EE', name: 'Estonya' },
    { code: 'FI', name: 'Finlandiya' },
    { code: 'FR', name: 'Fransa' },
    { code: 'DE', name: 'Almanya' },
    { code: 'GR', name: 'Yunanistan' },
    { code: 'HU', name: 'Macaristan' },
    { code: 'IE', name: 'İrlanda' },
    { code: 'IT', name: 'İtalya' },
    { code: 'LV', name: 'Letonya' },
    { code: 'LT', name: 'Litvanya' },
    { code: 'LU', name: 'Lüksemburg' },
    { code: 'MT', name: 'Malta' },
    { code: 'NL', name: 'Hollanda' },
    { code: 'PL', name: 'Polonya' },
    { code: 'PT', name: 'Portekiz' },
    { code: 'RO', name: 'Romanya' },
    { code: 'SK', name: 'Slovakya' },
    { code: 'SI', name: 'Slovenya' },
    { code: 'ES', name: 'İspanya' },
    { code: 'SE', name: 'İsveç' }
];

// Ülke seçeneklerini doldur
function populateCountries() {
    const countrySelect = document.getElementById('country');
    if (!countrySelect) return;

    // Varsayılan seçenek
    countrySelect.innerHTML = '<option value="">Ülke Seçin</option>';

    // AB ülkelerini alfabetik sıraya göre ekle
    euCountries
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(country => {
            const option = document.createElement('option');
            option.value = country.code;
            option.textContent = country.name;
            countrySelect.appendChild(option);
        });
}

// Deneyimleri yükleme fonksiyonu
function loadExperiences() {
    const experiences = JSON.parse(localStorage.getItem('experiences')) || [];
    const approvedExperiences = experiences.filter(exp => exp.status === 'approved');
    const container = document.getElementById('experiencesContainer');
    
    if (!container) return;
    
    if (approvedExperiences.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                Henüz onaylanmış deneyim bulunmuyor
            </div>
        `;
        return;
    }

    container.innerHTML = approvedExperiences.map(exp => `
        <div class="experience-card mb-4">
            <div class="card-header">
                <div class="user-info">
                    <h5 class="mb-0">${exp.userName || 'Anonim'}</h5>
                    <p class="text-muted mb-0">${exp.university}</p>
                </div>
                <div class="meta-info">
                    <span class="country">
                        <i class="fas fa-map-marker-alt me-1"></i>${exp.country}
                    </span>
                    <span class="semester ms-3">
                        <i class="fas fa-calendar me-1"></i>${exp.semester}
                    </span>
                    <span class="rating ms-3">
                        ${'⭐'.repeat(parseInt(exp.rating))}
                    </span>
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title">${exp.title}</h5>
                <p class="experience-text">${exp.experience}</p>
                ${exp.recommendations ? `
                    <div class="recommendations">
                        <h6><i class="fas fa-lightbulb me-2"></i>Tavsiyeler</h6>
                        <p>${exp.recommendations}</p>
                    </div>
                ` : ''}
                <div class="experience-details">
                    <span class="detail-item">
                        <i class="fas fa-euro-sign me-1"></i>
                        Aylık: ${exp.monthlyExpense}€
                    </span>
                    <span class="detail-item ms-3">
                        <i class="fas fa-home me-1"></i>
                        ${exp.accommodation}
                    </span>
                </div>
                ${exp.photos && exp.photos.length > 0 ? `
                    <div class="experience-photos mt-3">
                        <div class="row g-2">
                            ${exp.photos.map(photo => `
                                <div class="col-md-4">
                                    <img src="${photo}" class="img-fluid rounded" alt="Deneyim fotoğrafı">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Yorum ekleme fonksiyonu
function addComment(event, experienceId) {
    event.preventDefault();
    
    const kullanici = JSON.parse(localStorage.getItem('kullanici'));
    if (!kullanici) {
        showAlert('warning', 'Yorum yapabilmek için giriş yapmalısınız!');
        return false;
    }
    
    const commentText = event.target.comment.value.trim();
    if (!commentText) {
        showAlert('warning', 'Yorum boş olamaz!');
        return false;
    }
    
    const comment = {
        id: Date.now().toString(),
        content: commentText,
        userId: kullanici.email,
        userName: kullanici.ad,
        date: new Date().toISOString(),
        status: 'pending'
    };
    
    const experiences = JSON.parse(localStorage.getItem('experiences')) || [];
    const expIndex = experiences.findIndex(exp => exp.id === experienceId);
    
    if (expIndex !== -1) {
        if (!experiences[expIndex].comments) {
            experiences[expIndex].comments = [];
        }
        experiences[expIndex].comments.push(comment);
        localStorage.setItem('experiences', JSON.stringify(experiences));
        
        event.target.reset();
        showAlert('success', 'Yorumunuz gönderildi ve onay bekliyor!');
        loadExperiences(); // Sayfayı yenile
    }
    
    return false;
}

// Alert gösterme fonksiyonu
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '1050';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Çıkış yapma fonksiyonu
function cikisYap() {
    localStorage.removeItem('kullanici');
    window.location.href = 'svg-turkiye-haritasi.html';
}

let currentExperienceId = null;

function viewExperience(id) {
    const experiences = JSON.parse(localStorage.getItem('experiences')) || [];
    const experience = experiences.find(exp => exp.id === id);
    
    if (experience) {
        currentExperienceId = id;
        
        // Modal içeriğini doldur
        document.getElementById('modalUserImage').src = experience.userImage || 'https://via.placeholder.com/96';
        document.getElementById('modalUserName').textContent = experience.userName || 'İsimsiz';
        document.getElementById('modalUniversity').textContent = experience.university || '';
        document.getElementById('modalCountry').textContent = experience.country || '';
        document.getElementById('modalSemester').textContent = experience.semester || '';
        document.getElementById('modalContent').textContent = experience.experience || '';
        
        // Yorumları yükle
        loadComments(id);
        
        // Modalı göster
        const modal = new bootstrap.Modal(document.getElementById('experienceModal'));
        modal.show();
    }
}

function loadComments(experienceId) {
    const experiences = JSON.parse(localStorage.getItem('experiences')) || [];
    const experience = experiences.find(exp => exp.id === experienceId);
    const commentsList = document.getElementById('commentsList');
    
    if (!commentsList) return;
    
    if (!experience || !experience.comments || experience.comments.length === 0) {
        commentsList.innerHTML = '<div class="text-muted text-center py-3">İlk yorumu sen yap</div>';
        return;
    }
    
    commentsList.innerHTML = experience.comments.map(comment => `
        <div class="comment-item py-2">
            <div class="d-flex">
                <div class="comment-avatar me-2">
                    <i class="fas fa-user"></i>
                </div>
                <div class="flex-grow-1">
                    <span class="fw-bold me-2">${comment.userName || 'Öğrenci'}</span>
                    <span>${comment.text}</span>
                    <div class="text-muted small">${timeAgo(new Date(comment.date))}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function addComment() {
    if (!currentExperienceId) {
        console.error('No experience selected');
        return;
    }
    
    const commentText = document.getElementById('commentText');
    if (!commentText) return;
    
    const text = commentText.value.trim();
    if (!text) {
        showNotification('Yorum alanı boş olamaz', 'warning');
        return;
    }
    
    const experiences = JSON.parse(localStorage.getItem('experiences')) || [];
    const index = experiences.findIndex(exp => exp.id === currentExperienceId);
    
    if (index !== -1) {
        if (!experiences[index].comments) {
            experiences[index].comments = [];
        }
        
        // Öğrenci bilgilerini al
        const student = JSON.parse(localStorage.getItem('student') || sessionStorage.getItem('student'));
        
        const comment = {
            id: Date.now().toString(),
            text: text,
            date: new Date().toISOString(),
            userName: student ? student.name : 'Öğrenci'
        };
        
        experiences[index].comments.push(comment);
        localStorage.setItem('experiences', JSON.stringify(experiences));
        
        // Yorum alanını temizle
        commentText.value = '';
        
        // Yorumları yeniden yükle
        loadComments(currentExperienceId);
        
        showNotification('Yorum başarıyla eklendi', 'success');
    }
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return interval + ' yıl önce';
    
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + ' ay önce';
    
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return interval + ' gün önce';
    
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return interval + ' saat önce';
    
    interval = Math.floor(seconds / 60);
    if (interval > 1) return interval + ' dakika önce';
    
    if(seconds < 10) return 'şimdi';
    
    return Math.floor(seconds) + ' saniye önce';
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

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}
