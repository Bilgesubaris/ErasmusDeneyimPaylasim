document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    setupEventListeners();
});

function loadUserProfile() {
    const userInfo = JSON.parse(localStorage.getItem('kullanici')) || {};
    
    // Profil bilgilerini doldur
    document.getElementById('profileName').textContent = userInfo.ad || 'Kullanıcı Adı';
    document.getElementById('universityInfo').textContent = 
        `${userInfo.universite || 'Üniversite'} - ${userInfo.bolum || 'Bölüm'}`;
    
    if (userInfo.profilResmi) {
        document.getElementById('mainProfileImage').src = userInfo.profilResmi;
    }
    
    // Form alanlarını doldur
    document.getElementById('fullName').value = userInfo.ad || '';
    document.getElementById('email').value = userInfo.email || '';
    document.getElementById('university').value = userInfo.universite || '';
    document.getElementById('department').value = userInfo.bolum || '';
    document.getElementById('about').value = userInfo.hakkimda || '';
    document.getElementById('linkedin').value = userInfo.linkedin || '';
    document.getElementById('instagram').value = userInfo.instagram || '';
    
    // İstatistikleri güncelle
    updateProfileStats();
}

function updateProfileStats() {
    const experiences = JSON.parse(localStorage.getItem('experiences')) || [];
    const userEmail = JSON.parse(localStorage.getItem('kullanici'))?.email;
    
    const userExperiences = experiences.filter(exp => exp.userId === userEmail);
    document.getElementById('experienceCount').textContent = userExperiences.length;
    
    let commentCount = 0;
    experiences.forEach(exp => {
        if (exp.comments) {
            commentCount += exp.comments.filter(comment => comment.userId === userEmail).length;
        }
    });
    document.getElementById('commentCount').textContent = commentCount;
}

function setupEventListeners() {
    // Profil fotoğrafı değiştirme
    document.getElementById('photoInput').addEventListener('change', handlePhotoChange);
    
    // Profil formu gönderimi
    document.getElementById('profileForm').addEventListener('submit', handleProfileSubmit);
}

async function handlePhotoChange(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Lütfen geçerli bir resim dosyası seçin.');
        return;
    }
    
    try {
        const base64Image = await convertToBase64(file);
        document.getElementById('mainProfileImage').src = base64Image;
        
        // Kullanıcı bilgilerini güncelle
        const userInfo = JSON.parse(localStorage.getItem('kullanici')) || {};
        userInfo.profilResmi = base64Image;
        localStorage.setItem('kullanici', JSON.stringify(userInfo));
        
        showSuccessMessage('Profil fotoğrafı başarıyla güncellendi!');
    } catch (error) {
        console.error('Fotoğraf yükleme hatası:', error);
        alert('Fotoğraf yüklenirken bir hata oluştu.');
    }
}

function handleProfileSubmit(event) {
    event.preventDefault();
    
    const userInfo = JSON.parse(localStorage.getItem('kullanici')) || {};
    
    // Form verilerini al ve kullanıcı bilgilerini güncelle
    userInfo.ad = document.getElementById('fullName').value;
    userInfo.universite = document.getElementById('university').value;
    userInfo.bolum = document.getElementById('department').value;
    userInfo.hakkimda = document.getElementById('about').value;
    userInfo.linkedin = document.getElementById('linkedin').value;
    userInfo.instagram = document.getElementById('instagram').value;
    
    // Kullanıcı bilgilerini kaydet
    localStorage.setItem('kullanici', JSON.stringify(userInfo));
    
    // Profil görünümünü güncelle
    document.getElementById('profileName').textContent = userInfo.ad;
    document.getElementById('universityInfo').textContent = 
        `${userInfo.universite} - ${userInfo.bolum}`;
    
    showSuccessMessage('Profil bilgileriniz başarıyla güncellendi!');
}

function showSuccessMessage(message) {
    const alert = document.getElementById('successAlert');
    const messageElement = document.getElementById('successMessage');
    
    messageElement.textContent = message;
    alert.classList.remove('d-none');
    
    setTimeout(() => {
        alert.classList.add('d-none');
    }, 3000);
}

function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
