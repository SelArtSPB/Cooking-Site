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

// Пагинация
const itemsPerPage = 6;
let currentPage = 1;

function updatePagination() {
    const recipeCards = document.querySelectorAll('.recipe-card');
    const totalPages = Math.ceil(recipeCards.length / itemsPerPage);
    
    // Очищаем предыдущую пагинацию
    const existingPagination = document.querySelector('.pagination');
    if (existingPagination) existingPagination.remove();

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
    const recipeCards = document.querySelectorAll('.recipe-card');
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    recipeCards.forEach((card, index) => {
        card.style.display = (index >= start && index < end) ? 'block' : 'none';
    });

    // Обновляем активную кнопку
    document.querySelectorAll('.pagination-button').forEach(button => {
        button.classList.remove('active');
        if (parseInt(button.textContent) === page) {
            button.classList.add('active');
        }
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

// Инициализация пагинации при загрузке и после фильтрации
document.addEventListener('DOMContentLoaded', () => {
    updatePagination();
});

// Обновляем пагинацию после применения фильтров
function applyFilters() {
    // ... существующий код фильтрации ...
    
    // После перенаправления обновляем пагинацию
    setTimeout(() => {
        updatePagination();
    }, 100);
}

document.querySelectorAll('.recipe-card').forEach(card => {
    card.addEventListener('click', function () {
        const title = this.dataset.title;
        const description = this.dataset.description;
        const cookingTime = this.dataset.cookingTime;
        const country = this.dataset.country;
        const type = this.dataset.type;
        const author = this.dataset.author;
        const recipe = this.dataset.recipe;
        const image = this.dataset.image; // Новый параметр

        const url = `data_view.html?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&cookingTime=${encodeURIComponent(cookingTime)}&country=${encodeURIComponent(country)}&type=${encodeURIComponent(type)}&author=${encodeURIComponent(author)}&recipe=${encodeURIComponent(recipe)}&image=${encodeURIComponent(image)}`;
        window.location.href = url;
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const countryFilter = document.getElementById("country");
    const timeFilter = document.getElementById("time");
    const typeFilter = document.getElementById("type");
    const recipeCards = document.querySelectorAll(".recipe-card");

    function filterRecipes() {
        const selectedCountry = countryFilter.value;
        const selectedTime = timeFilter.value;
        const selectedType = typeFilter.value;

        recipeCards.forEach(card => {
            const cardCountry = card.dataset.country;
            const cardTime = parseInt(card.dataset.cookingTime);  // Преобразуем строку в число
            const cardType = card.dataset.type;

            let countryMatch = !selectedCountry || cardCountry.includes(selectedCountry.replace("-", " "));
            let timeMatch = true;

            if (selectedTime) {
                // Преобразуем выбранное время в число для сравнения
                if (selectedTime === "До 15 минут") {
                    timeMatch = cardTime <= 15;
                } else if (selectedTime === "До 30 минут") {
                    timeMatch = cardTime <= 30;
                } else if (selectedTime === "До 40 минут") {
                    timeMatch = cardTime <= 40;
                } else if (selectedTime === "До 1 часа") {
                    timeMatch = cardTime <= 60;
                } else if (selectedTime === "Более 1 часа") {
                    timeMatch = cardTime > 60;
                }
            }

            let typeMatch = !selectedType || cardType.includes(selectedType);

            if (countryMatch && timeMatch && typeMatch) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    }

    countryFilter.addEventListener("change", filterRecipes);
    timeFilter.addEventListener("change", filterRecipes);
    typeFilter.addEventListener("change", filterRecipes);

    filterRecipes();
});
