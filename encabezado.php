<nav class="navbar glass-panel">
    <div class="nav-left">
        <div class="nav-brand-title">
            <a href="/AppCurso/home.php" style="text-decoration: none;">
                <span class="main-title">PROG<span class="highlight">FUNDAMENTOS</span></span>
            </a>
        </div>
    </div>
    
    <div class="mobile-menu-btn" id="mobile-menu-btn">
        <i class="ri-menu-3-line"></i>
    </div>

    <div class="nav-menu" id="nav-menu">
        <a href="/AppCurso/home.php" class="nav-link <?php echo (isset($pagina_actual) && $pagina_actual == 'home') ? 'active-page' : ''; ?>">INICIO</a>
        <a href="/AppCurso/Navegaciones/temario/temario.php" class="nav-link">TEMARIO</a>
        <a href="/AppCurso/Navegaciones/proyectos/proyectos.php" class="nav-link">PROYECTOS</a>
        <a href="/AppCurso/Navegaciones/estadisticas/estadisticas.php" class="nav-link">ESTADISTICAS</a>
        <a href="/AppCurso/Navegaciones/contacto/contacto.php" class="nav-link">CONTACTO</a>
        
        <button id="theme-toggle" class="btn-theme">MODO CLARO</button>
        
        <a href="/AppCurso/Navegaciones/login/login.php" class="btn-action primary">ENTRAR</a>
    </div>
</nav>