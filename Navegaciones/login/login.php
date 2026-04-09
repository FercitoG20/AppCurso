<?php $pagina_actual = 'login'; ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ingresar | ProgFundamentos</title>
    
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet">
    <link rel="stylesheet" href="../../home.css">
    <link rel="stylesheet" href="login.css">

    <style>
        .modal-error-overlay {
            display: none;
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            z-index: 9999;
            align-items: center; justify-content: center;
        }
        .modal-error-card {
            background: white;
            width: 90%; max-width: 380px;
            padding: 30px; border-radius: 24px;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
            animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .modal-icon {
            width: 60px; height: 60px; background: rgba(255, 71, 87, 0.1);
            color: #ff4757; display: flex; align-items: center; justify-content: center;
            font-size: 30px; border-radius: 50%; margin: 0 auto 15px;
        }
        .modal-btn {
            background: #00bcd4; color: white; border: none;
            padding: 12px 25px; border-radius: 12px;
            font-weight: 700; cursor: pointer; width: 100%; margin-top: 20px;
        }
    </style>
</head>
<body>
    <div id="modalError" class="modal-error-overlay">
        <div class="modal-error-card">
            <div class="modal-icon"><i class="ri-shield-user-fill"></i></div>
            <h3 id="modalTitle" style="color: #2d3436; margin-bottom: 10px;">Error de Acceso</h3>
            <p id="modalDesc" style="color: #636e72; font-size: 0.95rem;"></p>
            <button class="modal-btn" onclick="closeModal()">Intentar de nuevo</button>
        </div>
    </div>

    <div class="progress-container"><div class="progress-bar" id="scroll-bar"></div></div>
    <div class="ambient-glow"></div>
    
    <?php include '../../encabezado.php'; ?>

    <main class="login-main">
        <section class="login-container anim-on-scroll">
            <div class="login-grid glass-panel">
                
                <div class="login-hero">
                    <div class="login-badge">PF</div>
                    <h1>Prog<span class="outline">Fundamentos</span></h1>
                    <p>Inicia sesión para acceder al contenido de tu curso: temario, proyectos y recursos interactivos.</p>
                    <div class="login-chips">
                        <span class="chip">💡 Lógica</span>
                        <span class="chip">📚 Recursos</span>
                        <span class="chip">🧪 Prácticas</span>
                    </div>
                </div>

                <div class="login-form-side">
                    <h2 class="title">Bienvenido de nuevo</h2>
                    <p class="subtitle">Ingresa tus credenciales para continuar.</p>

                    <form id="loginForm" action="logueo.php" method="POST">
                        <div class="form-group">
                            <label for="email">Correo electrónico</label>
                            <input type="email" id="email" name="email" placeholder="tucorreo@ejemplo.com" required>
                        </div>

                        <div class="form-group">
                            <label for="password">Contraseña</label>
                            <div class="password-wrapper">
                                <input type="password" id="password" name="password" placeholder="••••••••" required>
                                <button type="button" id="togglePassword" class="toggle-btn">
                                    <i class="ri-eye-line"></i>
                                </button>
                            </div>
                        </div>

                        <div class="form-options">
                            <label class="checkbox-custom">
                                <input type="checkbox" name="remember">
                                <span>Recordarme</span>
                            </label>
                            <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
                        </div>

                        <button type="submit" class="btn-theme login-btn">
                            <span>Entrar</span>
                            <i class="ri-arrow-right-line"></i>
                        </button>

                        <p class="register-text">
                            ¿No tienes cuenta? <a href="../registro/registro.php">Regístrate aquí</a>
                        </p>
                    </form>
                </div>

            </div>
        </section>
    </main>

    <?php include '../../pie-pagina.php'; ?>
    
    <script src="../../home.js"></script>
    <script>
        function closeModal() {
            document.getElementById('modalError').style.display = 'none';
            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({}, '', cleanUrl);
        }

        window.onload = () => {
            const params = new URLSearchParams(window.location.search);
            const error = params.get('error');
            const modal = document.getElementById('modalError');
            const mDesc = document.getElementById('modalDesc');

            if (error) {
                modal.style.display = 'flex';
                if (error === 'password_incorrecto') {
                    mDesc.innerText = "La contraseña que ingresaste no es correcta. Verifica e intenta de nuevo.";
                } else if (error === 'no_existe') {
                    mDesc.innerText = "No encontramos ninguna cuenta asociada a este correo electrónico.";
                }
            }
        };
        document.getElementById('togglePassword').addEventListener('click', function() {
            const passInput = document.getElementById('password');
            const icon = this.querySelector('i');
            if (passInput.type === 'password') {
                passInput.type = 'text';
                icon.classList.replace('ri-eye-line', 'ri-eye-off-line');
            } else {
                passInput.type = 'password';
                icon.classList.replace('ri-eye-off-line', 'ri-eye-line');
            }
        });
    </script>
</body>
</html>