// Добавляем константу для количества рецептов на странице
const RECIPES_PER_PAGE = 6;

let allRecipes = [];

function displayRecipes(page) {
    const recipeContainer = document.querySelector('.recipe-row');
    if (!recipeContainer || !allRecipes) return; // Добавляем проверку

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
    
    if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) {
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

// Функция для обновления изображения профиля в dropdown
function updateProfileDropdownImage(imageData) {
        const profileIcon = document.querySelector(".profile-toggle i");
    if (imageData && profileIcon) {
        const profileImg = document.createElement("img");
        profileImg.src = imageData;
        profileImg.alt = "Profile";
        profileImg.style.width = "42px";
        profileImg.style.height = "42px";
        profileImg.style.borderRadius = "50%";
        profileImg.style.objectFit = "cover";
        profileImg.style.marginLeft = "15px";

        profileIcon.replaceWith(profileImg);
    }
}

// Использование функции при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    const userLogin = localStorage.getItem('userLogin');
    const token = localStorage.getItem('token');
    
    if (!userLogin || !token) {
        window.location.href = 'login.html';
        return;
    }

    // Загружаем данные профиля
    fetch(`http://localhost:5000/api/profile/${userLogin}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userLogin');
                    window.location.href = 'login.html';
                    throw new Error('Необходима повторная авторизация');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error('Ошибка:', data.error);
                return;
            }

            // Обновляем информацию профиля
            const cardImage = document.querySelector('.card-image img');
            const sidewayText = document.querySelector('.sideway-text');
            
            if (data.image) {
                cardImage.src = data.image.startsWith('data:image') ? 
                    data.image : 
                    data.image.startsWith('src/') ?
                        `./${data.image}` :
                        `http://localhost:5000/${data.image}`;
            } else {
                cardImage.src = './src/img/default.jpg';
            }
            
            cardImage.onerror = function() {
                console.log("Используется изображение по умолчанию");
                if (!this.src.includes('default.jpg')) {
                    this.src = 'src/img/default.jpg';
                }
            };

            sidewayText.querySelector('h1').textContent = data.login || userLogin;
            sidewayText.querySelector('p3').textContent = data.description || 'Нет описания';
            sidewayText.querySelector('h4').textContent = `Рецептов: ${data.recipesCount || 0}`;
        })
        .catch(error => {
            console.error('Ошибка при загрузке профиля:', error);
            // Показываем сообщение об ошибке на странице
            const sidewayText = document.querySelector('.sideway-text');
            if (sidewayText) {
                sidewayText.querySelector('h1').textContent = 'Ошибка загрузки';
                sidewayText.querySelector('p3').textContent = 'Попробуйте обновить страницу';
                sidewayText.querySelector('h4').textContent = '';
            }
        });

    // Загружаем рецепты пользователя
    fetch(`http://localhost:5000/api/recipes?author=${userLogin}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(recipes => {
            const grid = document.querySelector('.grid');
            if (!grid) return;
            
            grid.innerHTML = '';

            if (!recipes || recipes.length === 0) {
                grid.innerHTML = '<p class="no-recipes">У вас пока нет рецептов</p>';
                return;
            }

            recipes.forEach(recipe => {
                const recipeCard = createRecipeCard(recipe);
                grid.appendChild(recipeCard);
            });
        })
        .catch(error => {
            console.error('Ошибка при загрузке рецептов:', error);
            const grid = document.querySelector('.grid');
            if (grid) {
                grid.innerHTML = '<p class="error-message">Ошибка при загрузке рецептов</p>';
            }
        });

    // Обработчики для модального окна
    const openAddRecipeModal = document.getElementById('openAddRecipeModal');
    if (openAddRecipeModal) {
        openAddRecipeModal.addEventListener('click', function() {
            document.getElementById('addRecipeModal').style.display = 'flex';
        });
    }

    const closeButton = document.querySelector('.close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            document.getElementById('addRecipeModal').style.display = 'none';
        });
    }

    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('addRecipeModal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Добавление этапа приготовления
    const addStageBtn = document.getElementById('addStageBtn');
    if (addStageBtn) {
        addStageBtn.addEventListener('click', function() {
            const stagesContainer = document.getElementById('stagesContainer');
            const stageNumber = stagesContainer.getElementsByClassName('stage-item').length + 1;
            
            const stageDiv = document.createElement('div');
            stageDiv.className = 'stage-item';
            stageDiv.innerHTML = `
                <h4>Этап ${stageNumber}</h4>
                <div class="form-group">
                    <label>Описание этапа:</label>
                    <textarea required></textarea>
                </div>
                <div class="form-group">
                    <label>Фото этапа:</label>
                    <input type="file" accept="image/*">
                </div>
                <button type="button" class="remove-stage">Удалить этап</button>
            `;
            
            stagesContainer.appendChild(stageDiv);
        });
    }

    // Функция для конвертации файла в base64
    function getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // Обработка формы добавления рецепта
    const addRecipeForm = document.getElementById('addRecipeForm');
    if (addRecipeForm) {
        addRecipeForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const imageFile = document.getElementById('recipeImage').files[0];
                let imageBase64 = null;
                
                if (imageFile) {
                    imageBase64 = await getBase64(imageFile);
                }

                const formData = {
                    title: document.getElementById('recipeTitle').value,
                    description: document.getElementById('recipeDescription').value,
                    cookingTime: document.getElementById('recipeCookingTime').value,
                    country: document.getElementById('recipeCountry').value,
                    type: document.getElementById('recipeType').value,
                    author: localStorage.getItem('userLogin'),
                    image: imageBase64,
                    stages: []
                };

                // Собираем данные об этапах
                const stageItems = document.getElementsByClassName('stage-item');
                for (let i = 0; i < stageItems.length; i++) {
                    const stageItem = stageItems[i];
                    const stageImageFile = stageItem.querySelector('input[type="file"]').files[0];
                    let stageImageBase64 = null;

                    if (stageImageFile) {
                        stageImageBase64 = await getBase64(stageImageFile);
                    }

                    formData.stages.push({
                        number: i + 1,
                        description: stageItem.querySelector('textarea').value,
                        image: stageImageBase64
                    });
                }

                const response = await fetch('http://localhost:5000/api/recipes/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    document.getElementById('addRecipeModal').style.display = 'none';
                    document.getElementById('addRecipeForm').reset();
                    
                    // Обновляем количество рецептов в профиле
                    const userLogin = localStorage.getItem('userLogin');
                    const profileResponse = await fetch(`http://localhost:5000/api/profile/${userLogin}`);
                    const profileData = await profileResponse.json();
                    
                    if (profileData && !profileData.error) {
                        document.querySelector('.sideway-text h4').textContent = `Рецептов: ${profileData.recipesCount}`;
                    }

                    // Обновляем список рецептов
                    const recipesResponse = await fetch(`http://localhost:5000/api/recipes?author=${userLogin}`);
                    const recipes = await recipesResponse.json();
                    displayRecipes(1); // Обновляем отображение рецептов на первой странице
                } else {
                    alert(result.error || 'Ошибка при добавлении рецепта');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Ошибка при добавлении рецепта');
            }
        });
    }

    // Добавляем предпросмотр изображения
    document.getElementById('recipeImage')?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.createElement('img');
                preview.src = e.target.result;
                preview.style.maxWidth = '200px';
                preview.style.marginTop = '10px';
                
                // Удаляем предыдущий предпросмотр, если он есть
                const oldPreview = this.parentElement.querySelector('img');
                if (oldPreview) {
                    oldPreview.remove();
                }
                
                this.parentElement.appendChild(preview);
            }.bind(this);
            reader.readAsDataURL(file);
        }
    });
});

let isDeleteMode = false;
const selectedRecipes = new Set();

// Модифицируем функцию создания карточек рецептов
function createRecipeCard(recipe) {
    const recipeCard = document.createElement('div');
    recipeCard.className = 'recipe-card';
    recipeCard.dataset.id = recipe.id;

    let imageSrc = recipe.image || './src/img/default.jpg';

    recipeCard.innerHTML = `
        <img src="${imageSrc}" 
             alt="${recipe.title}" 
             onerror="this.src='./src/img/default.jpg'"
             style="width: 100%; height: 100%; object-fit: cover;">
        <div class="recipe-overlay">
            <h3>${recipe.title}</h3>
            <p>${recipe.description || 'Нет описания'}</p>
        </div>
    `;

    // Единый обработчик клика
    recipeCard.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (isDeleteMode) {
            this.classList.toggle('selected');
            const recipeId = this.dataset.id;
            
            if (selectedRecipes.has(recipeId)) {
                selectedRecipes.delete(recipeId);
            } else {
                selectedRecipes.add(recipeId);
            }
        } else {
            window.location.href = `data_view.html?id=${recipe.id}`;
        }
    };

    return recipeCard;
}

// Обработчик для кнопки удаления
const deleteRecipeBtn = document.getElementById('deleteRecipeBtn');
if (deleteRecipeBtn) {
    deleteRecipeBtn.onclick = function() {
        isDeleteMode = !isDeleteMode;
        this.classList.toggle('active');
        
        const recipeCards = document.querySelectorAll('.recipe-card');
        
        if (isDeleteMode) {
            this.innerHTML = '<i class="fas fa-check"></i> Подтвердить удаление';
            this.style.backgroundColor = '#28a745';
            recipeCards.forEach(card => {
                card.style.cursor = 'pointer';
                card.classList.add('delete-mode');
            });
        } else {
            if (selectedRecipes.size > 0) {
                deleteSelectedRecipes();
            }
            resetDeleteMode();
        }
    };
}

function resetDeleteMode() {
    isDeleteMode = false;
    selectedRecipes.clear();
    const deleteBtn = document.getElementById('deleteRecipeBtn');
    if (deleteBtn) {
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Удалить рецепт';
        deleteBtn.style.backgroundColor = '';
    }
    document.querySelectorAll('.recipe-card').forEach(card => {
        card.classList.remove('selected');
        card.classList.remove('delete-mode');
        card.style.cursor = '';
    });
}

async function deleteSelectedRecipes() {
    if (selectedRecipes.size === 0) return;

    const confirmed = confirm(`Вы уверены, что хотите удалить ${selectedRecipes.size} рецепт(ов)?`);
    if (!confirmed) {
        resetDeleteMode();
        return;
    }

    try {
        const promises = Array.from(selectedRecipes).map(recipeId =>
            fetch(`http://localhost:5000/api/recipes/${recipeId}`, {
                method: 'DELETE'
            }).then(response => {
                if (!response.ok) throw new Error('Ошибка при удалении рецепта');
                return response.json();
            })
        );

        await Promise.all(promises);
        alert('Рецепты успешно удалены!');
        location.reload();
    } catch (error) {
        console.error('Ошибка при удалении рецептов:', error);
        alert('Произошла ошибка при удалении рецептов');
    }
}

// Добавляем проверку на существование элементов перед использованием
document.addEventListener('DOMContentLoaded', () => {
    const userLogin = localStorage.getItem('userLogin');
    if (!userLogin) {
        window.location.href = 'login.html';
        return;
    }

    // Загружаем рецепты только если мы на странице с рецептами
    const recipeContainer = document.querySelector('.recipe-row');
    if (recipeContainer) {
        fetch(`http://localhost:5000/api/recipes?author=${userLogin}`)
            .then(response => response.json())
            .then(recipes => {
                allRecipes = recipes; // Определяем глобально
                displayRecipes(1);
            })
            .catch(error => {
                console.error('Ошибка при загрузке рецептов:', error);
            });
    }
});

// Добавляем обработчик для удаления этапов
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-stage')) {
        const stageItem = e.target.closest('.stage-item');
        if (stageItem) {
            stageItem.remove();
            // Обновляем нумерацию оставшихся этапов
            const stages = document.querySelectorAll('.stage-item');
            stages.forEach((stage, index) => {
                const stageTitle = stage.querySelector('h4');
                if (stageTitle) {
                    stageTitle.textContent = `Этап ${index + 1}`;
                }
            });
        }
    }
});

// Функция для загрузки списка стран
async function loadCountries() {
    try {
        const response = await fetch('http://localhost:5000/api/countries');
        const countries = await response.json();
        const countrySelect = document.getElementById('recipeCountry');
        
        if (countrySelect) {
            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                countrySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Ошибка при загрузке списка стран:', error);
    }
}

// Функция для загрузки типов блюд
async function loadDishTypes() {
    try {
        const response = await fetch('http://localhost:5000/api/dish-types');
        const types = await response.json();
        const typeSelect = document.getElementById('recipeType');
        
        if (typeSelect) {
            types.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                typeSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Ошибка при загрузке типов блюд:', error);
    }
}

// Добавляем загрузку списков при открытии модального окна
document.getElementById('openAddRecipeModal')?.addEventListener('click', function() {
    document.getElementById('addRecipeModal').style.display = 'flex';
    // Загружаем списки только если они еще не загружены
    const countrySelect = document.getElementById('recipeCountry');
    const typeSelect = document.getElementById('recipeType');
    
    if (countrySelect && countrySelect.children.length <= 1) {
        loadCountries();
    }
    if (typeSelect && typeSelect.children.length <= 1) {
        loadDishTypes();
    }
});
