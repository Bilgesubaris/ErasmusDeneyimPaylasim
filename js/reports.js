// Storage keys
const STORAGE_KEYS = {
    REPORTS: 'reports',
    USERS: 'users',
    EXPERIENCES: 'experiences',
    ACTIVITIES: 'activities'
};

// Status values
const STATUS = {
    PENDING: 'pending',
    RESOLVED: 'resolved',
    REJECTED: 'rejected'
};

// Report types
const REPORT_TYPES = {
    INAPPROPRIATE: 'inappropriate',
    SPAM: 'spam',
    HARASSMENT: 'harassment',
    OTHER: 'other'
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

// Report management
const reportManager = {
    getAll: () => storage.get(STORAGE_KEYS.REPORTS) || [],
    
    getById: (id) => {
        const reports = storage.get(STORAGE_KEYS.REPORTS);
        return reports.find(report => report.id === id);
    },
    
    resolve: (id, resolutionNote) => {
        const reports = storage.get(STORAGE_KEYS.REPORTS);
        const index = reports.findIndex(report => report.id === id);
        
        if (index !== -1) {
            reports[index].status = STATUS.RESOLVED;
            reports[index].resolutionNote = resolutionNote;
            reports[index].resolvedAt = new Date().toISOString();
            storage.set(STORAGE_KEYS.REPORTS, reports);
            return true;
        }
        return false;
    },
    
    reject: (id, rejectionNote) => {
        const reports = storage.get(STORAGE_KEYS.REPORTS);
        const index = reports.findIndex(report => report.id === id);
        
        if (index !== -1) {
            reports[index].status = STATUS.REJECTED;
            reports[index].rejectionNote = rejectionNote;
            reports[index].rejectedAt = new Date().toISOString();
            storage.set(STORAGE_KEYS.REPORTS, reports);
            return true;
        }
        return false;
    },
    
    delete: (id) => {
        const reports = storage.get(STORAGE_KEYS.REPORTS);
        const index = reports.findIndex(report => report.id === id);
        
        if (index !== -1) {
            reports.splice(index, 1);
            storage.set(STORAGE_KEYS.REPORTS, reports);
            return true;
        }
        return false;
    }
};

// User management
const userManager = {
    getById: (id) => {
        const users = storage.get(STORAGE_KEYS.USERS);
        return users.find(user => user.id === id);
    }
};

// Experience management
const experienceManager = {
    getById: (id) => {
        const experiences = storage.get(STORAGE_KEYS.EXPERIENCES);
        return experiences.find(exp => exp.id === id);
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
function viewReport(id) {
    const report = reportManager.getById(id);
    if (report) {
        const reporter = userManager.getById(report.reporterId);
        const reportedUser = userManager.getById(report.reportedUserId);
        const experience = report.experienceId ? experienceManager.getById(report.experienceId) : null;
        
        // Set reporter info
        document.getElementById('modalReporterImage').src = reporter.profileImage || 'https://via.placeholder.com/96';
        document.getElementById('modalReporterName').textContent = reporter.name;
        document.getElementById('modalReporterEmail').textContent = reporter.email;
        
        // Set reported user info
        document.getElementById('modalReportedUserImage').src = reportedUser.profileImage || 'https://via.placeholder.com/96';
        document.getElementById('modalReportedUserName').textContent = reportedUser.name;
        document.getElementById('modalReportedUserEmail').textContent = reportedUser.email;
        
        // Set report info
        document.getElementById('modalReportType').textContent = 
            report.type === REPORT_TYPES.INAPPROPRIATE ? 'Uygunsuz İçerik' :
            report.type === REPORT_TYPES.SPAM ? 'Spam' :
            report.type === REPORT_TYPES.HARASSMENT ? 'Taciz' : 'Diğer';
        
        document.getElementById('modalReportDate').textContent = new Date(report.date).toLocaleDateString('tr-TR');
        document.getElementById('modalReportContent').textContent = report.content;
        
        // Set experience info if exists
        const experienceInfo = document.getElementById('modalExperienceInfo');
        if (experience) {
            experienceInfo.innerHTML = `
                <div class="mb-3">
                    <h6>Deneyim Detayları</h6>
                    <p class="mb-1"><strong>Üniversite:</strong> ${experience.university}</p>
                    <p class="mb-1"><strong>Ülke:</strong> ${experience.country}</p>
                    <p class="mb-1"><strong>Dönem:</strong> ${experience.semester}</p>
                    <p class="mb-1"><strong>Tarih:</strong> ${new Date(experience.date).toLocaleDateString('tr-TR')}</p>
                </div>
            `;
        } else {
            experienceInfo.innerHTML = '<p class="text-muted">Bu rapor bir deneyimle ilgili değil.</p>';
        }
        
        // Set resolution info if exists
        const resolutionInfo = document.getElementById('modalResolutionInfo');
        if (report.status === STATUS.RESOLVED) {
            resolutionInfo.innerHTML = `
                <div class="alert alert-success">
                    <h6>Çözüm Notu</h6>
                    <p class="mb-0">${report.resolutionNote}</p>
                    <small class="text-muted">Çözüldü: ${new Date(report.resolvedAt).toLocaleDateString('tr-TR')}</small>
                </div>
            `;
        } else if (report.status === STATUS.REJECTED) {
            resolutionInfo.innerHTML = `
                <div class="alert alert-warning">
                    <h6>Red Nedeni</h6>
                    <p class="mb-0">${report.rejectionNote}</p>
                    <small class="text-muted">Reddedildi: ${new Date(report.rejectedAt).toLocaleDateString('tr-TR')}</small>
                </div>
            `;
        } else {
            resolutionInfo.innerHTML = `
                <div class="alert alert-info">
                    <p class="mb-0">Bu rapor henüz incelenmedi.</p>
                </div>
            `;
        }
        
        // Set up action buttons
        if (report.status === STATUS.PENDING) {
            document.getElementById('modalResolveBtn').style.display = 'block';
            document.getElementById('modalRejectBtn').style.display = 'block';
            document.getElementById('modalDeleteBtn').style.display = 'block';
            
            document.getElementById('modalResolveBtn').onclick = () => resolveReport(id);
            document.getElementById('modalRejectBtn').onclick = () => rejectReport(id);
            document.getElementById('modalDeleteBtn').onclick = () => deleteReport(id);
        } else {
            document.getElementById('modalResolveBtn').style.display = 'none';
            document.getElementById('modalRejectBtn').style.display = 'none';
            document.getElementById('modalDeleteBtn').style.display = 'block';
            
            document.getElementById('modalDeleteBtn').onclick = () => deleteReport(id);
        }
        
        UI.showModal('reportModal');
    }
}

function resolveReport(id) {
    Swal.fire({
        title: 'Raporu çözmek istediğinize emin misiniz?',
        input: 'textarea',
        inputLabel: 'Çözüm Notu',
        inputPlaceholder: 'Raporun nasıl çözüldüğünü açıklayın...',
        showCancelButton: true,
        confirmButtonText: 'Çöz',
        cancelButtonText: 'İptal',
        inputValidator: (value) => {
            if (!value) {
                return 'Çözüm notu gereklidir!';
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            if (reportManager.resolve(id, result.value)) {
                UI.showSuccess('Rapor başarıyla çözüldü');
                UI.hideModal('reportModal');
                updateReportsTable();
            } else {
                UI.showError('Rapor çözülürken bir hata oluştu');
            }
        }
    });
}

function rejectReport(id) {
    Swal.fire({
        title: 'Raporu reddetmek istediğinize emin misiniz?',
        input: 'textarea',
        inputLabel: 'Red Nedeni',
        inputPlaceholder: 'Raporun neden reddedildiğini açıklayın...',
        showCancelButton: true,
        confirmButtonText: 'Reddet',
        cancelButtonText: 'İptal',
        inputValidator: (value) => {
            if (!value) {
                return 'Red nedeni gereklidir!';
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            if (reportManager.reject(id, result.value)) {
                UI.showSuccess('Rapor başarıyla reddedildi');
                UI.hideModal('reportModal');
                updateReportsTable();
            } else {
                UI.showError('Rapor reddedilirken bir hata oluştu');
            }
        }
    });
}

function deleteReport(id) {
    Swal.fire({
        title: 'Raporu silmek istediğinize emin misiniz?',
        text: 'Bu işlem geri alınamaz!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Evet, sil',
        cancelButtonText: 'İptal'
    }).then((result) => {
        if (result.isConfirmed) {
            if (reportManager.delete(id)) {
                UI.showSuccess('Rapor başarıyla silindi');
                UI.hideModal('reportModal');
                updateReportsTable();
            } else {
                UI.showError('Rapor silinirken bir hata oluştu');
            }
        }
    });
}

function exportReports() {
    const reports = reportManager.getAll();
    const csv = [
        ['Raporlayan', 'Raporlanan', 'Tür', 'Tarih', 'Durum'],
        ...reports.map(report => {
            const reporter = userManager.getById(report.reporterId);
            const reportedUser = userManager.getById(report.reportedUserId);
            return [
                reporter.name,
                reportedUser.name,
                report.type === REPORT_TYPES.INAPPROPRIATE ? 'Uygunsuz İçerik' :
                report.type === REPORT_TYPES.SPAM ? 'Spam' :
                report.type === REPORT_TYPES.HARASSMENT ? 'Taciz' : 'Diğer',
                new Date(report.date).toLocaleDateString('tr-TR'),
                report.status === STATUS.PENDING ? 'Beklemede' :
                report.status === STATUS.RESOLVED ? 'Çözüldü' : 'Reddedildi'
            ];
        })
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `raporlar_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

function refreshReports() {
    updateReportsTable();
    UI.showSuccess('Raporlar listesi yenilendi');
}

function updateReportsTable() {
    const reports = reportManager.getAll();
    const tbody = document.getElementById('reportsTableBody');
    tbody.innerHTML = '';
    
    reports.forEach(report => {
        const reporter = userManager.getById(report.reporterId);
        const reportedUser = userManager.getById(report.reportedUserId);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <img src="${reporter.profileImage || 'https://via.placeholder.com/32'}" class="rounded-circle me-2" width="32" height="32">
                    <div>
                        <div class="fw-bold">${reporter.name}</div>
                        <small class="text-muted">${reporter.email}</small>
                    </div>
                </div>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${reportedUser.profileImage || 'https://via.placeholder.com/32'}" class="rounded-circle me-2" width="32" height="32">
                    <div>
                        <div class="fw-bold">${reportedUser.name}</div>
                        <small class="text-muted">${reportedUser.email}</small>
                    </div>
                </div>
            </td>
            <td>
                ${report.type === REPORT_TYPES.INAPPROPRIATE ? 'Uygunsuz İçerik' :
                  report.type === REPORT_TYPES.SPAM ? 'Spam' :
                  report.type === REPORT_TYPES.HARASSMENT ? 'Taciz' : 'Diğer'}
            </td>
            <td>${new Date(report.date).toLocaleDateString('tr-TR')}</td>
            <td>
                <span class="badge bg-${report.status === STATUS.PENDING ? 'warning' : 
                                      report.status === STATUS.RESOLVED ? 'success' : 
                                      'danger'}">
                    ${report.status === STATUS.PENDING ? 'Beklemede' :
                      report.status === STATUS.RESOLVED ? 'Çözüldü' : 'Reddedildi'}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="viewReport('${report.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${report.status === STATUS.PENDING ? `
                        <button class="btn btn-outline-success" onclick="resolveReport('${report.id}')">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="rejectReport('${report.id}')">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-outline-danger" onclick="deleteReport('${report.id}')">
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
    if (!storage.get(STORAGE_KEYS.REPORTS)) {
        const sampleReports = [
            {
                id: '1',
                reporterId: '1',
                reportedUserId: '2',
                experienceId: '1',
                type: REPORT_TYPES.INAPPROPRIATE,
                content: 'Bu deneyim paylaşımı uygunsuz içerik barındırıyor.',
                date: '2024-03-20',
                status: STATUS.PENDING
            },
            {
                id: '2',
                reporterId: '2',
                reportedUserId: '1',
                type: REPORT_TYPES.SPAM,
                content: 'Kullanıcı sürekli aynı içeriği paylaşıyor.',
                date: '2024-03-19',
                status: STATUS.RESOLVED,
                resolutionNote: 'İçerik incelendi ve spam olmadığı tespit edildi.',
                resolvedAt: '2024-03-20'
            }
        ];
        storage.set(STORAGE_KEYS.REPORTS, sampleReports);
    }
    
    // Initialize table
    updateReportsTable();
    
    // Add filter event listeners
    document.getElementById('filterType').addEventListener('change', updateReportsTable);
    document.getElementById('filterStatus').addEventListener('change', updateReportsTable);
    document.getElementById('searchInput').addEventListener('input', updateReportsTable);
}); 