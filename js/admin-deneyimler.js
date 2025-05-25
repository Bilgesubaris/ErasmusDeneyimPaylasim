// Firebase referanslarını al
const db = firebase.firestore();
const auth = firebase.auth();

// Aktif filtre
let currentFilter = 'pending';

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    // Admin kontrolü
    auth.onAuthStateChanged(user => {
        if (user) {
            // Admin bilgilerini yükle
            loadAdminInfo(user);
            // Deneyimleri yükle
            loadExperiences(currentFilter);
            // Filtre butonlarını ayarla
            setupFilterButtons();
        } else {
            // Admin girişi yoksa login sayfasına yönlendir
            window.location.href = 'admin-giris.html';
        }
    });
});

// Admin bilgilerini yükle
function loadAdminInfo(user) {
    db.collection('admins').doc(user.uid).get()
        .then(doc => {
            if (doc.exists) {
                const adminData = doc.data();
                document.getElementById('adminName').textContent = adminData.name || 'Admin';
            }
        })
        .catch(error => {
            console.error('Admin bilgileri yüklenirken hata:', error);
        });
}

// Filtre butonlarını ayarla
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Aktif butonu güncelle
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline-primary');
            });
            button.classList.add('active');
            button.classList.remove('btn-outline-primary');
            button.classList.add('btn-primary');

            // Filtreyi güncelle ve deneyimleri yeniden yükle
            currentFilter = button.dataset.filter;
            loadExperiences(currentFilter);
        });
    });
}

// Deneyimleri yükle
async function loadExperiences(filter) {
    try {
        const tableBody = document.getElementById('experiencesTableBody');
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center"><div class="spinner-border" role="status"></div></td></tr>';

        let query = db.collection('experiences');
        
        // Filtreye göre sorguyu ayarla
        switch (filter) {
            case 'pending':
                query = query.where('status', '==', 'pending');
                break;
            case 'approved':
                query = query.where('status', '==', 'approved');
                break;
            case 'rejected':
                query = query.where('status', '==', 'rejected');
                break;
        }

        // Tarihe göre sırala
        query = query.orderBy('createdAt', 'desc');

        const snapshot = await query.get();

        if (snapshot.empty) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <p class="text-muted my-3">Deneyim bulunamadı.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = '';
        snapshot.forEach(doc => {
            const experience = doc.data();
            const row = createExperienceRow(doc.id, experience);
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Deneyimler yüklenirken hata:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Deneyimler yüklenirken bir hata oluştu.'
        });
    }
}

// Deneyim satırı oluştur
function createExperienceRow(id, experience) {
    const tr = document.createElement('tr');
    
    const statusClass = {
        'pending': 'warning',
        'approved': 'success',
        'rejected': 'danger'
    }[experience.status];

    const statusText = {
        'pending': 'Onay Bekliyor',
        'approved': 'Onaylandı',
        'rejected': 'Reddedildi'
    }[experience.status];

    tr.innerHTML = `
        <td>${experience.title || 'Başlıksız'}</td>
        <td>${experience.university || '-'}</td>
        <td>${experience.country || '-'}</td>
        <td>${experience.username || 'Anonim'}</td>
        <td>${formatDate(experience.createdAt)}</td>
        <td>
            <span class="badge bg-${statusClass}">${statusText}</span>
        </td>
        <td>
            <button class="btn btn-sm btn-info me-2" onclick="viewExperience('${id}')">
                <i class="fas fa-eye"></i>
            </button>
            ${experience.status === 'pending' ? `
                <button class="btn btn-sm btn-success me-2" onclick="approveExperience('${id}')">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="rejectExperience('${id}')">
                    <i class="fas fa-times"></i>
                </button>
            ` : ''}
        </td>
    `;
    
    return tr;
}

// Deneyim detaylarını görüntüle
async function viewExperience(id) {
    try {
        const doc = await db.collection('experiences').doc(id).get();
        
        if (!doc.exists) {
            throw new Error('Deneyim bulunamadı');
        }

        const experience = doc.data();
        const modal = document.getElementById('experienceModal');
        const details = document.getElementById('experienceDetails');

        details.innerHTML = `
            <div class="experience-details">
                <div class="mb-4">
                    <h4>${experience.title || 'Başlıksız Deneyim'}</h4>
                    <div class="text-muted">
                        <i class="fas fa-user me-2"></i>${experience.username || 'Anonim'}
                        <span class="mx-2">|</span>
                        <i class="fas fa-calendar me-2"></i>${formatDate(experience.createdAt)}
                    </div>
                </div>

                <div class="row mb-4">
                    <div class="col-md-6">
                        <h6><i class="fas fa-university me-2"></i>Üniversite</h6>
                        <p>${experience.university || '-'}</p>
                    </div>
                    <div class="col-md-6">
                        <h6><i class="fas fa-map-marker-alt me-2"></i>Konum</h6>
                        <p>${experience.city || '-'}, ${experience.country || '-'}</p>
                    </div>
                </div>

                <div class="row mb-4">
                    <div class="col-md-6">
                        <h6><i class="fas fa-calendar-alt me-2"></i>Dönem</h6>
                        <p>${experience.semester || '-'}</p>
                    </div>
                    <div class="col-md-6">
                        <h6><i class="fas fa-star me-2"></i>Değerlendirme</h6>
                        <p>${generateRatingStars(experience.rating || 0)}</p>
                    </div>
                </div>

                <div class="mb-4">
                    <h6><i class="fas fa-home me-2"></i>Konaklama</h6>
                    <p>${experience.accommodation || '-'}</p>
                </div>

                <div class="mb-4">
                    <h6><i class="fas fa-euro-sign me-2"></i>Aylık Harcama</h6>
                    <p>${experience.monthlyExpense || 0} €</p>
                </div>

                <div class="mb-4">
                    <h6><i class="fas fa-book me-2"></i>Deneyim</h6>
                    <p>${experience.content || '-'}</p>
                </div>

                <div class="mb-4">
                    <h6><i class="fas fa-lightbulb me-2"></i>Tavsiyeler</h6>
                    <p>${experience.recommendations || '-'}</p>
                </div>

                ${experience.photos && experience.photos.length > 0 ? `
                    <div class="mb-4">
                        <h6><i class="fas fa-images me-2"></i>Fotoğraflar</h6>
                        <div class="row g-2">
                            ${experience.photos.map(photo => `
                                <div class="col-md-4">
                                    <img src="${photo}" class="img-fluid rounded" alt="Deneyim fotoğrafı">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        // Modal'ı göster
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();

    } catch (error) {
        console.error('Deneyim detayları yüklenirken hata:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Deneyim detayları yüklenirken bir hata oluştu.'
        });
    }
}

// Deneyimi onayla
async function approveExperience(id) {
    try {
        const result = await Swal.fire({
            title: 'Emin misiniz?',
            text: 'Bu deneyimi onaylamak istediğinize emin misiniz?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Evet, Onayla',
            cancelButtonText: 'İptal',
            confirmButtonColor: '#28a745'
        });

        if (result.isConfirmed) {
            await db.collection('experiences').doc(id).update({
                status: 'approved',
                approvedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            Swal.fire({
                icon: 'success',
                title: 'Başarılı!',
                text: 'Deneyim başarıyla onaylandı ve yayınlandı.'
            });

            // Deneyimleri yeniden yükle
            loadExperiences(currentFilter);
        }

    } catch (error) {
        console.error('Deneyim onaylanırken hata:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Deneyim onaylanırken bir hata oluştu.'
        });
    }
}

// Deneyimi reddet
async function rejectExperience(id) {
    try {
        const { value: reason } = await Swal.fire({
            title: 'Reddetme Nedeni',
            input: 'textarea',
            inputLabel: 'Lütfen reddetme nedenini yazın',
            inputPlaceholder: 'Reddetme nedenini buraya yazın...',
            showCancelButton: true,
            confirmButtonText: 'Reddet',
            cancelButtonText: 'İptal',
            confirmButtonColor: '#dc3545',
            inputValidator: (value) => {
                if (!value) {
                    return 'Reddetme nedeni boş olamaz!';
                }
            }
        });

        if (reason) {
            await db.collection('experiences').doc(id).update({
                status: 'rejected',
                rejectionReason: reason,
                rejectedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            Swal.fire({
                icon: 'success',
                title: 'Başarılı!',
                text: 'Deneyim reddedildi.'
            });

            // Deneyimleri yeniden yükle
            loadExperiences(currentFilter);
        }

    } catch (error) {
        console.error('Deneyim reddedilirken hata:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Deneyim reddedilirken bir hata oluştu.'
        });
    }
}

// Yıldız derecelendirmesi oluştur
function generateRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star text-warning"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt text-warning"></i>';
    }
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star text-warning"></i>';
    }

    return stars;
}

// Tarihi formatla
function formatDate(timestamp) {
    if (!timestamp) return 'Tarih belirtilmemiş';
    
    const date = timestamp.toDate();
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Local storage'ı temizle
function clearLocalStorage() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
}

// Çıkış yap
function logout() {
    auth.signOut().then(() => {
        clearLocalStorage();
        window.location.href = 'svg-turkiye-haritasi.html';
    }).catch((error) => {
        console.error('Çıkış hatası:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Çıkış yapılırken bir hata oluştu.'
        });
    });
} 