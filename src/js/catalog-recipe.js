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
    if (nav.classList.contains('active') && !nav.contains(e.target) && !toggle.contains(e.target)) {
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

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelector('.mobile-search-container').classList.remove('active');
    }
});

// Пагинация с учетом фильтров
let itemsPerPage = 6;
let currentPage = 1;
let allCards = Array.from(document.querySelectorAll('.recipe-card'));
let filteredCards = allCards;

function filterRecipes() {
    const countryFilter = document.getElementById("country");
    const timeFilter = document.getElementById("time");
    const typeFilter = document.getElementById("type");
    
    const selectedCountry = countryFilter.value;
    const selectedTime = timeFilter.value;
    const selectedType = typeFilter.value;
    
    filteredCards = [];
    allCards.forEach(card => {
        const cardCountry = card.dataset.country;
        let cardTime = parseInt(card.dataset.cookingTime) || 0;
        const cardType = card.dataset.type;
        
        let countryMatch = !selectedCountry || cardCountry.includes(selectedCountry.replace("-", " "));
        let timeMatch = true;
        if (selectedTime) {
            if (selectedTime === "До 15 минут") timeMatch = cardTime <= 15;
            else if (selectedTime === "До 30 минут") timeMatch = cardTime <= 30;
            else if (selectedTime === "До 40 минут") timeMatch = cardTime <= 40;
            else if (selectedTime === "До 1 часа") timeMatch = cardTime <= 60;
            else if (selectedTime === "Более 1 часа") timeMatch = cardTime > 60;
        }
        let typeMatch = !selectedType || cardType.includes(selectedType);
        
        if (countryMatch && timeMatch && typeMatch) {
            filteredCards.push(card);
        }
    });
    
    currentPage = 1;
    updatePagination();
}

function updatePagination() {
    const existingPagination = document.querySelector('.pagination');
    if (existingPagination) existingPagination.remove();

    const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
    
    if (totalPages > 1) {
        const pagination = document.createElement('div');
        pagination.className = 'pagination';
        
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.className = `pagination-button ${i === 1 ? 'active' : ''}`;
            button.textContent = i;
            button.addEventListener('click', () => changePage(i));
            pagination.appendChild(button);
        }
        
        document.querySelector('.recipes-grid .container').appendChild(pagination);
    }
    showPage(currentPage);
}

function showPage(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    allCards.forEach(card => card.style.display = 'none');
    filteredCards.slice(start, end).forEach(card => card.style.display = 'block');
    
    document.querySelectorAll('.pagination-button').forEach(button => {
        button.classList.remove('active');
        if (parseInt(button.textContent) === page) button.classList.add('active');
    });
}

function changePage(newPage) {
    currentPage = newPage;
    showPage(currentPage);
    window.scrollTo({
        top: document.querySelector('.recipes-grid').offsetTop - 100,
        behavior: 'smooth'
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const countryFilter = document.getElementById("country");
    const timeFilter = document.getElementById("time");
    const typeFilter = document.getElementById("type");
    
    countryFilter.addEventListener("change", filterRecipes);
    timeFilter.addEventListener("change", filterRecipes);
    typeFilter.addEventListener("change", filterRecipes);
    
    filterRecipes();
});
