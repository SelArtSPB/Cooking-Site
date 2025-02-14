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

document.addEventListener("DOMContentLoaded", () => {
    let profileData = JSON.parse(localStorage.getItem("profileData"));

    if (profileData && profileData.image) {
        const profileIcon = document.querySelector(".profile-toggle i");
        const profileImg = document.createElement("img");

        profileImg.src = profileData.image;
        profileImg.alt = "Profile";
        profileImg.style.width = "42px";
        profileImg.style.height = "42px";
        profileImg.style.borderRadius = "50%";
        profileImg.style.objectFit = "cover";
        profileImg.style.marginLeft = "15px";

        profileIcon.replaceWith(profileImg);
    }
});


// Закрываем поиск при нажатии Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelector('.mobile-search-container').classList.remove('active');
    }
});



document.addEventListener("DOMContentLoaded", () => {
    const saveBtn = document.querySelector(".save-btn");
    
    // Загружаем текущие данные из localStorage
    let profileData = JSON.parse(localStorage.getItem("profileData")) || {
        name: "Пользователь",
        tag: "@user",
        email: "",
        description: "Описание",
        password: "",
        image: "src/img/user.png"
    };

    // Обновляем поля ввода текущими значениями
    document.querySelector(".settings-card-change-name input").value = profileData.name;
    document.querySelector(".settings-card-change-autor input").value = profileData.tag;
    document.querySelector(".settings-card-change-email input").value = profileData.email;
    document.querySelector(".settings-card-change-discription input").value = profileData.description;

    saveBtn.addEventListener("click", () => {
        const newName = document.querySelector(".settings-card-change-name input").value.trim();
        const newTag = document.querySelector(".settings-card-change-autor input").value.trim();
        const newEmail = document.querySelector(".settings-card-change-email input").value.trim();
        const newDescription = document.querySelector(".settings-card-change-discription input").value.trim();
        const fileInput = document.querySelector("#new-img-input");

        // Обновляем объект profileData новыми данными
        profileData.name = newName || profileData.name;
        profileData.tag = newTag || profileData.tag;
        profileData.email = newEmail || profileData.email;
        profileData.description = newDescription || profileData.description;

        // Если выбрано новое изображение, читаем его как Data URL и сохраняем
        if (fileInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profileData.image = e.target.result;
                saveProfileData(profileData);
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            saveProfileData(profileData);
        }
    });
});

function saveProfileData(data) {
    localStorage.setItem("profileData", JSON.stringify(data));
    alert("Настройки сохранены!");
}

