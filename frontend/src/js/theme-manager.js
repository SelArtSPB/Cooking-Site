// theme-manager.js

document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.querySelector('.profile-theme-toggle');
    const darkThemeClass = 'dark-theme';
    const storageKey = 'siteTheme';

    // Инициализация темы из Local Storage
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme === 'dark') {
        document.body.classList.add(darkThemeClass);
    }

    // Обработчик переключения темы
    if (themeToggle) {
        themeToggle.addEventListener('click', function(e) {
            e.preventDefault();
            document.body.classList.toggle(darkThemeClass);
            
            // Сохранение состояния в Local Storage
            const isDarkTheme = document.body.classList.contains(darkThemeClass);
            localStorage.setItem(storageKey, isDarkTheme ? 'dark' : 'light');
        });
    }

    // Синхронизация темы между вкладками
    window.addEventListener('storage', function(e) {
        if (e.key === storageKey) {
            const newTheme = e.newValue;
            if (newTheme === 'dark') {
                document.body.classList.add(darkThemeClass);
            } else {
                document.body.classList.remove(darkThemeClass);
            }
        }
    });
});