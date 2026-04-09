document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const scrollBar = document.getElementById('scroll-bar');

    // Progress Bar
    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if(scrollBar) scrollBar.style.width = scrolled + "%";
    });

    // Validación de contraseñas
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            const pass = document.getElementById('password').value;
            const confirm = document.getElementById('confirmPassword').value;

            if (pass !== confirm) {
                e.preventDefault();
                alert("❌ Las contraseñas no coinciden. Por favor, verifica.");
                return;
            }

            const btn = registerForm.querySelector('.login-btn');
            btn.innerHTML = "Creando cuenta... ⏳";
            btn.style.opacity = "0.7";
        });
    }
});

// Función para ver contraseña
function toggleView(id) {
    const input = document.getElementById(id);
    const icon = event.currentTarget.querySelector('i');
    if (input.type === "password") {
        input.type = "text";
        icon.className = "ri-eye-off-line";
    } else {
        input.type = "password";
        icon.className = "ri-eye-line";
    }
}