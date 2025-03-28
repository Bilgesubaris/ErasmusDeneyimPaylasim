fetch('https://restcountries.com/v3.1/all')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP Hatası! Durum Kodu: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('API verisi:', data);
        const euCountries = data.filter(country =>
            country.regionalBlocs?.some(bloc => bloc.acronym === 'EU')
        );
        console.log('AB Ülkeleri:', euCountries);
    })
    .catch(error => console.error('Veri çekme hatası:', error));
