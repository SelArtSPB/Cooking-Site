// Обработчик мобильного меню
document.querySelector('.menu-toggle').addEventListener('click', function() {
    this.classList.toggle('active');
    document.querySelector('.nav').classList.toggle('active');
    document.body.style.overflow = document.querySelector('.nav').classList.contains('active') ? 'hidden' : '';
});

// Закрытие меню при клике на ссылку
document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.nav').classList.remove('active');
        document.querySelector('.menu-toggle').classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Закрытие меню при клике вне его
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

// Обработчик меню профиля
document.querySelector('.profile-toggle').addEventListener('click', function(e) {
    e.stopPropagation();
    document.querySelector('.profile-menu').classList.toggle('active');
});

// Закрытие меню профиля при клике вне его
document.addEventListener('click', function(e) {
    const menu = document.querySelector('.profile-menu');
    const toggle = document.querySelector('.profile-toggle');
    
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove('active');
    }
});

// Переключение темы
document.querySelector('.profile-theme-toggle').addEventListener('click', function(e) {
    e.preventDefault();
    document.body.classList.toggle('dark-theme');
});

// Мобильный поиск
document.querySelector('.mobile-search-toggle').addEventListener('click', function() {
    const searchContainer = document.querySelector('.mobile-search-container');
    searchContainer.classList.toggle('active');
    
    if (searchContainer.classList.contains('active')) {
        searchContainer.querySelector('input').focus();
    }
});

// Закрытие мобильного поиска при клике вне его
document.addEventListener('click', (e) => {
    const searchContainer = document.querySelector('.mobile-search-container');
    const searchToggle = document.querySelector('.mobile-search-toggle');
    
    if (!searchContainer.contains(e.target) && 
        !searchToggle.contains(e.target) && 
        searchContainer.classList.contains('active')) {
        searchContainer.classList.remove('active');
    }
});

// Закрытие мобильного поиска при нажатии Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelector('.mobile-search-container').classList.remove('active');
    }
});

// Обработка отправки формы поиска
document.querySelector('.mobile-search-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const searchQuery = this.querySelector('input').value;
    console.log('Поисковый запрос:', searchQuery);
    // Здесь будет логика обработки поиска
});
