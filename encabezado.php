<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
<nav class="navbar glass-panel">
    <div class="nav-left">
        <div class="nav-brand-title">
            <a href="/AppCurso/home.php" style="text-decoration: none;">
                <span class="main-title">PROG<span class="highlight">FUNDAMENTOS</span></span>
            </a>
        </div>
    </div>

    <?php if(isset($_SESSION['usuario_nombre'])): ?>
        <span style="color: white; font-weight: bold; text-transform: uppercase; font-size: 0.9rem;">
            <?php 
                echo htmlspecialchars($_SESSION['usuario_nombre'] . ' ' . 
                $_SESSION['usuario_paterno'] . ' ' . 
                $_SESSION['usuario_materno']); 
            ?>
        </span>
    <?php endif; ?>
            
    <div class="nav-menu" id="nav-menu">
        <a href="/AppCurso/home.php" class="nav-link <?php echo (isset($pagina_actual) && $pagina_actual == 'home') ? 'active-page' : ''; ?>">INICIO</a>
        <a href="/AppCurso/Navegaciones/temario/temario.php" class="nav-link">TEMARIO</a>
        <a href="/AppCurso/Navegaciones/proyectos/proyectos.php" class="nav-link">PROYECTOS</a>
        <a href="/AppCurso/Navegaciones/estadisticas/estadisticas.php" class="nav-link">ESTADISTICAS</a>
        <a href="/AppCurso/Navegaciones/contacto/contacto.php" class="nav-link">CONTACTO</a>
        
        <button id="theme-toggle" class="btn-theme">MODO CLARO</button>
        
        <?php if(isset($_SESSION['usuario_nombre'])): ?>
            <div class="user-info" style="display: flex; align-items: center; gap: 10px; margin-left: 15px;">
                <a href="/AppCurso/Navegaciones/login/logout.php" class="btn-action primary" style="background: #ff4757; font-size: 0.8rem;">SALIR</a>
            </div>
        <?php else: ?>
            <a href="/AppCurso/Navegaciones/login/login.php" class="btn-action primary">ENTRAR</a>
        <?php endif; ?>
    </div>
</nav>