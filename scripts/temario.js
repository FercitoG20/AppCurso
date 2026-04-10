document.addEventListener('DOMContentLoaded', () => {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    if (accordionHeaders.length > 0) {
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const accordionItem = header.parentElement;
                accordionItem.classList.toggle('active');
            });
        });

        if (accordionHeaders[0]) {
             accordionHeaders[0].parentElement.classList.add('active');
        }
    }

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const accordionItemsToAnimate = document.querySelectorAll('.accordion-item');
    accordionItemsToAnimate.forEach((item, index) => {
        item.classList.add('anim-on-scroll');
        item.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(item);
    });

});