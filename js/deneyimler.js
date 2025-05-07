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

function loadExperiences() {
    const experiences = JSON.parse(localStorage.getItem('experiences')) || [];
    const tbody = document.getElementById('experiencesTableBody');
    
    tbody.innerHTML = experiences.map(exp => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${exp.userImage || 'https://via.placeholder.com/32'}" 
                         class="rounded-circle me-2" width="32" height="32">
                    <div>
                        <div class="fw-bold">${exp.userName || 'İsimsiz'}</div>
                        <div class="small text-muted">${exp.userEmail || ''}</div>
                    </div>
                </div>
            </td>
            <td>${exp.university || ''}</td>
            <td>${exp.country || ''}</td>
            <td>${new Date(exp.date).toLocaleDateString('tr-TR')}</td>
            <td>
                <span class="badge ${exp.status === 'approved' ? 'bg-success' : 
                                   exp.status === 'rejected' ? 'bg-danger' : 'bg-warning'}">
                    ${exp.status === 'approved' ? 'Onaylandı' :
                      exp.status === 'rejected' ? 'Reddedildi' : 'Beklemede'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="viewExperience('${exp.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                ${!exp.status ? `
                    <button class="btn btn-sm btn-success me-1" onclick="updateStatus('${exp.id}', 'approved')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="updateStatus('${exp.id}', 'rejected')">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

function viewExperience(id) {
    const experiences = JSON.parse(localStorage.getItem('experiences')) || [];
    const experience = experiences.find(exp => exp.id === id);
    
    if (experience) {
        currentExperienceId = id;
        
        // Modal alanlarını doldur
        document.getElementById('modalUserImage').src = experience.userImage || 'https://via.placeholder.com/96';
        document.getElementById('modalUserName').textContent = experience.userName || 'İsimsiz';
        document.getElementById('modalUserEmail').textContent = experience.userEmail || '';
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
