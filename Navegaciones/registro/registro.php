<?php 
$pagina_actual = 'registro'; 
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro | ProgFundamentos</title>
    
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet">
    <link rel="stylesheet" href="../../home.css">
    <link rel="stylesheet" href="../login/login.css"> 
    
    <style>
        /* --- ESTILOS DEL MODAL MEJORADO --- */
        .modal-overlay {
            display: none; 
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            z-index: 9999;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        }

        .modal-card {
            background: white;
            width: 90%;
            max-width: 400px;
            padding: 35px;
            border-radius: 28px;
            text-align: center;
            box-shadow: 0 25px 50px rgba(0,0,0,0.3);
            transform: scale(0.8);
            animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { to { transform: scale(1); } }

        .modal-icon-circle {
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            border-radius: 50%;
            margin: 0 auto 20px;
        }

        /* Colores dinámicos para el modal */
        .modal-error .modal-icon-circle { background: rgba(255, 71, 87, 0.1); color: #ff4757; }
        .modal-success .modal-icon-circle { background: rgba(46, 213, 115, 0.1); color: #2ed573; }

        .modal-card h3 { color: #2d3436; font-size: 1.6rem; margin-bottom: 10px; font-weight: 800; }
        .modal-card p { color: #636e72; line-height: 1.6; margin-bottom: 25px; }

        .modal-btn {
            background: #00bcd4;
            color: white; border: none;
            padding: 14px 30px; border-radius: 12px;
            font-weight: 700; cursor: pointer;
            transition: 0.3s; width: 100%; font-size: 1rem;
        }

        .modal-btn:hover { background: #0097a7; transform: translateY(-2px); }
    </style>
</head>
<body>

    <div id="statusModal" class="modal-overlay">
        <div id="modalTypeClass" class="modal-card">
            <div class="modal-icon-circle">
                <i id="modalIcon" class="ri-error-warning-fill"></i>
            </div>
            <h3 id="modalTitle">Título</h3>
            <p id="modalDesc">Descripción del mensaje.</p>
            <button id="modalBtn" class="modal-btn" onclick="closeModal()">Entendido</button>
        </div>
    </div>

    <div class="progress-container"><div class="progress-bar" id="scroll-bar"></div></div>
    <div class="ambient-glow"></div>
    
    <?php include '../../encabezado.php'; ?>

    <main class="login-main"> 
        <section class="login-container anim-on-scroll" style="max-width: 1000px;">
            <div class="login-grid glass-panel">
                
                <div class="login-hero">
                    <div class="login-badge">PF</div>
                    <h1>Únete a <span class="outline">Nosotros</span></h1>
                    <p>Crea tu cuenta para guardar tu progreso, participar en proyectos y acceder a recursos exclusivos.</p>
                    <div class="login-chips">
                        <span class="chip">🚀 Proyectos</span>
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

                        <button type="submit" class="login-btn">
                            <span>Crear Cuenta</span>
                            <i class="ri-user-add-line"></i>
                        </button>

                        <p class="register-text">
                            ¿Ya tienes una cuenta? <a href="/AppCurso/Navegaciones/login/login.php">Inicia sesión aquí</a>
                        </p>
                    </form>
                </div>
            </div>
        </section>
    </main>

    <?php include '../../pie-pagina.php'; ?>

    <script src="../../home.js"></script>
    <script>
        const modal = document.getElementById('statusModal');
        const card = document.getElementById('modalTypeClass');
        const mIcon = document.getElementById('modalIcon');
        const mTitle = document.getElementById('modalTitle');
        const mDesc = document.getElementById('modalDesc');
        const mBtn = document.getElementById('modalBtn');

        function showModal(type, title, desc, btnText = "Entendido") {
            card.className = "modal-card " + (type === 'success' ? 'modal-success' : 'modal-error');
            mIcon.className = type === 'success' ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill';
            mTitle.innerText = title;
            mDesc.innerText = desc;
            mBtn.innerText = btnText;
            modal.style.display = 'flex';
        }

        function closeModal() {
            modal.style.display = 'none';
            // Si fue éxito, al cerrar mandamos al login
            if(card.classList.contains('modal-success')) {
                window.location.href = '../login/login.php';
            }
            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({path: cleanUrl}, '', cleanUrl);
        }

        window.addEventListener('load', () => {
            const params = new URLSearchParams(window.location.search);
            if (params.get('success')) {
                showModal('success', '¡Registro Exitoso!', 'Tu cuenta ha sido creada. Ya puedes iniciar sesión para comenzar a aprender.', 'Ir al Login');
            } else if (params.get('error') === 'email_existe') {
                showModal('error', 'Correo Duplicado', 'Este correo ya está registrado. Intenta con otro o recupera tu cuenta.');
            }
        });

        function toggleView(id) {
            const input = document.getElementById(id);
            const icon = event.currentTarget.querySelector('i');
            input.type = input.type === "password" ? "text" : "password";
            icon.classList.toggle('ri-eye-line');
            icon.classList.toggle('ri-eye-off-line');
        }

        document.getElementById('registerForm').addEventListener('submit', function(e) {
            const pass = document.getElementById('password').value;
            const confirm = document.getElementById('confirmPassword').value;
            if (pass !== confirm) {
                e.preventDefault();
                showModal('error', 'Contraseñas distintas', 'La contraseña y la confirmación no coinciden.');
            }
        });
    </script>
</body>
</html>