class PremiumProductShowcase {
  constructor(element) {
    this.element = element;
    this.filterTabs = this.element.querySelectorAll('.premium-showcase__filter-tab');
    this.collections = this.element.querySelectorAll('.premium-showcase__collection');
    this.currentCollection = this.filterTabs[0]?.dataset.collection || '';
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.setupIntersectionObserver();
    this.initializeFilters();
  }
  
  setupEventListeners() {
    // Filter tabs
    this.filterTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchCollection(tab.dataset.collection);
      });
    });
    
    // Quick actions
    this.element.addEventListener('click', (e) => {
      const quickBtn = e.target.closest('.premium-showcase__quick-btn');
      if (quickBtn) {
        e.preventDefault();
        this.handleQuickAction(quickBtn);
      }
      
      const loadMoreBtn = e.target.closest('.premium-showcase__load-more .btn');
      if (loadMoreBtn) {
        e.preventDefault();
        this.handleLoadMore(loadMoreBtn);
      }
    });
    
    // Add to cart forms
    this.element.addEventListener('submit', (e) => {
      const form = e.target.closest('.premium-showcase__cart-form');
      if (form) {
        e.preventDefault();
        this.handleAddToCart(form);
      }
    });
  }
  
  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });
    
    this.element.querySelectorAll('.premium-showcase__product-card').forEach(card => {
      observer.observe(card);
    });
  }
  
  initializeFilters() {
    // Set initial active states
    this.filterTabs[0]?.classList.add('active');
    this.collections[0]?.classList.add('active');
  }
  
  switchCollection(collectionHandle) {
    if (collectionHandle === this.currentCollection) return;
    
    // Update filter tabs
    this.filterTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.collection === collectionHandle);
    });
    
    // Update collections with smooth transition
    this.collections.forEach(collection => {
      if (collection.dataset.collection === collectionHandle) {
        collection.style.opacity = '0';
        collection.classList.add('active');
        
        // Fade in with stagger
        requestAnimationFrame(() => {
          collection.style.transition = 'opacity 0.4s ease';
          collection.style.opacity = '1';
          
          // Stagger product cards
          const cards = collection.querySelectorAll('.premium-showcase__product-card');
          cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
          });
        });
      } else {
        collection.style.opacity = '0';
        setTimeout(() => {
          collection.classList.remove('active');
        }, 400);
      }
    });
    
    this.currentCollection = collectionHandle;
    
    // Re-observe new products
    setTimeout(() => {
      this.setupIntersectionObserver();
    }, 400);
  }
  
  handleQuickAction(button) {
    const action = button.dataset.action;
    const productId = button.dataset.productId;
    
    // Add loading state
    button.style.pointerEvents = 'none';
    button.style.opacity = '0.7';
    
    switch (action) {
      case 'quick-view':
        this.openQuickView(productId);
        break;
      case 'add-to-wishlist':
        this.addToWishlist(productId);
        break;
    }
    
    // Remove loading state
    setTimeout(() => {
      button.style.pointerEvents = '';
      button.style.opacity = '';
    }, 1000);
  }
  
  openQuickView(productId) {
    // Implement quick view functionality
    console.log('Opening quick view for product:', productId);
    this.showNotification('Quick view feature coming soon!', 'info');
  }
  
  addToWishlist(productId) {
    // Implement wishlist functionality
    console.log('Adding to wishlist:', productId);
    this.showNotification('Added to wishlist!', 'success');
  }
  
  async handleAddToCart(form) {
    const formData = new FormData(form);
    const button = form.querySelector('.btn');
    
    // Add loading state
    const originalText = button.innerHTML;
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="animation: spin 1s linear infinite;">
        <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="37.7" stroke-dashoffset="37.7" style="animation: dash 2s ease-in-out infinite;"/>
      </svg>
      Adding...
    `;
    button.disabled = true;
    
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        this.showNotification('Added to cart!', 'success');
        this.updateCartCount();
        
        // Success animation
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.5 5.5L6.5 12.5L2.5 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Added!
        `;
        
        setTimeout(() => {
          button.innerHTML = originalText;
          button.disabled = false;
        }, 2000);
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showNotification('Error adding to cart. Please try again.', 'error');
      
      // Reset button
      button.innerHTML = originalText;
      button.disabled = false;
    }
  }
  
  handleLoadMore(button) {
    const collection = button.dataset.collection;
    console.log('Loading more products for:', collection);
    
    // Add loading state
    const originalText = button.innerHTML;
    button.innerHTML = 'Loading...';
    button.disabled = true;
    
    // Simulate loading
    setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
      this.showNotification('Feature coming soon!', 'info');
    }, 1000);
  }
  
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 2rem;
      right: 2rem;
      background: ${type === 'success' ? 'var(--color-secondary)' : type === 'error' ? 'var(--color-accent)' : 'var(--color-primary)'};
      color: ${type === 'success' ? 'var(--color-primary)' : 'var(--color-white)'};
      padding: 1rem 1.5rem;
      border-radius: var(--radius-lg);
      font-weight: 500;
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      box-shadow: var(--shadow-xl);
      backdrop-filter: blur(10px);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
  
  updateCartCount() {
    // Update cart count in header if it exists
    const cartCount = document.querySelector('.furniture-header__cart-count');
    if (cartCount) {
      fetch('/cart.js')
        .then(response => response.json())
        .then(cart => {
          cartCount.textContent = cart.item_count;
          if (cart.item_count > 0) {
            cartCount.style.display = 'flex';
          }
        })
        .catch(error => console.error('Error updating cart count:', error));
    }
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes dash {
    0% { stroke-dashoffset: 37.7; }
    50% { stroke-dashoffset: 0; }
    100% { stroke-dashoffset: -37.7; }
  }
  
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Export for manual initialization
window.PremiumProductShowcase = PremiumProductShowcase;
