// Check admin authentication
function checkAdminAuth() {
    const adminSession = JSON.parse(localStorage.getItem('adminSession') || sessionStorage.getItem('adminSession'));
    
    if (!adminSession || !adminSession.isAdmin) {
        window.location.href = 'admingiris.html';
    }
}

// Admin logout
function adminLogout() {
    localStorage.removeItem('adminSession');
    sessionStorage.removeItem('adminSession');
    window.location.href = 'admingiris.html';
}

// Update statistics
function updateStats() {
    // Get data from localStorage
    const experiences = JSON.parse(localStorage.getItem('experiences') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');

    // Calculate statistics
    const universities = new Set(experiences.map(exp => exp.university)).size;
    
    // Update DOM
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalExperiences').textContent = experiences.length;
    document.getElementById('totalUniversities').textContent = universities;
    document.getElementById('totalReports').textContent = reports.length;
}

// Update recent experiences table
function updateRecentExperiences() {
    const experiences = JSON.parse(localStorage.getItem('experiences') || '[]');
    const tbody = document.querySelector('#recentExperiencesTable tbody');
    
    // Clear existing content
    tbody.innerHTML = '';
    
    // Sort by date descending and take last 10
    const recentExperiences = experiences
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

    recentExperiences.forEach(exp => {
        const tr = document.createElement('tr');
        
        // User info cell
        const userCell = document.createElement('td');
        userCell.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${exp.userImage || 'https://via.placeholder.com/32'}" 
                     class="rounded-circle me-2" width="32" height="32">
                <span>${exp.userName}</span>
            </div>
        `;
        
        // University cell
        const uniCell = document.createElement('td');
        uniCell.textContent = exp.university;
        
        // Country cell
        const countryCell = document.createElement('td');
        countryCell.textContent = exp.country;
        
        // Date cell
        const dateCell = document.createElement('td');
        dateCell.textContent = new Date(exp.date).toLocaleDateString('tr-TR');
        
        // Status cell
        const statusCell = document.createElement('td');
        statusCell.innerHTML = `
            <span class="badge bg-${exp.status === 'approved' ? 'success' : 'warning'}">
                ${exp.status === 'approved' ? 'Onaylı' : 'Beklemede'}
            </span>
        `;
        
        // Actions cell
        const actionsCell = document.createElement('td');
        actionsCell.innerHTML = `
            <div class="btn-group btn-group-sm">
                <button type="button" class="btn btn-outline-primary view-btn">
                    <i class="fas fa-eye"></i>
                </button>
                <button type="button" class="btn btn-outline-success approve-btn">
                    <i class="fas fa-check"></i>
                </button>
                <button type="button" class="btn btn-outline-danger delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        const viewBtn = actionsCell.querySelector('.view-btn');
        const approveBtn = actionsCell.querySelector('.approve-btn');
        const deleteBtn = actionsCell.querySelector('.delete-btn');
        
        viewBtn.addEventListener('click', () => viewExperience(exp.id));
        approveBtn.addEventListener('click', () => approveExperience(exp.id));
        deleteBtn.addEventListener('click', () => {
            if (confirm('Bu deneyimi silmek istediğinizden emin misiniz?')) {
                deleteExperience(exp.id);
            }
        });
        
        // Append all cells
        tr.appendChild(userCell);
        tr.appendChild(uniCell);
        tr.appendChild(countryCell);
        tr.appendChild(dateCell);
        tr.appendChild(statusCell);
        tr.appendChild(actionsCell);
        
        // Add row to table
        tbody.appendChild(tr);
    });
}

// Update recent activities
function updateRecentActivities() {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    const container = document.getElementById('recentActivities');

    const recentActivities = activities
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

    container.innerHTML = recentActivities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon bg-${activity.type}">
                <i class="fas fa-${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-content">
                <p class="mb-0">${activity.message}</p>
                <small class="text-muted">${formatTimeAgo(activity.date)}</small>
            </div>
        </div>
    `).join('');
}

// Helper function to get activity icon
function getActivityIcon(type) {
    const icons = {
        'experience': 'globe',
        'user': 'user',
        'report': 'flag',
        'approval': 'check',
        'delete': 'trash'
    };
    return icons[type] || 'info-circle';
}

// Helper function to format time ago
function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    const intervals = {
        'yıl': 31536000,
        'ay': 2592000,
        'hafta': 604800,
        'gün': 86400,
        'saat': 3600,
        'dakika': 60,
        'saniye': 1
    };

    for (let [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit} önce`;
        }
    }
    return 'şimdi';
}

// Global variable for modal
let experienceModal;

// Experience management functions
function viewExperience(id) {
    try {
        const experiences = JSON.parse(localStorage.getItem('experiences') || '[]');
        const experience = experiences.find(exp => exp.id === id);
        
        if (experience) {
            console.log('Found experience:', experience); // Debug log
            
            // Update modal content
            document.getElementById('modalUserImage').src = experience.userImage || 'https://via.placeholder.com/96';
            document.getElementById('modalUserName').textContent = experience.userName;
            document.getElementById('modalUserEmail').textContent = experience.userEmail;
            document.getElementById('modalUniversity').textContent = experience.university;
            document.getElementById('modalCountry').textContent = experience.country;
            document.getElementById('modalSemester').textContent = experience.semester;
            document.getElementById('modalDate').textContent = new Date(experience.date).toLocaleDateString('tr-TR');
            document.getElementById('modalContent').textContent = experience.content;

            // Handle photos
            const photosContainer = document.getElementById('modalPhotos');
            photosContainer.innerHTML = '';
            
            if (experience.photos && experience.photos.length > 0) {
                const photoGrid = document.createElement('div');
                photoGrid.className = 'row g-2';
                
                experience.photos.forEach(photo => {
                    const col = document.createElement('div');
                    col.className = 'col-md-4 col-6';
                    
                    const img = document.createElement('img');
                    img.src = photo;
                    img.className = 'img-fluid rounded';
                    img.alt = 'Experience Photo';
                    
                    col.appendChild(img);
                    photoGrid.appendChild(col);
                });
                
                photosContainer.appendChild(photoGrid);
            }

            // Set up action buttons
            const approveBtn = document.getElementById('modalApproveBtn');
            const deleteBtn = document.getElementById('modalDeleteBtn');
            
            approveBtn.onclick = () => {
                approveExperience(id);
                document.getElementById('experienceModal').style.display = 'none';
                document.body.classList.remove('modal-open');
                document.querySelector('.modal-backdrop')?.remove();
            };
            
            deleteBtn.onclick = () => {
                if (confirm('Bu deneyimi silmek istediğinizden emin misiniz?')) {
                    deleteExperience(id);
                    document.getElementById('experienceModal').style.display = 'none';
                    document.body.classList.remove('modal-open');
                    document.querySelector('.modal-backdrop')?.remove();
                }
            };

            // Show modal
            const modalElement = document.getElementById('experienceModal');
            modalElement.style.display = 'block';
            modalElement.classList.add('show');
            document.body.classList.add('modal-open');
            
            // Add backdrop
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            document.body.appendChild(backdrop);
            
            // Add activity
            addActivity({
                type: 'experience',
                message: `"${experience.university}" deneyimi görüntülendi`,
                date: new Date().toISOString()
            });

            console.log('Modal should be visible now'); // Debug log
        }
    } catch (error) {
        console.error('Error in viewExperience:', error);
    }
}

function approveExperience(id) {
    const experiences = JSON.parse(localStorage.getItem('experiences') || '[]');
    const index = experiences.findIndex(exp => exp.id === id);
    
    if (index !== -1) {
        experiences[index].status = 'approved';
        localStorage.setItem('experiences', JSON.stringify(experiences));
        
        // Add activity
        addActivity({
            type: 'approval',
            message: `"${experiences[index].university}" deneyimi onaylandı`,
            date: new Date().toISOString()
        });
        
        updateRecentExperiences();
        updateRecentActivities();
    }
}

function deleteExperience(id) {
    if (confirm('Bu deneyimi silmek istediğinizden emin misiniz?')) {
        const experiences = JSON.parse(localStorage.getItem('experiences') || '[]');
        const index = experiences.findIndex(exp => exp.id === id);
        
        if (index !== -1) {
            const deleted = experiences.splice(index, 1)[0];
            localStorage.setItem('experiences', JSON.stringify(experiences));
            
            // Add activity
            addActivity({
                type: 'delete',
                message: `"${deleted.university}" deneyimi silindi`,
                date: new Date().toISOString()
            });
            
            updateStats();
            updateRecentExperiences();
            updateRecentActivities();
        }
    }
}

// Add new activity
function addActivity(activity) {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    activities.unshift(activity);
    localStorage.setItem('activities', JSON.stringify(activities));
}

// Add sample data for testing
function addSampleData() {
    if (!localStorage.getItem('experiences')) {
        const sampleExperiences = [
            {
                id: '1',
                userName: 'Ahmet Yılmaz',
                userEmail: 'ahmet@example.com',
                userImage: 'https://via.placeholder.com/96',
                university: 'University of Amsterdam',
                country: 'Hollanda',
                semester: '2024 Bahar',
                date: '2024-03-15',
                content: 'Amsterdam Üniversitesi\'nde geçirdiğim Erasmus dönemi inanılmaz bir deneyimdi. Kampüs hayatı, dersler ve şehrin kültürel zenginliği bana çok şey kattı.',
                status: 'pending',
                photos: [
                    'https://via.placeholder.com/300',
                    'https://via.placeholder.com/300',
                    'https://via.placeholder.com/300'
                ]
            },
            {
                id: '2',
                userName: 'Ayşe Demir',
                userEmail: 'ayse@example.com',
                userImage: 'https://via.placeholder.com/96',
                university: 'Technical University of Munich',
                country: 'Almanya',
                semester: '2024 Bahar',
                date: '2024-03-20',
                content: 'Münih Teknik Üniversitesi\'ndeki eğitim kalitesi ve laboratuvar imkanları beklentilerimin çok üzerindeydi. Alman kültürünü yakından tanıma fırsatı buldum.',
                status: 'approved',
                photos: [
                    'https://via.placeholder.com/300',
                    'https://via.placeholder.com/300'
                ]
            }
        ];
        
        localStorage.setItem('experiences', JSON.stringify(sampleExperiences));
    }
}

// Navigation handling
document.addEventListener('DOMContentLoaded', function() {
    // Get all nav links and sections
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    // Handle navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links and add to clicked one
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Get target section id from href
            const targetId = link.getAttribute('href').substring(1);
            
            // Hide all sections and show target
            sections.forEach(section => {
                section.style.display = 'none';
                if (section.id === targetId) {
                    section.style.display = 'block';
                }
            });

            // If experiences section is shown, update the table
            if (targetId === 'experiences') {
                updateExperiencesTable();
            }
            if (targetId === 'users') {
                updateUsersTable();
            }
        });
    });

    // Show dashboard by default
    document.querySelector('#dashboard').style.display = 'block';
    document.querySelector('a[href="#dashboard"]').classList.add('active');
});

// Update experiences table
function updateExperiencesTable() {
    const experiences = JSON.parse(localStorage.getItem('experiences') || '[]');
    const tbody = document.querySelector('#experiencesTable tbody');
    const experienceCount = document.getElementById('experienceCount');
    
    // Clear existing content
    tbody.innerHTML = '';
    
    experiences.forEach(exp => {
        const tr = document.createElement('tr');
        
        // Checkbox cell
        const checkboxCell = document.createElement('td');
        checkboxCell.innerHTML = `<input type="checkbox" class="form-check-input experience-checkbox" value="${exp.id}">`;
        
        // User info cell
        const userCell = document.createElement('td');
        userCell.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${exp.userImage || 'https://via.placeholder.com/32'}" 
                     class="rounded-circle me-2" width="32" height="32">
                <span>${exp.userName}</span>
            </div>
        `;
        
        // Other cells
        const uniCell = document.createElement('td');
        uniCell.textContent = exp.university;
        
        const countryCell = document.createElement('td');
        countryCell.textContent = exp.country;
        
        const semesterCell = document.createElement('td');
        semesterCell.textContent = exp.semester;
        
        const dateCell = document.createElement('td');
        dateCell.textContent = new Date(exp.date).toLocaleDateString('tr-TR');
        
        const statusCell = document.createElement('td');
        statusCell.innerHTML = `
            <span class="badge bg-${exp.status === 'approved' ? 'success' : 'warning'}">
                ${exp.status === 'approved' ? 'Onaylı' : 'Beklemede'}
            </span>
        `;
        
        // Actions cell
        const actionsCell = document.createElement('td');
        actionsCell.innerHTML = `
            <div class="btn-group btn-group-sm">
                <button type="button" class="btn btn-outline-primary view-btn">
                    <i class="fas fa-eye"></i>
                </button>
                <button type="button" class="btn btn-outline-success approve-btn">
                    <i class="fas fa-check"></i>
                </button>
                <button type="button" class="btn btn-outline-danger delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        const viewBtn = actionsCell.querySelector('.view-btn');
        const approveBtn = actionsCell.querySelector('.approve-btn');
        const deleteBtn = actionsCell.querySelector('.delete-btn');
        
        viewBtn.addEventListener('click', () => viewExperience(exp.id));
        approveBtn.addEventListener('click', () => approveExperience(exp.id));
        deleteBtn.addEventListener('click', () => {
            if (confirm('Bu deneyimi silmek istediğinizden emin misiniz?')) {
                deleteExperience(exp.id);
            }
        });
        
        // Append all cells
        tr.appendChild(checkboxCell);
        tr.appendChild(userCell);
        tr.appendChild(uniCell);
        tr.appendChild(countryCell);
        tr.appendChild(semesterCell);
        tr.appendChild(dateCell);
        tr.appendChild(statusCell);
        tr.appendChild(actionsCell);
        
        // Add row to table
        tbody.appendChild(tr);
    });

    // Update experience count
    experienceCount.textContent = `${experiences.length} deneyim`;

    // Handle bulk actions visibility
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

// Update users table
function updateUsersTable() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const experiences = JSON.parse(localStorage.getItem('experiences') || '[]');
    const tbody = document.querySelector('#usersTable tbody');
    const userCount = document.getElementById('userCount');
    const universityFilter = document.getElementById('filterUniversity');
    
    // Clear existing content
    tbody.innerHTML = '';
    
    // Update university filter options
    const universities = [...new Set(users.map(user => user.university))];
    universityFilter.innerHTML = `
        <option value="all">Tüm Üniversiteler</option>
        ${universities.map(uni => `<option value="${uni}">${uni}</option>`).join('')}
    `;
    
    users.forEach(user => {
        const tr = document.createElement('tr');
        
        // User info cell
        const userCell = document.createElement('td');
        userCell.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${user.profileImage || 'https://via.placeholder.com/32'}" 
                     class="rounded-circle me-2" width="32" height="32">
                <div>
                    <div class="fw-bold">${user.name}</div>
                    <small class="text-muted">${user.studentId || ''}</small>
                </div>
            </div>
        `;
        
        // Email cell
        const emailCell = document.createElement('td');
        emailCell.textContent = user.email;
        
        // University cell
        const uniCell = document.createElement('td');
        uniCell.textContent = user.university;
        
        // Registration date cell
        const regDateCell = document.createElement('td');
        regDateCell.textContent = new Date(user.registrationDate).toLocaleDateString('tr-TR');
        
        // Experience count cell
        const expCount = experiences.filter(exp => exp.userId === user.id).length;
        const expCountCell = document.createElement('td');
        expCountCell.innerHTML = `
            <span class="badge bg-info">${expCount}</span>
        `;
        
        // Last login cell
        const lastLoginCell = document.createElement('td');
        lastLoginCell.textContent = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('tr-TR') : '-';
        
        // Status cell
        const statusCell = document.createElement('td');
        statusCell.innerHTML = `
            <span class="badge bg-${user.status === 'active' ? 'success' : 'warning'}">
                ${user.status === 'active' ? 'Aktif' : 'Beklemede'}
            </span>
        `;
        
        // Actions cell
        const actionsCell = document.createElement('td');
        actionsCell.innerHTML = `
            <div class="btn-group btn-group-sm">
                <button type="button" class="btn btn-outline-primary view-btn" title="Profili Görüntüle">
                    <i class="fas fa-user"></i>
                </button>
                <button type="button" class="btn btn-outline-info message-btn" title="Mesaj Gönder">
                    <i class="fas fa-envelope"></i>
                </button>
                ${user.status === 'active' ? 
                    `<button type="button" class="btn btn-outline-warning suspend-btn" title="Hesabı Askıya Al">
                        <i class="fas fa-ban"></i>
                    </button>` :
                    `<button type="button" class="btn btn-outline-success activate-btn" title="Hesabı Aktifleştir">
                        <i class="fas fa-check"></i>
                    </button>`
                }
                <button type="button" class="btn btn-outline-danger delete-btn" title="Hesabı Sil">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        const viewBtn = actionsCell.querySelector('.view-btn');
        const messageBtn = actionsCell.querySelector('.message-btn');
        const suspendBtn = actionsCell.querySelector('.suspend-btn');
        const activateBtn = actionsCell.querySelector('.activate-btn');
        const deleteBtn = actionsCell.querySelector('.delete-btn');
        
        viewBtn.addEventListener('click', () => viewUser(user.id));
        messageBtn.addEventListener('click', () => messageUser(user.id));
        if (suspendBtn) {
            suspendBtn.addEventListener('click', () => suspendUser(user.id));
        }
        if (activateBtn) {
            activateBtn.addEventListener('click', () => activateUser(user.id));
        }
        deleteBtn.addEventListener('click', () => {
            if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
                deleteUser(user.id);
            }
        });
        
        // Append all cells
        tr.appendChild(userCell);
        tr.appendChild(emailCell);
        tr.appendChild(uniCell);
        tr.appendChild(regDateCell);
        tr.appendChild(expCountCell);
        tr.appendChild(lastLoginCell);
        tr.appendChild(statusCell);
        tr.appendChild(actionsCell);
        
        // Add row to table
        tbody.appendChild(tr);
    });

    // Update user count
    userCount.textContent = `${users.length} öğrenci`;

    // Handle search
    const searchInput = document.getElementById('userSearch');
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const rows = tbody.getElementsByTagName('tr');
        
        Array.from(rows).forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    // Handle university filter
    universityFilter.addEventListener('change', () => {
        const selectedUni = universityFilter.value;
        const rows = tbody.getElementsByTagName('tr');
        
        Array.from(rows).forEach(row => {
            const uni = row.children[2].textContent; // University is in the third column
            row.style.display = (selectedUni === 'all' || uni === selectedUni) ? '' : 'none';
        });
    });
}

// User management functions
function viewUser(id) {
    // TODO: Implement user profile view
    console.log('View user:', id);
}

function messageUser(id) {
    // TODO: Implement messaging
    console.log('Message user:', id);
}

function suspendUser(id) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex(user => user.id === id);
    
    if (index !== -1) {
        users[index].status = 'suspended';
        localStorage.setItem('users', JSON.stringify(users));
        updateUsersTable();
        
        addActivity({
            type: 'user',
            message: `"${users[index].name}" hesabı askıya alındı`,
            date: new Date().toISOString()
        });
    }
}

function activateUser(id) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex(user => user.id === id);
    
    if (index !== -1) {
        users[index].status = 'active';
        localStorage.setItem('users', JSON.stringify(users));
        updateUsersTable();
        
        addActivity({
            type: 'user',
            message: `"${users[index].name}" hesabı aktifleştirildi`,
            date: new Date().toISOString()
        });
    }
}

function deleteUser(id) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex(user => user.id === id);
    
    if (index !== -1) {
        const userName = users[index].name;
        users.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(users));
        updateUsersTable();
        
        // Also delete user's experiences
        const experiences = JSON.parse(localStorage.getItem('experiences') || '[]');
        const updatedExperiences = experiences.filter(exp => exp.userId !== id);
        localStorage.setItem('experiences', JSON.stringify(updatedExperiences));
        
        addActivity({
            type: 'user',
            message: `"${userName}" hesabı silindi`,
            date: new Date().toISOString()
        });
    }
}

// Bulk actions
function bulkApprove() {
    const selectedIds = Array.from(document.querySelectorAll('.experience-checkbox:checked'))
        .map(checkbox => checkbox.value);
    
    if (confirm(`${selectedIds.length} deneyimi onaylamak istediğinizden emin misiniz?`)) {
        selectedIds.forEach(id => approveExperience(id));
        updateExperiencesTable();
    }
}

function bulkDelete() {
    const selectedIds = Array.from(document.querySelectorAll('.experience-checkbox:checked'))
        .map(checkbox => checkbox.value);
    
    if (confirm(`${selectedIds.length} deneyimi silmek istediğinizden emin misiniz?`)) {
        selectedIds.forEach(id => deleteExperience(id));
        updateExperiencesTable();
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Admin oturumunu kontrol et
    const adminInfo = JSON.parse(localStorage.getItem('admin') || sessionStorage.getItem('admin'));
    if (!adminInfo) {
        window.location.href = 'admingiris.html';
        return;
    }

    // Deneyimler sayfasını yükle
    loadContent('deneyimler.html');

    // Sidebar aktif link kontrolü
    const sidebarLinks = document.querySelectorAll('.sidebar .nav-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') !== 'javascript:void(0)') {
                e.preventDefault();
                sidebarLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                const href = this.getAttribute('href');
                if (href && href !== 'javascript:void(0)') {
                    loadContent(href);
                }
            }
        });
    });
});

function loadContent(url) {
    const contentWrapper = document.querySelector('.content-wrapper');
    if (!contentWrapper) return;

    fetch(url)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const content = doc.querySelector('.container-fluid');
            if (content) {
                contentWrapper.innerHTML = content.innerHTML;
            }
        })
        .catch(error => {
            console.error('Error loading content:', error);
            contentWrapper.innerHTML = '<div class="alert alert-danger">İçerik yüklenirken bir hata oluştu.</div>';
        });
}

function logout() {
    localStorage.removeItem('admin');
    sessionStorage.removeItem('admin');
    window.location.href = 'admingiris.html';
}
