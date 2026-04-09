<nav class="navbar glass-panel">
    <div class="nav-left">
        <div class="nav-brand-title">
            <a href="home.php" style="text-decoration: none;">
                <span class="main-title">PROG<span class="highlight">FUNDAMENTOS</span></span>
            </a>
        </div>
    </div>
    
    <div class="mobile-menu-btn" id="mobile-menu-btn">
        <i class="ri-menu-3-line"></i>
    </div>

    <div class="nav-menu" id="nav-menu">
        <a href="home.php" class="nav-link <?php echo (isset($pagina_actual) && $pagina_actual == 'home') ? 'active-page' : ''; ?>">INICIO</a>
        <a href="temario.php" class="nav-link">TEMARIO</a>
        <a href="proyectos.php" class="nav-link">PROYECTOS</a>
        <a href="contactos.php" class="nav-link">CONTACTO</a>
        
        <button id="theme-toggle" class="btn-theme">MODO CLARO</button>
        
        <a href="login/login.php" class="btn-action primary">ENTRAR</a>
    </div>
</nav>