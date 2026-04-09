document.addEventListener('DOMContentLoaded', () => {
    const scrollBar = document.getElementById('scroll-bar');
    const contactForm = document.getElementById('contactForm');

    // 1. Progress Bar Scroll
    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if(scrollBar) scrollBar.style.width = scrolled + "%";
    });

    // 2. Manejo de Formulario
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simulación de envío
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = "Enviando... 🚀";
            btn.style.opacity = "0.7";
            btn.disabled = true;

            setTimeout(() => {
                alert("✅ ¡Gracias! Tu mensaje ha sido enviado. Nos pondremos en contacto pronto.");
                contactForm.reset();
                btn.innerHTML = originalText;
                btn.style.opacity = "1";
                btn.disabled = false;
            }, 1500);
        });
    }
});