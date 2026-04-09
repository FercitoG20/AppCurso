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
</head>
<body>
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

                    <form id="loginForm" action="procesar_login.php" method="POST">
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
    <script src="login.js"></script>
</body>
</html>