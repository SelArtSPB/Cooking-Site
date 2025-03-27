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

document.querySelector('.profile-toggle').addEventListener('click', function() {
    document.querySelector('.profile-menu').classList.toggle('active');
});

document.addEventListener('click', function(e) {
    const menu = document.querySelector('.profile-menu');
    const toggle = document.querySelector('.profile-toggle');
    
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove('active');
    }
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

        if (!login || !password || !password_repeat) {
            alert("Заполните обязательные поля: логин и пароль!");
            return;
        }

        if (password !== password_repeat) {
            alert("Пароли не совпадают!");
            return;
        }

        try {
            let response = await fetch("http://localhost:5000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    login: login,
                    password: password
                })
            });

            if (response.ok) {
                let result = await response.json();
                alert("Регистрация успешна! Пожалуйста, войдите в систему.");
                window.location.href = "login.html";
            } else {
                let error = await response.json();
                alert(error.error || "Ошибка при регистрации");
            }
        } catch (error) {
            console.error("Ошибка:", error);
            alert("Ошибка при регистрации");
        }
    });
});
