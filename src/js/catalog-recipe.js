document.querySelector('.menu-toggle').addEventListener('click', function() {
    this.classList.toggle('active');
    document.querySelector('.nav').classList.toggle('active');
    document.body.style.overflow = document.querySelector('.nav').classList.contains('active') ? 'hidden' : '';
});

document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.nav').classList.remove('active');
        document.querySelector('.menu-toggle').classList.remove('active');
        document.body.style.overflow = '';
    });
});

document.addEventListener('click', (e) => {
    const nav = document.querySelector('.nav');
    const toggle = document.querySelector('.menu-toggle');
    if (nav.classList.contains('active') && 
        !nav.contains(e.target) && 
        !toggle.contains(e.target)) {
        nav.classList.remove('active');
        toggle.classList.remove('active');
        document.body.style.overflow = '';
    }
});

document.querySelector('.profile-toggle').addEventListener('click', function(e) {
    e.stopPropagation();
    document.querySelector('.profile-menu').classList.toggle('active');
});

document.addEventListener('click', function(e) {
    const menu = document.querySelector('.profile-menu');
    const toggle = document.querySelector('.profile-toggle');
    
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove('active');
    }
});

document.querySelector('.profile-theme-toggle').addEventListener('click', function(e) {
    e.preventDefault();
    document.body.classList.toggle('dark-theme');
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelector('.mobile-search-container').classList.remove('active');
    }
});

document.querySelector('.footer-section ul').addEventListener('click', function(e) {
    if (e.target.tagName === 'A') {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
});

// Фильтрация
const urlParams = new URLSearchParams(window.location.search);
const filters = {
    country: urlParams.get('country') || '',
    date: urlParams.get('date') || '',
    time: urlParams.get('time') || '',
    type: urlParams.get('type') || ''
};

const countryFilter = document.getElementById('country');
const dateFilter = document.getElementById('date');
const timeFilter = document.getElementById('time');
const typeFilter = document.getElementById('type');

// Установка значений фильтров из URL
countryFilter.value = filters.country;
dateFilter.value = filters.date;
timeFilter.value = filters.time;
typeFilter.value = filters.type;

function applyFilters() {
    const updatedFilters = {
        country: countryFilter.value,
        date: dateFilter.value,
        time: timeFilter.value,
        type: typeFilter.value
    };

    // Убираем пустые параметры
    const queryParams = new URLSearchParams();
    Object.keys(updatedFilters).forEach(key => {
        if (updatedFilters[key]) queryParams.append(key, updatedFilters[key]);
    });

    window.location.href = `catalog-recipe.html?${queryParams.toString()}`;
}

[countryFilter, dateFilter, timeFilter, typeFilter].forEach((filter) => {
    filter.addEventListener('change', applyFilters);
});
