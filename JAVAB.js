// Variables globales
let isPlaying = false;
let currentSlide = 0;
let totalSlides = 0;
let enableMusic = false;

function getAudio() {
    return document.getElementById('bgMusic');
}

// Reproduce la música de fondo (musica.mp3). Se llama directamente dentro
// del click del usuario, que es lo que exigen iOS Safari y Chrome para
// permitir audio.
function playMusic() {
    const audio = getAudio();
    const musicPlayer = document.getElementById('musicPlayer');
    if (musicPlayer) musicPlayer.style.display = 'block';
    if (!audio) return;
    audio.muted = false;
    audio.volume = 1;
    let p;
    try { p = audio.play(); } catch (e) { p = Promise.reject(e); }
    if (p && typeof p.then === 'function') {
        p.then(() => { isPlaying = true; updateMusicIcon(); })
         .catch(() => {
            isPlaying = false;
            updateMusicIcon();
            // Si el navegador bloqueó el primer intento, reintenta con el
            // siguiente toque en cualquier parte de la página.
            const retry = () => {
                document.removeEventListener('pointerdown', retry, true);
                document.removeEventListener('touchend', retry, true);
                if (enableMusic && audio.paused) audio.play().catch(() => {});
            };
            document.addEventListener('pointerdown', retry, true);
            document.addEventListener('touchend', retry, true);
         });
    } else {
        isPlaying = true;
        updateMusicIcon();
    }
}

function enterWithMusicClick() {
    revealHero();
    enableMusic = true;
    const modal = document.getElementById('welcomeModal');
    if (modal) modal.style.display = 'none';
    playMusic();
}

function enterWithoutMusicClick() {
    revealHero();
    enableMusic = false;
    const modal = document.getElementById('welcomeModal');
    if (modal) modal.style.display = 'none';
    // Mostramos el botón para que puedan activar la música luego si quieren
    const musicPlayer = document.getElementById('musicPlayer');
    if (musicPlayer) musicPlayer.style.display = 'block';
    isPlaying = false;
    updateMusicIcon();
}

function setupModalButtons() {
    const enterWithMusic = document.getElementById('enterWithMusic');
    const enterWithoutMusic = document.getElementById('enterWithoutMusic');
    if (enterWithMusic) enterWithMusic.onclick = enterWithMusicClick;
    if (enterWithoutMusic) enterWithoutMusic.onclick = enterWithoutMusicClick;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeCountdown();
    initializeCarousel();
    setupModalButtons();

    const musicToggle = document.getElementById('musicToggle');
    if (musicToggle) musicToggle.addEventListener('click', toggleMusic);

    const audio = getAudio();
    if (audio) {
        audio.addEventListener('play', () => { isPlaying = true; updateMusicIcon(); });
        audio.addEventListener('pause', () => { isPlaying = false; updateMusicIcon(); });
    }

    // Mostrar el modal de bienvenida para elegir con/sin música
    const modal = document.getElementById('welcomeModal');
    if (modal) modal.style.display = 'flex';
});

function toggleMusic() {
    const audio = getAudio();
    if (!audio) return;
    if (audio.paused) {
        playMusic();
    } else {
        audio.pause();
        isPlaying = false;
        updateMusicIcon();
    }
}

function updateMusicIcon() {
    const volumeIcon = document.getElementById('volumeIcon');
    
    if (volumeIcon) {
        if (isPlaying) {
            volumeIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#0F5C45" stroke="#fff" stroke-width="1"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.08" stroke="#0F5C45" stroke-width="2"></path>
                <circle cx="6.5" cy="12" r="1" fill="#C9A24A"/>
            `;
        } else {
            volumeIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#0F5C45" stroke="#fff" stroke-width="1"></polygon>
                <line x1="19" y1="9" x2="17" y2="11" stroke="#ff6b6b" stroke-width="2"></line>
                <line x1="17" y1="9" x2="19" y2="11" stroke="#ff6b6b" stroke-width="2"></line>
                <circle cx="6.5" cy="12" r="1" fill="#ff6b6b"/>
            `;
        }
    }
}

// Countdown
function initializeCountdown() {
    const targetDate = new Date('2026-11-15T10:00:00-04:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;
        
        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            
            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        } else {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Carrusel
function initializeCarousel() {
    const track = document.getElementById('carouselTrack');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    if (!track) return;

    // calcular total dinámicamente
    const items = track.querySelectorAll('.carousel-item');
    totalSlides = items.length;
    const totalSlidesElement = document.getElementById('totalSlides');
    if (totalSlidesElement) totalSlidesElement.textContent = totalSlides;

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
            restartAutoplay();
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateCarousel();
            restartAutoplay();
        });
    }

    // Ajuste inicial para asegurar cálculo correcto tras el render
    updateCarousel();
    requestAnimationFrame(updateCarousel);
    setTimeout(updateCarousel, 200);

    // Auto-play del carrusel: una foto nueva cada 2.5 segundos
    restartAutoplay();
}

let autoplayTimer = null;
function restartAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = setInterval(nextSlide, 2500);
}

function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    if (track) {
        const items = track.querySelectorAll('.carousel-item');
        if (!items.length) return;
        const container = track.parentElement;

        // Temporarily reset transform to measure actual positions
        const previousTransform = track.style.transform;
        track.style.transform = 'none';

        const firstRect = items[0].getBoundingClientRect();
        const secondRect = items[1] ? items[1].getBoundingClientRect() : null;
        const stepWidth = Math.max(1, secondRect ? Math.round(secondRect.left - firstRect.left) : Math.round(firstRect.width));

        const containerWidth = Math.round(container.getBoundingClientRect().width);
        const visibleCount = Math.max(1, Math.floor((containerWidth + 1) / stepWidth));
        const maxIndex = Math.max(0, totalSlides - visibleCount);

        // Detecta si hay que dar la vuelta (de la última foto a la 1, o viceversa)
        let wrapped = false;
        if (currentSlide > maxIndex) { currentSlide = 0; wrapped = true; }
        if (currentSlide < 0) { currentSlide = maxIndex; wrapped = true; }

        const trackRect = track.getBoundingClientRect();
        const baseLeft = Math.round(firstRect.left - trackRect.left);
        const translateXpx = -Math.round(baseLeft + (currentSlide * stepWidth));

        if (wrapped) {
            // Al dar la vuelta, salta directo a la foto 1 sin animar el regreso
            // (evita el efecto de "devolverse" deslizando hacia atrás por todas las fotos)
            const prevTransition = track.style.transition;
            track.style.transition = 'none';
            track.style.transform = `translateX(${translateXpx}px)`;
            void track.offsetWidth; // fuerza reflow para aplicar el salto sin animación
            track.style.transition = prevTransition || '';
        } else {
            // Apply transform
            track.style.transform = `translateX(${translateXpx}px)`;
        }
        // console.log('Carousel moved to slide:', { currentSlide, visibleCount, maxIndex, translateXpx, stepWidth, baseLeft });
    }
    updateSlideCounter();
    markCenterCarouselItem();
}

function nextSlide() {
    currentSlide++;
    updateCarousel();
}

function previousSlide() {
    currentSlide--;
    updateCarousel();
}

function updateSlideCounter() {
    const currentSlideElement = document.getElementById('currentSlide');
    const totalSlidesElement = document.getElementById('totalSlides');
    if (currentSlideElement) currentSlideElement.textContent = (currentSlide + 1);
    if (totalSlidesElement) totalSlidesElement.textContent = totalSlides;
}

// Mark center carousel item on desktop
function markCenterCarouselItem() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    const items = Array.from(track.querySelectorAll('.carousel-item'));
    if (!items.length) return;
    items.forEach(it => it.classList.remove('is-center'));

    const firstItem = items[0];
    const container = track.parentElement;
    const itemWidth = firstItem.getBoundingClientRect().width;
    const containerWidth = container.getBoundingClientRect().width;
    const visibleCount = Math.max(1, Math.floor(containerWidth / itemWidth));

    const centerIndex = (currentSlide + Math.floor(visibleCount / 2)) % items.length;
    items[centerIndex].classList.add('is-center');
}

// Hook into carousel updates
const _origUpdateCarousel = typeof updateCarousel === 'function' ? updateCarousel : null;
if (_origUpdateCarousel) {
    window.updateCarousel = function() {
        _origUpdateCarousel();
        markCenterCarouselItem();
    };
}

window.addEventListener('resize', markCenterCarouselItem);

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(markCenterCarouselItem, 200);
});

// Funciones de los botones
function openLocation(location) {
    // Enlaces de ejemplo (dirección ficticia) - ceremonia y celebración
    const mapsUrls = {
        ceremony: "https://maps.app.goo.gl/C9EUbrcP6fKbyRUg8",
        reception: "https://maps.app.goo.gl/C9EUbrcP6fKbyRUg8"
    };
    const mapsUrl = mapsUrls[location] || mapsUrls.ceremony;
    window.open(mapsUrl, '_blank');
}

// NOTA: esta es una plantilla de ejemplo. Reemplaza el contenido de estas
// funciones con tu propio enlace (Google Drive, Google Form, lista de
// regalos, etc.) cuando personalices la invitación.

function sharePhotos() {
    // Ejemplo: aquí se debe colocar el enlace real a la carpeta de Google Drive.
    window.open('https://photos.app.goo.gl/12WD8CUThgTxYpjVA', '_blank');
}

function showDressCode() {
    const modal = document.getElementById('dresscodeModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeDressCodeModal() {
    // El click dentro de la tarjeta del modal usa stopPropagation(), así que
    // esta función solo se dispara al hacer click en el fondo oscuro o en la X.
    const modal = document.getElementById('dresscodeModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showGifts() {
    const modal = document.getElementById('giftsModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }
}

function closeGiftsModal() {
    const modal = document.getElementById('giftsModal');
    if (modal) modal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeGiftsModal();
        const dc = document.getElementById('dresscodeModal');
        if (dc) dc.style.display = 'none';
    }
});

// Copia el número de cuenta de la Mesa de Regalos (sin enlaces externos)
function copyAccount() {
    const el = document.getElementById('giftAccount');
    if (!el) return;
    const text = el.textContent.replace(/\s+/g, '');
    const done = () => {
        showToast('¡Copiado!', 'Número de cuenta: ' + text);
        const b = document.querySelector('.btn-copy-icon');
        if (b) { b.classList.add('copied'); setTimeout(() => b.classList.remove('copied'), 1500); }
    };
    const fallback = () => {
        const ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', '');
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); }
        catch (e) { showToast('Número de cuenta', text); }
        document.body.removeChild(ta);
    };
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
        fallback();
    }
}

function confirmAttendance() {
    // Confirmación directa por WhatsApp
    const phone = '18299229371';
    const msg = '¡Hola! Confirmo mi asistencia a los XV años de Nashley Isabel De León Rosario el domingo 15 de noviembre en Coco Club, Playa Najayo. 🎉';
    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg), '_blank');
}

// Sistema de Toast
function showToast(title, message) {
    const toast = document.getElementById('toast');
    const toastContent = document.getElementById('toastContent');
    
    toastContent.innerHTML = `
        <h4 style="font-weight: 700; color: #fff; margin-bottom: 0.35rem; letter-spacing: 0.2px;">${title}</h4>
        <p style="color: #ddd;">${message}</p>
    `;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Nota: el efecto de portada ahora se logra 100% con CSS (hero fijo detrás
// del contenido, ver .hero-section y .content en CCSB.css), igual que en
// boda100L. Ya no hace falta mover nada por JS en el scroll.


// Forzar limpieza de caches en clientes antiguos
(function() {
  function clearCaches() {
    if ('caches' in window) {
      caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => {});
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => reg.unregister());
      }).catch(() => {});
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', clearCaches);
  } else {
    clearCaches();
  }
})();


// Aparición elegante de la información al hacer scroll
(function () {
    const SELECTORS = [
        '.parents-intro', '.parents-title', '.parents-names', '.parents-ornament',
        '.section-title', '.section-subtitle', '.countdown-container',
        '.event-card', '.event-icon', '.camera-icon', '.carousel-container', '.carousel-counter',
        '.party-card', '.gift-icon', '.gifts-container .btn-wedding',
        '.whatsapp-icon', '.rsvp-container .btn-wedding', '.footer-content'
    ];
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.documentElement.classList.add('js-reveal');
    function init() {
        const els = document.querySelectorAll('.content ' + SELECTORS.join(', .content '));
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        els.forEach((el) => {
            el.classList.add('reveal');
            // tarjetas hermanas aparecen una tras otra
            const sib = el.parentElement ? Array.from(el.parentElement.children).filter(c => c.classList.contains('party-card')) : [];
            const i = sib.indexOf(el);
            if (i > 0) el.style.transitionDelay = (i * 0.15) + 's';
            io.observe(el);
        });
        // Seguridad: si algo no se activó, mostrarlo igual
        setTimeout(() => els.forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.top < window.innerHeight) el.classList.add('is-visible');
        }), 2500);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

// Entrada suave del nombre y la frase en la portada (al cerrar la bienvenida)
function revealHero() {
    setTimeout(() => document.body.classList.add('hero-ready'), 150);
}
(function () {
    // Si no hay pantalla de bienvenida, mostrar de una vez
    function check() { if (!document.getElementById('welcomeModal')) revealHero(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', check); else check();
    // Seguridad: nunca dejar el nombre oculto
    setTimeout(() => document.body.classList.add('hero-ready'), 12000);
})();

// Destellos dorados y rosados + burbujas del hada del agua
(function () {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    function start() {
        const cv = document.getElementById('sparkles');
        if (!cv || !cv.getContext) return;
        const ctx = cv.getContext('2d');
        let W = 0, H = 0, dpr = 1;
        const COLORS = ['#F6E3A6', '#E7C97F', '#F3B6C6', '#E9A3B5', '#FFFFFF'];
        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = window.innerWidth; H = window.innerHeight;
            cv.width = W * dpr; cv.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resize();
        window.addEventListener('resize', resize);
        const rnd = (a, b) => a + Math.random() * (b - a);
        const small = W < 700;
        const stars = Array.from({ length: small ? 18 : 30 }, () => ({
            x: rnd(0, 1), y: rnd(0, 1), r: rnd(1.6, 4.2), p: rnd(0, Math.PI * 2),
            s: rnd(0.6, 1.5), c: COLORS[(Math.random() * COLORS.length) | 0], vy: rnd(-0.004, -0.012)
        }));
        const bubbles = Array.from({ length: small ? 6 : 10 }, () => ({
            x: rnd(0, 1), y: rnd(0, 1.2), r: rnd(3, 9), vy: rnd(0.012, 0.03), w: rnd(0, 6.28)
        }));
        function star(x, y, r, a, c) {
            ctx.globalAlpha = a; ctx.fillStyle = c;
            ctx.beginPath();
            ctx.moveTo(x, y - r * 2.2);
            ctx.quadraticCurveTo(x, y, x + r * 2.2, y);
            ctx.quadraticCurveTo(x, y, x, y + r * 2.2);
            ctx.quadraticCurveTo(x, y, x - r * 2.2, y);
            ctx.quadraticCurveTo(x, y, x, y - r * 2.2);
            ctx.fill();
            ctx.globalAlpha = a * 0.35;
            ctx.beginPath(); ctx.arc(x, y, r * 1.3, 0, 6.283); ctx.fill();
        }
        let last = performance.now(), running = true;
        function frame(t) {
            if (!running) return;
            const dt = Math.min(50, t - last) / 1000; last = t;
            ctx.clearRect(0, 0, W, H);
            for (const b of bubbles) {
                b.y -= b.vy * dt * 6; b.w += dt;
                if (b.y < -0.05) { b.y = 1.05; b.x = rnd(0, 1); }
                const x = b.x * W + Math.sin(b.w) * 8, y = b.y * H;
                ctx.globalAlpha = 0.5;
                ctx.strokeStyle = 'rgba(190,232,222,0.9)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.arc(x, y, b.r, 0, 6.283); ctx.stroke();
                ctx.globalAlpha = 0.6; ctx.fillStyle = '#FFFFFF';
                ctx.beginPath(); ctx.arc(x - b.r * 0.35, y - b.r * 0.35, b.r * 0.22, 0, 6.283); ctx.fill();
            }
            for (const s of stars) {
                s.p += dt * s.s * 2; s.y += s.vy * dt;
                if (s.y < -0.02) { s.y = 1.02; s.x = rnd(0, 1); }
                const a = Math.max(0, Math.sin(s.p)) * 0.85;
                if (a > 0.02) star(s.x * W, s.y * H, s.r * (0.6 + a * 0.5), a, s.c);
            }
            ctx.globalAlpha = 1;
            requestAnimationFrame(frame);
        }
        document.addEventListener('visibilitychange', () => {
            running = !document.hidden;
            if (running) { last = performance.now(); requestAnimationFrame(frame); }
        });
        requestAnimationFrame(frame);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
