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
<div class="hero-grid centrar-proximamente">
            <div class="hero-content hero-glass-card glass-panel anim-on-scroll">
                
                <h1>Estamos</h1>
                <h1>trabajando</h1>
                <h1 class="outline">Proximamente..</h1>
                <br>
                <div>
                    
                    <a href="/AppCurso/home.php" class="btn-action primary scroll-to">
                        Regresar al panel principal
                    </a>
                </div>
            </div>


</main>

<?php include 'pie-pagina.php'; ?>

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
<script src="home.js"></script> 
</body>
</html>