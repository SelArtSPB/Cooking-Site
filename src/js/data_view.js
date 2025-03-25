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
    
    if (searchContainer && searchToggle && 
        !searchContainer.contains(e.target) && 
        !searchToggle.contains(e.target) && 
        searchContainer.classList.contains('active')) {
        searchContainer.classList.remove('active');
    }
});

// Закрываем поиск при нажатии Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const mobileSearchContainer = document.querySelector('.mobile-search-container');
        if (mobileSearchContainer) {
            mobileSearchContainer.classList.remove('active');
        }
    }
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



document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get('id');
    
    if (!recipeId) {
        showError('Не указан ID рецепта');
        return;
    }
    
    try {
        // Загружаем данные рецепта без проверки авторизации
        const recipeResponse = await fetch(`http://localhost:5000/api/recipes/${recipeId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // Проверяем статус ответа
        if (!recipeResponse.ok) {
            throw new Error(
                recipeResponse.status === 404 
                ? 'Рецепт не найден' 
                : `Ошибка сервера: ${recipeResponse.status}`
            );
        }
        
        const recipe = await recipeResponse.json();
        
        // Проверяем, есть ли данные в ответе
        if (recipe.error) {
            throw new Error(recipe.error);
        }

        // Продолжаем загрузку этапов только если рецепт получен успешно
        const stagesResponse = await fetch(`http://localhost:5000/api/recipes/${recipeId}/stages`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        let stages = [];
        
        if (stagesResponse.ok) {
            stages = await stagesResponse.json();
        } else {
            console.warn(`Ошибка получения этапов: ${stagesResponse.status} ${stagesResponse.statusText}`);
        }

        // Заполняем основные данные рецепта
        document.querySelector('.dish-title').textContent = recipe.title || 'Название не указано';
        document.querySelector('.cooking-time').textContent = `Время готовки: ${recipe.cookingTime || 'не указано'} минут`;
        document.querySelector('.description').textContent = recipe.description || 'Описание отсутствует';
        document.querySelector('.country').textContent = `Страна: ${recipe.country || 'не указана'}`;
        document.querySelector('.type').textContent = `Тип блюда: ${recipe.type || 'не указан'}`;
        document.querySelector('.author').textContent = `Автор: ${recipe.author || 'не указан'}`;
        
        // Устанавливаем главное изображение рецепта
        const recipeImage = document.querySelector('.insert-image img');
        if (recipe.image) {
            recipeImage.src = recipe.image;
        }
        recipeImage.onerror = function() {
            this.src = './src/img/default.jpg';
        };

        // Создаем HTML для этапов рецепта
        const recipeContainer = document.querySelector('.recipe');
        recipeContainer.innerHTML = ''; // Очищаем контейнер

        if (stages && stages.length > 0 && !stages.error) {
            const stagesHtml = stages
                .sort((a, b) => a.stage - b.stage)
                .map(stage => {
                    // Проверяем наличие описания этапа
                    const description = stage.description || stage.stageDiscription || 'Описание этапа отсутствует';
                    
                    // Проверяем наличие изображения
                    const image = stage.image || stage.stageImage;
                    const imageHtml = image ? `
                        <div class="stage-image">
                            <img src="${image}" 
                                alt="Этап ${stage.stage}" 
                                onerror="this.src='./src/img/default.jpg'">
                        </div>
                    ` : '';

                    return `
                        <div class="recipe-stage">
                            <h4>Этап ${stage.stage}</h4>
                            ${imageHtml}
                            <p class="stage-description">${description}</p>
                        </div>
                    `;
                }).join('');

            recipeContainer.innerHTML = `
                <h2>Этапы приготовления:</h2>
                <div class="stages-container">
                    ${stagesHtml}
                </div>
            `;
        } else {
            recipeContainer.innerHTML = '<p>Этапы приготовления не указаны</p>';
        }
    } catch (error) {
        console.error('Ошибка при загрузке данных рецепта:', error);
        showError(error.message || 'Не удалось загрузить рецепт');
    }
});

// Функция для отображения ошибки
function showError(message) {
    document.querySelector('.dish-title').textContent = 'Ошибка';
    document.querySelector('.description').textContent = message;
    document.querySelector('.recipe').innerHTML = '<p>Извините, данный рецепт недоступен.</p>';
}