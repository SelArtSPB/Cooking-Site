document.addEventListener('DOMContentLoaded', () => {
    let activeSuggestions = null;
    const searchInputs = document.querySelectorAll('input[type="search"]');
    let recipes = []; // Будем хранить рецепты здесь

    // Функция для загрузки рецептов из API
    const loadRecipes = async () => {
        try {
            const response = await fetch('http://localhost:5000/recipes');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            console.log('Загруженные рецепты:', data); // Добавляем логирование
            recipes = data; // Сохраняем полученные рецепты
        } catch (error) {
            console.error('Error loading recipes:', error);
            recipes = []; // В случае ошибки используем пустой массив
        }
    };

    const createSuggestions = (input) => {
        // Удаляем предыдущие подсказки
        if(activeSuggestions) activeSuggestions.remove();
        
        // Создаем новый контейнер
        const suggestions = document.createElement('div');
        suggestions.className = 'search-suggestions';
        
        // Позиционируем относительно поля ввода
        const rect = input.getBoundingClientRect();
        suggestions.style.top = `${rect.bottom + window.scrollY + 5}px`;
        suggestions.style.left = `${rect.left + window.scrollX}px`;
        suggestions.style.width = `${rect.width}px`;
        
        document.body.appendChild(suggestions);
        return suggestions;
    };

    const handleInput = async (e) => {
        const term = e.target.value.toLowerCase().trim();
        const input = e.target;
        
        if(activeSuggestions) {
            activeSuggestions.remove();
            activeSuggestions = null;
        }

        if (!term) return;

        activeSuggestions = createSuggestions(input);
        
        console.log('Текущие рецепты:', recipes); // Добавляем логирование
        console.log('Поисковый запрос:', term); // Добавляем логирование
        
        // Исправляем фильтрацию, используя правильные имена полей
        const results = recipes.filter(recipe => {
            console.log('Проверяем рецепт:', recipe); // Добавляем логирование
            return recipe.title.toLowerCase().includes(term);
        });

        console.log('Результаты поиска:', results); // Добавляем логирование

        results.forEach(recipe => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = recipe.title;
            
            item.addEventListener('click', () => {
                window.location.href = `data_view.html?id=${recipe.id}`;
            });

            activeSuggestions.appendChild(item);
        });

        activeSuggestions.style.display = 'block';
    };

    // Загружаем рецепты при загрузке страницы
    loadRecipes();

    // Обработчики событий
    searchInputs.forEach(input => {
        input.addEventListener('input', handleInput);
        input.addEventListener('focus', handleInput);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-line, .mobile-search-container, .search-suggestions')) {
            if(activeSuggestions) {
                activeSuggestions.remove();
                activeSuggestions = null;
                // Очищаем все поля поиска
                searchInputs.forEach(input => {
                    input.value = '';
                });
            }
        }
    });

    // Адаптация при ресайзе
    window.addEventListener('resize', () => {
        if(activeSuggestions) {
            activeSuggestions.remove();
            activeSuggestions = null;
        }
    });
});