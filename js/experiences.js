// Storage keys
const STORAGE_KEYS = {
    EXPERIENCES: 'experiences',
    USERS: 'users',
    ACTIVITIES: 'activities'
};

// Status values
const STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};

// Utility functions
const storage = {
    get: (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    }
};

// Experience management
const experienceManager = {
    getAll: () => storage.get(STORAGE_KEYS.EXPERIENCES) || [],
    
    getById: (id) => {
        const experiences = storage.get(STORAGE_KEYS.EXPERIENCES);
        return experiences.find(exp => exp.id === id);
    },
    
    approve: (id) => {
        const experiences = storage.get(STORAGE_KEYS.EXPERIENCES);
        const index = experiences.findIndex(exp => exp.id === id);
        
        if (index !== -1) {
            experiences[index].status = STATUS.APPROVED;
            storage.set(STORAGE_KEYS.EXPERIENCES, experiences);
            return true;
        }
        return false;
    },
    
    delete: (id) => {
        const experiences = storage.get(STORAGE_KEYS.EXPERIENCES);
        const index = experiences.findIndex(exp => exp.id === id);
        
        if (index !== -1) {
            experiences.splice(index, 1);
            storage.set(STORAGE_KEYS.EXPERIENCES, experiences);
            return true;
        }
        return false;
    }
};

// User management
const userManager = {
    getById: (id) => {
        const users = storage.get(STORAGE_KEYS.USERS) || [];
        return users.find(user => user.id === id);
    }
};

// Activity logging
const activityLogger = {
    add: (action, details) => {
        const activities = storage.get(STORAGE_KEYS.ACTIVITIES) || [];
        activities.unshift({
            id: Date.now(),
            action,
            details,
            timestamp: new Date().toISOString()
        });
        storage.set(STORAGE_KEYS.ACTIVITIES, activities);
    }
};

// UI management
const UI = {
    showModal: (modalId) => {
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
    },
    
    hideModal: (modalId) => {
        const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
        if (modal) {
            modal.hide();
        }
    },
    
    showSuccess: (message) => {
        Swal.fire({
            icon: 'success',
            title: 'Başarılı!',
            text: message,
            confirmButtonText: 'Tamam'
        });
    },
    
    showError: (message) => {
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: message,
            confirmButtonText: 'Tamam'
        });
    }
};

// Event handlers
function viewExperience(id) {
    const experience = experienceManager.getById(id);
    if (experience) {
        document.getElementById('modalUserImage').src = experience.userImage || 'https://via.placeholder.com/96';
        document.getElementById('modalUserName').textContent = experience.userName;
        document.getElementById('modalUserEmail').textContent = experience.userEmail;
        document.getElementById('modalUniversity').textContent = experience.university;
        document.getElementById('modalCountry').textContent = experience.country;
        document.getElementById('modalSemester').textContent = experience.semester;
        document.getElementById('modalDate').textContent = new Date(experience.date).toLocaleDateString('tr-TR');
        document.getElementById('modalContent').textContent = experience.content;
        
        // Set up action buttons
        document.getElementById('modalApproveBtn').onclick = () => approveExperience(id);
        document.getElementById('modalDeleteBtn').onclick = () => deleteExperience(id);
        
        UI.showModal('experienceModal');
    }
}

function approveExperience(id) {
    if (experienceManager.approve(id)) {
        UI.showSuccess('Deneyim başarıyla onaylandı');
        UI.hideModal('experienceModal');
        updateExperiencesTable();
    } else {
        UI.showError('Deneyim onaylanırken bir hata oluştu');
    }
}

function deleteExperience(id) {
    if (confirm('Bu deneyimi silmek istediğinizden emin misiniz?')) {
        if (experienceManager.delete(id)) {
            UI.showSuccess('Deneyim başarıyla silindi');
            UI.hideModal('experienceModal');
            updateExperiencesTable();
        } else {
            UI.showError('Deneyim silinirken bir hata oluştu');
        }
    }
}

function bulkApprove() {
    const selectedIds = Array.from(document.querySelectorAll('.experience-checkbox:checked'))
        .map(checkbox => checkbox.value);
    
    if (selectedIds.length === 0) {
        UI.showError('Lütfen en az bir deneyim seçin');
        return;
    }
    
    if (confirm(`${selectedIds.length} deneyimi onaylamak istediğinizden emin misiniz?`)) {
        selectedIds.forEach(id => experienceManager.approve(id));
        UI.showSuccess('Seçili deneyimler başarıyla onaylandı');
        updateExperiencesTable();
    }
}

function bulkDelete() {
    const selectedIds = Array.from(document.querySelectorAll('.experience-checkbox:checked'))
        .map(checkbox => checkbox.value);
    
    if (selectedIds.length === 0) {
        UI.showError('Lütfen en az bir deneyim seçin');
        return;
    }
    
    if (confirm(`${selectedIds.length} deneyimi silmek istediğinizden emin misiniz?`)) {
        selectedIds.forEach(id => experienceManager.delete(id));
        UI.showSuccess('Seçili deneyimler başarıyla silindi');
        updateExperiencesTable();
    }
}

function exportExperiences() {
    const experiences = experienceManager.getAll();
    const csv = [
        ['Kullanıcı', 'Üniversite', 'Ülke', 'Dönem', 'Tarih', 'Durum'],
        ...experiences.map(exp => [
            exp.userName,
            exp.university,
            exp.country,
            exp.semester,
            new Date(exp.date).toLocaleDateString('tr-TR'),
            exp.status === STATUS.APPROVED ? 'Onaylandı' : 
            exp.status === STATUS.REJECTED ? 'Reddedildi' : 'Beklemede'
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `deneyimler_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

function refreshExperiences() {
    updateExperiencesTable();
    UI.showSuccess('Deneyimler listesi yenilendi');
}

function updateExperiencesTable() {
    const experiences = experienceManager.getAll();
    const tbody = document.getElementById('experiencesTableBody');
    tbody.innerHTML = '';
    
    experiences.forEach(exp => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="form-check-input experience-checkbox" value="${exp.id}"></td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${exp.userImage || 'https://via.placeholder.com/32'}" class="rounded-circle me-2" width="32" height="32">
                    <div>
                        <div class="fw-bold">${exp.userName}</div>
                        <small class="text-muted">${exp.userEmail}</small>
                    </div>
                </div>
            </td>
            <td>${exp.university}</td>
            <td>${exp.country}</td>
            <td>${exp.semester}</td>
            <td>${new Date(exp.date).toLocaleDateString('tr-TR')}</td>
            <td>
                <span class="badge bg-${exp.status === STATUS.APPROVED ? 'success' : 
                                      exp.status === STATUS.REJECTED ? 'danger' : 
                                      'warning'}">
                    ${exp.status === STATUS.APPROVED ? 'Onaylandı' : 
                      exp.status === STATUS.REJECTED ? 'Reddedildi' : 
                      'Beklemede'}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="viewExperience('${exp.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${exp.status !== STATUS.APPROVED ? `
                        <button class="btn btn-outline-success" onclick="approveExperience('${exp.id}')">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-outline-danger" onclick="deleteExperience('${exp.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Update bulk actions visibility
    const bulkActions = document.querySelector('.bulk-actions');
    const checkboxes = document.querySelectorAll('.experience-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const checkedCount = document.querySelectorAll('.experience-checkbox:checked').length;
            bulkActions.style.display = checkedCount > 0 ? 'block' : 'none';
        });
    });
    
    // Handle select all checkbox
    const selectAll = document.getElementById('selectAll');
    selectAll.addEventListener('change', () => {
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAll.checked;
        });
        bulkActions.style.display = selectAll.checked ? 'block' : 'none';
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Add sample data if none exists
    if (!storage.get(STORAGE_KEYS.EXPERIENCES)) {
        const sampleExperiences = [
            {
                id: '1',
                userName: 'Ahmet Yılmaz',
                userEmail: 'ahmet@example.com',
                userImage: 'https://via.placeholder.com/32',
                university: 'University of Amsterdam',
                country: 'Hollanda',
                semester: '2024 Bahar',
                date: '2024-03-15',
                content: 'Amsterdam Üniversitesi\'nde geçirdiğim Erasmus dönemi inanılmaz bir deneyimdi.',
                status: STATUS.PENDING
            },
            {
                id: '2',
                userName: 'Ayşe Demir',
                userEmail: 'ayse@example.com',
                userImage: 'https://via.placeholder.com/32',
                university: 'Technical University of Munich',
                country: 'Almanya',
                semester: '2024 Bahar',
                date: '2024-03-20',
                content: 'Münih Teknik Üniversitesi\'ndeki eğitim kalitesi beklentilerimin üzerindeydi.',
                status: STATUS.APPROVED
            }
        ];
        storage.set(STORAGE_KEYS.EXPERIENCES, sampleExperiences);
    }
    
    // Initialize table
    updateExperiencesTable();
    
    // Add filter event listeners
    document.getElementById('filterUniversity').addEventListener('change', updateExperiencesTable);
    document.getElementById('filterCountry').addEventListener('change', updateExperiencesTable);
    document.getElementById('filterStatus').addEventListener('change', updateExperiencesTable);
    document.getElementById('searchInput').addEventListener('input', updateExperiencesTable);
}); 