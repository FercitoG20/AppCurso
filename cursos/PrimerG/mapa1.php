<?php
session_start();
if (!isset($_SESSION['usuario_id'])) {
    header("Location: ../../Navegaciones/login/login.php");
    exit();
}

include '../../conexion.php'; 

$id_user = $_SESSION['usuario_id'];
$total_juegos_mapa1 = 100;
$query = "SELECT DISTINCT juego_id FROM progreso_usuario WHERE usuario_id = '$id_user' AND grado = 1";
$res = mysqli_query($conexion, $query);

$pasados_count = 0;
$niveles_completados = [1];

if($res) {
    while($row = mysqli_fetch_assoc($res)) {
        $niveles_completados[] = (int)$row['juego_id']; 
        $niveles_completados[] = (int)$row['juego_id'] + 1; 
        $pasados_count++;
    }
}

$porcentaje_mapa1 = round(($pasados_count / $total_juegos_mapa1) * 100);
if ($porcentaje_mapa1 > 100) $porcentaje_mapa1 = 100;

$progreso_json = json_encode(array_values(array_unique($niveles_completados)));
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mapa 1 - Aventura de Programación</title>
    <link rel="stylesheet" href="mapa1.css">
    
    <style>
        .progress-pill {
            background: rgba(0, 0, 0, 0.6);
            padding: 8px 15px;
            border-radius: 12px;
            color: #00FFCC;
            font-family: 'Consolas', monospace;
            font-weight: bold;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 10px;
            border: 1px solid rgba(0, 255, 204, 0.4);
            box-shadow: 0 0 10px rgba(0,255,204,0.2);
        }
        .progress-bar-mini {
            width: 80px; height: 8px;
            background: #333; border-radius: 4px; overflow: hidden;
        }
        .progress-fill-mini {
            height: 100%; background: #00FFCC; 
            width: <?php echo $porcentaje_mapa1; ?>%;
            transition: width 0.5s ease-in-out;
            box-shadow: 0 0 8px #00FFCC;
        }
    </style>
</head>
<body>

    <div class="top-nav-map" style="display: flex; gap: 15px; align-items: center;">
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

        <div class="progress-pill" title="Tu progreso en el 1er Grado">
            <span><?php echo $porcentaje_mapa1; ?>%</span>
            <div class="progress-bar-mini">
                <div class="progress-fill-mini"></div>
            </div>
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
    
    <script>
        window.PROGRESO_USUARIO = <?php echo $progreso_json; ?>;
        console.log("🎮 Mapa cargado para: <?php echo $_SESSION['usuario_nombre']; ?>");
        console.log("📈 Niveles desbloqueados: ", window.PROGRESO_USUARIO);
    </script>

    <script src="mapa1.js"></script>
</body>
</html>