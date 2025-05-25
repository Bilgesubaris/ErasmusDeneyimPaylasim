// Firebase referanslarını al
let firestoreDb;

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
        console.log('Firestore referansı alındı');
        
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
        firestoreDb.collection('users').onSnapshot(snapshot => {
            const totalUsers = snapshot.size;
            document.getElementById('totalUsers').textContent = totalUsers;
            console.log('Toplam kullanıcı sayısı güncellendi:', totalUsers);
        });

        // Bekleyen deneyimleri dinle
        firestoreDb.collection('deneyimler').onSnapshot(snapshot => {
            const pendingExperiences = snapshot.size;
            document.getElementById('pendingExperiences').textContent = pendingExperiences;
            console.log('Bekleyen deneyim sayısı güncellendi:', pendingExperiences);
        });

        // Onaylanmış deneyimleri dinle
        firestoreDb.collection('experiences').onSnapshot(snapshot => {
            const approvedExperiences = snapshot.size;
            document.getElementById('approvedExperiences').textContent = approvedExperiences;
            console.log('Onaylanmış deneyim sayısı güncellendi:', approvedExperiences);
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
        if (!activitiesContainer) return;

        let activities = [];

        // Bekleyen deneyimleri dinle
        firestoreDb.collection('deneyimler')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .onSnapshot(snapshot => {
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
            });

        // Onaylanmış deneyimleri dinle
        firestoreDb.collection('experiences')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .onSnapshot(snapshot => {
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
            });

    } catch (error) {
        console.error('Son aktiviteler dinlenirken hata oluştu:', error);
    }
}

// Aktiviteler listesini güncelle
function updateActivitiesList(activities) {
    const activitiesContainer = document.getElementById('recentActivities');
    if (!activitiesContainer) return;

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

// Tarih formatla
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    
    // Son 24 saat içinde
    if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        if (hours === 0) {
            const minutes = Math.floor(diff / (60 * 1000));
            return `${minutes} dakika önce`;
        }
        return `${hours} saat önce`;
    }
    
    // Son 7 gün içinde
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `${days} gün önce`;
    }
    
    // Daha eski
    return date.toLocaleDateString('tr-TR');
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Firebase'i başlat
        if (initializeFirebase()) {
            // İstatistikleri dinlemeye başla
            listenToStatistics();
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