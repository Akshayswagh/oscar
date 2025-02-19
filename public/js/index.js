let index = 0;
        function moveToSlide(n) {
            index = n;
            updateCarousel();
        }
        function updateCarousel() {
            const carousel = document.querySelector('.carousel');
            const dots = document.querySelectorAll('.dot');
            carousel.style.transform = `translateX(${-index * 100}%)`;
            dots.forEach(dot => dot.classList.remove('active'));
            dots[index].classList.add('active');
        }
        function autoSlide() {
            index = (index + 1) % 3;
            updateCarousel();
        }
        setInterval(autoSlide, 3000); // Auto-slide every 3 seconds