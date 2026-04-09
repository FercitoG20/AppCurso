<?php
session_start();
if (!isset($_SESSION['usuario_id'])) {
    header("Location: ../../Navegaciones/login/login.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mapa 3D - Aventura de Programación</title>
    <link rel="stylesheet" href="mapa1.css">
    
</head>
<body>

    <div class="top-nav-map">
        <button id="home-button" title="Volver al Home" onclick="window.location.href='../../home.php'">
            🏠 Home
        </button>
        
        <div class="user-pill">
            <i class="ri-user-fill"></i> 
            <?php 
                echo htmlspecialchars($_SESSION['usuario_nombre'] . ' ' . 
                $_SESSION['usuario_paterno'] . ' ' . 
                $_SESSION['usuario_materno']); 
            ?>
        </div>
    </div>

    <h1 id="main-title">
        Primer Curso de Programación
        <span>Nivel Bachillerato</span>
    </h1>

    <button id="back-to-map" class="map-btn">🗺️ VOLVER AL MAPA</button>
    <button id="reset-view-button" title="Resetear Vista">🌍 Vista General</button>
    
    <canvas id="map-canvas"></canvas>

    <div id="level-popup" class="hidden">
        <button id="close-popup" title="Cerrar">&times;</button>
        <h2 id="level-title">Nivel 1</h2>
        <p id="level-topic">El viaje comienza</p>
        <button id="play-button">¡Jugar!</button>
    </div>

    <script src="../../librerias/three.min.js"></script>
    <script src="../../librerias/CSS2DRenderer.js"></script>
    <script src="../../librerias/OrbitControls.js"></script>
    <script src="../../librerias/tween.umd.js"></script>
    <script src="mapa1.js"></script>

    <script>
        console.log("🎮 Mapa cargado para: <?php echo $_SESSION['usuario_nombre']; ?>");
    </script>
</body>
</html>