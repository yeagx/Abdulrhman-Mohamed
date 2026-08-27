// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Check if GSAP is available
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Hero section animation
        gsap.from(".hero-content", {
            duration: 1.5,
            y: 100,
            opacity: 0,
            ease: "power3.out",
            delay: 0.5,
            onComplete: () => {
                gsap.set(".hero-content", { opacity: 1, y: 0 });
            }
        });

        // About section animation
        gsap.from(".about-content", {
            scrollTrigger: {
                trigger: ".about",
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            duration: 1,
            y: 50,
            opacity: 0,
            ease: "power2.out",
            onComplete: () => {
                gsap.set(".about-content", { opacity: 1, y: 0 });
            }
        });

        // Projects section animation
        gsap.from(".box", {
            scrollTrigger: {
                trigger: ".projects",
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            duration: 0.8,
            y: 60,
            opacity: 0,
            stagger: 0.2,
            ease: "power2.out",
            onComplete: () => {
                gsap.set(".box", { opacity: 1, y: 0 });
            }
        });

        // Contact section animation
        gsap.from(".contact .container", {
            scrollTrigger: {
                trigger: ".contact",
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            duration: 1,
            y: 50,
            opacity: 0,
            ease: "power2.out",
            onComplete: () => {
                gsap.set(".contact .container", { opacity: 1, y: 0 });
            }
        });

        // Footer animation
        gsap.from("footer", {
            scrollTrigger: {
                trigger: "footer",
                start: "top 90%",
                toggleActions: "play none none none"
            },
            duration: 0.8,
            y: 30,
            opacity: 0,
            ease: "power2.out",
            onComplete: () => {
                gsap.set("footer", { opacity: 1, y: 0 });
            }
        });
    }

    // Services section animation with Intersection Observer
    const servicesSection = document.querySelector('.services');
    if (servicesSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -100px 0px'
        });

        observer.observe(servicesSection);
    }

    // YouTube section animation with Intersection Observer
    const youtubeSection = document.querySelector('.youtube');
    if (youtubeSection) {
        const youtubeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    youtubeObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -100px 0px'
        });

        youtubeObserver.observe(youtubeSection);
    }

    // Clash Royale section animation - using ScrollTrigger for consistency
    if (typeof gsap !== 'undefined') {
        const clashTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: ".clash-royale",
                start: "top 75%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            }
        });

        // Animate the clash royale title
        clashTimeline.from(".clash-royale h1", {
            duration: 0.8,
            y: -50,
            opacity: 0,
            ease: "back.out(1.7)"
        })

            // Animate the player info and main deck containers
            .from(".player-info, .main-deck", {
                duration: 0.8,
                y: 50,
                opacity: 0,
                stagger: 0.2,
                ease: "power2.out"
            }, "-=0.4")

            // Animate the stat items
            .from(".stat-item", {
                duration: 0.5,
                scale: 0.8,
                opacity: 0,
                stagger: {
                    amount: 0.6,
                    grid: "auto",
                    from: "center"
                },
                ease: "back.out(1.5)"
            }, "-=0.4")

            // Animate the deck cards
            .from(".deck-card", {
                duration: 0.5,
                y: 30,
                opacity: 0,
                stagger: 0.1,
                ease: "power2.out"
            }, "-=0.2")

            // Animate the achievements chips
            .from(".achievements-chips .chip", {
                duration: 0.4,
                scale: 0,
                opacity: 0,
                stagger: 0.1,
                ease: "back.out(2)"
            }, "-=0.2");
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Back to top button functionality
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});