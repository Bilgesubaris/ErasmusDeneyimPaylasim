function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Burada gerçek bir kimlik doğrulama yapılacak
    // Şimdilik basit bir kontrol yapıyoruz
    if (email && password) {
        // Başarılı giriş sonrası yönlendirme
        window.location.href = 'erasmusdeneyim.html';
    } else {
        alert('Lütfen email ve şifrenizi giriniz!');
    }
    
    return false;
}
