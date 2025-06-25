class AdvancedHero {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      autoplay: true,
      autoplaySpeed: 6000,
      enableParallax: true,
      transitionDuration: 1000,
      ...options
    };
    
    this.currentSlide = 0;
    this.slides = this.element.querySelectorAll('.advanced-hero__slide');
    this.slideContents = this.element.querySelectorAll('.advanced-hero__slide-content');
    this.dots = this.element.querySelectorAll('.advanced-hero__dot');
    this.prevButton = this.element.querySelector('.advanced-hero__arrow--prev');
    this.nextButton = this.element.querySelector('.advanced-hero__arrow--next');
    this.progressBar = this.element.querySelector('.advanced-hero__progress-bar');
    
    this.autoplayTimer = null;
    this.progressTimer = null;
    this.isTransitioning = false;
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.setupParallax();
    this.setupParticles();
    
    if (this.options.autoplay && this.slides.length > 1) {
      this.startAutoplay();
    }
    
    // Set initial height based on data attribute
    const height = this.element.dataset.height || 'large';
    this.element.setAttribute('data-height', height);
    
    // Enable parallax class if option is set
    if (this.options.enableParallax) {
      this.element.classList.add('parallax-enabled');
    }
  }
  
  setupEventListeners() {
    // Dot navigation
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });
    
    // Arrow navigation
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => this.previousSlide());
    }
    
    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => this.nextSlide());
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.previousSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });
    
    // Pause autoplay on hover
    this.element.addEventListener('mouseenter', () => this.pauseAutoplay());
    this.element.addEventListener('mouseleave', () => this.resumeAutoplay());
    
    // Touch/swipe support
    this.setupTouchEvents();
    
    // Intersection Observer for performance
    this.setupIntersectionObserver();
  }
  
  setupTouchEvents() {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    
    this.element.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });
    
    this.element.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      // Only trigger if horizontal swipe is greater than vertical
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          this.previousSlide();
        } else {
          this.nextSlide();
        }
      }
    });
  }
  
  setupParallax() {
    if (!this.options.enableParallax) return;
    
    let ticking = false;
    
    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;
      
      this.slides.forEach(slide => {
        const media = slide.querySelector('.advanced-hero__video, .advanced-hero__image');
        if (media) {
          media.style.transform = `translate(-50%, calc(-50% + ${rate}px)) scale(1.1)`;
        }
      });
      
      ticking = false;
    };
    
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', requestTick);
  }
  
  setupParticles() {
    // Simple particle system for slides with particles enabled
    this.slides.forEach((slide, index) => {
      const particlesContainer = slide.querySelector('.advanced-hero__particles');
      if (!particlesContainer) return;
      
      this.createParticles(particlesContainer);
    });
  }
  
  createParticles(container) {
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: 2px;
        height: 2px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
        animation-delay: ${Math.random() * 2}s;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
      `;
      
      container.appendChild(particle);
    }
    
    // Add CSS animation if not already present
    if (!document.querySelector('#particle-animation')) {
      const style = document.createElement('style');
      style.id = 'particle-animation';
      style.textContent = `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.resumeAutoplay();
        } else {
          this.pauseAutoplay();
        }
      });
    });
    
    observer.observe(this.element);
  }
  
  goToSlide(index) {
    if (this.isTransitioning || index === this.currentSlide) return;
    
    this.isTransitioning = true;
    
    // Update active states
    this.slides[this.currentSlide].classList.remove('active');
    this.slideContents[this.currentSlide].classList.remove('active');
    this.dots[this.currentSlide]?.classList.remove('active');
    
    this.currentSlide = index;
    
    this.slides[this.currentSlide].classList.add('active');
    this.slideContents[this.currentSlide].classList.add('active');
    this.dots[this.currentSlide]?.classList.add('active');
    
    // Reset transition flag after animation
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.options.transitionDuration);
    
    // Restart autoplay progress
    if (this.options.autoplay) {
      this.restartProgress();
    }
  }
  
  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }
  
  previousSlide() {
    const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prevIndex);
  }
  
  startAutoplay() {
    if (this.slides.length <= 1) return;
    
    this.autoplayTimer = setInterval(() => {
      this.nextSlide();
    }, this.options.autoplaySpeed);
    
    this.startProgress();
  }
  
  pauseAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
    
    this.pauseProgress();
  }
  
  resumeAutoplay() {
    if (this.options.autoplay && !this.autoplayTimer) {
      this.startAutoplay();
    }
  }
  
  startProgress() {
    if (!this.progressBar) return;
    
    this.progressBar.style.transition = 'none';
    this.progressBar.style.width = '0%';
    
    // Force reflow
    this.progressBar.offsetHeight;
    
    this.progressBar.style.transition = `width ${this.options.autoplaySpeed}ms linear`;
    this.progressBar.style.width = '100%';
  }
  
  pauseProgress() {
    if (!this.progressBar) return;
    
    const currentWidth = this.progressBar.getBoundingClientRect().width;
    const containerWidth = this.progressBar.parentElement.getBoundingClientRect().width;
    const percentage = (currentWidth / containerWidth) * 100;
    
    this.progressBar.style.transition = 'none';
    this.progressBar.style.width = `${percentage}%`;
  }
  
  restartProgress() {
    if (this.options.autoplay) {
      this.startProgress();
    }
  }
  
  destroy() {
    this.pauseAutoplay();
    // Remove event listeners and clean up
  }
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  const heroElements = document.querySelectorAll('.advanced-hero');
  heroElements.forEach(element => {
    if (!element.dataset.initialized) {
      new AdvancedHero(element);
      element.dataset.initialized = 'true';
    }
  });
});

// Export for manual initialization
window.AdvancedHero = AdvancedHero;
