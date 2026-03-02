
const countryInput = document.getElementById('country-input');
const searchBtn = document.getElementById('search-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const countryInfo = document.getElementById('country-info');
const borderingCountries = document.getElementById('bordering-countries');
const errorMessage = document.getElementById('error-message');


function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}


function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    
   
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 5000);
}


function clearResults() {
    countryInfo.innerHTML = '';
    borderingCountries.innerHTML = '';
}


async function searchCountry(countryName) {
    
    if (!countryName || countryName.trim() === '') {
        showError('Please enter a country name');
        return;
    }
    
   
    clearResults();
    showLoading(true);
    
    try {
      
        const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`);
        
     
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Country "${countryName}" not found`);
            } else {
                throw new Error('Failed to fetch country data');
            }
        }
        
        
        const data = await response.json();
        
       
        const country = data[0];
        
    
        displayCountryInfo(country);
        
       
        if (country.borders && country.borders.length > 0) {
            await fetchBorderingCountries(country.borders);
        } else {
            
            borderingCountries.innerHTML = '<p class="no-borders">This country has no bordering countries.</p>';
        }
        
    } catch (error) {
       
        showError(error.message);
        console.error('Error:', error);
    } finally {
       
        showLoading(false);
    }
}

function displayCountryInfo(country) {
   
    const formattedPopulation = country.population.toLocaleString();
    
    
    const capital = country.capital ? country.capital[0] : 'N/A';
    
 
    const countryHTML = `
        <h2>${country.name.common}</h2>
        <img src="${country.flags.svg}" alt="${country.name.common} flag" class="country-flag">
        <p><strong>Official Name:</strong> ${country.name.official}</p>
        <p><strong>Capital:</strong> ${capital}</p>
        <p><strong>Population:</strong> ${formattedPopulation}</p>
        <p><strong>Region:</strong> ${country.region}</p>
        <p><strong>Subregion:</strong> ${country.subregion || 'N/A'}</p>
        <p><strong>Languages:</strong> ${country.languages ? Object.values(country.languages).join(', ') : 'N/A'}</p>
        <p><strong>Currency:</strong> ${country.currencies ? Object.values(country.currencies)[0].name : 'N/A'}</p>
    `;
    
   
    countryInfo.innerHTML = countryHTML;
}

async function fetchBorderingCountries(borderCodes) {
    try {
        
        borderingCountries.innerHTML = '<p class="loading">Loading bordering countries...</p>';
        
        
        const borderPromises = borderCodes.map(code => 
            fetch(`https://restcountries.com/v3.1/alpha/${code}`)
                .then(res => res.json())
                .then(data => data[0])
        );
        
       
        const borderCountries = await Promise.all(borderPromises);
        
       
        displayBorderingCountries(borderCountries);
        
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


searchBtn.addEventListener('click', () => {
    const countryName = countryInput.value.trim();
    searchCountry(countryName);
});


countryInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const countryName = countryInput.value.trim();
        searchCountry(countryName);
    }
});

