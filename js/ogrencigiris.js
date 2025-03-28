// Form submit olayını dinle
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Form verilerini al
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;

            // Demo kullanıcı bilgileri (gerçek uygulamada sunucu tarafında doğrulanmalı)
            const validEmail = "demo@example.com";
            const validPassword = "demo123";

            if (email === validEmail && password === validPassword) {
                // Kullanıcı bilgilerini localStorage'a kaydet
                const userInfo = {
                    ad: "Demo Kullanıcı",
                    email: email,
                    profilResmi: "https://via.placeholder.com/32",
                    girisZamani: new Date().toISOString()
                };
                
                localStorage.setItem('kullanici', JSON.stringify(userInfo));
                
                // Erasmus deneyim sayfasına yönlendir
                console.log("Giriş başarılı, yönlendiriliyor...");
                window.location.href = 'erasmusdeneyim.html';
            } else {
                // Hata mesajını göster
                const errorMessage = document.getElementById('error-message');
                errorMessage.style.display = 'block';
                
                // 3 saniye sonra hata mesajını gizle
                setTimeout(() => {
                    errorMessage.style.display = 'none';
                }, 3000);
            }
        });
    } else {
        console.error('Login form bulunamadı!');
    }
});
