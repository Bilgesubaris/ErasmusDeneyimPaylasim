// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/8.10.1/firebase-storage.js";

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
let firebaseAuth;

// Firebase'i başlat
function initializeFirebase() {
    try {
        console.log('Firebase başlatılıyor...');
        
        // Firebase yapılandırmasını kontrol et
        if (!firebaseConfig) {
            throw new Error('Firebase yapılandırması bulunamadı');
        }
        
        // Firebase uygulamasını başlat
    if (!firebase.apps.length) {
            console.log('Firebase uygulaması başlatılıyor...');
            firebase.initializeApp(firebaseConfig);
            firebase.analytics();
        }
        
        // Firestore referansını al
        firestoreDb = firebase.firestore();
        firebaseAuth = firebase.auth();
        console.log('Firestore referansı alındı');
        
        // Firestore ayarlarını yapılandır
        firestoreDb.settings({
            experimentalForceLongPolling: true,
            merge: true,
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
            ignoreUndefinedProperties: true
        });
        console.log('Firestore ayarları yapılandırıldı');

        // Test sorgusu yap
        firestoreDb.collection('experiences').get()
            .then(snapshot => {
                console.log('Experiences koleksiyonu test sorgusu:', snapshot.size, 'döküman bulundu');
                snapshot.forEach(doc => {
                    console.log('Deneyim:', doc.id, doc.data());
                });
            })
            .catch(error => {
                console.error('Experiences koleksiyonu test sorgusu hatası:', error);
            });
        
        return true;
    } catch (error) {
        console.error('Firebase başlatma hatası:', error);
        Swal.fire({
            icon: 'error',
            title: 'Firebase Hatası',
            text: 'Firebase başlatılırken bir hata oluştu: ' + error.message
        });
        return false;
    }
}

// İstatistikleri gerçek zamanlı dinle
function listenToStatistics() {
    try {
        console.log('İstatistikler dinleniyor...');
        
        // Kullanıcı sayısını dinle
        firestoreDb.collection('users')
            .onSnapshot(snapshot => {
                const totalUsers = snapshot.size;
                const totalUsersElement = document.getElementById('totalUsers');
                if (totalUsersElement) {
                    totalUsersElement.textContent = totalUsers;
                }
                console.log('Toplam kullanıcı sayısı güncellendi:', totalUsers);
            }, error => {
                console.error('Kullanıcı sayısı dinlenirken hata:', error);
            });

        // Bekleyen deneyimleri dinle
        firestoreDb.collection('deneyimler')
            .onSnapshot(snapshot => {
                const pendingExperiences = snapshot.size;
                const pendingApprovalsElement = document.getElementById('pendingApprovals');
                if (pendingApprovalsElement) {
                    pendingApprovalsElement.textContent = pendingExperiences;
                }
                console.log('Bekleyen deneyim sayısı güncellendi:', pendingExperiences);
            }, error => {
                console.error('Bekleyen deneyimler dinlenirken hata:', error);
            });

        // Onaylanmış deneyimleri dinle
        firestoreDb.collection('experiences')
            .onSnapshot(snapshot => {
                console.log('Experiences koleksiyonu güncellendi:', snapshot.size, 'döküman');
                const approvedExperiences = snapshot.size;
                const totalExperiencesElement = document.getElementById('totalExperiences');
                if (totalExperiencesElement) {
                    totalExperiencesElement.textContent = approvedExperiences;
                }
                console.log('Onaylanmış deneyim sayısı güncellendi:', approvedExperiences);
            }, error => {
                console.error('Onaylanmış deneyimler dinlenirken hata:', error);
            });

        // Son aktiviteleri dinle
        listenToRecentActivities();

    } catch (error) {
        console.error('İstatistikler dinlenirken hata oluştu:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'İstatistikler dinlenirken bir hata oluştu: ' + error.message
        });
    }
}

// Son aktiviteleri gerçek zamanlı dinle
function listenToRecentActivities() {
    try {
        const activitiesContainer = document.getElementById('recentActivities');
        if (!activitiesContainer) {
            console.error('Aktiviteler container bulunamadı');
            return;
        }

        let activities = [];

        // Bekleyen deneyimleri dinle
        firestoreDb.collection('deneyimler')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .onSnapshot(snapshot => {
                console.log('Deneyimler koleksiyonu güncellendi:', snapshot.size, 'döküman');
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const data = change.doc.data();
                        activities.push({
                            type: 'pending',
                            id: change.doc.id,
                            username: data.username || 'Anonim',
                            title: data.title || 'Başlıksız Deneyim',
                            createdAt: data.createdAt?.toDate() || new Date(),
                            status: 'Beklemede'
                        });
                    } else if (change.type === 'removed') {
                        activities = activities.filter(a => a.id !== change.doc.id);
                    }
                });
                updateActivitiesList(activities);
            }, error => {
                console.error('Bekleyen deneyimler dinlenirken hata:', error);
            });

        // Onaylanmış deneyimleri dinle
        firestoreDb.collection('experiences')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .onSnapshot(snapshot => {
                console.log('Experiences koleksiyonu güncellendi:', snapshot.size, 'döküman');
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const data = change.doc.data();
                        activities.push({
                            type: 'approved',
                            id: change.doc.id,
                            username: data.username || 'Anonim',
                            title: data.title || 'Başlıksız Deneyim',
                            createdAt: data.createdAt?.toDate() || new Date(),
                            status: 'Onaylandı'
                        });
                    } else if (change.type === 'removed') {
                        activities = activities.filter(a => a.id !== change.doc.id);
                    }
                });
                updateActivitiesList(activities);
            }, error => {
                console.error('Onaylanmış deneyimler dinlenirken hata:', error);
            });

    } catch (error) {
        console.error('Son aktiviteler dinlenirken hata oluştu:', error);
    }
}

// Aktiviteler listesini güncelle
function updateActivitiesList(activities) {
    const activitiesContainer = document.getElementById('recentActivities');
    if (!activitiesContainer) {
        console.error('Aktiviteler container bulunamadı');
        return;
    }

    // Tarihe göre sırala
    activities.sort((a, b) => b.createdAt - a.createdAt);

    // Son 10 aktiviteyi göster
    activitiesContainer.innerHTML = activities.slice(0, 10).map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type === 'pending' ? 'bg-warning' : 'bg-success'}">
                <i class="fas ${activity.type === 'pending' ? 'fa-clock' : 'fa-check'}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">
                    <strong>${activity.username}</strong> tarafından yeni bir deneyim ${activity.status.toLowerCase()}
                </div>
                <div class="activity-time">
                    ${formatDate(activity.createdAt)}
                </div>
            </div>
        </div>
    `).join('');
    }
    
    // Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
        try {
        console.log('Sayfa yükleniyor...');
            
        // Firebase'i başlat
        if (initializeFirebase()) {
            console.log('Firebase başarıyla başlatıldı');
            
            // İstatistikleri dinlemeye başla
            listenToStatistics();
            console.log('İstatistikler dinlenmeye başlandı');
            
            // Modal elementlerini kontrol et
            const experienceModal = document.getElementById('experienceModal');
            if (experienceModal) {
                experienceModal.addEventListener('hidden.bs.modal', function () {
                    console.log('Modal kapandı');
                });
            } else {
                console.warn('Modal elementi bulunamadı');
            }
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

// Oturum kontrolü
async function checkAuth() {
    try {
        const user = await new Promise((resolve, reject) => {
            const unsubscribe = firebaseAuth.onAuthStateChanged(user => {
                unsubscribe();
                resolve(user);
            }, reject);
        });

        if (!user) {
            throw new Error('Oturum bulunamadı');
        }

        const doc = await firestoreDb
            .collection('admin_table')
            .doc(user.uid)
            .get();
        
        if (!doc.exists || doc.data().role !== 'admin' || doc.data().status !== 'active') {
            throw new Error('Yetkisiz erişim');
        }

        // Admin bilgilerini localStorage'a kaydet
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('adminName', doc.data().fullName);
        localStorage.setItem('adminId', doc.id);
        localStorage.setItem('adminEmail', doc.data().email);
        localStorage.setItem('adminPermissions', JSON.stringify(doc.data().permissions));
        
        // Admin adını göster
        document.getElementById('adminName').textContent = doc.data().fullName;

    } catch (error) {
        console.error('Oturum kontrolü hatası:', error);
        await firebaseAuth.signOut();
        clearLocalStorage();
        window.location.replace('login.html');
    }
}

// Deneyimleri yükle
async function loadExperiences() {
    try {
        const experiencesRef = firestoreDb.collection('experiences');
        const snapshot = await experiencesRef
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();
        
        const tbody = document.querySelector('#experiencesTable tbody');
        tbody.innerHTML = '';
        
        if (snapshot.empty) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4">
                        <i class="fas fa-info-circle me-2"></i>
                        Henüz hiç deneyim bulunmuyor.
                    </td>
                </tr>
            `;
            return;
        }
        
        snapshot.forEach(doc => {
            const experience = doc.data();
            const row = createExperienceRow(doc.id, experience);
            tbody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Deneyimler yüklenirken hata:', error);
        showErrorAlert('Deneyimler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
    } finally {
        // Loading spinner'ı gizle
        document.getElementById('loadingSpinner').style.display = 'none';
    }
}

// Deneyim satırı oluştur
function createExperienceRow(id, experience) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <input type="checkbox" class="form-check-input experience-checkbox" data-id="${id}">
        </td>
        <td>
            <div class="d-flex align-items-center">
                <i class="fas fa-user-circle fa-2x me-2"></i>
                <div>
                    <div class="fw-bold">${experience.username || 'İsimsiz Kullanıcı'}</div>
                    <small class="text-muted">${experience.userEmail || ''}</small>
                </div>
            </div>
        </td>
        <td>${experience.university || '-'}</td>
        <td>${experience.country || '-'}</td>
        <td>${experience.semester || '-'}</td>
        <td>${formatDate(experience.createdAt)}</td>
        <td>
            <span class="badge bg-${getStatusBadgeColor(experience.status)}">
                ${getStatusText(experience.status)}
            </span>
        </td>
        <td>
            <div class="btn-group">
                <button class="btn btn-sm btn-outline-primary" onclick="viewExperience('${id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-success" onclick="approveExperience('${id}')">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteExperience('${id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    return row;
}

// Deneyim detaylarını görüntüle
async function viewExperience(id) {
    try {
        const doc = await firestoreDb.collection('experiences').doc(id).get();
        if (!doc.exists) {
            throw new Error('Deneyim bulunamadı');
        }

        const experience = doc.data();
        const modal = document.getElementById('experienceModal');
        
        if (!modal) {
            console.error('Modal elementi bulunamadı');
            return;
        }
        
        // Modal içeriğini doldur
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.innerHTML = `
                <div class="modal-header">
                    <h5 class="modal-title">Deneyim Detayları</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="user-info mb-3">
                        <i class="fas fa-user-circle fa-3x me-2"></i>
                        <div>
                            <h6>${experience.username || 'İsimsiz Kullanıcı'}</h6>
                            <small class="text-muted">${experience.userEmail || ''}</small>
                        </div>
                    </div>
                    <div class="experience-details">
                        <p><strong>Üniversite:</strong> ${experience.university || '-'}</p>
                        <p><strong>Ülke:</strong> ${experience.country || '-'}</p>
                        <p><strong>Dönem:</strong> ${experience.semester || '-'}</p>
                        <p><strong>Tarih:</strong> ${formatDate(experience.createdAt)}</p>
                        <p><strong>Durum:</strong> ${getStatusText(experience.status)}</p>
                        <p><strong>İçerik:</strong></p>
                        <p>${experience.content || ''}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    ${experience.status !== 'approved' ? `
                        <button type="button" class="btn btn-success" onclick="approveExperience('${id}')">
                            <i class="fas fa-check me-2"></i>Onayla
                        </button>
                    ` : ''}
                    <button type="button" class="btn btn-danger" onclick="deleteExperience('${id}')">
                        <i class="fas fa-trash me-2"></i>Sil
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="fas fa-times me-2"></i>Kapat
                    </button>
                </div>
            `;
        }

        // Modalı göster
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();

    } catch (error) {
        console.error('Deneyim detayları yüklenirken hata:', error);
        showErrorAlert('Deneyim detayları yüklenirken bir hata oluştu.');
    }
}

// Deneyimi onayla
async function approveExperience(id) {
    try {
        await firestoreDb.collection('experiences').doc(id).update({
            status: 'approved',
            approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
            approvedBy: localStorage.getItem('adminId')
        });

        showSuccessAlert('Deneyim başarıyla onaylandı.');
        loadExperiences();
        
        // Modalı kapat
        const modal = bootstrap.Modal.getInstance(document.getElementById('experienceModal'));
        if (modal) {
            modal.hide();
        }

    } catch (error) {
        console.error('Deneyim onaylanırken hata:', error);
        showErrorAlert('Deneyim onaylanırken bir hata oluştu.');
    }
}

// Deneyimi sil
async function deleteExperience(id) {
    try {
        const result = await Swal.fire({
            title: 'Emin misiniz?',
            text: 'Bu deneyim kalıcı olarak silinecek!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Evet, sil',
            cancelButtonText: 'İptal'
        });

        if (result.isConfirmed) {
            await firestoreDb.collection('experiences').doc(id).delete();
            showSuccessAlert('Deneyim başarıyla silindi.');
            loadExperiences();
            
            // Modalı kapat
            const modal = bootstrap.Modal.getInstance(document.getElementById('experienceModal'));
            if (modal) {
                modal.hide();
            }
        }

    } catch (error) {
        console.error('Deneyim silinirken hata:', error);
        showErrorAlert('Deneyim silinirken bir hata oluştu.');
    }
}

// Toplu onaylama
async function bulkApprove() {
    const selectedIds = getSelectedExperienceIds();
    if (selectedIds.length === 0) {
        showWarningAlert('Lütfen en az bir deneyim seçin.');
        return;
    }

    try {
        const batch = firestoreDb.batch();
        selectedIds.forEach(id => {
            const ref = firestoreDb.collection('experiences').doc(id);
            batch.update(ref, {
                status: 'approved',
                approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
                approvedBy: localStorage.getItem('adminId')
            });
        });

        await batch.commit();
        showSuccessAlert(`${selectedIds.length} deneyim başarıyla onaylandı.`);
        loadExperiences();
        toggleBulkActions();

    } catch (error) {
        console.error('Toplu onaylama hatası:', error);
        showErrorAlert('Deneyimler onaylanırken bir hata oluştu.');
    }
}

// Toplu silme
async function bulkDelete() {
    const selectedIds = getSelectedExperienceIds();
    if (selectedIds.length === 0) {
        showWarningAlert('Lütfen en az bir deneyim seçin.');
        return;
    }

    try {
        const result = await Swal.fire({
            title: 'Emin misiniz?',
            text: `${selectedIds.length} deneyim kalıcı olarak silinecek!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Evet, sil',
            cancelButtonText: 'İptal'
        });

        if (result.isConfirmed) {
            const batch = firestoreDb.batch();
            selectedIds.forEach(id => {
                const ref = firestoreDb.collection('experiences').doc(id);
                batch.delete(ref);
            });

            await batch.commit();
            showSuccessAlert(`${selectedIds.length} deneyim başarıyla silindi.`);
            loadExperiences();
            toggleBulkActions();
        }

    } catch (error) {
        console.error('Toplu silme hatası:', error);
        showErrorAlert('Deneyimler silinirken bir hata oluştu.');
    }
}

// Seçili deneyim ID'lerini al
function getSelectedExperienceIds() {
    const checkboxes = document.querySelectorAll('.experience-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.dataset.id);
}

// Toplu işlem butonlarını göster/gizle
function toggleBulkActions() {
    const selectedCount = getSelectedExperienceIds().length;
    const bulkActions = document.querySelector('.bulk-actions');
    bulkActions.style.display = selectedCount > 0 ? 'block' : 'none';
}

// Filtreleri yükle
async function loadFilters() {
    try {
        const experiencesRef = firestoreDb.collection('experiences');
        const snapshot = await experiencesRef.get();
        
        const countries = new Set();
        const semesters = new Set();
        
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.country) countries.add(data.country);
            if (data.semester) semesters.add(data.semester);
        });
        
        // Ülke filtresini doldur
        const countryFilter = document.getElementById('countryFilter');
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countryFilter.appendChild(option);
        });
        
        // Dönem filtresini doldur
        const semesterFilter = document.getElementById('semesterFilter');
        semesters.forEach(semester => {
            const option = document.createElement('option');
            option.value = semester;
            option.textContent = semester;
            semesterFilter.appendChild(option);
        });
        
    } catch (error) {
        console.error('Filtreler yüklenirken hata:', error);
    }
}

// Event listener'ları ekle
function addEventListeners() {
    // Tümünü seç/kaldır
    document.getElementById('selectAll').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.experience-checkbox');
        checkboxes.forEach(cb => cb.checked = this.checked);
        toggleBulkActions();
    });
    
    // Deneyim seçimleri değiştiğinde
    document.querySelector('#experiencesTable tbody').addEventListener('change', function(e) {
        if (e.target.classList.contains('experience-checkbox')) {
            toggleBulkActions();
        }
    });
    
    // Filtreler değiştiğinde
    document.getElementById('statusFilter').addEventListener('change', filterExperiences);
    document.getElementById('countryFilter').addEventListener('change', filterExperiences);
    document.getElementById('semesterFilter').addEventListener('change', filterExperiences);
    document.getElementById('searchInput').addEventListener('input', filterExperiences);
}

// Deneyimleri filtrele
function filterExperiences() {
    const status = document.getElementById('statusFilter').value;
    const country = document.getElementById('countryFilter').value;
    const semester = document.getElementById('semesterFilter').value;
    const search = document.getElementById('searchInput').value.toLowerCase();
    
    const rows = document.querySelectorAll('#experiencesTable tbody tr');
    
    rows.forEach(row => {
        const rowStatus = row.querySelector('.badge').textContent.trim();
        const rowCountry = row.cells[3].textContent.trim();
        const rowSemester = row.cells[4].textContent.trim();
        const rowText = row.textContent.toLowerCase();
        
        const statusMatch = status === 'all' || rowStatus === getStatusText(status);
        const countryMatch = country === 'all' || rowCountry === country;
        const semesterMatch = semester === 'all' || rowSemester === semester;
        const searchMatch = search === '' || rowText.includes(search);
        
        row.style.display = statusMatch && countryMatch && semesterMatch && searchMatch ? '' : 'none';
    });
}

// Yardımcı fonksiyonlar
function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusText(status) {
    switch (status) {
        case 'pending': return 'Onay Bekliyor';
        case 'approved': return 'Onaylandı';
        case 'rejected': return 'Reddedildi';
        default: return status;
    }
}

function getStatusBadgeColor(status) {
    switch (status) {
        case 'pending': return 'warning';
        case 'approved': return 'success';
        case 'rejected': return 'danger';
        default: return 'secondary';
    }
}

// Alert fonksiyonları
function showSuccessAlert(message) {
    Swal.fire({
        icon: 'success',
        title: 'Başarılı!',
        text: message,
        timer: 2000,
        showConfirmButton: false
    });
}

function showErrorAlert(message) {
    Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: message
    });
}

function showWarningAlert(message) {
    Swal.fire({
        icon: 'warning',
        title: 'Uyarı!',
        text: message
    });
}

// LocalStorage temizleme
function clearLocalStorage() {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminPermissions');
}

// Çıkış yap
function logout() {
    firebaseAuth.signOut().then(() => {
        clearLocalStorage();
        window.location.href = 'svg-turkiye-haritasi.html';
    }).catch((error) => {
        console.error('Çıkış hatası:', error);
    });
}

function displayUserAvatar(user) {
    if (user.photoURL) {
        return `<img src="${user.photoURL}" alt="${user.displayName}" class="rounded-circle me-2" width="32" height="32">`;
    } else {
        return `<i class="fas fa-user-circle fa-2x me-2"></i>`;
    }
}