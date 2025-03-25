// Функция для обновления access token
async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        return false;
    }

    try {
        const response = await fetch('http://localhost:5000/api/refresh', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${refreshToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            return true;
        } else {
            // Если refresh token невалиден, очищаем хранилище
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userLogin');
            return false;
        }
    } catch (error) {
        console.error('Ошибка при обновлении токена:', error);
        return false;
    }
}

// Функция для выполнения защищенных запросов
async function fetchWithToken(url, options = {}) {
    let token = localStorage.getItem('token');
    
    // Настройки запроса с учетом CORS
    options = {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        mode: 'cors' // Явно указываем режим CORS
    };

    try {
        let response = await fetch(url, options);

        // Если получаем 401, пробуем обновить токен
        if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                // Повторяем запрос с новым токеном
                token = localStorage.getItem('token');
                options.headers['Authorization'] = `Bearer ${token}`;
                return fetch(url, options);
            } else {
                // Если токен не обновился, перенаправляем на страницу входа
                window.location.href = '/login.html';
                throw new Error('Unauthorized - Token refresh failed');
            }
        }
        
        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const userLogin = localStorage.getItem('userLogin');
    const token = localStorage.getItem('token');
    
    // Получаем текущий путь страницы
    const currentPage = window.location.pathname.split('/').pop();
    
    // Список страниц, требующих авторизации
    const protectedPages = [
        'profile.html',
        'settings.html',
        'input_data.html'
        // 'data_view.html' - удалено, чтобы незарегистрированные пользователи могли просматривать рецепты
    ];
    
    // Список страниц, доступных без авторизации
    const publicPages = [
        'index.html',
        'catalog-recipe.html',
        'login.html',
        'reg.html',
        'data_view.html',  // добавлено как публичная страница
        ''  // Для случая, когда открыта корневая директория
    ];

    // Проверяем, требует ли текущая страница авторизации
    if (protectedPages.includes(currentPage)) {
        if (!userLogin || !token) {
            window.location.href = 'login.html';
            return;
        }
    }

    // Если пользователь авторизован, показываем его профиль
    if (userLogin && token) {
        // Скрываем меню авторизации
        const authMenu = document.querySelector('.auth-menu');
        if (authMenu) {
            authMenu.style.display = 'none';
        }

        // Показываем меню профиля
        const profileMenu = document.querySelector('.profile-menu');
        if (profileMenu) {
            profileMenu.style.display = 'block';
        }

        // Используем новую функцию для запросов
        fetchWithToken(`http://localhost:5000/api/profile/${userLogin}`)
            .then(response => response.json())
            .then(data => {
                const profileIcon = document.querySelector(".profile-toggle i");
                if (data.image && profileIcon) {
                    const profileImg = document.createElement("img");
                    profileImg.src = data.image;
                    profileImg.alt = "Profile";
                    profileImg.style.width = "42px";
                    profileImg.style.height = "42px";
                    profileImg.style.borderRadius = "50%";
                    profileImg.style.objectFit = "cover";
                    profileImg.style.marginLeft = "15px";
                    profileIcon.replaceWith(profileImg);
                }
            })
            .catch(error => console.error('Ошибка при загрузке профиля:', error));
    } else {
        // Если пользователь не авторизован, показываем меню авторизации
        const authMenu = document.querySelector('.auth-menu');
        if (authMenu) {
            authMenu.style.display = 'block';
        }

        // Скрываем защищенные пункты меню
        const profileMenu = document.querySelector('.profile-menu');
        if (profileMenu) {
            const protectedLinks = profileMenu.querySelectorAll('a:not(.auth-menu a)');
            protectedLinks.forEach(link => {
                link.style.display = 'none';
            });
        }
    }

    // Обработчик выхода
    document.querySelectorAll('.profile-menu a').forEach(link => {
        if (link.querySelector('.fa-sign-out-alt')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userLogin');
                window.location.href = 'login.html';
            });
        }
    });
}); 