// Geri sayım sayacı
function updateCountdown() {
    const deadline = new Date('April 30, 2025 23:59:59').getTime();
    const now = new Date().getTime();
    const distance = deadline - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('countdown').innerHTML = `
        <div class="countdown-item">
            <span class="countdown-number">${days}</span>
            <span class="countdown-label">Gün</span>
        </div>
        <div class="countdown-item">
            <span class="countdown-number">${hours}</span>
            <span class="countdown-label">Saat</span>
        </div>
        <div class="countdown-item">
            <span class="countdown-number">${minutes}</span>
            <span class="countdown-label">Dakika</span>
        </div>
        <div class="countdown-item">
            <span class="countdown-number">${seconds}</span>
            <span class="countdown-label">Saniye</span>
        </div>
    `;

    if (distance < 0) {
        clearInterval(countdownTimer);
        document.getElementById('countdown').innerHTML = 'Başvuru süresi sona erdi!';
    }
}

const countdownTimer = setInterval(updateCountdown, 1000);

// İstatistik sayaçları animasyonu
function animateNumbers() {
    const stats = [
        { element: document.querySelector('.stat-item:nth-child(1) .stat-number'), target: 1234 },
        { element: document.querySelector('.stat-item:nth-child(2) .stat-number'), target: 85 },
        { element: document.querySelector('.stat-item:nth-child(3) .stat-number'), target: 25 },
        { element: document.querySelector('.stat-item:nth-child(4) .stat-number'), target: 95 }
    ];

    stats.forEach(stat => {
        let current = 0;
        const increment = stat.target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= stat.target) {
                current = stat.target;
                clearInterval(timer);
            }
            stat.element.textContent = Math.round(current).toLocaleString();
        }, 20);
    });
}

// Sayfa yüklendiğinde istatistikleri animasyonla göster
document.addEventListener('DOMContentLoaded', () => {
    animateNumbers();
});

// Harita işaretçileri için tooltip
const mapMarkers = document.querySelectorAll('.map-marker');
mapMarkers.forEach(marker => {
    marker.addEventListener('mouseover', () => {
        const title = marker.getAttribute('title');
        const tooltip = document.createElement('div');
        tooltip.className = 'marker-tooltip';
        tooltip.textContent = title;
        marker.appendChild(tooltip);
    });

    marker.addEventListener('mouseout', () => {
        const tooltip = marker.querySelector('.marker-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    });

    marker.addEventListener('click', () => {
        const country = marker.getAttribute('title');
        const countryCards = document.querySelectorAll('.country-card');
        countryCards.forEach(card => {
            if (card.querySelector('h3').textContent === country) {
                card.scrollIntoView({ behavior: 'smooth' });
                card.classList.add('highlight-card');
                setTimeout(() => {
                    card.classList.remove('highlight-card');
                }, 2000);
            }
        });
    });
});

// Deneyim kartları için hover efekti
const experienceCards = document.querySelectorAll('.card');
experienceCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Ülke kartları için hover efekti ve detay gösterimi
const countryCards = document.querySelectorAll('.country-card');
countryCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        const details = card.querySelector('.country-details');
        if (details) {
            details.style.opacity = '1';
            details.style.transform = 'translateY(0)';
        }
    });

    card.addEventListener('mouseleave', () => {
        const details = card.querySelector('.country-details');
        if (details) {
            details.style.opacity = '0';
            details.style.transform = 'translateY(20px)';
        }
    });
});

// Sayfa kaydırma animasyonu
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Bildirim banner'ı için kapatma animasyonu
document.querySelector('.alert-banner button')?.addEventListener('click', function() {
    const banner = this.parentElement;
    banner.style.transform = 'translateY(-100%)';
    banner.style.opacity = '0';
    setTimeout(() => {
        banner.style.display = 'none';
    }, 500);
});
