import { auth, db, storage } from './firebase-config.js';

// Ülke listesi
const countries = [
    { code: 'AT', name: 'Avusturya' },
    { code: 'BE', name: 'Belçika' },
    { code: 'BG', name: 'Bulgaristan' },
    { code: 'HR', name: 'Hırvatistan' },
    { code: 'CZ', name: 'Çek Cumhuriyeti' },
    { code: 'DK', name: 'Danimarka' },
    { code: 'EE', name: 'Estonya' },
    { code: 'FI', name: 'Finlandiya' },
    { code: 'FR', name: 'Fransa' },
    { code: 'DE', name: 'Almanya' },
    { code: 'GR', name: 'Yunanistan' },
    { code: 'HU', name: 'Macaristan' },
    { code: 'IS', name: 'İzlanda' },
    { code: 'IE', name: 'İrlanda' },
    { code: 'IT', name: 'İtalya' },
    { code: 'LV', name: 'Letonya' },
    { code: 'LI', name: 'Lihtenştayn' },
    { code: 'LT', name: 'Litvanya' },
    { code: 'LU', name: 'Lüksemburg' },
    { code: 'MT', name: 'Malta' },
    { code: 'NL', name: 'Hollanda' },
    { code: 'NO', name: 'Norveç' },
    { code: 'PL', name: 'Polonya' },
    { code: 'PT', name: 'Portekiz' },
    { code: 'RO', name: 'Romanya' },
    { code: 'SK', name: 'Slovakya' },
    { code: 'SI', name: 'Slovenya' },
    { code: 'ES', name: 'İspanya' },
    { code: 'SE', name: 'İsveç' },
    { code: 'CH', name: 'İsviçre' },
    { code: 'TR', name: 'Türkiye' },
    { code: 'GB', name: 'Birleşik Krallık' }
];

// Ülkeleri yükle
function loadCountries() {
    const ulkeSelect = document.getElementById('country');
    const countryFilter = document.getElementById('countryFilter');
    
    if (!ulkeSelect || !countryFilter) {
        console.error('Select elementleri bulunamadı!');
        return;
    }

    // Select elementlerini temizle
    ulkeSelect.innerHTML = '<option value="">Ülke Seçin</option>';
    countryFilter.innerHTML = '<option value="">Tümü</option>';

    // Ülkeleri alfabetik sıraya göre sırala
    const sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));

    // Ülkeleri select elementlerine ekle
    sortedCountries.forEach(ulke => {
        const option = document.createElement('option');
        option.value = ulke.code;
        option.textContent = ulke.name;
        
        ulkeSelect.appendChild(option.cloneNode(true));
        countryFilter.appendChild(option);
    });
}

// Sayfa yüklendiğinde ülkeleri yükle
document.addEventListener('DOMContentLoaded', loadCountries);

// Deneyim paylaşma formu gönderimi
document.getElementById('experienceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const country = document.getElementById('country').value;
    const university = document.getElementById('university').value;
    const semester = document.getElementById('semester').value;
    const content = document.getElementById('experience').value;
    
    // Kullanıcı kontrolü
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Deneyim paylaşmak için giriş yapmalısınız!'
        });
        return;
    }
    
    // Deneyimleri al
    const experiences = JSON.parse(localStorage.getItem('experiences') || '[]');
    
    // Yeni deneyim ekle
    const newExperience = {
        id: experiences.length + 1,
        userId: currentUser.id,
        username: currentUser.username,
        title: title,
        country: country,
        university: university,
        semester: semester,
        content: content,
        date: new Date().toLocaleDateString('tr-TR'),
        likes: 0,
        comments: []
    };
    
    experiences.push(newExperience);
    localStorage.setItem('experiences', JSON.stringify(experiences));
    
    // Kullanıcının deneyim sayısını güncelle
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].experienceCount++;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Formu temizle
    this.reset();
    
    // Başarı mesajı göster
    Swal.fire({
        icon: 'success',
        title: 'Başarılı!',
        text: 'Deneyiminiz başarıyla paylaşıldı.',
        timer: 1500,
        showConfirmButton: false
    }).then(() => {
        window.location.href = 'experiences.html';
    });
});

// Deneyim detaylarını görüntüleme
async function viewExperienceDetails(id) {
    try {
        const experienceDoc = await db.collection('experiences').doc(id).get();
        
        if (!experienceDoc.exists) {
            throw new Error('Deneyim bulunamadı');
        }

        const experience = experienceDoc.data();
        const modal = document.getElementById('viewExperienceModal');
        
        // Modal içeriğini doldur
        modal.querySelector('.experience-title').textContent = experience.title;
        modal.querySelector('.university').textContent = experience.university;
        modal.querySelector('.location').textContent = `${experience.city}, ${experience.country}`;
        modal.querySelector('.semester').textContent = experience.semester;
        modal.querySelector('.accommodation').textContent = experience.accommodation;
        modal.querySelector('.expense').textContent = `${experience.monthlyExpense}€`;
        modal.querySelector('.experience-text').textContent = experience.experience;
        modal.querySelector('.recommendations-text').textContent = experience.recommendations || 'Tavsiye bulunmuyor.';

        // Yorumları yükle
        loadComments(id);

        // Modalı göster
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    } catch (error) {
        console.error('Deneyim yüklenirken hata:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Deneyim yüklenirken bir hata oluştu.'
        });
    }
}

// Yorumları yükle
async function loadComments(experienceId) {
    try {
        const commentsList = document.getElementById('commentsList');
        commentsList.innerHTML = '';

        const snapshot = await db.collection('experiences')
            .doc(experienceId)
            .collection('comments')
            .orderBy('createdAt', 'desc')
            .get();

        if (snapshot.empty) {
            commentsList.innerHTML = '<p class="text-muted">Henüz yorum yapılmamış.</p>';
            return;
        }

        snapshot.forEach(doc => {
            const comment = doc.data();
            const commentElement = createCommentElement(comment);
            commentsList.appendChild(commentElement);
        });
    } catch (error) {
        console.error('Yorumlar yüklenirken hata:', error);
    }
}

// Yorum elementi oluştur
function createCommentElement(comment) {
    const div = document.createElement('div');
    div.className = 'comment mb-3';
    div.innerHTML = `
        <div class="comment-header d-flex align-items-center mb-2">
            <img src="${comment.userPhotoURL || 'https://via.placeholder.com/32'}" 
                 alt="Kullanıcı" 
                 class="rounded-circle me-2" 
                 style="width: 32px; height: 32px;">
            <div>
                <div class="fw-bold">${comment.userName}</div>
                <small class="text-muted">${new Date(comment.createdAt.toDate()).toLocaleDateString()}</small>
            </div>
        </div>
        <div class="comment-content">
            ${comment.text}
        </div>
    `;
    return div;
}

// Yorum ekle
async function addComment(experienceId, text) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Yorum yapmak için giriş yapmalısınız');
        }

        const commentData = {
            text,
            userId: user.uid,
            userName: user.displayName || 'Anonim',
            userPhotoURL: user.photoURL,
            createdAt: new Date()
        };

        await db.collection('experiences')
            .doc(experienceId)
            .collection('comments')
            .add(commentData);

        // Yorumları yeniden yükle
        await loadComments(experienceId);

        // Formu temizle
        document.getElementById('commentText').value = '';
    } catch (error) {
        console.error('Yorum eklenirken hata:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: error.message || 'Yorum eklenirken bir hata oluştu.'
        });
    }
}

// Yorum formunu dinle
document.getElementById('commentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = document.getElementById('commentText').value.trim();
    if (!text) return;

    const experienceId = document.querySelector('.experience-details').dataset.experienceId;
    await addComment(experienceId, text);
});

// Global fonksiyonları dışa aktar
window.viewExperienceDetails = viewExperienceDetails;
window.addComment = addComment; 