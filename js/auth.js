// Form elemanları
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitButton = loginForm.querySelector('button[type="submit"]');
const passwordToggle = document.querySelector('.password-toggle');

// Şifre göster/gizle
passwordToggle.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.querySelector('i').classList.toggle('fa-eye');
    this.querySelector('i').classList.toggle('fa-eye-slash');
});

// Form gönderimi
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Form doğrulama
    if (!validateForm()) {
        return;
    }
    
    // Buton durumunu güncelle
    setLoading(true);
    
    try {
        const email = emailInput.value;
        const password = passwordInput.value;
        
        // Firebase ile giriş yap
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        // Kullanıcı rolünü kontrol et
        const userDoc = await db.collection('users').doc(userCredential.user.uid).get();
        
        if (!userDoc.exists || userDoc.data().role !== 'student') {
            // Öğrenci değilse çıkış yap
            await auth.signOut();
            throw new Error('Bu hesap öğrenci hesabı değil!');
        }
        
        // Başarılı giriş
        showSuccess('Giriş başarıyla yapıldı.');
        
        // Kullanıcı bilgilerini kaydet
        localStorage.setItem('isStudentLoggedIn', 'true');
        localStorage.setItem('studentUsername', userDoc.data().username);
        
        // Yönlendirme
        setTimeout(() => {
            window.location.href = 'erasmusdeneyim.html';
        }, 1500);
        
    } catch (error) {
        console.error('Giriş hatası:', error);
        showError(error.message || 'E-posta veya şifre hatalı!');
    } finally {
        setLoading(false);
    }
});

// Form doğrulama
function validateForm() {
    let isValid = true;
    
    // Email doğrulama
    if (!emailInput.value) {
        showFieldError(emailInput, 'Email adresi gerekli');
        isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
        showFieldError(emailInput, 'Geçerli bir email adresi girin');
        isValid = false;
    } else {
        clearFieldError(emailInput);
    }
    
    // Şifre doğrulama
    if (!passwordInput.value) {
        showFieldError(passwordInput, 'Şifre gerekli');
        isValid = false;
    } else if (passwordInput.value.length < 6) {
        showFieldError(passwordInput, 'Şifre en az 6 karakter olmalı');
        isValid = false;
    } else {
        clearFieldError(passwordInput);
    }
    
    return isValid;
}

// Yardımcı fonksiyonlar
function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    const btnText = submitButton.querySelector('.btn-text');
    const spinner = submitButton.querySelector('.spinner-border');
    
    if (isLoading) {
        btnText.textContent = 'Giriş Yapılıyor...';
        spinner.classList.remove('d-none');
    } else {
        btnText.textContent = 'Giriş Yap';
        spinner.classList.add('d-none');
    }
}

function showFieldError(input, message) {
    input.classList.add('is-invalid');
    const feedback = input.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.textContent = message;
    } else {
        const div = document.createElement('div');
        div.className = 'invalid-feedback';
        div.textContent = message;
        input.parentNode.insertBefore(div, input.nextSibling);
    }
}

function clearFieldError(input) {
    input.classList.remove('is-invalid');
    const feedback = input.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.remove();
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showSuccess(message) {
    Swal.fire({
        icon: 'success',
        title: 'Başarılı!',
        text: message,
        showConfirmButton: false,
        timer: 1500
    });
}

function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: message
    });
}

// Oturum kontrolü
auth.onAuthStateChanged(async function(user) {
    if (user) {
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists && userDoc.data().role === 'student') {
                window.location.href = 'erasmusdeneyim.html';
            }
        } catch (error) {
            console.error('Oturum kontrolü hatası:', error);
        }
    }
}); 