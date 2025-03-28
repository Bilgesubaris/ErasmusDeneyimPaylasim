// Hedef tarih: 16 Mart 16:59
var targetDate = new Date("March 26, 2025 18:11:09").getTime();

var countdownElement = document.getElementById("countdown");
var countdownContainer = document.getElementById("countdown-container");

// Güncellemeyi her saniye yapacak şekilde ayarlandı
var countdownInterval = setInterval(function() {

    var now = new Date().getTime();
    var timeLeft = targetDate - now;

    // Eğer zaman bitmişse
    if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        countdownElement.innerHTML = "Başvurular Bitti!";
        countdownContainer.classList.add("ended");  // "Başvurular Bitti" yazısı kırmızı olacak
    } else {
        // Güncelleme için gün, saat, dakika, saniye hesaplaması
        var days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        var hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        countdownElement.innerHTML = days + "g " + hours + "s " + minutes + "d " + seconds + "s ";
    }
}, 1000);
