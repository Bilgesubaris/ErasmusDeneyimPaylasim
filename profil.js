document.addEventListener('DOMContentLoaded', function() {
    // Kullanıcı bilgilerini kontrol et ve yükle
    const kullanici = JSON.parse(localStorage.getItem('kullanici')) || {};
    
    // Form elemanlarını doldur
    document.getElementById('fullName').value = kullanici.ad || '';
    document.getElementById('email').value = kullanici.email || '';
    document.getElementById('university').value = kullanici.universite || '';
    document.getElementById('department').value = kullanici.bolum || '';
    document.getElementById('about').value = kullanici.hakkimda || '';
    document.getElementById('linkedin').value = kullanici.linkedin || '';
    document.getElementById('instagram').value = kullanici.instagram || '';

    // Profil resimlerini güncelle
    if (kullanici.profilResmi) {
        document.getElementById('mainProfileImage').src = kullanici.profilResmi;
        document.getElementById('navProfileImage').src = kullanici.profilResmi;
    }

    // Profil adını güncelle
    document.getElementById('profileName').textContent = kullanici.ad || 'Kullanıcı Adı';
    document.getElementById('navProfileName').textContent = kullanici.ad || 'Kullanıcı Adı';
    
    // Üniversite bilgisini güncelle
    document.getElementById('universityInfo').textContent = 
        (kullanici.universite && kullanici.bolum) ? 
        `${kullanici.universite} - ${kullanici.bolum}` : 
        'Üniversite - Bölüm';

    // İstatistikleri güncelle (demo veriler)
    document.getElementById('experienceCount').textContent = '2';
    document.getElementById('commentCount').textContent = '5';

    // Profil formu gönderildiğinde
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Kullanıcı bilgilerini güncelle
        kullanici.ad = document.getElementById('fullName').value;
        kullanici.universite = document.getElementById('university').value;
        kullanici.bolum = document.getElementById('department').value;
        kullanici.hakkimda = document.getElementById('about').value;
        kullanici.linkedin = document.getElementById('linkedin').value;
        kullanici.instagram = document.getElementById('instagram').value;

        // LocalStorage'a kaydet
        localStorage.setItem('kullanici', JSON.stringify(kullanici));

        // Profil adını ve üniversite bilgisini güncelle
        document.getElementById('profileName').textContent = kullanici.ad;
        document.getElementById('navProfileName').textContent = kullanici.ad;
        document.getElementById('universityInfo').textContent = 
            `${kullanici.universite} - ${kullanici.bolum}`;

        // Başarı mesajını göster
        const successAlert = document.getElementById('successAlert');
        successAlert.style.display = 'block';
        
        // 3 saniye sonra mesajı gizle
        setTimeout(() => {
            successAlert.style.display = 'none';
        }, 3000);
    });

    // Profil resmi değiştirme
    document.getElementById('photoInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageData = e.target.result;
                // Profil resimlerini güncelle
                document.getElementById('mainProfileImage').src = imageData;
                document.getElementById('navProfileImage').src = imageData;
                // LocalStorage'a kaydet
                kullanici.profilResmi = imageData;
                localStorage.setItem('kullanici', JSON.stringify(kullanici));
            };
            reader.readAsDataURL(file);
        }
    });

    // Çıkış yapma fonksiyonu
    window.cikisYap = function() {
        localStorage.removeItem('kullanici');
        window.location.href = 'ogrencigiris.html';
    };
});
