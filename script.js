/* ==========================================================
   Sohit Sharma — Portfolio  ·  script.js
   Lean, dependency-free interaction layer.
   ========================================================== */

(() => {
    'use strict';

    /* --------------------------------------------------
       DOM references
       -------------------------------------------------- */
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    const navbar      = $('#navbar');
    const navToggle   = $('#nav-toggle');
    const navMenu     = $('#nav-menu');
    const navLinks    = $$('.nav-link');
    const backToTop   = $('#back-to-top');
    const form        = $('#contact-form');
    const cursorGlow  = $('#cursor-glow');
    const heroVisual  = $('.hero-visual');

    /* --------------------------------------------------
       1. Navigation & Scroll State
       -------------------------------------------------- */
    const onScroll = () => {
        const scrolled = window.scrollY > 40;
        navbar.classList.toggle('scrolled', scrolled);
        backToTop.classList.toggle('show', window.scrollY > 500);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const open = navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', open);
        });

        // Close mobile menu on link click
        navLinks.forEach(link =>
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            })
        );
    }

    // Active section highlighting (mapping section IDs to closest nav link)
    const sectionNavMap = {
        'hero': '#hero',
        'about': '#about',
        'expertise': '#expertise',
        'experience': '#experience',
        'projects': '#projects',
        'capabilities': '#projects',
        'achievements': '#achievements',
        'education': '#achievements',
        'contact': '#contact'
    };

    const sections = $$('section[id]');
    const highlightNav = () => {
        const scrollY = window.scrollY + 140;
        for (let i = sections.length - 1; i >= 0; i--) {
            const sec = sections[i];
            if (scrollY >= sec.offsetTop) {
                const id = sec.getAttribute('id');
                const targetHref = sectionNavMap[id] || `#${id}`;
                navLinks.forEach(l => {
                    l.classList.toggle('active', l.getAttribute('href') === targetHref);
                });
                break;
            }
        }
    };
    window.addEventListener('scroll', highlightNav, { passive: true });
    highlightNav();

    // Smooth scroll for anchor links
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            const target = $(targetId);
            if (!target) return;
            e.preventDefault();
            const offset = parseInt(getComputedStyle(document.documentElement)
                .getPropertyValue('--nav-h')) || 72;
            window.scrollTo({
                top: target.offsetTop - offset,
                behavior: 'smooth'
            });
        });
    });

    // Back to top
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* --------------------------------------------------
       2. Cursor-Following Glow & Hero Parallax
       -------------------------------------------------- */
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isTouch && !prefersReducedMotion && cursorGlow) {
        let mouseX = -1000;
        let mouseY = -1000;
        let currentX = -1000;
        let currentY = -1000;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorGlow.classList.add('active');
        }, { passive: true });

        window.addEventListener('mouseleave', () => {
            cursorGlow.classList.remove('active');
        });

        const updateCursor = () => {
            currentX += (mouseX - currentX) * 0.15;
            currentY += (mouseY - currentY) * 0.15;
            cursorGlow.style.left = `${currentX}px`;
            cursorGlow.style.top = `${currentY}px`;
            requestAnimationFrame(updateCursor);
        };
        requestAnimationFrame(updateCursor);

        // Subtle 3D tilt on Hero visual
        if (heroVisual) {
            const heroSection = $('#hero');
            if (heroSection) {
                heroSection.addEventListener('mousemove', (e) => {
                    const rect = heroSection.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width - 0.5;
                    const y = (e.clientY - rect.top) / rect.height - 0.5;
                    const phone = $('.phone', heroVisual);
                    if (phone) {
                        phone.style.transform = `translate(-50%, -50%) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
                    }
                }, { passive: true });

                heroSection.addEventListener('mouseleave', () => {
                    const phone = $('.phone', heroVisual);
                    if (phone) {
                        phone.style.transform = 'translate(-50%, -50%) rotateY(0deg) rotateX(0deg)';
                    }
                });
            }
        }
    }

    /* --------------------------------------------------
       3. Interactive Futuristic Hero Particle Canvas
       -------------------------------------------------- */
    const initHeroParticles = () => {
        const canvas = $('#hero-particles-canvas');
        const hero = $('#hero');
        if (!canvas || !hero) return;

        const ctx = canvas.getContext('2d');
        let width = 0;
        let height = 0;
        let dpr = window.devicePixelRatio || 1;
        let animationFrameId = null;
        let isHeroVisible = true;

        const mouse = {
            x: -1000,
            y: -1000,
            radius: 170,
            active: false
        };

        const ripples = [];

        const colors = [
            'rgba(22, 134, 217, ',   // Primary Blue
            'rgba(6, 182, 212, ',    // Cyan
            'rgba(118, 87, 232, ',   // Violet
            'rgba(56, 189, 248, '    // Sky Blue
        ];

        let particles = [];
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 36 : 78;

        class Particle {
            constructor() {
                this.reset(true);
            }

            reset(initial = false) {
                this.x = initial ? Math.random() * width : (Math.random() > 0.5 ? 0 : width);
                this.y = initial ? Math.random() * height : Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.7;
                this.vy = (Math.random() - 0.5) * 0.7;
                this.baseRadius = Math.random() * 1.8 + 1.4; // 1.4px to 3.2px
                this.radius = this.baseRadius;
                this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
                this.baseAlpha = Math.random() * 0.45 + 0.35; // 0.35 to 0.8
                this.alpha = this.baseAlpha;
            }

            update() {
                // Mouse interaction: Repulsion (scatter) + Proximity Size Expansion
                if (mouse.active) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < mouse.radius) {
                        // Repulsion / scatter force
                        const force = (mouse.radius - dist) / mouse.radius;
                        const angle = Math.atan2(dy, dx);
                        this.x -= Math.cos(angle) * force * 5.2;
                        this.y -= Math.sin(angle) * force * 5.2;

                        // Proximity size expansion: expands larger as cursor approaches
                        const targetRadius = this.baseRadius * (1 + (1 - dist / mouse.radius) * 2.6);
                        this.radius += (targetRadius - this.radius) * 0.2;
                        this.alpha = Math.min(1, this.baseAlpha + (1 - dist / mouse.radius) * 0.5);
                    } else {
                        this.radius += (this.baseRadius - this.radius) * 0.08;
                        this.alpha += (this.baseAlpha - this.alpha) * 0.08;
                    }
                } else {
                    this.radius += (this.baseRadius - this.radius) * 0.08;
                    this.alpha += (this.baseAlpha - this.alpha) * 0.08;
                }

                // Shockwave ripples interaction
                for (let i = 0; i < ripples.length; i++) {
                    const rip = ripples[i];
                    const rdx = this.x - rip.x;
                    const rdy = this.y - rip.y;
                    const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
                    const diff = Math.abs(rdist - rip.r);
                    if (diff < 35 && rdist > 0) {
                        const push = ((35 - diff) / 35) * rip.strength * 4;
                        this.x += (rdx / rdist) * push;
                        this.y += (rdy / rdist) * push;
                        this.radius = Math.min(6, this.radius + 1.2);
                    }
                }

                // Ambient drift
                this.x += this.vx;
                this.y += this.vy;

                // Screen boundary wrapping
                const pad = 25;
                if (this.x < -pad) this.x = width + pad;
                if (this.x > width + pad) this.x = -pad;
                if (this.y < -pad) this.y = height + pad;
                if (this.y > height + pad) this.y = -pad;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, Math.max(0.5, this.radius), 0, Math.PI * 2);
                ctx.fillStyle = `${this.colorPrefix}${this.alpha.toFixed(2)})`;
                ctx.fill();

                // Glowing halo when expanded near cursor
                if (this.radius > this.baseRadius * 1.3) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius * 2.2, 0, Math.PI * 2);
                    ctx.fillStyle = `${this.colorPrefix}${(this.alpha * 0.25).toFixed(2)})`;
                    ctx.fill();
                }
            }
        }

        const resize = () => {
            width = hero.clientWidth;
            height = hero.clientHeight;
            dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);

            if (particles.length === 0) {
                for (let i = 0; i < particleCount; i++) {
                    particles.push(new Particle());
                }
            }
        };

        window.addEventListener('resize', resize, { passive: true });
        resize();

        // Mouse tracking within Hero section
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            mouse.active = true;
        }, { passive: true });

        hero.addEventListener('mouseleave', () => {
            mouse.active = false;
        });

        // Click to generate a futuristic shockwave ripple
        hero.addEventListener('click', (e) => {
            const rect = hero.getBoundingClientRect();
            ripples.push({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                r: 5,
                maxR: Math.min(width, 240),
                strength: 1.5,
                alpha: 0.6
            });
        });

        // Animation frame loop
        const animate = () => {
            if (!isHeroVisible) {
                animationFrameId = null;
                return;
            }

            ctx.clearRect(0, 0, width, height);

            // Draw ripple waves
            for (let i = ripples.length - 1; i >= 0; i--) {
                const rip = ripples[i];
                rip.r += 6;
                rip.alpha -= 0.015;
                if (rip.alpha <= 0 || rip.r >= rip.maxR) {
                    ripples.splice(i, 1);
                    continue;
                }
                ctx.beginPath();
                ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(6, 182, 212, ${Math.max(0, rip.alpha * 0.35).toFixed(2)})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // Constellation network lines
            const connectDist = 110;
            const pLen = particles.length;
            for (let i = 0; i < pLen; i++) {
                for (let j = i + 1; j < pLen; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectDist) {
                        const lineAlpha = (1 - dist / connectDist) * 0.22;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(22, 134, 217, ${lineAlpha.toFixed(2)})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }

                // Interactive cursor energy field
                if (mouse.active) {
                    const mdx = mouse.x - particles[i].x;
                    const mdy = mouse.y - particles[i].y;
                    const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
                    if (mdist < 140) {
                        const mLineAlpha = (1 - mdist / 140) * 0.35;
                        ctx.beginPath();
                        ctx.moveTo(mouse.x, mouse.y);
                        ctx.lineTo(particles[i].x, particles[i].y);
                        ctx.strokeStyle = `rgba(6, 182, 212, ${mLineAlpha.toFixed(2)})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }

                particles[i].update();
                particles[i].draw();
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        // Pause canvas loop when Hero is scrolled out of view
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isHeroVisible = entry.isIntersecting;
                if (isHeroVisible && !animationFrameId) {
                    animate();
                }
            });
        }, { threshold: 0.05 });

        heroObserver.observe(hero);

        if (!prefersReducedMotion) {
            animate();
        } else {
            for (let i = 0; i < particles.length; i++) {
                particles[i].draw();
            }
        }
    };

    initHeroParticles();

    /* --------------------------------------------------
       4. Scroll-Reveal (IntersectionObserver)
       -------------------------------------------------- */
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    $$('.reveal').forEach(el => revealObserver.observe(el));

    /* --------------------------------------------------
       4. Project Cards "View Details" Toggle
       -------------------------------------------------- */
    $$('.project-card').forEach((card) => {
        const toggleBtn = $('.project-details-btn', card);
        const detailsPane = $('.project-expanded', card);
        if (toggleBtn && detailsPane) {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const isOpen = detailsPane.classList.toggle('open');
                toggleBtn.setAttribute('aria-expanded', isOpen);
                toggleBtn.innerHTML = isOpen
                    ? '<i class="fas fa-chevron-up"></i> Less Details'
                    : '<i class="fas fa-info-circle"></i> View Details';
            });
        }
    });

    /* --------------------------------------------------
       5. Contact Form (Formspree)
       -------------------------------------------------- */
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Form validation
            const fields = $$('input[required], textarea[required]', form);
            let valid = true;
            fields.forEach(f => {
                const isFieldValid = f.checkValidity();
                f.classList.toggle('error', !isFieldValid);
                if (!isFieldValid) valid = false;
            });

            if (!valid) {
                toast('Please fill in all fields correctly.', 'error');
                return;
            }

            const btn = $('button[type="submit"]', form);
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span class="loading"></span> Sending…';
            btn.disabled = true;

            try {
                const res = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { Accept: 'application/json' }
                });
                if (!res.ok) throw new Error('Submission failed');
                toast('Message sent successfully!', 'success');
                form.reset();
                setTimeout(() => { window.location.href = 'thanks.html'; }, 1200);
            } catch {
                toast('Failed to send. Please try again.', 'error');
            } finally {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
            }
        });

        // Clear error styling on input
        $$('input, textarea', form).forEach(f => {
            f.addEventListener('input', () => f.classList.remove('error'));
        });
    }

    /* --------------------------------------------------
       6. Toast Notification Helper
       -------------------------------------------------- */
    function toast(msg, type = 'success') {
        const existing = $('.toast');
        if (existing) existing.remove();

        const el = document.createElement('div');
        el.className = `toast toast--${type}`;
        el.textContent = msg;
        document.body.appendChild(el);

        requestAnimationFrame(() => el.classList.add('show'));

        setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => el.remove(), 350);
        }, 4000);
    }

    /* --------------------------------------------------
       7. Keyboard Navigation & Accessibility
       -------------------------------------------------- */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
        if (e.key === 'Tab') document.body.classList.add('keyboard-nav');
    });

    document.addEventListener('mousedown', () =>
        document.body.classList.remove('keyboard-nav')
    );

})();
