// Firebase'den ülkeleri çek ve select elementlerini doldur
async function populateCountrySelects() {
    try {
        // Select elementlerini seç
        const countryFilter = document.getElementById('countryFilter');
        const countrySelect = document.getElementById('country');

        if (!countryFilter || !countrySelect) {
            console.error('Select elementleri bulunamadı');
            return;
        }

        // Her iki select elementini doldur
        [countryFilter, countrySelect].forEach(select => {
            // Mevcut seçenekleri temizle (ilk "Tümü" veya "Seçiniz" seçeneği hariç)
            while (select.options.length > 1) {
                select.remove(1);
            }
        });

        // Ülkeleri Firestore'dan çek
        const querySnapshot = await firebase.firestore().collection('ulkeler')
            .orderBy('name')
            .get();

        if (querySnapshot.empty) {
            console.log('Ülke verisi bulunamadı');
            return;
        }

        // Her iki select elementini doldur
        [countryFilter, countrySelect].forEach(select => {
            // Ülkeleri ekle
            querySnapshot.forEach(doc => {
                const country = doc.data();
                const option = document.createElement('option');
                option.value = country.name;
                option.textContent = country.name;
                select.appendChild(option);
            });
        });

        console.log('Ülkeler başarıyla yüklendi');
    } catch (error) {
        console.error('Ülkeler yüklenirken hata:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Ülkeler yüklenirken bir hata oluştu: ' + error.message
        });
    }
}

// Sayfa yüklendiğinde ülkeleri yükle
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Firebase başlatılmış mı kontrol et
        if (!firebase.apps.length) {
            console.error('Firebase başlatılmamış');
            return;
        }

        // Ülkeleri yükle
        await populateCountrySelects();
    } catch (error) {
        console.error('Ülkeler yüklenirken hata:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Ülkeler yüklenirken bir hata oluştu: ' + error.message
        });
    }
});
