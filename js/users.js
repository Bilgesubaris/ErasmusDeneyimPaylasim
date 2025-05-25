// Storage keys
const STORAGE_KEYS = {
    USERS: 'users',
    EXPERIENCES: 'experiences',
    ACTIVITIES: 'activities'
};

// Status values
const STATUS = {
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
    BANNED: 'banned'
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

// User management
const userManager = {
    getAll: () => storage.get(STORAGE_KEYS.USERS) || [],
    
    getById: (id) => {
        const users = storage.get(STORAGE_KEYS.USERS);
        return users.find(user => user.id === id);
    },
    
    suspend: (id) => {
        const users = storage.get(STORAGE_KEYS.USERS);
        const index = users.findIndex(user => user.id === id);
        
        if (index !== -1) {
            users[index].status = STATUS.SUSPENDED;
            storage.set(STORAGE_KEYS.USERS, users);
            return true;
        }
        return false;
    },
    
    activate: (id) => {
        const users = storage.get(STORAGE_KEYS.USERS);
        const index = users.findIndex(user => user.id === id);
        
        if (index !== -1) {
            users[index].status = STATUS.ACTIVE;
            storage.set(STORAGE_KEYS.USERS, users);
            return true;
        }
        return false;
    },
    
    delete: (id) => {
        const users = storage.get(STORAGE_KEYS.USERS);
        const index = users.findIndex(user => user.id === id);
        
        if (index !== -1) {
            users.splice(index, 1);
            storage.set(STORAGE_KEYS.USERS, users);
            return true;
        }
        return false;
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
function viewUser(id) {
    const user = userManager.getById(id);
    if (user) {
        document.getElementById('modalUserImage').src = user.profileImage || 'https://via.placeholder.com/96';
        document.getElementById('modalUserName').textContent = user.name;
        document.getElementById('modalUserEmail').textContent = user.email;
        document.getElementById('modalUniversity').textContent = user.university;
        document.getElementById('modalRegistrationDate').textContent = new Date(user.registrationDate).toLocaleDateString('tr-TR');
        document.getElementById('modalLastLogin').textContent = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('tr-TR') : '-';
        document.getElementById('modalExperienceCount').textContent = user.experienceCount || '0';
        document.getElementById('modalStatus').textContent = user.status === STATUS.ACTIVE ? 'Aktif' : 
                                                           user.status === STATUS.SUSPENDED ? 'Askıya Alındı' : 
                                                           'Yasaklı';
        
        // Set up action buttons
        document.getElementById('modalSuspendBtn').onclick = () => suspendUser(id);
        document.getElementById('modalActivateBtn').onclick = () => activateUser(id);
        document.getElementById('modalDeleteBtn').onclick = () => deleteUser(id);
        
        UI.showModal('userModal');
    }
}

function suspendUser(id) {
    if (userManager.suspend(id)) {
        UI.showSuccess('Kullanıcı başarıyla askıya alındı');
        UI.hideModal('userModal');
        updateUsersTable();
    } else {
        UI.showError('Kullanıcı askıya alınırken bir hata oluştu');
    }
}

function activateUser(id) {
    if (userManager.activate(id)) {
        UI.showSuccess('Kullanıcı başarıyla aktifleştirildi');
        UI.hideModal('userModal');
        updateUsersTable();
    } else {
        UI.showError('Kullanıcı aktifleştirilirken bir hata oluştu');
    }
}

function deleteUser(id) {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
        if (userManager.delete(id)) {
            UI.showSuccess('Kullanıcı başarıyla silindi');
            UI.hideModal('userModal');
            updateUsersTable();
        } else {
            UI.showError('Kullanıcı silinirken bir hata oluştu');
        }
    }
}

function exportUsers() {
    const users = userManager.getAll();
    const csv = [
        ['Ad Soyad', 'E-posta', 'Üniversite', 'Kayıt Tarihi', 'Son Giriş', 'Deneyim Sayısı', 'Durum'],
        ...users.map(user => [
            user.name,
            user.email,
            user.university,
            new Date(user.registrationDate).toLocaleDateString('tr-TR'),
            user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('tr-TR') : '-',
            user.experienceCount || '0',
            user.status === STATUS.ACTIVE ? 'Aktif' : 
            user.status === STATUS.SUSPENDED ? 'Askıya Alındı' : 'Yasaklı'
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `kullanicilar_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

function refreshUsers() {
    updateUsersTable();
    UI.showSuccess('Kullanıcılar listesi yenilendi');
}

function updateUsersTable() {
    const users = userManager.getAll();
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <img src="${user.profileImage || 'https://via.placeholder.com/32'}" class="rounded-circle me-2" width="32" height="32">
                    <div>
                        <div class="fw-bold">${user.name}</div>
                        <small class="text-muted">${user.email}</small>
                    </div>
                </div>
            </td>
            <td>${user.university}</td>
            <td>${new Date(user.registrationDate).toLocaleDateString('tr-TR')}</td>
            <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('tr-TR') : '-'}</td>
            <td><span class="badge bg-info">${user.experienceCount || '0'}</span></td>
            <td>
                <span class="badge bg-${user.status === STATUS.ACTIVE ? 'success' : 
                                      user.status === STATUS.SUSPENDED ? 'warning' : 
                                      'danger'}">
                    ${user.status === STATUS.ACTIVE ? 'Aktif' : 
                      user.status === STATUS.SUSPENDED ? 'Askıya Alındı' : 
                      'Yasaklı'}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="viewUser('${user.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${user.status === STATUS.ACTIVE ? `
                        <button class="btn btn-outline-warning" onclick="suspendUser('${user.id}')">
                            <i class="fas fa-ban"></i>
                        </button>
                    ` : `
                        <button class="btn btn-outline-success" onclick="activateUser('${user.id}')">
                            <i class="fas fa-check"></i>
                        </button>
                    `}
                    <button class="btn btn-outline-danger" onclick="deleteUser('${user.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Add sample data if none exists
    if (!storage.get(STORAGE_KEYS.USERS)) {
        const sampleUsers = [
            {
                id: '1',
                name: 'Ahmet Yılmaz',
                email: 'ahmet@example.com',
                profileImage: 'https://via.placeholder.com/32',
                university: 'İstanbul Üniversitesi',
                registrationDate: '2024-01-15',
                lastLogin: '2024-03-20',
                experienceCount: 2,
                status: STATUS.ACTIVE
            },
            {
                id: '2',
                name: 'Ayşe Demir',
                email: 'ayse@example.com',
                profileImage: 'https://via.placeholder.com/32',
                university: 'Ankara Üniversitesi',
                registrationDate: '2024-02-01',
                lastLogin: '2024-03-19',
                experienceCount: 1,
                status: STATUS.SUSPENDED
            }
        ];
        storage.set(STORAGE_KEYS.USERS, sampleUsers);
    }
    
    // Initialize table
    updateUsersTable();
    
    // Add filter event listeners
    document.getElementById('filterUniversity').addEventListener('change', updateUsersTable);
    document.getElementById('filterStatus').addEventListener('change', updateUsersTable);
    document.getElementById('searchInput').addEventListener('input', updateUsersTable);
}); 