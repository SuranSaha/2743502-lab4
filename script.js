const countryInput = document.getElementById('country-input');
const searchBtn = document.getElementById('search-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const countryInfo = document.getElementById('country-info');
const borderingCountries = document.getElementById('bordering-countries');
const errorMessage = document.getElementById('error-message');


let errorTimeout;

function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

function showError(message) {
    
    if (errorTimeout) {
        clearTimeout(errorTimeout);
    }
    
   
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    
   
    errorTimeout = setTimeout(() => {
        errorMessage.classList.add('hidden');
        errorTimeout = null;
    }, 5000);
    
    
    console.log('Error shown:', message);
}

function clearResults() {
    countryInfo.innerHTML = '';
    borderingCountries.innerHTML = '';
}

async function searchCountry(countryName) {

    console.log('Searching for:', countryName);
    
  
    if (!countryName || countryName.trim() === '') {
        console.log('Empty input detected');
        showError('Please enter a country name');
        return;
    }
    

    countryName = countryName.trim();
    
    clearResults();
    showLoading(true);
    
    try {
        console.log('Fetching data for:', countryName);
        const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Country "${countryName}" not found`);
            } else {
                throw new Error('Failed to fetch country data');
            }
        }
        
        const data = await response.json();
        console.log('Data received:', data);
        
        const country = data[0];
        displayCountryInfo(country);
        
        if (country.borders && country.borders.length > 0) {
            await fetchBorderingCountries(country.borders);
        } else {
            borderingCountries.innerHTML = '<p class="no-borders">This country has no bordering countries.</p>';
        }
        
    } catch (error) {
        console.error('Error caught:', error);
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

function displayCountryInfo(country) {
    const formattedPopulation = country.population.toLocaleString();
    const capital = country.capital ? country.capital[0] : 'N/A';
    

    let languages = 'N/A';
    if (country.languages) {
        languages = Object.values(country.languages).join(', ');
    }
    

    let currency = 'N/A';
    if (country.currencies) {
        const currencyCode = Object.keys(country.currencies)[0];
        if (currencyCode) {
            currency = country.currencies[currencyCode].name;
        }
    }
    
    const countryHTML = `
        <h2>${country.name.common}</h2>
        <img src="${country.flags.svg}" alt="${country.name.common} flag" class="country-flag">
        <p><strong>Official Name:</strong> ${country.name.official}</p>
        <p><strong>Capital:</strong> ${capital}</p>
        <p><strong>Population:</strong> ${formattedPopulation}</p>
        <p><strong>Region:</strong> ${country.region}</p>
        <p><strong>Subregion:</strong> ${country.subregion || 'N/A'}</p>
        <p><strong>Languages:</strong> ${languages}</p>
        <p><strong>Currency:</strong> ${currency}</p>
    `;
    
    countryInfo.innerHTML = countryHTML;
}

async function fetchBorderingCountries(borderCodes) {
    try {
        borderingCountries.innerHTML = '<p class="loading">Loading bordering countries...</p>';
        
        const borderPromises = borderCodes.map(async (code) => {
            try {
                const response = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
                const data = await response.json();
                return data[0];
            } catch (error) {
                console.error(`Error fetching border country ${code}:`, error);
                return null;
            }
        });
        
        const borderCountries = await Promise.all(borderPromises);
       
        const validCountries = borderCountries.filter(country => country !== null);
        displayBorderingCountries(validCountries);
        
    } catch (error) {
        console.error('Error fetching bordering countries:', error);
        borderingCountries.innerHTML = '<p class="error">Failed to load bordering countries.</p>';
    }
}

function displayBorderingCountries(countries) {
    if (!countries || countries.length === 0) {
        borderingCountries.innerHTML = '<p class="no-borders">No bordering countries found.</p>';
        return;
    }
    
    const borderHTML = countries.map(country => `
        <div class="border-country">
            <h4>${country.name.common}</h4>
            <img src="${country.flags.svg}" alt="${country.name.common} flag" loading="lazy">
        </div>
    `).join('');
    
    borderingCountries.innerHTML = `
        <h3>Bordering Countries (${countries.length})</h3>
        <div class="border-grid">
            ${borderHTML}
        </div>
    `;
}


countryInput.addEventListener('input', () => {
    if (errorTimeout) {
        clearTimeout(errorTimeout);
        errorTimeout = null;
    }
    errorMessage.classList.add('hidden');
});

searchBtn.addEventListener('click', () => {
    const countryName = countryInput.value;
    searchCountry(countryName);
});

countryInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const countryName = countryInput.value;
        searchCountry(countryName);
    }
});


console.log('Script loaded successfully');