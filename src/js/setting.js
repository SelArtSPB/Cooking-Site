let userData = {
    username: '',
    email: '',
    avatar: ''
};

// Загрузка текущих данных пользователя при инициализации
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
            userData = await response.json();
            // Заполняем поля формы текущими данными
            document.querySelector('input[type="text"]').value = userData.username;
            document.querySelector('input[type="email"]').value = userData.email;
        }
    } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
    }
});

// Обработчик для кнопки "Сохранить"
document.querySelector('.save-btn').addEventListener('click', async function() {
    const newUsername = document.querySelector('input[type="text"]').value;
    const newEmail = document.querySelector('input[type="email"]').value;
    const newPassword = document.querySelector('input[type="password"]').value;
    const confirmPassword = document.querySelectorAll('input[type="password"]')[1].value;

    // Валидация
    if (newPassword && newPassword !== confirmPassword) {
        alert('Пароли не совпадают!');
        return;
    }

    const updateData = {
        username: newUsername,
        email: newEmail,
        avatar: croppedImageData || userData.avatar
    };

    if (newPassword) {
        updateData.password = newPassword;
    }

    try {
        const response = await fetch('/profile/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            alert('Настройки успешно сохранены!');
            location.reload();
        } else {
            const error = await response.json();
            alert(`Ошибка при сохранении: ${error.message}`);
        }
    } catch (error) {
        console.error('Ошибка при обновлении профиля:', error);
        alert('Произошла ошибка при сохранении настроек');
    }
});

// Обработчик для кнопки "Отменить"
document.querySelector('.cancel-btn').addEventListener('click', function() {
    // Возвращаем исходные значения
    document.querySelector('input[type="text"]').value = userData.username;
    document.querySelector('input[type="email"]').value = userData.email;
    document.querySelectorAll('input[type="password"]').forEach(input => input.value = '');
    
    // Если есть предпросмотр аватара, удаляем его
    const preview = document.querySelector('.settings-card-new-img img');
    if (preview) {
        preview.remove();
    }
    
    croppedImageData = null;
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



// Добавляем обработчик для мобильного поиска
document.querySelector('.mobile-search-toggle').addEventListener('click', function() {
    const searchContainer = document.querySelector('.mobile-search-container');
    searchContainer.classList.toggle('active');
    
    if (searchContainer.classList.contains('active')) {
        // Фокусируемся на поле ввода
        searchContainer.querySelector('input').focus();
    }
});

// Удаляем или комментируем этот блок кода
/*
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
*/

document.addEventListener("DOMContentLoaded", () => {
    const userLogin = localStorage.getItem('userLogin');
    if (!userLogin) {
        window.location.href = 'login.html';
        return;
    }

    // Загружаем данные профиля из БД
    fetch(`http://localhost:5000/api/profile/${userLogin}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Ошибка:', data.error);
                return;
            }

            // Обновляем изображение в profile-dropdown
            const profileIcon = document.querySelector(".profile-toggle i");
            if (data.image) {
                const profileImg = document.createElement("img");
                profileImg.src = data.image;
                profileImg.alt = "Profile";
                profileImg.style.width = "42px";
                profileImg.style.height = "42px";
                profileImg.style.borderRadius = "50%";
                profileImg.style.objectFit = "cover";
                profileImg.style.marginLeft = "15px";

                if (profileIcon) {
                    profileIcon.replaceWith(profileImg);
                }
            }
            
            // Заполняем поля формы текущими данными
            document.querySelector(".settings-card-change-name input").value = data.login || userLogin;
            document.querySelector(".settings-card-change-discription input").value = data.description || '';
            document.querySelector(".settings-card-change-email input").value = data.email || '';
        })
        .catch(error => console.error('Ошибка при загрузке профиля:', error));

    // Обработчик изменения изображения с предпросмотром
    const imageInput = document.getElementById('new-img-input');
    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const preview = document.createElement('img');
                preview.style.maxWidth = '200px';
                preview.style.marginTop = '10px';
                preview.style.borderRadius = '8px';
                
                const imageUrl = await getBase64(file);
                preview.src = imageUrl;
                
                const oldPreview = imageInput.parentElement.querySelector('img');
                if (oldPreview) {
                    oldPreview.remove();
                }
                
                imageInput.parentElement.appendChild(preview);
            } catch (error) {
                console.error('Ошибка при создании предпросмотра:', error);
            }
        }
    });

    // Обработчик сохранения настроек
    const saveBtn = document.querySelector(".save-btn");
    saveBtn.addEventListener("click", async () => {
        try {
            const imageFile = document.getElementById('new-img-input').files[0];
            let imageData = null;
            
            if (imageFile) {
                imageData = await getBase64(imageFile);
            }

            const newLogin = document.querySelector(".settings-card-change-name input").value;
            const password = document.querySelector(".settings-card-change-password input").value;
            const confirmPassword = document.querySelector(".settings-card-change-password input:last-child").value;

            if (password && password !== confirmPassword) {
                alert('Пароли не совпадают!');
                return;
            }

            const updateData = {
                userLogin: userLogin,
                newLogin: newLogin,
                description: document.querySelector(".settings-card-change-discription input").value,
                email: document.querySelector(".settings-card-change-email input").value,
                password: password || undefined,
                image: imageData
            };

            const response = await fetch('http://localhost:5000/api/profile/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            const result = await response.json();
            
            if (response.ok) {
                // Если логин был изменен, обновляем его в localStorage
                if (newLogin !== userLogin) {
                    localStorage.setItem('userLogin', newLogin);
                }
                alert('Настройки успешно сохранены!');
                window.location.href = 'profile.html';
            } else {
                alert(result.error || 'Ошибка при сохранении настроек');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при сохранении настроек');
        }
    });

    // Обработчик кнопки "Отменить"
    const cancelBtn = document.querySelector(".cancel-btn");
    cancelBtn.addEventListener("click", () => {
        window.location.href = 'profile.html';
    });
});

// Вспомогательная функция для конвертации файла в base64
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

let cropper = null;
let croppedImageData = null;

document.querySelector('#new-img-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const modal = document.querySelector('.modal-crop');
            const img = document.querySelector('#crop-image');
            
            img.src = e.target.result;
            modal.style.display = 'flex';
            
            // Инициализация Cropper
            cropper = new Cropper(img, {
                aspectRatio: 1,
                viewMode: 1,
                dragMode: 'move',
                autoCropArea: 1,
                restore: false,
                modal: true,
                guides: true,
                highlight: true,
                cropBoxMovable: true,
                cropBoxResizable: true,
                toggleDragModeOnDblclick: false,
            });
        };
        reader.readAsDataURL(file);
    }
});

// Обработчики для модального окна
document.querySelector('.close-modal').addEventListener('click', closeCropModal);
document.querySelector('.crop-cancel').addEventListener('click', closeCropModal);
document.querySelector('.crop-save').addEventListener('click', function() {
    croppedImageData = cropper.getCroppedCanvas({
        width: 250, // Фиксированная ширина
        height: 250 // Фиксированная высота
    }).toDataURL('image/jpeg');
    
    // Показываем превью
    const preview = document.createElement('img');
    preview.src = croppedImageData;
    preview.style.width = '100px';
    preview.style.height = '100px';
    preview.style.borderRadius = '50%';
    preview.style.objectFit = 'cover';
    
    const container = document.querySelector('.settings-card-new-img');
    const existingPreview = container.querySelector('img');
    if (existingPreview) {
        container.removeChild(existingPreview);
    }
    container.appendChild(preview);
    
    closeCropModal();
});

function closeCropModal() {
    const modal = document.querySelector('.modal-crop');
    modal.style.display = 'none';
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
}

