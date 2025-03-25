// Меню и блокировка скролла при открытом меню
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

// Профиль
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

// Закрытие мобильного поиска по Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelector('.mobile-search-container').classList.remove('active');
    }
});

// Плавный скролл из футера
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

const urlParams = new URLSearchParams(window.location.search);
const filters = {
    country: urlParams.get('country') || '',
    author: urlParams.get('author') || '', // Заменяем time
    type: urlParams.get('type') || ''
};

const countryFilter = document.getElementById('country');
const authorFilter = document.getElementById('author'); // Заменяем timeFilter
const typeFilter = document.getElementById('type');

// Установка значений фильтров из URL
if (countryFilter) countryFilter.value = filters.country;
if (authorFilter) authorFilter.value = filters.author;
if (typeFilter) typeFilter.value = filters.type;

function applyFilters() {
    const updatedFilters = {
        country: countryFilter ? countryFilter.value : '',
        author: authorFilter ? authorFilter.value : '', // Заменяем time
        type: typeFilter ? typeFilter.value : ''
    };

    // Убираем пустые параметры
    const queryParams = new URLSearchParams();
    Object.keys(updatedFilters).forEach(key => {
        if (updatedFilters[key]) queryParams.append(key, updatedFilters[key]);
    });

    window.location.href = `catalog-recipe.html?${queryParams.toString()}`;
}

// =======================================================
// ПАГИНАЦИЯ И КЛИЕНТСАЙД ФИЛЬТРАЦИЯ ДЛЯ КАРТОЧЕК РЕЦЕПТОВ
// =======================================================

const itemsPerPage = 9;
let currentPage = 1;

/**
 * Возвращает массив карточек, удовлетворяющих выбранным фильтрам.
 */
function getFilteredCards() {
    const countryInput = document.getElementById("country");
    const authorInput = document.getElementById("author"); // Заменяем time на author
    const typeInput = document.getElementById("type");
    const selectedCountry = countryInput ? countryInput.value : "";
    const selectedAuthor = authorInput ? authorInput.value : ""; // Заменяем selectedTime
    const selectedType = typeInput ? typeInput.value : "";
    
    const recipeCards = Array.from(document.querySelectorAll(".recipe-card"));
    
    return recipeCards.filter(card => {
        const cardCountry = card.dataset.country;
        const cardAuthor = card.dataset.author; // Заменяем cardTime
        const cardType = card.dataset.type;
        
        let countryMatch = !selectedCountry || cardCountry.includes(selectedCountry.replace("-", " "));
        let authorMatch = !selectedAuthor || cardAuthor === selectedAuthor; // Простое сравнение строк
        let typeMatch = !selectedType || cardType.includes(selectedType);
        
        return countryMatch && authorMatch && typeMatch;
    });
}

/**
 * Обновляет пагинацию: рассчитывает число страниц для отфильтрованных карточек,
 * создаёт кнопки и отображает нужную страницу.
 */
function updatePagination() {
    const filteredCards = getFilteredCards();
    const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
    
    // Удаляем предыдущую пагинацию
    const existingPagination = document.querySelector('.pagination');
    if (existingPagination) existingPagination.remove();

    // Если страниц больше 1, создаём блок пагинации
    if (totalPages > 1) {
         const pagination = document.createElement('div');
         pagination.className = 'pagination';
         for (let i = 1; i <= totalPages; i++) {
              const button = document.createElement('button');
              button.className = `pagination-button ${i === currentPage ? 'active' : ''}`;
              button.textContent = i;
              button.addEventListener('click', () => changePage(i));
              pagination.appendChild(button);
         }
         const container = document.querySelector('.recipes-grid .container');
         if (container) container.appendChild(pagination);
    }
    
    showPage(currentPage);
}

/**
 * Отображает карточки на выбранной странице (с учётом фильтрации)
 */
function showPage(page) {
    const filteredCards = getFilteredCards();
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    // Скрываем все карточки
    document.querySelectorAll('.recipe-card').forEach(card => {
         card.style.display = 'none';
    });
    // Отображаем только карточки, попадающие в диапазон текущей страницы
    filteredCards.slice(start, end).forEach(card => {
         card.style.display = 'block';
    });

    // Обновляем активную кнопку пагинации
    document.querySelectorAll('.pagination-button').forEach(button => {
         button.classList.remove('active');
         if (parseInt(button.textContent) === page) {
              button.classList.add('active');
         }
    });
}

/**
 * Изменяет текущую страницу, обновляет показ и скроллит к началу блока рецептов.
 */
function changePage(newPage) {
    currentPage = newPage;
    showPage(currentPage);
    const recipesGrid = document.querySelector('.recipes-grid');
    if (recipesGrid) {
         window.scrollTo({
             top: recipesGrid.offsetTop - 100,
             behavior: 'smooth'
         });
    }
}

// Переход к подробному просмотру рецепта по клику на карточку
document.querySelectorAll('.recipe-card').forEach(card => {
    card.addEventListener('click', function () {
        const id = this.dataset.id;
        if (id) {
            window.location.href = `data_view.html?id=${encodeURIComponent(id)}`;
        }
    });
});

// При загрузке документа и если на странице есть карточки рецептов,
// навешиваем обработчики изменения фильтров и инициализируем пагинацию
document.addEventListener("DOMContentLoaded", function () {
    if (document.querySelectorAll('.recipe-card').length > 0) {
        const countryInput = document.getElementById("country");
        const authorInput = document.getElementById("author"); // Заменяем timeInput
        const typeInput = document.getElementById("type");

        if(countryInput) countryInput.addEventListener("change", () => { currentPage = 1; updatePagination(); });
        if(authorInput) authorInput.addEventListener("change", () => { currentPage = 1; updatePagination(); }); // Заменяем timeInput
        if(typeInput) typeInput.addEventListener("change", () => { currentPage = 1; updatePagination(); });

        updatePagination();
    }
});

// Объединяем все обработчики DOMContentLoaded в один
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Загрузка рецептов из API
        const response = await fetch('http://localhost:5000/api/recipes');
        if (!response.ok) {
            throw new Error('Ошибка при загрузке рецептов');
        }
        const recipes = await response.json();
        console.log('Загруженные рецепты:', recipes);

        const gridContainer = document.querySelector('.grid');
        if (!gridContainer) {
            console.error('Контейнер для рецептов не найден');
            return;
        }

        // Функция для отображения рецептов с учетом фильтров
        function displayRecipes(filteredRecipes) {
            gridContainer.innerHTML = '';
            
            if (filteredRecipes.length === 0) {
                const noRecipesMessage = document.createElement('p');
                noRecipesMessage.className = 'no-recipes-message';
                noRecipesMessage.textContent = 'Рецепты не найдены. Попробуйте изменить параметры поиска.';
                gridContainer.appendChild(noRecipesMessage);
                return;
            }
            
            filteredRecipes.forEach(recipe => {
                const card = document.createElement('div');
                card.className = 'recipe-card';
                card.dataset.id = recipe.id;
                card.dataset.country = recipe.country || 'Не указано';
                card.dataset.author = recipe.author || 'Аноним';
                card.dataset.type = recipe.type || 'Не указано';
                
                card.innerHTML = `
                    <img src="${recipe.image || 'src/img/default.jpg'}" alt="${recipe.title}">
                    <div class="recipe-info">
                        <h3>${recipe.title}</h3>
                        <p>${recipe.description ? recipe.description.substring(0, 100) + '...' : 'Описание отсутствует'}</p>
                        <div class="recipe-meta">
                            <span><i class="fas fa-clock"></i> ${recipe.cookingTime || 'Не указано'} мин</span>
                            <span><i class="fas fa-flag"></i> ${recipe.country || 'Не указано'}</span>
                            <span><i class="fas fa-utensils"></i> ${recipe.type || 'Не указано'}</span>
                        </div>
                    </div>
                `;
                
                gridContainer.appendChild(card);
            });
            
            // После добавления всех карточек, добавляем обработчики событий
            document.querySelectorAll('.recipe-card').forEach(card => {
                card.addEventListener('click', function() {
                    const id = this.dataset.id;
                    if (id) {
                        window.location.href = `data_view.html?id=${encodeURIComponent(id)}`;
                    }
                });
            });
            
            // Обновляем пагинацию, если она необходима
            if (filteredRecipes.length > itemsPerPage) {
                setupPagination(filteredRecipes);
            }
        }

        // Функция фильтрации
        function filterRecipes() {
            const countryFilter = document.getElementById('country').value;
            const authorFilter = document.getElementById('author').value;
            const typeFilter = document.getElementById('type').value;

            const filteredRecipes = recipes.filter(recipe => {
                const countryMatch = !countryFilter || recipe.country === countryFilter;
                const authorMatch = !authorFilter || recipe.author === authorFilter;
                const typeMatch = !typeFilter || recipe.type === typeFilter;

                return countryMatch && authorMatch && typeMatch;
            });

            displayRecipes(filteredRecipes);
        }

        // Добавляем обработчики событий для фильтров
        const filters = ['country', 'author', 'type'];
        filters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', filterRecipes);
            }
        });

        // Заполняем фильтры уникальными значениями из рецептов
        const countrySelect = document.getElementById('country');
        const authorSelect = document.getElementById('author');
        const typeSelect = document.getElementById('type');

        if (countrySelect) {
            const countries = [...new Set(recipes.map(r => r.country).filter(Boolean))];
            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                countrySelect.appendChild(option);
            });
        }

        if (authorSelect) {
            const authors = [...new Set(recipes.map(r => r.author).filter(Boolean))];
            authors.forEach(author => {
                const option = document.createElement('option');
                option.value = author;
                option.textContent = author;
                authorSelect.appendChild(option);
            });
        }

        if (typeSelect) {
            const types = [...new Set(recipes.map(r => r.type).filter(Boolean))];
            types.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                typeSelect.appendChild(option);
            });
        }

        // Начальное отображение всех рецептов
        displayRecipes(recipes);

    } catch (error) {
        console.error('Ошибка при загрузке рецептов:', error);
        const gridContainer = document.querySelector('.grid');
        if (gridContainer) {
            gridContainer.innerHTML = '<p class="error-message">Ошибка при загрузке рецептов</p>';
        }
    }
});

// Функция для загрузки списка стран в фильтр
async function loadCountriesFilter() {
    try {
        const response = await fetch('http://localhost:5000/api/countries');
        const countries = await response.json();
        const countrySelect = document.getElementById('country');
        
        if (countrySelect) {
            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                countrySelect.appendChild(option);
            });
            
            // Устанавливаем значение из URL, если есть
            const urlParams = new URLSearchParams(window.location.search);
            const countryParam = urlParams.get('country');
            if (countryParam) {
                countrySelect.value = countryParam;
            }
        }
    } catch (error) {
        console.error('Ошибка при загрузке списка стран:', error);
    }
}

// Функция для загрузки типов блюд в фильтр
async function loadDishTypesFilter() {
    try {
        const response = await fetch('http://localhost:5000/api/dish-types');
        const types = await response.json();
        const typeSelect = document.getElementById('type');
        
        if (typeSelect) {
            types.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                typeSelect.appendChild(option);
            });
            
            // Устанавливаем значение из URL, если есть
            const urlParams = new URLSearchParams(window.location.search);
            const typeParam = urlParams.get('type');
            if (typeParam) {
                typeSelect.value = typeParam;
            }
        }
    } catch (error) {
        console.error('Ошибка при загрузке типов блюд:', error);
    }
}

// Загружаем списки при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadCountriesFilter();
    loadDishTypesFilter();
});