// Geri sayım için bitiş tarihi (30 Mart 2025)
const endDate = new Date('March 30, 2025 23:59:59').getTime();

function updateCountdown() {
    // Şu anki tarih
    const now = new Date().getTime();
    
    // Kalan süre
    const timeLeft = endDate - now;
    
    // Countdown elementini güncelle
    const countdownElement = document.getElementById('countdown');
    
    if (timeLeft < 0) {
        // Süre bittiyse
        countdownElement.innerHTML = `
            <div class="countdown-expired">BAŞVURU SÜRESİ DOLDU!</div>
            <div class="countdown-item" style="opacity: 0.3">
                <span class="countdown-value">0</span>
                <span class="countdown-label">Gün</span>
            </div>
            <div class="countdown-item" style="opacity: 0.3">
                <span class="countdown-value">0</span>
                <span class="countdown-label">Saat</span>
            </div>
            <div class="countdown-item" style="opacity: 0.3">
                <span class="countdown-value">0</span>
                <span class="countdown-label">Dakika</span>
            </div>
            <div class="countdown-item" style="opacity: 0.3">
                <span class="countdown-value">0</span>
                <span class="countdown-label">Saniye</span>
            </div>
        `;
    } else {
        // Zaman birimleri hesaplama
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        // Süre devam ediyorsa
        countdownElement.innerHTML = `
            <div class="countdown-item">
                <span class="countdown-value">${days}</span>
                <span class="countdown-label">Gün</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">${hours}</span>
                <span class="countdown-label">Saat</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">${minutes}</span>
                <span class="countdown-label">Dakika</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">${seconds}</span>
                <span class="countdown-label">Saniye</span>
            </div>
        `;
    }
}

// Sayfa yüklendiğinde sayacı başlat
document.addEventListener('DOMContentLoaded', () => {
    updateCountdown();
    // Her saniye güncelle
    setInterval(updateCountdown, 1000);
});
