document.addEventListener('DOMContentLoaded', () => {
    const data = {
      recipes: [
        {
          title: "Паста Карбонара",
          description: "Изысканное итальянское блюдо...",
          cookingTime: "30 минут",
          country: "Италия",
          type: "Горячее",
          author: "@Admins",
          recipe: "1. Подготовьте все ингредиенты: нарежьте бекон, натрите сыр Пекорино Романо и разведите яйца. 2. Отварите пасту в большом количестве подсоленной воды до состояния al dente. 3. Пока паста варится, обжарьте бекон до золотистой корочки на среднем огне. 4. В миске смешайте яичные желтки, тертый сыр и немного воды из пасты до однородной консистенции. 5. Слейте пасту, оставив немного воды, и соедините ее с беконом на сковороде. 6. Снимите сковороду с огня и добавьте соус из яиц и сыра, постоянно перемешивая, чтобы избежать сворачивания яиц. 7. При необходимости добавьте немного воды из пасты для достижения кремовой текстуры. 8. Подавайте пасту Карбонара сразу, посыпав сверху свежемолотым черным перцем и дополнительно сыром.",
          image: "src/img/karbonara.jpg"
        },
        {
          title: "Рамен с курицей",
          description: "Японский суп с пшеничной лапшой, курицей и овощами.",
          cookingTime: "2 часа",
          country: "Япония",
          type: "Суп",
          author: "@RamenMaster",
          recipe: "1. Приготовьте бульон из куриных костей (8 часов).\n2. Обжарьте куриное филе с имбирем и чесноком.\n3. Отварите лапшу, разложите по чашам.\n4. Добавьте бульон, мясо, яйцо пашот, ростки бамбука и зеленый лук.",
          image: "src/img/ramen.jpg"
        },
        {
          title: "Паэлья с морепродуктами",
          description: "Традиционное испанское блюдо с рисом шафранного цвета.",
          cookingTime: "40 минут",
          country: "Испания",
          type: "Горячее",
          author: "@SpanishChef",
          recipe: "1. Обжарьте лук, чеснок и перец в паэльере.\n2. Добавьте рис, шафран и бульон.\n3. Выложите креветки, мидии и кальмары.\n4. Готовьте на среднем огне 20 минут без перемешивания.",
          image: "src/img/paella.jpg"
        },
        {
          title: "Фалафель",
          description: "Жареные шарики из нута с восточными специями.",
          cookingTime: "1 час",
          country: "Израиль",
          type: "Закуска",
          author: "@StreetFood",
          recipe: "1. Замочите 250 г нута на ночь.\n2. Измельчите с луком, чесноком и кинзой.\n3. Добавьте кумин, кориандр и муку.\n4. Сформируйте шарики, жарьте во фритюре 5 минут.",
          image: "src/img/falafel.jpg"
        },
        {
          title: "Бёф бургиньон",
          description: "Французское рагу из говядины в красном вине.",
          cookingTime: "3.5 часа",
          country: "Франция",
          type: "Горячее",
          author: "@FrenchCuisine",
          recipe: "1. Обжарьте говядину до корочки.\n2. Тушите с луком, морковью и бульоном.\n3. Добавьте красное вино и грибы.\n4. Подавайте с картофельным пюре.",
          image: "src/img/boeuf.jpg"
        },
        {
          title: "Хачапури по-аджарски",
          description: "Грузинская лодочка из теста с сыром и яйцом.",
          cookingTime: "1.5 часа",
          country: "Грузия",
          type: "Выпечка",
          author: "@BreadLover",
          recipe: "1. Замесите дрожжевое тесто.\n2. Сформируйте лодочки, наполните смесью сыров.\n3. Выпекайте 20 минут при 200°C.\n4. Добавьте яйцо и сливочное масло перед подачей.",
          image: "src/img/hachapuri.jpg"
        },
        {
          title: "Панна-котта",
          description: "Итальянский десерт с ванилью и ягодным соусом.",
          cookingTime: "4 часа",
          country: "Италия",
          type: "Десерт",
          author: "@DessertMaster",
          recipe: "1. Нагрейте сливки с ванилью и желатином.\n2. Разлейте по формам, охладите 3 часа.\n3. Приготовьте соус из свежих ягод.\n4. Подавайте перевернув на тарелку с соусом.",
          image: "src/img/panna_cotta.jpg"
        },
        {
          title: "Фо-бо",
          description: "Вьетнамский суп с говядиной и рисовой лапшой.",
          cookingTime: "5 часов",
          country: "Вьетнам",
          type: "Суп",
          author: "@AsiaFood",
          recipe: "1. Варите бульон из говяжьих костей 4 часа.\n2. Добавьте звездчатый анис и корицу.\n3. Отварите лапшу, тонко нарежьте говядину.\n4. Соберите в пиалах с ростками и лаймом.",
          image: "src/img/pho.jpg"
        },
        {
          title: "Мохито",
          description: "Кубинский коктейль с лаймом и мятой.",
          cookingTime: "5 минут",
          country: "Куба",
          type: "Напиток",
          author: "@BarmanPro",
          recipe: "1. Разомните мяту с лаймом и сахаром.\n2. Добавьте лед и светлый ром.\n3. Долейте содовой, украсьте мятой.\n4. Подавайте с соломинкой.",
          image: "src/img/mojito.jpg"
        },
        {
          title: "Бризоль",
          description: "Украинское блюдо из тонкого мясного рулета.",
          cookingTime: "1 час",
          country: "Украина",
          type: "Горячее",
          author: "@MeatLover",
          recipe: "1. Раскатайте фарш в прямоугольный пласт.\n2. Выложите начинку из яиц и грибов.\n3. Сверните рулет, запекайте 40 минут.\n4. Нарежьте порционно перед подачей.",
          image: "src/img/brizol.jpg"
        },
        {
          title: "Такос",
          description: "Мексиканская закуска с кукурузными лепешками.",
          cookingTime: "30 минут",
          country: "Мексика",
          type: "Закуска",
          author: "@TacoTuesday",
          recipe: "1. Обжарьте лепешки до хрустящей корочки.\n2. Приготовьте начинку: говяжий фарш с чили.\n3. Добавьте сальсу, гуакамоле и сметану.\n4. Подавайте сразу после приготовления.",
          image: "src/img/tacos.jpg"
        },
        {
          title: "Муссака",
          description: "Греческая запеканка с баклажанами и мясом.",
          cookingTime: "1.5 часа",
          country: "Греция",
          type: "Горячее",
          author: "@Mediterranean",
          recipe: "1. Обжарьте баклажаны и мясной фарш.\n2. Слоями выложите в форму.\n3. Залейте соусом бешамель.\n4. Запекайте 40 минут при 180°C.",
          image: "src/img/moussaka.jpg"
        },
        {
          title: "Бигос",
          description: "Польское рагу из капусты и мяса.",
          cookingTime: "3 часа",
          country: "Польша",
          type: "Горячее",
          author: "@WinterFood",
          recipe: "1. Тушите квашеную капусту 2 часа.\n2. Добавьте копчености и грибы.\n3. Влейте красное вино, тушите еще 1 час.\n4. Подавайте с черным хлебом.",
          image: "src/img/bigos.jpg"
        },
        {
          title: "Кимчи",
          description: "Острая корейская квашеная капуста.",
          cookingTime: "3 дня",
          country: "Корея",
          type: "Закуска",
          author: "@Fermentation",
          recipe: "1. Натрите капусту солью, оставьте на 2 часа.\n2. Приготовьте пасту из перца, имбиря и чеснока.\n3. Намажьте капусту пастой, ферментируйте 3 дня.\n4. Храните в холодильнике до месяца.",
          image: "src/img/kimchi.jpg"
        },
        {
          title: "Фондю",
          description: "Швейцарское блюдо с расплавленным сыром.",
          cookingTime: "30 минут",
          country: "Швейцария",
          type: "Закуска",
          author: "@AlpsCuisine",
          recipe: "1. Смешайте сыры грюйер и эмменталь.\n2. Растопите с белым вином и крахмалом.\n3. Подавайте в керамической кастрюльке.\n4. Макайте кусочки хлеба с помощью вилок.",
          image: "src/img/fondue.jpg"
        },
        {
          title: "Лазанья",
          description: "Итальянская паста с мясным соусом бешамель.",
          cookingTime: "1.5 часа",
          country: "Италия",
          type: "Горячее",
          author: "@PastaLover",
          recipe: "1. Приготовьте болоньезе и соус бешамель.\n2. Слоями выложите листы лазаньи.\n3. Чередуйте с начинкой и соусами.\n4. Запекайте 40 минут до золотистой корочки.",
          image: "src/img/lasagna.jpg"
        },
        {
          title: "Цезарь Ролл",
          description: "Американский сэндвич-версия знаменитого салата.",
          cookingTime: "20 минут",
          country: "США",
          type: "Закуска",
          author: "@FastFood",
          recipe: "1. Обжарьте куриное филе в панировке.\n2. Смажьте тортилью соусом цезарь.\n3. Добавьте салат айсберг и помидоры.\n4. Заверните рулетом, разрежьте пополам.",
          image: "src/img/caesar_roll.jpg"
        }
      ]
    };
  
    let activeSuggestions = null;
  const searchInputs = document.querySelectorAll('input[type="search"]');

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

  const handleInput = (e) => {
    const term = e.target.value.toLowerCase().trim();
    const input = e.target;
    
    // Удаляем старые подсказки при изменении текста
    if(activeSuggestions) {
      activeSuggestions.remove();
      activeSuggestions = null;
    }

    if (!term) return;

    activeSuggestions = createSuggestions(input);
    
    // Фильтрация и отображение результатов
    const results = data.recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(term)
    );

    results.forEach(recipe => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.textContent = recipe.title;
      
      item.addEventListener('click', () => {
        const params = new URLSearchParams(recipe);
        window.location.href = `data_view.html?${params.toString()}`;
      });

      activeSuggestions.appendChild(item);
    });

    activeSuggestions.style.display = 'block';
  };

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