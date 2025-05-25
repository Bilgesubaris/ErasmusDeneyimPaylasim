// Firebase yapılandırmasını ve hizmetleri al
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// Firebase yapılandırman
const firebaseConfig = {
  apiKey: "AIzaSyB3jCeB9tFUGAbj1XSrjkRkSme98C4fGqc",
  authDomain: "webprojem-6fb9a.firebaseapp.com",
  projectId: "webprojem-6fb9a",
  storageBucket: "webprojem-6fb9a.firebasestorage.app",
  messagingSenderId: "571224024778",
  appId: "1:571224024778:web:77ab0b61a0a97e219f7633",
  measurementId: "G-M2JJY0MR0Q"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// Form gönderimini işle
async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Şifre kontrolü
    if (password !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Şifreler eşleşmiyor!'
        });
        return false;
    }

    // Firebase Authentication ile kullanıcı kaydı
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Kullanıcı kaydı başarılı olduktan sonra Firestore'a kullanıcı bilgilerini ekle
        await addDoc(collection(db, "users"), {
            uid: user.uid,
            username: username,
            email: email,
            createdAt: new Date(),
            experienceCount: 0 // İlk başta deneyim sayısı 0
        });

        // Başarılı kayıt mesajı
        Swal.fire({
            icon: 'success',
            title: 'Başarılı!',
            text: 'Hesabınız başarıyla oluşturuldu.',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            // Giriş sayfasına yönlendir
            window.location.href = 'login.html';
        });

    } catch (error) {
        console.error("Kayıt hatası:", error.message);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: `Kayıt yapılırken bir hata oluştu: ${error.message}`
        });
    }

    return false;
}
