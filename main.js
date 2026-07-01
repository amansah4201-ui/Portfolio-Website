/**
 * Aman Sahu - Portfolio Website Script
 * Interactive logic, Canvas neural net particles, Typewriter, Scroll observers, and theme controller.
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================================================
  // DYNAMIC FOOTER YEAR
  // ==========================================================================
  const footerYear = document.getElementById('footerYear');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  // ==========================================================================
  // LIGHT / DARK MODE CONTROLLER
  // ==========================================================================
  const themeToggle = document.getElementById('themeToggle');
  
  // Set default theme to Light Mode (clean, formal corporate appearance)
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Dispatch custom event to let canvas redraw if colors change
    window.dispatchEvent(new CustomEvent('themechanged', { detail: { isDark } }));
  });

  // ==========================================================================
  // MOBILE NAVIGATION HAMBURGER MENU
  // ==========================================================================
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  const toggleMobileMenu = () => {
    const isActive = menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  };

  const closeMobileMenu = () => {
    menuToggle.classList.remove('active');
    navMenu.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  menuToggle.addEventListener('click', toggleMobileMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('active') && 
        !navMenu.contains(e.target) && 
        !menuToggle.contains(e.target)) {
      closeMobileMenu();
    }
  });

  // ==========================================================================
  // SCROLL PROGRESS BAR & SCROLL-TO-TOP BUTTON
  // ==========================================================================
  const progressBar = document.getElementById('progressBar');
  const scrollToTopBtn = document.getElementById('scrollToTop');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    
    if (progressBar) {
      progressBar.style.width = `${scrollPercent}%`;
    }

    if (scrollToTopBtn) {
      if (scrollTop > 300) {
        scrollToTopBtn.classList.add('show');
      } else {
        scrollToTopBtn.classList.remove('show');
      }
    }
  });

  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ==========================================================================
  // TYPEWRITER ANIMATION (HERO SECTION)
  // ==========================================================================
  const typingTextSpan = document.getElementById('typing-text');
  const roles = [
    'AI Engineer',
    'Machine Learning Engineer',
    'Data Scientist',
    'Python Developer'
  ];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  const type = () => {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
      typingTextSpan.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      typingTextSpan.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 120;
    }

    if (!isDeleting && charIndex === currentRole.length) {
      isDeleting = true;
      typingSpeed = 2000; // Pause at full word
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 500; // Pause before typing next word
    }

    setTimeout(type, typingSpeed);
  };

  if (typingTextSpan) {
    setTimeout(type, 1000);
  }

  // ==========================================================================
  // INTERSECTION OBSERVER (REVEAL ON SCROLL & SKILL BARS & COUNTERS)
  // ==========================================================================
  
  // Reveal elements on scroll
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // Skills fill bar activation
  const skillsGrid = document.getElementById('skillsGrid');
  if (skillsGrid) {
    const skillsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });
    skillsObserver.observe(skillsGrid);
  }

  // Stats / Achievements count-up animation
  const counters = document.querySelectorAll('.counter, .stat-number');
  const runCounter = (counter) => {
    const target = +counter.getAttribute('data-target');
    const duration = 2000; // 2 seconds
    const stepTime = Math.max(Math.floor(duration / target), 15);
    let start = 0;
    
    const timer = setInterval(() => {
      start += Math.ceil(target / (duration / stepTime));
      if (start >= target) {
        counter.textContent = target;
        clearInterval(timer);
      } else {
        counter.textContent = start;
      }
    }, stepTime);
  };

  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => statsObserver.observe(counter));

  // ==========================================================================
  // CANVASES & NEURAL PARTICLE SYSTEM
  // ==========================================================================
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let animationId;
    
    // Set colors based on theme - muted and subtle
    let particleColor = 'rgba(30, 64, 175, 0.1)'; 
    let connectorColor = 'rgba(30, 64, 175, 0.02)'; 
    
    const updateColors = () => {
      const isDark = document.body.classList.contains('dark-mode');
      if (isDark) {
        particleColor = 'rgba(148, 163, 184, 0.15)'; // Muted slate gray
        connectorColor = 'rgba(148, 163, 184, 0.03)';
      } else {
        particleColor = 'rgba(30, 64, 175, 0.1)'; // Very soft corporate blue
        connectorColor = 'rgba(30, 64, 175, 0.02)';
      }
    };
    
    updateColors();
    window.addEventListener('themechanged', updateColors);

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
      initParticles();
    };

    class Particle {
      constructor(x, y, directionX, directionY, size) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = particleColor;
        ctx.fill();
      }
      
      update() {
        // Bounce off canvas edges
        if (this.x > canvas.width || this.x < 0) {
          this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
          this.directionY = -this.directionY;
        }
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
      }
    }

    const initParticles = () => {
      particlesArray = [];
      // Adjust density based on width
      const numberOfParticles = Math.floor((canvas.width * canvas.height) / 13000);
      
      for (let i = 0; i < numberOfParticles; i++) {
        const size = (Math.random() * 2) + 1;
        const x = Math.random() * (canvas.width - size * 2) + size;
        const y = Math.random() * (canvas.height - size * 2) + size;
        const directionX = (Math.random() * 0.4) - 0.2;
        const directionY = (Math.random() * 0.4) - 0.2;
        
        particlesArray.push(new Particle(x, y, directionX, directionY, size));
      }
    };

    const drawConnectors = () => {
      const maxDistance = 140;
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const distSq = ((particlesArray[a].x - particlesArray[b].x) ** 2) + 
                          ((particlesArray[a].y - particlesArray[b].y) ** 2);
          
          if (distSq < maxDistance * maxDistance) {
            ctx.strokeStyle = connectorColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
      }
      drawConnectors();
      animationId = requestAnimationFrame(animateParticles);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animateParticles();
  }

  // ==========================================================================
  // DOWNLOAD RESUME (PRINT TRIGGER WORKAROUND FOR STATIC ATS RESUME)
  // ==========================================================================
  const downloadResume = document.getElementById('downloadResume');
  if (downloadResume) {
    downloadResume.addEventListener('click', (e) => {
      e.preventDefault();
      // Since it's a static site, we trigger a window.print() representing printing to PDF.
      // This is a premium way to offer an ATS-compatible resume dynamically!
      // In CSS, print styles will format the page beautifully as a 1-2 page standard clean resume.
      window.print();
    });
  }

  // ==========================================================================
  // CONTACT FORM VALIDATION & HANDLING
  // ==========================================================================
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      // Visual feedback loading state
      submitBtn.textContent = 'Sending Message...';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';

      setTimeout(() => {
        // Success state simulation
        submitBtn.textContent = 'Message Sent Successfully!';
        submitBtn.style.backgroundColor = '#10B981'; // Green
        submitBtn.style.backgroundImage = 'none';
        contactForm.reset();

        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.style.backgroundColor = '';
          submitBtn.style.backgroundImage = '';
        }, 3000);
      }, 1500);
    });
  }
});
