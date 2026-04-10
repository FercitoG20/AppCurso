document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const loginForm = document.getElementById('loginForm');
    
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.querySelector('i').classList.toggle('ri-eye-off-line');
            togglePassword.querySelector('i').classList.toggle('ri-eye-line');
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            const btn = loginForm.querySelector('.login-btn');
            btn.style.opacity = "0.7";
            btn.innerHTML = "Iniciando sesión...";
        });
    }
});