<?php $pagina_actual = 'registro'; ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro | ProgFundamentos</title>
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet">
    <link rel="stylesheet" href="../../home.css">
    <link rel="stylesheet" href="../login/login.css"> </head>
<body>
    <div class="progress-container"><div class="progress-bar" id="scroll-bar"></div></div>
    <div class="ambient-glow"></div>
    
    <?php include '../../encabezado.php'; ?>

    <main class="login-main"> <section class="login-container anim-on-scroll" style="max-width: 1000px;">
            <div class="login-grid glass-panel">
                
                <div class="login-hero">
                    <div class="login-badge">PF</div>
                    <h1>Únete a <span class="outline">Nosotros</span></h1>
                    <p>Crea tu cuenta para guardar tu progreso, participar en proyectos y acceder a recursos exclusivos de programación.</p>
                    <div class="login-chips">
                        <span class="chip">🚀 Proyectos</span>
                        <span class="chip">📊 Progreso</span>
                        <span class="chip">🎓 Certificados</span>
                    </div>
                </div>

                <div class="login-form-side">
                    <h2 class="title">Crea tu cuenta</h2>
                    <p class="subtitle">Completa tus datos para comenzar tu viaje.</p>

                    <form id="registerForm" action="procesar_registro.php" method="POST">
                        <div class="form-group">
                            <label for="nombres">Nombres</label>
                            <input type="text" id="nombres" name="nombres" placeholder="Tu(s) nombre(s)" required>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="paterno">Apellido Paterno</label>
                                <input type="text" id="paterno" name="paterno" placeholder="Paterno" required>
                            </div>
                            <div class="form-group">
                                <label for="materno">Apellido Materno</label>
                                <input type="text" id="materno" name="materno" placeholder="Materno" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="email">Correo electrónico</label>
                            <input type="email" id="email" name="email" placeholder="tucorreo@ejemplo.com" required>
                        </div>

                        <div class="form-group">
                            <label for="password">Contraseña</label>
                            <div class="password-wrapper">
                                <input type="password" id="password" name="password" placeholder="••••••••" required minlength="6">
                                <button type="button" class="toggle-btn" onclick="toggleView('password')">
                                    <i class="ri-eye-line"></i>
                                </button>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="confirmPassword">Confirmar Contraseña</label>
                            <input type="password" id="confirmPassword" name="confirmPassword" placeholder="••••••••" required>
                        </div>

                        <button type="submit" class="btn-theme login-btn" style="width: 100%;">
                            <span>Crear Cuenta</span>
                            <i class="ri-user-add-line"></i>
                        </button>

                        <p class="register-text">
                            ¿Ya tienes una cuenta? <a href="login.php">Inicia sesión aquí</a>
                        </p>
                    </form>
                </div>

            </div>
        </section>
    </main>

    <?php include '../../pie-pagina.php'; ?>
    <script src="../../home.js"></script>
    <script src="registro.js"></script>
</body>
</html>