class InteractiveProductShowcase {
  constructor(element) {
    this.element = element;
    this.filterTabs = this.element.querySelectorAll('.interactive-showcase__filter-tab');
    this.viewButtons = this.element.querySelectorAll('.interactive-showcase__view-btn');
    this.collections = this.element.querySelectorAll('.interactive-showcase__collection');
    this.grid = this.element.querySelector('.interactive-showcase__grid');
    this.modal = this.element.querySelector('.interactive-showcase__modal');
    this.modalBody = this.element.querySelector('.interactive-showcase__modal-body');
    this.modalClose = this.element.querySelector('.interactive-showcase__modal-close');
    
    this.currentCollection = this.filterTabs[0]?.dataset.collection || '';
    this.currentView = 'grid';
    this.loadedProducts = new Set();
    
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
    
    // View toggle
    this.viewButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchView(btn.dataset.view);
      });
    });
    
    // Quick actions
    this.element.addEventListener('click', (e) => {
      const quickBtn = e.target.closest('.interactive-showcase__quick-btn');
      if (quickBtn) {
        e.preventDefault();
        this.handleQuickAction(quickBtn);
      }
      
      const loadMoreBtn = e.target.closest('.interactive-showcase__load-more-btn');
      if (loadMoreBtn) {
        e.preventDefault();
        this.loadMoreProducts(loadMoreBtn.dataset.collection);
      }
    });
    
    // Modal
    if (this.modalClose) {
      this.modalClose.addEventListener('click', () => this.closeModal());
    }
    
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal || e.target.classList.contains('interactive-showcase__modal-overlay')) {
          this.closeModal();
        }
      });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
        this.closeModal();
      }
    });
    
    // Add to cart forms
    this.element.addEventListener('submit', (e) => {
      const form = e.target.closest('.interactive-showcase__cart-form');
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
    
    this.element.querySelectorAll('.interactive-showcase__product-card').forEach(card => {
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
    
    // Update collections with fade effect
    this.collections.forEach(collection => {
      if (collection.dataset.collection === collectionHandle) {
        collection.style.opacity = '0';
        collection.classList.add('active');
        
        // Fade in
        requestAnimationFrame(() => {
          collection.style.transition = 'opacity 0.3s ease';
          collection.style.opacity = '1';
        });
      } else {
        collection.style.opacity = '0';
        setTimeout(() => {
          collection.classList.remove('active');
        }, 300);
      }
    });
    
    this.currentCollection = collectionHandle;
    
    // Re-observe new products
    setTimeout(() => {
      this.setupIntersectionObserver();
    }, 300);
  }
  
  switchView(viewType) {
    if (viewType === this.currentView) return;
    
    // Update view buttons
    this.viewButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewType);
    });
    
    // Update grid class
    const activeGrid = this.element.querySelector('.interactive-showcase__collection.active .interactive-showcase__grid');
    if (activeGrid) {
      activeGrid.classList.toggle('list-view', viewType === 'list');
    }
    
    this.currentView = viewType;
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
      case 'compare':
        this.addToCompare(productId);
        break;
    }
    
    // Remove loading state
    setTimeout(() => {
      button.style.pointerEvents = '';
      button.style.opacity = '';
    }, 1000);
  }
  
  async openQuickView(productId) {
    try {
      // Show modal with loading
      this.modal.classList.add('active');
      this.modalBody.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
          <div style="width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top: 3px solid #e74c3c; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
          <p>Loading product details...</p>
        </div>
      `;
      
      // Fetch product data (you would implement this based on your API)
      const response = await fetch(`/products/${productId}.js`);
      const product = await response.json();
      
      // Render quick view content
      this.renderQuickView(product);
      
    } catch (error) {
      console.error('Error loading quick view:', error);
      this.modalBody.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
          <p>Sorry, we couldn't load the product details. Please try again.</p>
        </div>
      `;
    }
  }
  
  renderQuickView(product) {
    this.modalBody.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; max-width: 800px;">
        <div>
          <img src="${product.featured_image}" alt="${product.title}" style="width: 100%; border-radius: 0.5rem;">
        </div>
        <div>
          <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem;">${product.title}</h2>
          <div style="font-size: 1.25rem; font-weight: 600; color: #e74c3c; margin-bottom: 1rem;">
            ${this.formatPrice(product.price)}
          </div>
          <div style="margin-bottom: 1.5rem; line-height: 1.6;">
            ${product.description}
          </div>
          <button onclick="window.location.href='${product.url}'" 
                  style="width: 100%; padding: 1rem; background: #e74c3c; color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer;">
            View Full Details
          </button>
        </div>
      </div>
    `;
  }
  
  addToWishlist(productId) {
    // Implement wishlist functionality
    console.log('Adding to wishlist:', productId);
    
    // Show success message
    this.showNotification('Added to wishlist!', 'success');
  }
  
  addToCompare(productId) {
    // Implement compare functionality
    console.log('Adding to compare:', productId);
    
    // Show success message
    this.showNotification('Added to compare!', 'success');
  }
  
  async handleAddToCart(form) {
    const formData = new FormData(form);
    const button = form.querySelector('.interactive-showcase__add-to-cart');
    
    // Add loading state
    const originalText = button.innerHTML;
    button.innerHTML = 'Adding...';
    button.disabled = true;
    
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        this.showNotification('Added to cart!', 'success');
        this.updateCartCount();
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showNotification('Error adding to cart. Please try again.', 'error');
    } finally {
      // Reset button
      button.innerHTML = originalText;
      button.disabled = false;
    }
  }
  
  async loadMoreProducts(collectionHandle) {
    const collection = this.element.querySelector(`[data-collection="${collectionHandle}"]`);
    const grid = collection.querySelector('.interactive-showcase__grid');
    const loadMoreBtn = collection.querySelector('.interactive-showcase__load-more-btn');
    
    // Add loading state
    loadMoreBtn.innerHTML = 'Loading...';
    loadMoreBtn.disabled = true;
    
    try {
      // This would be implemented based on your pagination system
      // For now, we'll simulate loading more products
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Hide load more button (simulate no more products)
      collection.querySelector('.interactive-showcase__load-more').style.display = 'none';
      
    } catch (error) {
      console.error('Error loading more products:', error);
      loadMoreBtn.innerHTML = 'Load More Products';
      loadMoreBtn.disabled = false;
    }
  }
  
  closeModal() {
    this.modal.classList.remove('active');
  }
  
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 2rem;
      right: 2rem;
      background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      z-index: 10000;
      animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
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
        });
    }
  }
  
  formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100);
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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
window.InteractiveProductShowcase = InteractiveProductShowcase;
