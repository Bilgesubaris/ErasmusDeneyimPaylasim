// Admin credentials
const ADMIN_EMAIL = 'admin@erasmus.com';
const ADMIN_PASSWORD = 'admin123';

// Form submit olayını dinle
document.addEventListener('DOMContentLoaded', function() {
    // Eğer zaten admin girişi yapılmışsa panel sayfasına yönlendir
    const adminSession = JSON.parse(localStorage.getItem('admin') || sessionStorage.getItem('admin'));
    if (adminSession) {
        window.location.href = 'admin-panel.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Form verilerini al
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            const errorMessage = document.getElementById('error-message');

            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                // Admin bilgilerini sakla
                const adminInfo = {
                    email: email,
                    role: 'admin',
                    lastLogin: new Date().toISOString()
                };
                
                if (remember) {
                    localStorage.setItem('admin', JSON.stringify(adminInfo));
                } else {
                    sessionStorage.setItem('admin', JSON.stringify(adminInfo));
                }

                // Admin paneline yönlendir
                window.location.href = 'admin-panel.html';
            } else {
                // Hata mesajını göster
                errorMessage.style.display = 'block';
                setTimeout(() => {
                    errorMessage.style.display = 'none';
                }, 3000);
            }
        });
    }

    // Admin oturum kontrolü
    const currentPage = window.location.pathname.split('/').pop();
    const admin = JSON.parse(localStorage.getItem('admin') || sessionStorage.getItem('admin') || 'null');

    if (currentPage === 'admin-panel.html') {
        if (!admin) {
            window.location.href = 'admingiris.html';
        }
    } else if (currentPage === 'admingiris.html') {
        if (admin) {
            window.location.href = 'admin-panel.html';
        }
    }

    // Navbar linklerini dinle
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            
            // Aktif sekmeyi güncelle
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Bölümleri göster/gizle
            document.querySelectorAll('.section').forEach(section => {
                section.style.display = section.id === targetId ? 'block' : 'none';
            });
        });
    });
});

// Admin panel functions
function loadExperiences() {
    const experiencesList = document.getElementById('experiences-list');
    if (!experiencesList) return;

    const experiences = JSON.parse(localStorage.getItem('experiences')) || [];
    experiencesList.innerHTML = experiences.map(exp => `
        <div class="card mb-3">
            <div class="card-header d-flex justify-content-between">
                <h5 class="mb-0">${exp.title}</h5>
                <span class="badge ${exp.status === 'approved' ? 'bg-success' : 
                                   exp.status === 'rejected' ? 'bg-danger' : 'bg-warning'}">
                    ${exp.status || 'Beklemede'}
                </span>
            </div>
            <div class="card-body">
                <p class="card-text">${exp.experience}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="btn-group">
                        ${!exp.status ? `
                            <button class="btn btn-sm btn-success" onclick="updateStatus('${exp.id}', 'approved')">
                                Onayla
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="updateStatus('${exp.id}', 'rejected')">
                                Reddet
                            </button>
                        ` : ''}
                    </div>
                    <small class="text-muted">${new Date(exp.date).toLocaleDateString('tr-TR')}</small>
                </div>
            </div>
        </div>
    `).join('');
}

function updateStatus(id, status) {
    const experiences = JSON.parse(localStorage.getItem('experiences')) || [];
    const index = experiences.findIndex(exp => exp.id === id);
    
    if (index !== -1) {
        experiences[index].status = status;
        localStorage.setItem('experiences', JSON.stringify(experiences));
        
        // Deneyimler sekmesine git
        if (status === 'approved') {
            window.location.href = '#experiences';
            
            // Aktif sekmeyi güncelle
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            document.querySelector('a.nav-link[href="#experiences"]').classList.add('active');
            
            // İlgili bölümü göster
            document.querySelectorAll('.section').forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById('experiences').style.display = 'block';
        }
        
        // Deneyimleri yeniden yükle
        loadExperiences();
        
        // Başarı mesajını göster
        showNotification(status === 'approved' ? 'Deneyim onaylandı' : 'Deneyim reddedildi', 'success');
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification`;
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000;';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Load admin panel content if on admin page
if (window.location.pathname.endsWith('admin-panel.html')) {
    loadExperiences();
}
