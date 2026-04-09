<?php $pagina_actual = 'home'; ?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ProgFundamentos | Inicio</title>
<link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet">
<link rel="stylesheet" href="home.css">
</head>
<body class="dark-mode"> 
<div class="progress-container"><div class="progress-bar" id="scroll-bar"></div></div>
<div class="ambient-glow"></div>

<?php include 'encabezado.php'; ?>

<main>
    <section id="hero" class="hero">
        <div class="hero-grid">
            <div class="hero-content hero-glass-card glass-panel anim-on-scroll">
                <span class="badge code-font">&lt; INGENIERÍA EN SOFTWARE /&gt;</span>
                <h1>Desbloquea tu</h1>
                <h1 class="outline">Futuro Digital.</h1>
                <p>Una aventura de 3 años diseñada para convertir tu curiosidad en una carrera profesional. Domina la lógica, la estructura y la creación de código desde cero.</p>
                <div>
                    <a href="#cursos" class="btn-action primary scroll-to">
                        Comenzar Aventura <i class="ri-rocket-line"></i>
                    </a>
                </div>
            </div>

            <div class="hero-visual anim-on-scroll" style="animation-delay: 0.2s;">
                <div class="glass-panel visual-container">
                    <canvas id="constellation-canvas"></canvas>
                </div>
            </div>
        </div>

        <div id="hero-gif-carousel" class="anim-on-scroll" style="animation-delay: 0.4s;">
            <div class="gif-container small"><img src="gifs/gif1.gif" alt="Animación 1"></div>
            <div class="gif-container large"><img src="gifs/gif2.gif" alt="Animación 2"></div>
            <div class="gif-container large"><img src="gifs/gif3.gif" alt="Animación 3"></div>
            <div class="gif-container small"><img src="gifs/gif4.gif" alt="Animación 4"></div>
        </div>
    </section>

    <section id="cursos" class="section-container">
        <h2 class="section-title anim-on-scroll">Ruta de Aprendizaje</h2>
        <div class="services-grid">
            <article class="course-card glass-panel anim-on-scroll">
                <div class="card-img-bg" style="background-image: url('imagenes/Bachiller1.png');"></div>
                <div class="card-content">
                    <span class="card-year code-font">1ER GRADO</span>
                    <h3>Lógica y Algoritmos</h3>
                    <p>Los cimientos. Aprende a estructurar tus ideas y descubre cómo piensan las computadoras resolviendo problemas con pseudocódigo.</p>
                    <button class="btn-info" data-link="cursos/PrimerG/mapa1.html">Ver Módulo <i class="ri-arrow-right-line"></i></button>
                </div>
            </article>

            <article class="course-card glass-panel anim-on-scroll">
                <div class="card-img-bg" style="background-image: url('imagenes/Bachiller2.png');"></div>
                <div class="card-content">
                    <span class="card-year code-font">2DO GRADO</span>
                    <h3>Estructuras y Datos</h3>
                    <p>Toma el control. Manipula ciclos, condiciones y almacenamiento básico en memoria usando vectores y matrices unidimensionales.</p>
                    <button class="btn-info" data-link="cursos/SegundoG/mapa2.html">Ver Módulo <i class="ri-arrow-right-line"></i></button>
                </div>
            </article>

            <article class="course-card glass-panel anim-on-scroll">
                <div class="card-img-bg" style="background-image: url('imagenes/Bachiller3.png');"></div>
                <div class="card-content">
                    <span class="card-year code-font">3ER GRADO</span>
                    <h3>P.O.O. y Proyectos</h3>
                    <p>Construye el futuro. Domina el paradigma de Orientación a Objetos creando clases y desarrollando aplicaciones reales.</p>
                    <button class="btn-info" data-link="cursos/TercerG/mapa3.html">Ver Módulo <i class="ri-arrow-right-line"></i></button>
                </div>
            </article>
        </div>
    </section>
</main>

<?php include 'pie-pagina.php'; ?>

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
<script src="home.js"></script> 
</body>
</html>