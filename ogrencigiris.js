document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault();

    // Kullanıcı adı ve şifreyi al
    const username = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Örnek kullanıcı adı ve şifre
    const validUsername = "toks@gmail.com";
    const validPassword = "1234";

    // Eğer kullanıcı adı ve şifre doğruysa giriş yap
    if (username === validUsername && password === validPassword) {
        window.location.href = "dashboard.html"; // Giriş yapıldığında yönlendirilecek sayfa
    } else {
        document.getElementById("error-message").style.display = "block"; // Hata mesajını göster
    }
});
