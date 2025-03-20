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





document.addEventListener("DOMContentLoaded", async function () {
    // Проверяем наличие токенов
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const userLogin = localStorage.getItem('userLogin');

    if (token && refreshToken && userLogin) {
        try {
            // Проверяем валидность токена
            const response = await fetch(`http://localhost:5000/profile/${userLogin}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Если токен валидный, перенаправляем на профиль
                window.location.href = 'profile.html';
                return;
            } else if (response.status === 401) {
                // Пробуем обновить токен
                const refreshResponse = await fetch('http://localhost:5000/refresh', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${refreshToken}`
                    }
                });

                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    localStorage.setItem('token', data.access_token);
                    window.location.href = 'profile.html';
                    return;
                } else {
                    // Если refresh token невалидный, очищаем хранилище
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('userLogin');
                }
            }
        } catch (error) {
            console.error('Ошибка при проверке токена:', error);
        }
    }

    // Обработчик формы входа
    document.querySelector(".login-btn").addEventListener("click", async function (event) {
        event.preventDefault();

        let login = document.querySelector("input[name='login']").value;
        let password = document.querySelector("input[name='password']").value;

        if (!login || !password) {
            alert("Заполните все поля!");
            return;
        }

        try {
            let response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    login: login,
                    password: password
                })
            });

            let result = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', result.access_token);
                localStorage.setItem('refreshToken', result.refresh_token);
                localStorage.setItem('userLogin', result.user_login);
                
                window.location.href = "profile.html";
            } else {
                alert(result.error || "Ошибка при входе");
            }
        } catch (error) {
            console.error("Ошибка:", error);
            alert("Ошибка при входе");
        }
    });
});
