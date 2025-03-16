function createStars() {
    const starContainer = document.querySelector('.stars');
    
    // Yıldız sayısını belirleyelim
    const starCount = 100; // 100 yıldız ekleyelim

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // Yıldız boyutunu daha büyük yapalım (5px ile 15px arasında)
        const size = Math.random() * (3 - 1) + 2; // 5px ile 15px arasında rastgele boyutlar
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        // Yıldız konumunu rastgele ayarlayalım (Ekranın her noktasına dağılacak şekilde)
        const leftPosition = Math.random() * 100; // 0 ile 100vw arasında
        const topPosition = Math.random() * 100; // 0 ile 100vh arasında
        star.style.left = `${leftPosition}vw`;
        star.style.top = `${topPosition}vh`;

        starContainer.appendChild(star);
    }
}

// Sayfa yüklendiğinde yıldızları oluştur
window.onload = createStars;
