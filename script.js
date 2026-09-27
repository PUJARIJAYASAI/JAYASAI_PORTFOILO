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
            }, index * 200);
        });

        setTimeout(() => {
            preloader.classList.add('hidden');
            setTimeout(() => preloader.style.display = 'none', 800); 
            startHeroAnimations();
        }, loaderLines.length * 200 + 400); 
    };

    // 2. HERO ANIMATIONS TRIGGER
    const startHeroAnimations = () => {
        // Hero Reveal Animations
        const heroReveals = document.querySelectorAll('.hero .reveal, .hero .reveal-up');
        heroReveals.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('active');
            }, index * 150);
        });
        startTyping();
        
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

    // 8. LIGHTBOX LOGIC
    const lightbox = document.getElementById('cert-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.lightbox-close');

    if (lightbox) {
        document.querySelectorAll('.clickable-cert, .view-trigger').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                const card = trigger.closest('.cert-card');
                const img = card.querySelector('img');
                const title = card.querySelector('.cert-title').textContent;
                
                lightbox.style.display = 'block';
                lightboxImg.src = img.src;
                lightboxCaption.textContent = title;
                document.body.style.overflow = 'hidden'; // Prevent scroll
            });
        });

        const closeLightbox = () => {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scroll
        };

        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        
        // Escape key close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });
    }

    // 9. CARD EXPAND/COLLAPSE
    document.querySelectorAll('.skill-context-card, .cert-card, .project-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't toggle if clicking on a link or button inside the card
            if (e.target.closest('a, button, .clickable-cert, .view-trigger')) return;
            card.classList.toggle('expanded');
        });
    });

    // 10. THEME TOGGLE
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('portfolio-theme');
    
    // Apply saved theme on load
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.textContent = '☀️';
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'light') {
            document.documentElement.removeAttribute('data-theme');
            themeToggle.textContent = '🌙';
            localStorage.setItem('portfolio-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            themeToggle.textContent = '☀️';
            localStorage.setItem('portfolio-theme', 'light');
        }
    });

    // 11. HERO TERMINAL CLI
    const cliInput = document.getElementById('hero-cli-input');
    const cliOutput = document.getElementById('hero-cli-output');
    const cliChips = document.querySelectorAll('.cli-chip');

    const executeCliCommand = (cmd) => {
        const cleanCmd = cmd.trim().toLowerCase();
        if (!cleanCmd) return;

        if (cleanCmd === 'clear' || cleanCmd === 'cls') {
            cliOutput.innerHTML = '';
            cliOutput.classList.remove('active');
            if (cliInput) cliInput.value = '';
            return;
        }

        cliOutput.classList.add('active');

        let response = '';
        if (cleanCmd === 'help') {
            response = 'Available commands:<br>' +
                '• <span class="accent-text">projects</span> - View featured engineering projects<br>' +
                '• <span class="accent-text">stack</span> - View technologies & tools<br>' +
                '• <span class="accent-text">whoami</span> - Engineer profile overview<br>' +
                '• <span class="accent-text">contact</span> - Direct contact channels<br>' +
                '• <span class="accent-text">resume</span> - View or download PDF resume<br>' +
                '• <span class="accent-text">clear</span> - Clear terminal output';
        } else if (cleanCmd === 'projects') {
            response = 'Featured Projects:<br>' +
                '1. <a href="#works">Hybrid ML-RL Intrusion Detector</a> (CNN-LSTM + Q-Learning, 98.5% acc)<br>' +
                '2. <a href="#works">Cop Connect</a> (Flask + Firebase civic platform)<br>' +
                '3. <a href="#works">AI Health Intake System</a> (Spring Boot + OpenAI API + K8s)<br>' +
                '<span class="accent-text">Tip: Scroll down to #works to see full case studies.</span>';
        } else if (cleanCmd === 'stack') {
            response = 'Technical Stack:<br>' +
                '• Languages: Python, Java, SQL, JavaScript<br>' +
                '• AI & Data: PyTorch, Scikit-learn, Pandas, NumPy, NLP<br>' +
                '• Backend: Flask, Spring Boot, REST APIs<br>' +
                '• Cloud/DevOps: Docker, Kubernetes, Git, Firebase';
        } else if (cleanCmd === 'whoami') {
            response = 'Jayasai Pujari — Software Engineer & AI/ML Developer.<br>' +
                'Location: Andhra Pradesh, India (UTC+5:30).<br>' +
                'Focus: Building intelligent systems bridging machine learning with scalable backend infrastructure.';
        } else if (cleanCmd === 'contact') {
            response = 'Contact Information:<br>' +
                '• Email: <a href="mailto:pujarijayasai@gmail.com">pujarijayasai@gmail.com</a><br>' +
                '• Phone: +91 9381453961<br>' +
                '• GitHub: <a href="https://github.com/PUJARIJAYASAI" target="_blank" rel="noopener noreferrer">github.com/PUJARIJAYASAI</a><br>' +
                '• LinkedIn: <a href="https://linkedin.com/in/pujarijayasai" target="_blank" rel="noopener noreferrer">linkedin.com/in/pujarijayasai</a>';
        } else if (cleanCmd === 'resume') {
            response = 'Resume Actions:<br>' +
                '• <a href="/assets/resume.pdf" target="_blank" rel="noopener noreferrer">Open Resume PDF</a><br>' +
                '• <a href="/assets/resume.pdf" download="Jayasai_Pujari_Resume.pdf">Download Resume PDF</a>';
        } else {
            response = `Command not recognized: "${cleanCmd}". Type <span class="accent-text">help</span> to view available commands.`;
        }

        const entry = document.createElement('div');
        entry.className = 'cli-log-entry';
        entry.innerHTML = `<div class="cli-echo">&gt; ${cleanCmd}</div><div class="cli-res">${response}</div>`;
        cliOutput.appendChild(entry);
        cliOutput.scrollTop = cliOutput.scrollHeight;

        if (cliInput) cliInput.value = '';
    };

    if (cliInput) {
        cliInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                executeCliCommand(cliInput.value);
            }
        });
    }

    cliChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const cmd = chip.getAttribute('data-cmd');
            if (cmd) executeCliCommand(cmd);
        });
    });

    // 12. PROJECT CATEGORY FILTERS
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.projects-grid .project-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.classList.remove('filter-hidden');
                } else {
                    card.classList.add('filter-hidden');
                }
            });
        });
    });

    // 13. COPY TO CLIPBOARD & HUD TOAST
    const toast = document.getElementById('cyber-toast');
    let toastTimeout = null;

    const showToast = (message) => {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    };

    document.querySelectorAll('.copy-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const textToCopy = trigger.getAttribute('data-copy');
            if (!textToCopy) return;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    showToast(`> COPIED TO CLIPBOARD: ${textToCopy}`);
                }).catch(() => {
                    fallbackCopy(textToCopy);
                });
            } else {
                fallbackCopy(textToCopy);
            }
        });
    });

    const fallbackCopy = (text) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showToast(`> COPIED TO CLIPBOARD: ${text}`);
        } catch (err) {
            showToast(`> MANUAL COPY: ${text}`);
        }
        document.body.removeChild(textarea);
    };

    // Start loading sequence
    loadSystem();

});
