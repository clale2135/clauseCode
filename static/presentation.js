let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;

// Add slide numbers to each slide
slides.forEach((slide, index) => {
    slide.setAttribute('data-slide-num', `${index + 1} / ${totalSlides}`);
});

function showSlide(n) {
    slides.forEach(slide => slide.classList.remove('active'));
    
    if (n >= totalSlides) {
        currentSlide = totalSlides - 1;
    } else if (n < 0) {
        currentSlide = 0;
    } else {
        currentSlide = n;
    }
    
    slides[currentSlide].classList.add('active');
    document.getElementById('slideCounter').textContent = `${currentSlide + 1} / ${totalSlides}`;
    
    // Update button states
    document.getElementById('prevBtn').disabled = currentSlide === 0;
    document.getElementById('nextBtn').disabled = currentSlide === totalSlides - 1;
}

function changeSlide(direction) {
    showSlide(currentSlide + direction);
}

// Keyboard navigation (enhanced for presentations)
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        changeSlide(-1);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        changeSlide(1);
    } else if (e.key === 'Home') {
        e.preventDefault();
        showSlide(0);
    } else if (e.key === 'End') {
        e.preventDefault();
        showSlide(totalSlides - 1);
    } else if (e.key === 'f' || e.key === 'F11') {
        // Fullscreen toggle
        if (e.key === 'f') {
            e.preventDefault();
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    } else if (e.key === 'Escape') {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }
});

// Initialize
showSlide(0);

// Touch navigation for mobile devices
let touchStartX = 0;
document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > 50) { // Minimum swipe distance
        if (diff > 0) {
            changeSlide(1); // Swipe left - next slide
        } else {
            changeSlide(-1); // Swipe right - previous slide
        }
    }
});

// Show help overlay on load
const helpOverlay = document.getElementById('helpOverlay');
setTimeout(() => {
    helpOverlay.style.opacity = '1';
    helpOverlay.style.pointerEvents = 'auto';
}, 1000);

// Hide help overlay on any interaction
let helpHidden = false;
function hideHelp() {
    if (!helpHidden) {
        helpOverlay.style.opacity = '0';
        setTimeout(() => {
            helpOverlay.style.pointerEvents = 'none';
        }, 300);
        helpHidden = true;
    }
}

document.addEventListener('keydown', hideHelp, { once: true });
document.addEventListener('click', hideHelp, { once: true });

// Exit presentation function
function exitPresentation() {
    window.location.href = '/';
}
