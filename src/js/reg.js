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

// Добавляем обработчик для мобильного поиска
document.querySelector('.mobile-search-toggle').addEventListener('click', function() {
    const searchContainer = document.querySelector('.mobile-search-container');
    searchContainer.classList.toggle('active');
    
    if (searchContainer.classList.contains('active')) {
        // Фокусируемся на поле ввода
        searchContainer.querySelector('input').focus();
    }
});


// Закрываем поиск при нажатии Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelector('.mobile-search-container').classList.remove('active');
    }
});


document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".login-btn").addEventListener("click", async function (event) {
        event.preventDefault();

        let email = document.querySelector("input[name='email']").value;
        let login = document.querySelector("input[name='login']").value;
        let password = document.querySelector("input[name='password']").value;
        let password_repeat = document.querySelector("input[name='password_repeat']").value;

        if (password !== password_repeat) {
            alert("Пароли не совпадают!");
            return;
        }

        let userData = {
            email: email,
            user_tag: login,
            password: password
        };

        try {
            let response = await fetch("http://127.0.0.1:5000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });

            let result = await response.json();
            if (response.ok) {
                // Сохраняем токены и логин
                localStorage.setItem('token', result.access_token);
                localStorage.setItem('refreshToken', result.refresh_token);
                localStorage.setItem('userLogin', result.user_login);
                
                alert(result.message);
                // Перенаправляем на профиль
                window.location.href = "profile.html";
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error("Ошибка:", error);
            alert("Ошибка при регистрации.");
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация темы
    const darkThemeClass = 'dark-theme';
    const storageKey = 'siteTheme';
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme === 'dark') {
        document.body.classList.add(darkThemeClass);
    }

    // Обработчик переключения темы
    document.querySelector('.profile-theme-toggle').addEventListener('click', function(e) {
        e.preventDefault();
        document.body.classList.toggle(darkThemeClass);
        localStorage.setItem(storageKey, document.body.classList.contains(darkThemeClass) ? 'dark' : 'light');
    });

    // Синхронизация темы между вкладками
    window.addEventListener('storage', function(e) {
        if (e.key === storageKey) {
            document.body.classList.toggle(darkThemeClass, e.newValue === 'dark');
        }
    });
});
