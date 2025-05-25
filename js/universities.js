// Türkiye'deki üniversiteler
const turkishUniversities = [
    // Devlet Üniversiteleri
    { name: 'Abant İzzet Baysal Üniversitesi', city: 'Bolu', type: 'Devlet' },
    { name: 'Adıyaman Üniversitesi', city: 'Adıyaman', type: 'Devlet' },
    { name: 'Afyon Kocatepe Üniversitesi', city: 'Afyonkarahisar', type: 'Devlet' },
    { name: 'Ağrı İbrahim Çeçen Üniversitesi', city: 'Ağrı', type: 'Devlet' },
    { name: 'Akdeniz Üniversitesi', city: 'Antalya', type: 'Devlet' },
    { name: 'Aksaray Üniversitesi', city: 'Aksaray', type: 'Devlet' },
    { name: 'Amasya Üniversitesi', city: 'Amasya', type: 'Devlet' },
    { name: 'Anadolu Üniversitesi', city: 'Eskişehir', type: 'Devlet' },
    { name: 'Ankara Üniversitesi', city: 'Ankara', type: 'Devlet' },
    { name: 'Ankara Hacı Bayram Veli Üniversitesi', city: 'Ankara', type: 'Devlet' },
    { name: 'Ankara Sosyal Bilimler Üniversitesi', city: 'Ankara', type: 'Devlet' },
    { name: 'Ankara Yıldırım Beyazıt Üniversitesi', city: 'Ankara', type: 'Devlet' },
    { name: 'Ardahan Üniversitesi', city: 'Ardahan', type: 'Devlet' },
    { name: 'Artvin Çoruh Üniversitesi', city: 'Artvin', type: 'Devlet' },
    { name: 'Atatürk Üniversitesi', city: 'Erzurum', type: 'Devlet' },
    { name: 'Balıkesir Üniversitesi', city: 'Balıkesir', type: 'Devlet' },
    { name: 'Bandırma Onyedi Eylül Üniversitesi', city: 'Balıkesir', type: 'Devlet' },
    { name: 'Bartın Üniversitesi', city: 'Bartın', type: 'Devlet' },
    { name: 'Batman Üniversitesi', city: 'Batman', type: 'Devlet' },
    { name: 'Bayburt Üniversitesi', city: 'Bayburt', type: 'Devlet' },
    { name: 'Bilecik Şeyh Edebali Üniversitesi', city: 'Bilecik', type: 'Devlet' },
    { name: 'Bingöl Üniversitesi', city: 'Bingöl', type: 'Devlet' },
    { name: 'Bitlis Eren Üniversitesi', city: 'Bitlis', type: 'Devlet' },
    { name: 'Boğaziçi Üniversitesi', city: 'İstanbul', type: 'Devlet' },
    { name: 'Burdur Mehmet Akif Ersoy Üniversitesi', city: 'Burdur', type: 'Devlet' },
    { name: 'Bursa Teknik Üniversitesi', city: 'Bursa', type: 'Devlet' },
    { name: 'Bursa Uludağ Üniversitesi', city: 'Bursa', type: 'Devlet' },
    { name: 'Çanakkale Onsekiz Mart Üniversitesi', city: 'Çanakkale', type: 'Devlet' },
    { name: 'Çankırı Karatekin Üniversitesi', city: 'Çankırı', type: 'Devlet' },
    { name: 'Çukurova Üniversitesi', city: 'Adana', type: 'Devlet' },
    { name: 'Dicle Üniversitesi', city: 'Diyarbakır', type: 'Devlet' },
    { name: 'Dokuz Eylül Üniversitesi', city: 'İzmir', type: 'Devlet' },
    { name: 'Dumlupınar Üniversitesi', city: 'Kütahya', type: 'Devlet' },
    { name: 'Ege Üniversitesi', city: 'İzmir', type: 'Devlet' },
    { name: 'Erciyes Üniversitesi', city: 'Kayseri', type: 'Devlet' },
    { name: 'Erzincan Binali Yıldırım Üniversitesi', city: 'Erzincan', type: 'Devlet' },
    { name: 'Erzurum Teknik Üniversitesi', city: 'Erzurum', type: 'Devlet' },
    { name: 'Eskişehir Teknik Üniversitesi', city: 'Eskişehir', type: 'Devlet' },
    { name: 'Fırat Üniversitesi', city: 'Elazığ', type: 'Devlet' },
    { name: 'Galatasaray Üniversitesi', city: 'İstanbul', type: 'Devlet' },
    { name: 'Gazi Üniversitesi', city: 'Ankara', type: 'Devlet' },
    { name: 'Gaziantep Üniversitesi', city: 'Gaziantep', type: 'Devlet' },
    { name: 'Gaziantep İslam Bilim ve Teknoloji Üniversitesi', city: 'Gaziantep', type: 'Devlet' },
    { name: 'Gebze Teknik Üniversitesi', city: 'Kocaeli', type: 'Devlet' },
    { name: 'Giresun Üniversitesi', city: 'Giresun', type: 'Devlet' },
    { name: 'Gümüşhane Üniversitesi', city: 'Gümüşhane', type: 'Devlet' },
    { name: 'Hacettepe Üniversitesi', city: 'Ankara', type: 'Devlet' },
    { name: 'Hakkari Üniversitesi', city: 'Hakkari', type: 'Devlet' },
    { name: 'Harran Üniversitesi', city: 'Şanlıurfa', type: 'Devlet' },
    { name: 'Hitit Üniversitesi', city: 'Çorum', type: 'Devlet' },
    { name: 'Iğdır Üniversitesi', city: 'Iğdır', type: 'Devlet' },
    { name: 'İnönü Üniversitesi', city: 'Malatya', type: 'Devlet' },
    { name: 'İstanbul Teknik Üniversitesi', city: 'İstanbul', type: 'Devlet' },
    { name: 'İstanbul Üniversitesi', city: 'İstanbul', type: 'Devlet' },
    { name: 'İstanbul Üniversitesi-Cerrahpaşa', city: 'İstanbul', type: 'Devlet' },
    { name: 'İzmir Bakırçay Üniversitesi', city: 'İzmir', type: 'Devlet' },
    { name: 'İzmir Demokrasi Üniversitesi', city: 'İzmir', type: 'Devlet' },
    { name: 'İzmir Kâtip Çelebi Üniversitesi', city: 'İzmir', type: 'Devlet' },
    { name: 'İzmir Yüksek Teknoloji Enstitüsü', city: 'İzmir', type: 'Devlet' },
    { name: 'Kahramanmaraş İstiklal Üniversitesi', city: 'Kahramanmaraş', type: 'Devlet' },
    { name: 'Kahramanmaraş Sütçü İmam Üniversitesi', city: 'Kahramanmaraş', type: 'Devlet' },
    { name: 'Karadeniz Teknik Üniversitesi', city: 'Trabzon', type: 'Devlet' },
    { name: 'Karamanoğlu Mehmetbey Üniversitesi', city: 'Karaman', type: 'Devlet' },
    { name: 'Kastamonu Üniversitesi', city: 'Kastamonu', type: 'Devlet' },
    { name: 'Kayseri Üniversitesi', city: 'Kayseri', type: 'Devlet' },
    { name: 'Kırıkkale Üniversitesi', city: 'Kırıkkale', type: 'Devlet' },
    { name: 'Kırklareli Üniversitesi', city: 'Kırklareli', type: 'Devlet' },
    { name: 'Kırşehir Ahi Evran Üniversitesi', city: 'Kırşehir', type: 'Devlet' },
    { name: 'Kilis 7 Aralık Üniversitesi', city: 'Kilis', type: 'Devlet' },
    { name: 'Kocaeli Üniversitesi', city: 'Kocaeli', type: 'Devlet' },
    { name: 'Konya Teknik Üniversitesi', city: 'Konya', type: 'Devlet' },
    { name: 'Kütahya Dumlupınar Üniversitesi', city: 'Kütahya', type: 'Devlet' },
    { name: 'Malatya Turgut Özal Üniversitesi', city: 'Malatya', type: 'Devlet' },
    { name: 'Manisa Celal Bayar Üniversitesi', city: 'Manisa', type: 'Devlet' },
    { name: 'Mardin Artuklu Üniversitesi', city: 'Mardin', type: 'Devlet' },
    { name: 'Marmara Üniversitesi', city: 'İstanbul', type: 'Devlet' },
    { name: 'Mersin Üniversitesi', city: 'Mersin', type: 'Devlet' },
    { name: 'Mimar Sinan Güzel Sanatlar Üniversitesi', city: 'İstanbul', type: 'Devlet' },
    { name: 'Muğla Sıtkı Koçman Üniversitesi', city: 'Muğla', type: 'Devlet' },
    { name: 'Munzur Üniversitesi', city: 'Tunceli', type: 'Devlet' },
    { name: 'Muş Alparslan Üniversitesi', city: 'Muş', type: 'Devlet' },
    { name: 'Necmettin Erbakan Üniversitesi', city: 'Konya', type: 'Devlet' },
    { name: 'Nevşehir Hacı Bektaş Veli Üniversitesi', city: 'Nevşehir', type: 'Devlet' },
    { name: 'Niğde Ömer Halisdemir Üniversitesi', city: 'Niğde', type: 'Devlet' },
    { name: 'Ondokuz Mayıs Üniversitesi', city: 'Samsun', type: 'Devlet' },
    { name: 'Ordu Üniversitesi', city: 'Ordu', type: 'Devlet' },
    { name: 'Orta Doğu Teknik Üniversitesi', city: 'Ankara', type: 'Devlet' },
    { name: 'Osmaniye Korkut Ata Üniversitesi', city: 'Osmaniye', type: 'Devlet' },
    { name: 'Pamukkale Üniversitesi', city: 'Denizli', type: 'Devlet' },
    { name: 'Recep Tayyip Erdoğan Üniversitesi', city: 'Rize', type: 'Devlet' },
    { name: 'Sakarya Üniversitesi', city: 'Sakarya', type: 'Devlet' },
    { name: 'Samsun Üniversitesi', city: 'Samsun', type: 'Devlet' },
    { name: 'Selçuk Üniversitesi', city: 'Konya', type: 'Devlet' },
    { name: 'Siirt Üniversitesi', city: 'Siirt', type: 'Devlet' },
    { name: 'Sinop Üniversitesi', city: 'Sinop', type: 'Devlet' },
    { name: 'Sivas Bilim ve Teknoloji Üniversitesi', city: 'Sivas', type: 'Devlet' },
    { name: 'Sivas Cumhuriyet Üniversitesi', city: 'Sivas', type: 'Devlet' },
    { name: 'Süleyman Demirel Üniversitesi', city: 'Isparta', type: 'Devlet' },
    { name: 'Şırnak Üniversitesi', city: 'Şırnak', type: 'Devlet' },
    { name: 'Tarsus Üniversitesi', city: 'Mersin', type: 'Devlet' },
    { name: 'Tekirdağ Namık Kemal Üniversitesi', city: 'Tekirdağ', type: 'Devlet' },
    { name: 'Tokat Gaziosmanpaşa Üniversitesi', city: 'Tokat', type: 'Devlet' },
    { name: 'Trabzon Üniversitesi', city: 'Trabzon', type: 'Devlet' },
    { name: 'Türk-Alman Üniversitesi', city: 'İstanbul', type: 'Devlet' },
    { name: 'Türkiye-Japonya Bilim ve Teknoloji Üniversitesi', city: 'İstanbul', type: 'Devlet' },
    { name: 'Uşak Üniversitesi', city: 'Uşak', type: 'Devlet' },
    { name: 'Van Yüzüncü Yıl Üniversitesi', city: 'Van', type: 'Devlet' },
    { name: 'Yalova Üniversitesi', city: 'Yalova', type: 'Devlet' },
    { name: 'Yıldız Teknik Üniversitesi', city: 'İstanbul', type: 'Devlet' },
    { name: 'Yozgat Bozok Üniversitesi', city: 'Yozgat', type: 'Devlet' },
    { name: 'Zonguldak Bülent Ecevit Üniversitesi', city: 'Zonguldak', type: 'Devlet' },

    // Vakıf Üniversiteleri
    { name: 'Acıbadem Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'Alanya Alaaddin Keykubat Üniversitesi', city: 'Antalya', type: 'Vakıf' },
    { name: 'Alanya Hamdullah Emin Paşa Üniversitesi', city: 'Antalya', type: 'Vakıf' },
    { name: 'Altınbaş Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'Ankara Medipol Üniversitesi', city: 'Ankara', type: 'Vakıf' },
    { name: 'Antalya Akev Üniversitesi', city: 'Antalya', type: 'Vakıf' },
    { name: 'Antalya Bilim Üniversitesi', city: 'Antalya', type: 'Vakıf' },
    { name: 'Atılım Üniversitesi', city: 'Ankara', type: 'Vakıf' },
    { name: 'Avrasya Üniversitesi', city: 'Trabzon', type: 'Vakıf' },
    { name: 'Bahçeşehir Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'Başkent Üniversitesi', city: 'Ankara', type: 'Vakıf' },
    { name: 'Beykent Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'Beykoz Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'Bezm-i Alem Vakıf Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'Biruni Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'Çağ Üniversitesi', city: 'Mersin', type: 'Vakıf' },
    { name: 'Çankaya Üniversitesi', city: 'Ankara', type: 'Vakıf' },
    { name: 'Doğuş Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'Fenerbahçe Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'Hasan Kalyoncu Üniversitesi', city: 'Gaziantep', type: 'Vakıf' },
    { name: 'Işık Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'İbn Haldun Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'İstanbul Arel Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'İstanbul Aydın Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'İstanbul Bilgi Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'İstanbul Esenyurt Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'İstanbul Gedik Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'İstanbul Gelişim Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'İstanbul Kültür Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'İstanbul Medipol Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'İstanbul Okan Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'İstanbul Sabahattin Zaim Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'İstanbul Şehir Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'İstanbul Ticaret Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'İzmir Ekonomi Üniversitesi', city: 'İzmir', type: 'Vakıf' },
    { name: 'İzmir Üniversitesi', city: 'İzmir', type: 'Vakıf' },
    { name: 'Kadir Has Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'Koç Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'Maltepe Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'MEF Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'Nişantaşı Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'Özyeğin Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'Piri Reis Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'Sabancı Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'TED Üniversitesi', city: 'Ankara', type: 'Vakıf' },
    { name: 'TOBB Ekonomi ve Teknoloji Üniversitesi', city: 'Ankara', type: 'Vakıf' },
    { name: 'Toros Üniversitesi', city: 'Mersin', type: 'Vakıf' },
    { name: 'Türk Hava Kurumu Üniversitesi', city: 'Ankara', type: 'Vakıf' },
    { name: 'Üsküdar Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'Yaşar Üniversitesi', city: 'İzmir', type: 'Vakıf' },
    { name: 'Yeditepe Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'Yeni Yüzyıl Üniversitesi', city: 'İstanbul', type: 'Vakıf' },
    { name: 'Yüksek İhtisas Üniversitesi', city: 'Ankara', type: 'Vakıf' }
];

// Üniversiteleri Firestore'a kaydet
async function saveUniversitiesToFirestore() {
    try {
        const batch = firebase.firestore().batch();
        
        turkishUniversities.forEach(uni => {
            const docRef = firebase.firestore().collection('universities').doc();
            batch.set(docRef, {
                name: uni.name,
                city: uni.city,
                type: uni.type,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        
        await batch.commit();
        console.log('Üniversiteler başarıyla kaydedildi');
    } catch (error) {
        console.error('Üniversiteler kaydedilirken hata:', error);
        throw error;
    }
}

// Üniversiteleri yükle
function loadUniversities() {
    const universitySelect = document.getElementById('university');
    
    // Önce Firestore'dan üniversiteleri kontrol et
    firebase.firestore().collection('universities').get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                // Üniversiteler yoksa kaydet
                return saveUniversitiesToFirestore().then(() => querySnapshot);
            }
            return querySnapshot;
        })
        .then((querySnapshot) => {
            // Üniversiteleri select'e ekle
            querySnapshot.forEach(doc => {
                const uni = doc.data();
                const option = document.createElement('option');
                option.value = uni.name;
                option.textContent = `${uni.name} (${uni.type})`;
                universitySelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Üniversiteler yüklenirken hata:', error);
            Swal.fire({
                icon: 'error',
                title: 'Hata!',
                text: 'Üniversiteler yüklenirken bir hata oluştu.'
            });
        });
} 