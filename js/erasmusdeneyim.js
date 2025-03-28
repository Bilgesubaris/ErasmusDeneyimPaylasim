// Kullanıcı bilgilerini localStorage'dan al
function getKullaniciBilgileri() {
    const kullanici = localStorage.getItem('kullanici');
    return kullanici ? JSON.parse(kullanici) : null;
}

// Kullanıcı bilgilerini güncelle
function kullaniciBilgileriniGuncelle() {
    const kullanici = getKullaniciBilgileri();
    if (kullanici) {
        document.querySelector('.profile-name').textContent = kullanici.ad;
        if (kullanici.profilResmi) {
            document.querySelector('.profile-image').src = kullanici.profilResmi;
        }
    } else {
        // Kullanıcı girişi yoksa login sayfasına yönlendir
        window.location.href = 'ogrencigiris.html';
    }
}

// Çıkış yapma fonksiyonu
window.cikisYap = function() {
    localStorage.removeItem('kullanici');
    window.location.href = 'svg-turkiye-haritasi.html';
};

// Yeni deneyim paylaşma fonksiyonu
function yeniDeneyimPaylas() {
    // Deneyim paylaşma modalı veya sayfası açılacak
    alert("Deneyim paylaşma özelliği yakında eklenecek!");
}

document.addEventListener('DOMContentLoaded', function() {
    // Kullanıcı bilgilerini kontrol et ve yükle
    const kullanici = JSON.parse(localStorage.getItem('kullanici')) || {};
    
    // Navbar profil bilgilerini güncelle
    if (kullanici.profilResmi) {
        document.getElementById('navProfileImage').src = kullanici.profilResmi;
    }
    document.getElementById('navProfileName').textContent = kullanici.ad || 'Kullanıcı Adı';

    // Deneyimleri yükle
    loadExperiences();
});

// Deneyim kaydetme fonksiyonu
function saveExperience() {
    // Form verilerini al
    const experience = {
        targetUniversity: document.getElementById('targetUniversity').value,
        country: document.getElementById('country').value,
        semester: document.getElementById('semester').value,
        rating: document.getElementById('rating').value,
        experience: document.getElementById('experience').value,
        recommendations: document.getElementById('recommendations').value,
        monthlyExpense: document.getElementById('monthlyExpense').value,
        accommodation: document.getElementById('accommodation').value,
        date: new Date().toISOString(),
        userId: JSON.parse(localStorage.getItem('kullanici')).email,
        userName: JSON.parse(localStorage.getItem('kullanici')).ad
    };

    // Validasyon
    if (!experience.targetUniversity || !experience.country || !experience.semester || 
        !experience.rating || !experience.experience || !experience.monthlyExpense || 
        !experience.accommodation) {
        alert('Lütfen tüm zorunlu alanları doldurun!');
        return;
    }

    // Mevcut deneyimleri al
    let experiences = JSON.parse(localStorage.getItem('experiences')) || [];
    
    // Yeni deneyimi ekle
    experiences.push(experience);
    
    // LocalStorage'a kaydet
    localStorage.setItem('experiences', JSON.stringify(experiences));
    
    // Modalı kapat
    const modal = bootstrap.Modal.getInstance(document.getElementById('addExperienceModal'));
    modal.hide();
    
    // Formu temizle
    document.getElementById('experienceForm').reset();
    
    // Deneyimleri yeniden yükle
    loadExperiences();
    
    // Başarı mesajı göster
    showAlert('success', 'Deneyiminiz başarıyla paylaşıldı!');
}

// Deneyimleri yükleme fonksiyonu
function loadExperiences() {
    const experiences = JSON.parse(localStorage.getItem('experiences')) || [];
    const experiencesList = document.getElementById('experiencesList');
    
    // Deneyimleri tarihe göre sırala (en yeni en üstte)
    experiences.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    experiencesList.innerHTML = experiences.map(exp => `
        <div class="col-12">
            <div class="experience-card">
                <div class="card-header">
                    <div class="user-info">
                        <h5 class="mb-0">${exp.userName}</h5>
                        <p class="text-muted mb-0">${exp.targetUniversity}</p>
                    </div>
                    <div class="meta-info">
                        <span class="country">
                            <i class="fas fa-map-marker-alt me-1"></i>${exp.country}
                        </span>
                        <span class="semester ms-3">
                            <i class="fas fa-calendar me-1"></i>${exp.semester}
                        </span>
                        <span class="rating ms-3">
                            ${'<i class="fas fa-star text-warning"></i>'.repeat(exp.rating)}
                            ${'<i class="far fa-star text-warning"></i>'.repeat(5 - exp.rating)}
                        </span>
                    </div>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${exp.targetUniversity}'de Erasmus Deneyimi</h5>
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
                </div>
            </div>
        </div>
    `).join('');
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

// Logout fonksiyonu
function logout() {
    // Kullanıcı oturumunu sonlandır
    localStorage.removeItem('currentUser');
    // Ana sayfaya yönlendir
    window.location.href = 'index.html';
}
