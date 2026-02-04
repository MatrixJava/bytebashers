// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 300;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background on scroll
const navbar = document.querySelector('.navbar');
const logoImage = document.querySelector('.logo-image');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.style.background = 'rgba(0, 0, 0, 0.98)';
        navbar.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.5)';
        if (logoImage) {
            logoImage.style.height = '80px';
        }
    } else {
        navbar.style.background = 'rgba(0, 0, 0, 0.98)';
        navbar.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.5)';
        if (logoImage) {
            logoImage.style.height = '120px';
        }
    }
    
    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards
const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Observe process steps
const processSteps = document.querySelectorAll('.process-step');
processSteps.forEach((step, index) => {
    step.style.opacity = '0';
    step.style.transform = 'translateX(-30px)';
    step.style.transition = `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`;
    observer.observe(step);
});

// Contact Form Submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const statusEl = contactForm.querySelector('.form-status');
        const originalText = submitBtn.textContent;
        const actionUrl = contactForm.getAttribute('action');

        if (!actionUrl) {
            if (statusEl) statusEl.textContent = 'Form is not configured. Please try again later.';
            return;
        }

        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        if (statusEl) statusEl.textContent = '';

        try {
            const formData = new FormData(contactForm);
            const response = await fetch(actionUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'application/json'
                }
            });

            if (response.ok) {
                submitBtn.textContent = '✓ Message Sent!';
                submitBtn.style.background = 'linear-gradient(135deg, #14b8a6 0%, #10b981 100%)';
                if (statusEl) statusEl.textContent = 'Thanks! We will get back to you shortly.';
                contactForm.reset();
            } else {
                submitBtn.textContent = 'Send Message';
                if (statusEl) statusEl.textContent = 'Something went wrong. Please try again.';
            }
        } catch (error) {
            submitBtn.textContent = 'Send Message';
            if (statusEl) statusEl.textContent = 'Network error. Please try again.';
        } finally {
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3000);
        }
    });
}

// Counter animation for stats
const animateCounter = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target + (element.dataset.suffix || '');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start) + (element.dataset.suffix || '');
        }
    }, 16);
};

// Observe hero stats
const heroStats = document.querySelectorAll('.stat h3');
let statsAnimated = false;

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
            statsAnimated = true;
            heroStats.forEach(stat => {
                const text = stat.textContent;
                const number = parseInt(text.match(/\d+/)[0]);
                const suffix = text.replace(/\d+/, '');
                stat.dataset.suffix = suffix;
                stat.textContent = '0' + suffix;
                animateCounter(stat, number);
            });
        }
    });
}, { threshold: 0.5 });

if (heroStats.length > 0) {
    statsObserver.observe(heroStats[0].parentElement.parentElement);
}

// Parallax effect for hero orbs
window.addEventListener('mousemove', (e) => {
    const orb1 = document.querySelector('.orb-1');
    const orb2 = document.querySelector('.orb-2');
    
    if (orb1 && orb2) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        orb1.style.transform = `translate(${x * 50}px, ${y * 50}px)`;
        orb2.style.transform = `translate(${-x * 30}px, ${-y * 30}px)`;
    }
});

// Add active class to current nav item based on scroll position
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Easter egg: Console message
console.log('%c🚀 ByteBashers', 'font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');
console.log('%cInterested in joining our team? Email us at careers@bytebashers.com', 'font-size: 14px; color: #6366f1;');
