// --- SCRIPT ESPECÍFICO DE TEMARIO.HTML (DINÁMICO) ---

document.addEventListener('DOMContentLoaded', () => {

    // 1. Lógica del Acordeón
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    if (accordionHeaders.length > 0) {
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const accordionItem = header.parentElement;
                accordionItem.classList.toggle('active');
            });
        });

        // Opcional: Abrir el primer acordeón por defecto
        if (accordionHeaders[0]) {
             accordionHeaders[0].parentElement.classList.add('active');
        }
    }

    // 2. Animación de "Fade In" para los elementos del acordeón al cargar (similar al home)
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // El elemento es visible un 10%
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Selecciona todos los ítems del acordeón
    const accordionItemsToAnimate = document.querySelectorAll('.accordion-item');
    accordionItemsToAnimate.forEach((item, index) => {
        item.classList.add('anim-on-scroll'); // Clase base de animación
        item.style.transitionDelay = `${index * 0.1}s`; // Retraso secuencial
        observer.observe(item);
    });

});