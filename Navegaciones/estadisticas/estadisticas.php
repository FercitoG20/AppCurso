<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['usuario_id'])) {
    header("Location: /AppCurso/Navegaciones/login/login.php");
    exit();
}

$pagina_actual = 'estadisticas';

include '../../conexion.php';

$total_completados = 0;
$promedio_intentos = 0;

$total_juegos_curso = 100;
$total_juegos_global = 300;

$porcentaje_curso = 0;
$porcentaje_global = 0;

$nombres_juegos = [];
$intentos_juegos = [];
$nombres_islas = [];
$conteo_islas = [];
$actividad_reciente = [];
$error_db = null;

if (isset($conexion)) {
    $usuario_id = intval($_SESSION['usuario_id']);
    
    $query_stats = "SELECT COUNT(*) as total, AVG(intentos) as promedio FROM progreso_usuario WHERE usuario_id = $usuario_id";
    $res_stats = mysqli_query($conexion, $query_stats);
    if($res_stats && $row = mysqli_fetch_assoc($res_stats)) {
        $total_completados = $row['total'];
        $promedio_intentos = round($row['promedio'] ?? 0, 1);
        
        $porcentaje_curso = min(100, round(($total_completados / $total_juegos_curso) * 100));
        $porcentaje_global = min(100, round(($total_completados / $total_juegos_global) * 100, 1)); 
    }

    $query_grafica1 = "SELECT nombre_juego, intentos FROM progreso_usuario WHERE usuario_id = $usuario_id ORDER BY fecha_completado ASC LIMIT 10";
    $res_grafica1 = mysqli_query($conexion, $query_grafica1);
    if($res_grafica1) {
        while($row = mysqli_fetch_assoc($res_grafica1)) {
            $nombres_juegos[] = $row['nombre_juego'];
            $intentos_juegos[] = $row['intentos'];
        }
    }

    $query_grafica2 = "SELECT nombre_isla, COUNT(*) as cantidad FROM progreso_usuario WHERE usuario_id = $usuario_id GROUP BY nombre_isla";
    $res_grafica2 = mysqli_query($conexion, $query_grafica2);
    if($res_grafica2) {
        while($row = mysqli_fetch_assoc($res_grafica2)) {
            $nombres_islas[] = $row['nombre_isla'];
            $conteo_islas[] = $row['cantidad'];
        }
    }

    $query_recientes = "SELECT nombre_juego, nombre_isla, grado, intentos, fecha_completado FROM progreso_usuario WHERE usuario_id = $usuario_id ORDER BY fecha_completado DESC LIMIT 5";
    $res_recientes = mysqli_query($conexion, $query_recientes);
    if($res_recientes) {
        while($row = mysqli_fetch_assoc($res_recientes)) {
            $actividad_reciente[] = $row;
        }
    }
} else {
    $error_db = "Error crítico: No se encontró la conexión a la base de datos.";
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ProgFundamentos | Mis Estadísticas</title>
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet">
    <link rel="stylesheet" href="../../home.css">
    <link rel="stylesheet" href="estadisticas.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="dark-mode"> 
    
    <?php include '../../encabezado.php'; ?>

    <main class="dashboard-wrapper">
        <div class="dashboard-header">
            <h1 class="dashboard-title">Centro de <span class="highlight">Comando</span></h1>
            <p>Monitorea tu evolución, analiza tus intentos y domina el código.</p>
        </div>
        
        <?php if($error_db): ?>
            <div class="glass-panel" style="padding: 30px; text-align: center; border: 1px solid #ff4757; color: #ff4757;">
                <i class="ri-error-warning-line" style="font-size: 3rem; margin-bottom: 10px; display: block;"></i>
                <strong><?php echo $error_db; ?></strong>
            </div>
        <?php else: ?>
            
            <div class="progress-section glass-panel">
                <div class="progress-info">
                    <h3>Progreso del Curso Actual</h3>
                    <span><?php echo $porcentaje_curso; ?>%</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" style="width: <?php echo $porcentaje_curso; ?>%;"></div>
                </div>

                <div class="progress-info" style="margin-top: 25px;">
                    <h3 style="color: #9b59b6;">Progreso Global (Todos los Cursos)</h3>
                    <span style="color: #9b59b6; text-shadow: 0 0 10px rgba(155, 89, 182, 0.5);"><?php echo $porcentaje_global; ?>%</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" style="width: <?php echo $porcentaje_global; ?>%; background: linear-gradient(90deg, #9b59b6, #3498db); box-shadow: 0 0 15px rgba(155, 89, 182, 0.6);"></div>
                </div>
            </div>

            <div class="kpi-grid">
                <div class="kpi-card glass-panel">
                    <div class="kpi-icon"><i class="ri-trophy-fill"></i></div>
                    <div class="kpi-data">
                        <h4>Niveles Superados</h4>
                        <h2><?php echo $total_completados; ?></h2>
                    </div>
                </div>
                <div class="kpi-card glass-panel">
                    <div class="kpi-icon" style="color: #3498db; background: rgba(52, 152, 219, 0.1);"><i class="ri-focus-3-line"></i></div>
                    <div class="kpi-data">
                        <h4>Promedio de Intentos</h4>
                        <h2><?php echo $promedio_intentos; ?></h2>
                    </div>
                </div>
                <div class="kpi-card glass-panel">
                    <div class="kpi-icon" style="color: #f1c40f; background: rgba(241, 196, 15, 0.1);"><i class="ri-medal-fill"></i></div>
                    <div class="kpi-data">
                        <h4>Rango Actual</h4>
                        <h2><?php echo ($total_completados > 10) ? 'Programador' : 'Novato'; ?></h2>
                    </div>
                </div>
            </div>

            <?php if($total_completados > 0): ?>
                <div class="charts-grid">
                    <div class="chart-container glass-panel">
                        <h3>Evolución de Intentos</h3>
                        <div class="line-wrapper">
                            <canvas id="lineChart"></canvas>
                        </div>
                    </div>
                    <div class="chart-container glass-panel">
                        <h3>Misiones por Sector</h3>
                        <div class="doughnut-wrapper">
                            <canvas id="doughnutChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="activity-section glass-panel">
                    <h3><i class="ri-history-line"></i> Últimas Operaciones</h3>
                    <div class="table-responsive">
                        <table class="activity-table">
                            <thead>
                                <tr>
                                    <th>Misión</th>
                                    <th>Sector</th>
                                    <th>Intentos</th>
                                    <th>Fecha de Registro</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach($actividad_reciente as $fila): ?>
                                    <tr>
                                        <td><strong><?php echo htmlspecialchars($fila['nombre_juego']); ?></strong></td>
                                        <td><?php echo htmlspecialchars($fila['nombre_isla']); ?></td>
                                        <td><span class="badge code-font"><?php echo $fila['intentos']; ?></span></td>
                                        <td class="code-font txt-muted"><?php echo date('d/m/Y H:i', strtotime($fila['fecha_completado'])); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            <?php else: ?>
                <div class="empty-state glass-panel">
                    <i class="ri-space-ship-line"></i>
                    <h2>Tu viaje apenas comienza</h2>
                    <p>Aún no has completado ninguna misión. ¡Ve al mapa y escribe tu primera línea de código!</p>
                </div>
            <?php endif; ?>

        <?php endif; ?>
    </main>

    <?php include '../../pie-pagina.php'; ?>

    <script>
        const chartData = {
            nombresJuegos: <?php echo json_encode($nombres_juegos); ?>,
            intentosJuegos: <?php echo json_encode($intentos_juegos); ?>,
            nombresIslas: <?php echo json_encode($nombres_islas); ?>,
            conteoIslas: <?php echo json_encode($conteo_islas); ?>
        };
    </script>
    <script src="estadisticas.js"></script>
</body>
</html>