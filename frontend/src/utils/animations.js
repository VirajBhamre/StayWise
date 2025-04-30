import { gsap } from 'gsap';

// Master function to initialize animations
export const initAnimations = () => {
  // Create a master timeline for coordinated animations
  const masterTimeline = gsap.timeline();
  return masterTimeline;
};

// Animated counter for statistics
export const animateCountUp = (selector, duration = 2) => {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach(element => {
    const target = parseInt(element.getAttribute('data-target'), 10);
    const startValue = 0;
    
    // Calculate increment step
    const increment = target / 100;
    
    // Create counter
    let currentValue = startValue;
    
    // Animation duration in ms
    const animDuration = Math.min(Math.max(duration * 1000, 1000), 3000);
    const updateFrequency = 10; // ms
    const totalSteps = animDuration / updateFrequency;
    const incrementPerStep = target / totalSteps;
    
    // Start counter
    const counter = setInterval(() => {
      currentValue += incrementPerStep;
      
      // Check if target is reached
      if (currentValue >= target) {
        element.textContent = target;
        clearInterval(counter);
      } else {
        element.textContent = Math.floor(currentValue);
      }
    }, updateFrequency);
  });
};

// Create 3D tilt effect on hover
export const create3DTiltEffect = (selector, perspective = 500, tiltFactor = 10) => {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach(element => {
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const xPercent = x / rect.width;
      const yPercent = y / rect.height;
      
      // Calculate rotation angles
      const rotateX = (0.5 - yPercent) * tiltFactor;
      const rotateY = (xPercent - 0.5) * tiltFactor;
      
      // Apply transform
      element.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    // Reset on mouse leave
    element.addEventListener('mouseleave', () => {
      gsap.to(element, {
        transform: 'perspective(500px) rotateX(0deg) rotateY(0deg)',
        duration: 0.5,
        ease: 'power2.out'
      });
    });
  });
};

// Create shimmer effect for buttons and cards
export const createShimmerEffect = (selector) => {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach(element => {
    // Create shimmer overlay
    const overlay = document.createElement('div');
    overlay.classList.add('shimmer-overlay');
    
    // Add to element
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(overlay);
    
    // Animate shimmer on hover
    element.addEventListener('mouseenter', () => {
      gsap.to(overlay, {
        left: '150%',
        duration: 1.2,
        ease: 'power2.inOut'
      });
    });
    
    // Reset on mouse leave
    element.addEventListener('mouseleave', () => {
      gsap.set(overlay, { left: '-150%' });
    });
  });
};

// Create ripple effect for buttons
export const createRippleEffect = (selector) => {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach(element => {
    element.addEventListener('click', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Create ripple element
      const ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');
      
      // Set position and add to element
      ripple.style.top = y + 'px';
      ripple.style.left = x + 'px';
      
      element.appendChild(ripple);
      
      // Animate ripple
      gsap.to(ripple, {
        width: Math.max(rect.width, rect.height) * 2.5,
        height: Math.max(rect.width, rect.height) * 2.5,
        x: -Math.max(rect.width, rect.height) * 1.25 + x,
        y: -Math.max(rect.width, rect.height) * 1.25 + y,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
          element.removeChild(ripple);
        }
      });
    });
  });
};

// Text reveal animations
export const createTextReveal = (selector) => {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach(element => {
    // Get text content and wrap each letter in a span
    const text = element.textContent;
    const letters = text.split('');
    
    // Clear element content
    element.textContent = '';
    
    // Add spans for each letter
    letters.forEach(letter => {
      const span = document.createElement('span');
      span.textContent = letter === ' ' ? '\u00A0' : letter; // Use non-breaking space for spaces
      element.appendChild(span);
    });
    
    // Set up the animation
    gsap.fromTo(
      element.querySelectorAll('span'),
      {
        opacity: 0,
        y: 20,
        rotateX: 90
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        stagger: 0.03,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2
      }
    );
  });
};

// Add parallax effect to elements
export const createParallaxEffect = (containerSelector, elements, sensitivity = 20) => {
  const container = document.querySelector(containerSelector);
  
  if (!container) return;
  
  const elementsList = elements.map(item => ({
    element: document.querySelector(item.selector),
    depth: item.depth || 0.1
  }));
  
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    elementsList.forEach(item => {
      if (item.element) {
        const shiftX = x * item.depth / sensitivity;
        const shiftY = y * item.depth / sensitivity;
        
        gsap.to(item.element, {
          x: shiftX,
          y: shiftY,
          duration: 0.8,
          ease: 'power1.out'
        });
      }
    });
  });
  
  // Reset on mouse leave
  container.addEventListener('mouseleave', () => {
    elementsList.forEach(item => {
      if (item.element) {
        gsap.to(item.element, {
          x: 0,
          y: 0,
          duration: 1,
          ease: 'power2.out'
        });
      }
    });
  });
};

// Create typing animation for text
export const createTypingAnimation = (selector, text, speed = 50, delay = 0) => {
  const element = document.querySelector(selector);
  
  if (!element) return;
  
  // Clear element content and add cursor class
  element.textContent = '';
  element.classList.add('cursor-blink');
  
  // Set initial delay
  let currentDelay = delay;
  
  // Type each character one by one
  for (let i = 0; i < text.length; i++) {
    setTimeout(() => {
      element.textContent += text.charAt(i);
      
      // Remove cursor class when typing is done
      if (i === text.length - 1) {
        setTimeout(() => {
          element.classList.remove('cursor-blink');
        }, 1000);
      }
    }, currentDelay);
    
    currentDelay += speed;
  }
};

// Create animated gradients on elements
export const createAnimatedGradient = (selector, colors, duration = 10) => {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach(element => {
    // Create gradient background
    element.style.backgroundSize = '400% 400%';
    element.style.backgroundImage = `linear-gradient(45deg, ${colors.join(', ')})`;
    
    // Animate gradient
    gsap.to(element, {
      backgroundPosition: '100% 100%',
      duration: duration,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  });
};

// Staggered animation for lists
export const createStaggeredAnimation = (containerSelector, itemSelector, staggerTime = 0.1) => {
  const container = document.querySelector(containerSelector);
  
  if (!container) return;
  
  const items = container.querySelectorAll(itemSelector);
  
  // Set initial state
  gsap.set(items, { opacity: 0, y: 20 });
  
  // Create the animation
  gsap.to(items, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: staggerTime,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: container,
      start: 'top 80%'
    }
  });
};

// Create morphing blob animation
export const createMorphingBlob = (selector, pathValues, duration = 5) => {
  const element = document.querySelector(selector);
  
  if (!element || !element.tagName === 'PATH') return;
  
  // Animate between different path values
  gsap.to(element, {
    attr: { d: pathValues },
    duration: duration,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });
};

// Create floating animation
export const createFloatingAnimation = (selector, amplitude = 10, duration = 3) => {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach(element => {
    gsap.to(element, {
      y: `-=${amplitude}`,
      duration: duration,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  });
};

// Create scroll-triggered animations
export const createScrollTriggeredAnimation = (selector, animation, options = {}) => {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach(element => {
    gsap.set(element, { opacity: 0, ...animation.from });
    
    gsap.to(element, {
      opacity: 1,
      ...animation.to,
      duration: options.duration || 1,
      ease: options.ease || 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: options.start || 'top 80%',
        end: options.end || 'bottom 20%',
        toggleActions: options.toggleActions || 'play none none reverse'
      }
    });
  });
};

// Create pulse animation
export const createPulseAnimation = (selector, scale = 1.05, duration = 1.5) => {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach(element => {
    gsap.to(element, {
      scale: scale,
      duration: duration,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  });
};

// Create shine effect on text
export const createShineEffect = (selector, duration = 3) => {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach(element => {
    // Create linear gradient for shine
    const gradient = document.createElement('div');
    gradient.style.position = 'absolute';
    gradient.style.top = '0';
    gradient.style.left = '-100%';
    gradient.style.width = '50%';
    gradient.style.height = '100%';
    gradient.style.background = 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)';
    gradient.style.transform = 'skewX(-25deg)';
    gradient.style.pointerEvents = 'none';
    
    // Set up the element for the effect
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(gradient);
    
    // Create animation
    gsap.to(gradient, {
      left: '150%',
      duration: duration,
      repeat: -1,
      repeatDelay: 4,
      ease: 'power2.inOut'
    });
  });
};

// Exporting all animation functions
export default {
  initAnimations,
  animateCountUp,
  create3DTiltEffect,
  createShimmerEffect,
  createRippleEffect,
  createTextReveal,
  createParallaxEffect,
  createTypingAnimation,
  createAnimatedGradient,
  createStaggeredAnimation,
  createMorphingBlob,
  createFloatingAnimation,
  createScrollTriggeredAnimation,
  createPulseAnimation,
  createShineEffect
};