const RECIPES_PER_PAGE = 2; // Количество рецептов на странице

// Пример данных рецептов (в реальном проекте это будет загружаться с сервера)
const allRecipes = [
    {
        image: "src/img/red-cake.jpg",
        title: "Кровавая Мери",
        rating: 5,
        author: "@artemS"
    },
    {
        image: "src/img/cezar.avif",
        title: "Салат цезарь",
        rating: 5,
        author: "@artemS"
    },
    {
        image: "src/img/pasta.jpg",
        title: "Паста Карбонара",
        rating: 4,
        author: "@artemS"
    },
    {
        image: "src/img/borsch.jpg",
        title: "Борщ",
        rating: 5,
        author: "@artemS"
    }
    // Добавьте больше рецептов по необходимости
];

function createRecipeCard(recipe) {
    return `
        <div class="recipe-item">
            <div class="recipe-image">
                <img src="${recipe.image}" alt="${recipe.title}">
            </div>
            <div class="recipe-content">
                <h3>${recipe.title}</h3>
                <div class="recipe-details">
                    <div class="recipe-rating">
                        <span>Оценка:</span>
                        <div class="stars">
                            ${Array(recipe.rating).fill('<i class="fas fa-star"></i>').join('')}
                        </div>
                    </div>
                    <div class="recipe-author">
                        <span>Автор:</span>
                        <span class="author-name">${recipe.author}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function displayRecipes(page) {
    const recipeContainer = document.querySelector('.recipe-row');
    const start = (page - 1) * RECIPES_PER_PAGE;
    const end = start + RECIPES_PER_PAGE;
    const recipesToShow = allRecipes.slice(start, end);
    
    recipeContainer.innerHTML = recipesToShow.map(recipe => createRecipeCard(recipe)).join('');
    updatePagination(page);
}

function updatePagination(currentPage) {
    const totalPages = Math.ceil(allRecipes.length / RECIPES_PER_PAGE);
    const pagination = document.querySelector('.pagination');
    const paginationHTML = [];

    // Кнопка "Назад"
    paginationHTML.push(`
        <a href="#" class="pagination-item ${currentPage === 1 ? 'disabled' : ''}" 
           ${currentPage === 1 ? '' : `onclick="changePage(${currentPage - 1})"'`}>
            <i class="fas fa-chevron-left"></i>
        </a>
    `);

    // Номера страниц
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML.push(`
            <a href="#" class="pagination-item ${currentPage === i ? 'active' : ''}" 
               onclick="changePage(${i})">
                ${i}
            </a>
        `);
    }

    // Кнопка "Вперед"
    paginationHTML.push(`
        <a href="#" class="pagination-item ${currentPage === totalPages ? 'disabled' : ''}"
           ${currentPage === totalPages ? '' : `onclick="changePage(${currentPage + 1})"`}>
            <i class="fas fa-chevron-right"></i>
        </a>
    `);

    pagination.innerHTML = paginationHTML.join('');
}

function changePage(page) {
    displayRecipes(page);
    window.scrollTo({
        top: document.querySelector('.profile-recipte').offsetTop - 100,
        behavior: 'smooth'
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    displayRecipes(1);
});

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

document.addEventListener('DOMContentLoaded', function() {
    const elements = {
        slider: document.querySelector('.slider-track'),
        slides: document.querySelectorAll('.recipe-card'),
        prevBtn: document.querySelector('.prev'),
        nextBtn: document.querySelector('.next'),
        dotsContainer: document.querySelector('.slider-dots')
    };
    
    if (!elements.slider || !elements.slides.length) return;

    const state = {
        slidesPerView: window.innerWidth > 1200 ? 4 : window.innerWidth > 992 ? 3 : window.innerWidth > 576 ? 2 : 1,
        currentSlide: 0,
        isDragging: false,
        startPos: 0,
        currentTranslate: 0,
        prevTranslate: 0,
        animationID: 0
    };

    // Обработчики событий для слайдера
    elements.slider.addEventListener('mousedown', dragStart);
    elements.slider.addEventListener('touchstart', dragStart);
    elements.slider.addEventListener('mousemove', drag);
    elements.slider.addEventListener('touchmove', drag);
    elements.slider.addEventListener('mouseup', dragEnd);
    elements.slider.addEventListener('touchend', dragEnd);
    elements.slider.addEventListener('mouseleave', dragEnd);

    function dragStart(e) {
        state.isDragging = true;
        state.startPos = e.type === 'mousedown' ? e.pageX : e.touches[0].clientX;
        state.animationID = requestAnimationFrame(animation);
        elements.slider.style.cursor = 'grabbing';
    }

    function drag(e) {
        if (!state.isDragging) return;
        const currentPosition = e.type === 'mousemove' ? e.pageX : e.touches[0].clientX;
        state.currentTranslate = state.prevTranslate + currentPosition - state.startPos;
    }

    function dragEnd() {
        state.isDragging = false;
        cancelAnimationFrame(state.animationID);
        
        const movedBy = state.currentTranslate - state.prevTranslate;
        const slideWidth = elements.slides[0].offsetWidth + 20;
        
        if (Math.abs(movedBy) > slideWidth / 4) {
            if (movedBy < 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        } else {
            goToSlide(state.currentSlide);
        }
        
        elements.slider.style.cursor = 'grab';
    }

    function animation() {
        if (state.isDragging) {
            setSliderPosition();
            requestAnimationFrame(animation);
        }
    }

    function setSliderPosition() {
        elements.slider.style.transform = `translateX(${state.currentTranslate}px)`;
    }

    function goToSlide(index) {
        const slideWidth = elements.slides[0].offsetWidth + 20;
        const maxScroll = elements.slides.length * slideWidth - elements.slider.parentElement.offsetWidth;
        
        if (index >= elements.slides.length - state.slidesPerView) {
            state.currentTranslate = -maxScroll;
            state.currentSlide = elements.slides.length - state.slidesPerView;
        } else if (index < 0) {
            state.currentTranslate = 0;
            state.currentSlide = 0;
        } else {
            state.currentTranslate = -index * slideWidth;
            state.currentSlide = index;
        }
        
        state.prevTranslate = state.currentTranslate;
        setSliderPosition();
        updateDots();
    }

    // Создаем точки навигации
    const dotsCount = elements.slides.length - state.slidesPerView + 1;
    for (let i = 0; i < dotsCount; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        elements.dotsContainer.appendChild(dot);
    }

    const dots = document.querySelectorAll('.dot');
    function updateDots() {
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === state.currentSlide);
        });
    }

    function nextSlide() {
        goToSlide(state.currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(state.currentSlide - 1);
    }

    // Кнопки навигации
    elements.prevBtn.addEventListener('click', prevSlide);
    elements.nextBtn.addEventListener('click', nextSlide);

    // Автопрокрутка
    const autoSlide = setInterval(() => {
        const maxSlideIndex = elements.slides.length - state.slidesPerView;
        if (state.currentSlide >= maxSlideIndex) {
            goToSlide(0);
        } else {
            nextSlide();
        }
    }, 5000);

    elements.slider.addEventListener('mouseenter', () => clearInterval(autoSlide));
});

document.querySelector('.profile-theme-toggle').addEventListener('click', function(e) {
    e.preventDefault();
    document.body.classList.toggle('dark-theme');
});

// Добавляем обработчик для мобильного поиска
document.querySelector('.mobile-search-toggle').addEventListener('click', function() {
    const searchContainer = document.querySelector('.mobile-search-container');
    searchContainer.classList.toggle('active');
    
    if (searchContainer.classList.contains('active')) {
        // Фокусируемся на поле ввода
        searchContainer.querySelector('input').focus();
    }
});

// Закрываем поиск при клике вне его
document.addEventListener('click', (e) => {
    const searchContainer = document.querySelector('.mobile-search-container');
    const searchToggle = document.querySelector('.mobile-search-toggle');
    
    if (!searchContainer.contains(e.target) && 
        !searchToggle.contains(e.target) && 
        searchContainer.classList.contains('active')) {
        searchContainer.classList.remove('active');
    }
});

// Закрываем поиск при нажатии Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelector('.mobile-search-container').classList.remove('active');
    }
});

// Обработка отправки формы поиска
document.querySelector('.mobile-search-form').addEventListener('submit', function(e) {
    e.preventDefault();
    // Здесь добавьте логику обработки поиска
    const searchQuery = this.querySelector('input').value;
    console.log('Поисковый запрос:', searchQuery);
});

// Плавная прокрутка для ссылок в футере
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
