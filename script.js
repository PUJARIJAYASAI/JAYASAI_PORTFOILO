document.addEventListener('DOMContentLoaded', () => {
    // 1. PRELOADER LOGIC
    const preloader = document.getElementById('preloader');
    const loaderLines = document.querySelectorAll('.loader-line');
    const loaderBar = document.querySelector('.loader-bar');
    
    let loadProgress = 0;
    const loadSystem = () => {
        loaderLines.forEach((line, index) => {
            setTimeout(() => {
                line.style.opacity = '1';
                line.style.transform = 'translateY(0)';
                loadProgress += 33.3;
                loaderBar.style.width = `${loadProgress}%`;
            }, index * 200); // Speed up line reveal
        });

        setTimeout(() => {
            preloader.classList.add('hidden');
            setTimeout(() => preloader.style.display = 'none', 800); // Fully remove after transition
            startHeroAnimations();
        }, loaderLines.length * 200 + 400); // Reduce total wait time
    };

    // 2. HERO ANIMATIONS TRIGGER
    const startHeroAnimations = () => {
        // Target all reveal elements in the hero to prevent the blank screen issue
        const heroReveals = document.querySelectorAll('.hero .reveal, .hero .reveal-up');
        heroReveals.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('active');
            }, index * 150);
        });
        startTyping();
        
        // Trigger onScroll once to catch any other elements already in the viewport
        setTimeout(onScroll, 100);
    };

    // 3. TYPING EFFECT
    const typingText = document.getElementById('typing-text');
    const phrases = ["AI/ML Developer", "Full-Stack Engineer", "Problem Solver"];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    const startTyping = () => {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            typingText.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            typingText.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500;
        }

        setTimeout(startTyping, typeSpeed);
    };

    // 4. SCROLL PROGRESS & REVEAL
    const scrollProgress = document.getElementById('scroll-progress');
    const reveals = document.querySelectorAll('.reveal, .reveal-up');
    
    const onScroll = () => {
        // Scroll Progress
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        scrollProgress.style.width = scrolled + "%";

        // Reveal on Scroll
        const windowHeight = window.innerHeight;
        reveals.forEach(reveal => {
            const revealTop = reveal.getBoundingClientRect().top;
            if (revealTop < windowHeight - 100) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', onScroll);

    // 5. MOBILE MENU LOGIC
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-links a');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    // 6. INTERSECTION OBSERVER FOR NAV
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Nav Highlight
                const id = entry.target.getAttribute('id');
                if (id) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            }
        });
    }, { threshold: 0.2 });

    sections.forEach(section => observer.observe(section));

    // 7. SMOOTH SCROLL
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Start loading sequence
    loadSystem();

    console.log('%c SYSTEM ONLINE: ACTIVE ', 'background: #00ff41; color: #0a0a0a; font-weight: bold; padding: 5px;');
});
