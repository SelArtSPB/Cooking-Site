document.querySelector('.menu-toggle').addEventListener('click', function () {
    document.querySelector('.nav ul').classList.toggle('active')
});

document.querySelector('.theme-toggle').addEventListener('click', function() {
    this.classList.toggle('dark');
    document.body.classList.toggle('dark-theme');
});

document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.slider-track');
    const slides = document.querySelectorAll('.recipe-card');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    const dotsContainer = document.querySelector('.slider-dots');
    
    if (!slider || !slides.length) return;

    function getSlidesPerView() {
        if (window.innerWidth > 1200) return 4;
        if (window.innerWidth > 992) return 3;
        if (window.innerWidth > 576) return 2;
        return 1;
    }

    let slidesPerView = getSlidesPerView();
    let totalSlides = slides.length;
    let maxSlideIndex = totalSlides - slidesPerView;
    let currentSlide = 0;

    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;
    let startTime = 0;
    
    slider.addEventListener('touchstart', touchStart);
    slider.addEventListener('touchmove', touchMove);
    slider.addEventListener('touchend', touchEnd);
    
    slider.addEventListener('mousedown', touchStart);
    slider.addEventListener('mousemove', touchMove);
    slider.addEventListener('mouseup', touchEnd);
    slider.addEventListener('mouseleave', touchEnd);
    
    window.oncontextmenu = function(event) {
        if (event.target.closest('.slider-track')) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }

    function touchStart(event) {
        startTime = Date.now();
        isDragging = true;
        startPos = getPositionX(event);
        
        animationID = requestAnimationFrame(animation);
        slider.style.cursor = 'grabbing';
    }

    function touchMove(event) {
        if (!isDragging) return;
        
        const currentPosition = getPositionX(event);
        currentTranslate = prevTranslate + currentPosition - startPos;
    }

    function touchEnd() {
        isDragging = false;
        cancelAnimationFrame(animationID);
        
        const movedBy = currentTranslate - prevTranslate;
        const duration = Date.now() - startTime;
        
        if (duration < 250 && Math.abs(movedBy) > 20) {
            if (movedBy < 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        } else {
            const slideWidth = slides[0].offsetWidth + 20;
            const threshold = slideWidth / 4;
            if (Math.abs(movedBy) > threshold) {
                if (movedBy < 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            } else {
                goToSlide(currentSlide);
            }
        }
        
        slider.style.cursor = 'grab';
    }

    function getPositionX(event) {
        return event.type.includes('mouse') 
            ? event.pageX 
            : event.touches[0].clientX;
    }

    function animation() {
        if (isDragging) {
            setSliderPosition();
            requestAnimationFrame(animation);
        }
    }

    function setSliderPosition() {
        slider.style.transform = `translateX(${currentTranslate}px)`;
    }

    function goToSlide(index) {
        if (index < 0 || index > maxSlideIndex) return;
        currentSlide = index;
        const slideWidth = slides[0].offsetWidth + 20;
        currentTranslate = -currentSlide * slideWidth;
        prevTranslate = currentTranslate;
        setSliderPosition();
        updateDots();
    }

    window.addEventListener('resize', () => {
        slidesPerView = getSlidesPerView();
        maxSlideIndex = totalSlides - slidesPerView;
        if (currentSlide > maxSlideIndex) {
            currentSlide = maxSlideIndex;
        }
        goToSlide(currentSlide);
        updateDots();
    });

    const totalDots = maxSlideIndex + 1;
    for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
    
    const dots = document.querySelectorAll('.dot');
    
    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }
    
    function nextSlide() {
        if (currentSlide < maxSlideIndex) {
            goToSlide(currentSlide + 1);
        }
    }
    
    function prevSlide() {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1);
        }
    }
    
    prevButton?.addEventListener('click', prevSlide);
    nextButton?.addEventListener('click', nextSlide);
    
    const slideInterval = setInterval(() => {
        if (currentSlide === maxSlideIndex) {
            goToSlide(0);
        } else {
            nextSlide();
        }
    }, 5000);
    
    slider.addEventListener('mouseenter', () => clearInterval(slideInterval));
});
