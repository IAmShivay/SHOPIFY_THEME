class LuxuryHero {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      autoplay: true,
      autoplaySpeed: 7000,
      enableParallax: true,
      transitionDuration: 1200,
      ...options
    };
    
    this.currentSlide = 0;
    this.slides = this.element.querySelectorAll('.luxury-hero__slide');
    this.slideContents = this.element.querySelectorAll('.luxury-hero__slide-content');
    this.dots = this.element.querySelectorAll('.luxury-hero__dot');
    this.prevButton = this.element.querySelector('.luxury-hero__arrow--prev');
    this.nextButton = this.element.querySelector('.luxury-hero__arrow--next');
    this.progressBar = this.element.querySelector('.luxury-hero__progress-bar');
    
    this.autoplayTimer = null;
    this.progressTimer = null;
    this.isTransitioning = false;
    this.isVisible = false;
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.setupParallax();
    this.setupIntersectionObserver();
    
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
    
    // Initialize first slide
    this.updateSlide(0, false);
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
      if (!this.isVisible) return;
      
      if (e.key === 'ArrowLeft') this.previousSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
      if (e.key === ' ') {
        e.preventDefault();
        this.toggleAutoplay();
      }
    });
    
    // Touch/swipe support
    this.setupTouchEvents();
    
    // Pause autoplay on hover
    this.element.addEventListener('mouseenter', () => this.pauseAutoplay());
    this.element.addEventListener('mouseleave', () => this.resumeAutoplay());
    
    // Window resize
    window.addEventListener('resize', () => this.handleResize());
  }
  
  setupTouchEvents() {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    
    this.element.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    
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
    }, { passive: true });
  }
  
  setupParallax() {
    if (!this.options.enableParallax) return;
    
    let ticking = false;
    
    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.3;
      const heroRect = this.element.getBoundingClientRect();
      
      // Only apply parallax when hero is visible
      if (heroRect.bottom > 0 && heroRect.top < window.innerHeight) {
        this.slides.forEach(slide => {
          const media = slide.querySelector('.luxury-hero__video, .luxury-hero__image');
          if (media) {
            media.style.transform = `translate(-50%, calc(-50% + ${rate}px)) scale(1.1)`;
          }
        });
      }
      
      ticking = false;
    };
    
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', requestTick, { passive: true });
  }
  
  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
        
        if (entry.isIntersecting) {
          this.resumeAutoplay();
          this.animateCurrentSlide();
        } else {
          this.pauseAutoplay();
        }
      });
    }, {
      threshold: 0.3
    });
    
    observer.observe(this.element);
  }
  
  goToSlide(index) {
    if (this.isTransitioning || index === this.currentSlide) return;
    
    this.updateSlide(index, true);
  }
  
  updateSlide(index, animate = true) {
    this.isTransitioning = true;
    
    // Update slides
    this.slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    
    // Update content with stagger
    this.slideContents.forEach((content, i) => {
      content.classList.remove('active');
      
      if (i === index) {
        setTimeout(() => {
          content.classList.add('active');
        }, animate ? 300 : 0);
      }
    });
    
    // Update dots
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    
    this.currentSlide = index;
    
    // Reset transition flag
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.options.transitionDuration);
    
    // Restart autoplay progress
    if (this.options.autoplay && this.isVisible) {
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
    if (this.options.autoplay && !this.autoplayTimer && this.isVisible) {
      this.startAutoplay();
    }
  }
  
  toggleAutoplay() {
    if (this.autoplayTimer) {
      this.pauseAutoplay();
    } else {
      this.resumeAutoplay();
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
    if (this.options.autoplay && this.isVisible) {
      this.startProgress();
    }
  }
  
  animateCurrentSlide() {
    const currentContent = this.slideContents[this.currentSlide];
    if (currentContent) {
      currentContent.classList.remove('active');
      
      setTimeout(() => {
        currentContent.classList.add('active');
      }, 100);
    }
  }
  
  handleResize() {
    // Recalculate parallax on resize
    if (this.options.enableParallax) {
      this.setupParallax();
    }
  }
  
  destroy() {
    this.pauseAutoplay();
    // Remove event listeners and clean up
  }
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  const heroElements = document.querySelectorAll('.luxury-hero');
  heroElements.forEach(element => {
    if (!element.dataset.initialized) {
      new LuxuryHero(element);
      element.dataset.initialized = 'true';
    }
  });
});

// Export for manual initialization
window.LuxuryHero = LuxuryHero;
