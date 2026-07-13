const body = document.body;
const contactModal = document.getElementById('contact-modal');
const modalClose = document.getElementById('modal-close');
const modalEmailLink = document.getElementById('modal-email-link');
const modalText = document.getElementById('modal-text');

const header = document.querySelector('header');
const backToTop = document.getElementById('back-to-top');
const typedTextEl = document.querySelector('.typed-text');
const typedPhrases = [
    'Web Developer',
    'Python Automator',
    'API Builder',
    'Design Enthusiast'
];
let typedIndex = 0;
let typedChar = 0;
let isDeleting = false;

function typeLoop() {
    if (!typedTextEl) return;

    const currentPhrase = typedPhrases[typedIndex];
    const displayText = isDeleting
        ? currentPhrase.substring(0, typedChar - 1)
        : currentPhrase.substring(0, typedChar + 1);

    typedTextEl.textContent = displayText;

    if (!isDeleting && typedChar < currentPhrase.length) {
        typedChar++;
        setTimeout(typeLoop, 120);
    } else if (isDeleting && typedChar > 0) {
        typedChar--;
        setTimeout(typeLoop, 60);
    } else {
        isDeleting = !isDeleting;
        if (!isDeleting) {
            typedIndex = (typedIndex + 1) % typedPhrases.length;
        }
        setTimeout(typeLoop, isDeleting ? 700 : 1200);
    }
}

typeLoop();


// =========================
// Smooth Reveal Animation
// =========================

const hiddenElements = document.querySelectorAll(
    ".section, .hero, .project-card, .skill-card, .service-card"
);

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {

        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }

    });
});

hiddenElements.forEach((el) => observer.observe(el));


// =========================
// Active Navbar Link
// =========================

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach((section) => {

        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.clientHeight;

        if (scrollY >= sectionTop) {
            current = section.getAttribute("id");
        }

    });

    navLinks.forEach((link) => {

        link.classList.remove("active");

        if (link.getAttribute("href") === `#${current}`) {
            link.classList.add("active");
        }

    });

    if (window.scrollY > 320) {
        document.body.classList.add('scrolled');
        backToTop?.classList.add('visible');
    } else {
        document.body.classList.remove('scrolled');
        backToTop?.classList.remove('visible');
    }

});

const scrollProgress = document.querySelector('.scroll-progress span');
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

if (backToTop) {
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}


window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (scrollProgress) {
        scrollProgress.style.width = `${progress}%`;
    }
});

filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        filterButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');

        const filter = button.dataset.filter;
        projectCards.forEach((card) => {
            const category = card.dataset.category;
            const show = filter === 'all' || category === filter;
            card.classList.toggle('hidden', !show);
        });
    });
});


// =========================
// Contact Form Submission
// =========================

const form = document.querySelector(".contact-form");
const formFeedback = document.querySelector('.form-feedback');

function showFormMessage(message, type = 'info') {
    if (!formFeedback) return;
    formFeedback.textContent = message;
    formFeedback.className = `form-feedback ${type}`;
}

function openContactModal(data) {
    if (!contactModal) return;
    body.classList.add('modal-open');
    contactModal.classList.add('open');
    contactModal.setAttribute('aria-hidden', 'false');
    const subject = encodeURIComponent(`Website Inquiry from ${data.name}`);
    const bodyText = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`);
    modalEmailLink.href = `mailto:portfolio+vedanshjain961@gmail.com?subject=${subject}&body=${bodyText}`;
    modalText.textContent = 'Your message was saved locally, but email delivery could not be completed. Use the button below to send it from your email client.';
}

function closeContactModal() {
    if (!contactModal) return;
    body.classList.remove('modal-open');
    contactModal.classList.remove('open');
    contactModal.setAttribute('aria-hidden', 'true');
}

if (modalClose) {
    modalClose.addEventListener('click', closeContactModal);
}

if (contactModal) {
    contactModal.addEventListener('click', (event) => {
        if (event.target === contactModal) {
            closeContactModal();
        }
    });
}

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const previous = submitBtn?.innerHTML || 'Send Message';
        if (submitBtn) submitBtn.innerHTML = 'Sending...';

        const data = {
                name: form.querySelector('#name').value.trim(),
                email: form.querySelector('#email').value.trim(),
                message: form.querySelector('#message').value.trim(),
        };

        if (!data.name || !data.email || !data.message) {
            showFormMessage('Please fill in all fields before submitting.', 'error');
            if (submitBtn) submitBtn.innerHTML = previous;
            return;
        }

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                showFormMessage('✓ Thank you! Your message has been received. I\'ll get back to you soon!', 'success');
                form.reset();
                // Scroll to form feedback
                setTimeout(() => {
                    formFeedback?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 300);
            } else {
                showFormMessage(result.warning || result.message || 'Please check your message and try again.', 'error');
                if (response.status >= 500) {
                    // Only open modal on server errors, not validation errors
                    setTimeout(() => openContactModal(data), 500);
                }
            }
        } catch (error) {
            console.error('Inquiry submit error:', error);
            showFormMessage('Network error. Please check your connection and try again.', 'error');
            // Offer email fallback for network errors
            setTimeout(() => openContactModal(data), 500);
        } finally {
            if (submitBtn) submitBtn.innerHTML = previous;
        }
    });
}


// =========================
// Mobile Navigation Toggle
// =========================

const navToggle = document.getElementById('nav-toggle');
const navLinksEl = document.getElementById('nav-links');

if (navToggle && navLinksEl) {
    navToggle.addEventListener('click', () => {
        const open = navLinksEl.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', open);
        navToggle.innerHTML = open ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });

    document.querySelectorAll('.nav-links a').forEach((a) => {
        a.addEventListener('click', () => {
            navLinksEl.classList.remove('open');
            navToggle.innerHTML = '<i class="fas fa-bars"></i>';
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });
}