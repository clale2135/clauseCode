let currentSlide = 1;
const totalSlides = 8;
let audioEnabled = true;
let userInteracted = false;

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const slideCounter = document.getElementById('slideCounter');
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const audioElements = document.querySelectorAll('.slide-audio');

// Stop all audio
function stopAllAudio() {
    audioElements.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
}

// Play audio for specific slide
function playSlideAudio(slideNum) {
    // Don't play if user hasn't interacted or audio is disabled
    if (!userInteracted || !audioEnabled) {
        return;
    }
    
    // Stop all currently playing audio
    stopAllAudio();
    
    // Find and play audio for this slide
    const audio = document.querySelector(`.slide-audio[data-slide="${slideNum}"]`);
    if (audio) {
        // Small delay to ensure smooth transition
        setTimeout(() => {
            audio.play().catch(err => {
                console.log('Audio autoplay prevented:', err);
            });
        }, 300);
    }
}

function updateSlide(slideNum) {
    // Remove active class from all slides
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Add active class to current slide
    const currentSlideEl = document.querySelector(`.slide[data-slide="${slideNum}"]`);
    const currentDot = document.querySelector(`.dot[data-slide="${slideNum}"]`);
    
    if (currentSlideEl) currentSlideEl.classList.add('active');
    if (currentDot) currentDot.classList.add('active');

    // Update counter
    slideCounter.textContent = `${slideNum} / ${totalSlides}`;

    // Update button states
    prevBtn.disabled = slideNum === 1;
    nextBtn.disabled = slideNum === totalSlides;

    // Play audio for this slide
    playSlideAudio(slideNum);

    currentSlide = slideNum;
}

function nextSlide() {
    if (currentSlide < totalSlides) {
        updateSlide(currentSlide + 1);
    }
}

function prevSlide() {
    if (currentSlide > 1) {
        updateSlide(currentSlide - 1);
    }
}

// Event listeners
prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
    }
});

// Dot navigation
dots.forEach(dot => {
    dot.addEventListener('click', () => {
        const slideNum = parseInt(dot.getAttribute('data-slide'));
        updateSlide(slideNum);
    });
});

// Touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.querySelector('.deck-container').addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.querySelector('.deck-container').addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    if (touchStartX - touchEndX > swipeThreshold) {
        nextSlide();
    } else if (touchEndX - touchStartX > swipeThreshold) {
        prevSlide();
    }
}

// Audio control toggle
const audioToggleBtn = document.createElement('button');
audioToggleBtn.id = 'audioToggle';
audioToggleBtn.className = 'audio-toggle-btn';
audioToggleBtn.innerHTML = '🔊';
audioToggleBtn.title = 'Toggle audio';
document.querySelector('.slide-nav').appendChild(audioToggleBtn);

audioToggleBtn.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    audioToggleBtn.innerHTML = audioEnabled ? '🔊' : '🔇';
    
    if (!audioEnabled) {
        stopAllAudio();
    } else {
        playSlideAudio(currentSlide);
    }
});

// Audio start overlay
const audioStartOverlay = document.getElementById('audioStartOverlay');
const startPresentationBtn = document.getElementById('startPresentationBtn');
const startSilentBtn = document.getElementById('startSilentBtn');

startPresentationBtn.addEventListener('click', () => {
    userInteracted = true;
    audioEnabled = true;
    audioStartOverlay.classList.add('hidden');
    audioToggleBtn.innerHTML = '🔊';
    playSlideAudio(1);
});

startSilentBtn.addEventListener('click', () => {
    userInteracted = true;
    audioEnabled = false;
    audioStartOverlay.classList.add('hidden');
    audioToggleBtn.innerHTML = '🔇';
});

// Pause audio when switching away from page
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAllAudio();
    }
});

// Initialize (but don't play audio yet)
updateSlide(1);
