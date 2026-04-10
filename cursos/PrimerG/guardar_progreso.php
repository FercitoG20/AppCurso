<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');
$ruta_conexion = '../../conexion.php'; 

if (!file_exists($ruta_conexion)) {
    echo json_encode(['status' => 'error', 'message' => 'NO ENCUENTRO CONEXION.PHP']);
    exit;
}

include $ruta_conexion;

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'La sesión expiró o no existe.']);
    exit;
}

$usuario_id = intval($_SESSION['usuario_id']);
$nombre_base = isset($_SESSION['usuario_nombre']) ? $_SESSION['usuario_nombre'] : '';
$paterno = isset($_SESSION['usuario_paterno']) ? $_SESSION['usuario_paterno'] : '';
$materno = isset($_SESSION['usuario_materno']) ? $_SESSION['usuario_materno'] : '';
$nombre_alumno = trim("$nombre_base $paterno $materno");
$nombre_alumno = mysqli_real_escape_string($conexion, $nombre_alumno);
$grado = isset($_POST['grado']) ? intval($_POST['grado']) : 1;
$isla_id = isset($_POST['isla_id']) ? intval($_POST['isla_id']) : 1;
$nombre_isla = isset($_POST['nombre_isla']) ? mysqli_real_escape_string($conexion, $_POST['nombre_isla']) : 'Isla Desconocida';
$juego_id = isset($_POST['juego_id']) ? intval($_POST['juego_id']) : 1;
$nombre_juego = isset($_POST['nombre_juego']) ? mysqli_real_escape_string($conexion, $_POST['nombre_juego']) : 'Juego Desconocido';
$intentos = isset($_POST['intentos']) ? intval($_POST['intentos']) : 1;
$check_query = "SELECT id FROM progreso_usuario WHERE usuario_id = $usuario_id AND isla_id = $isla_id AND juego_id = $juego_id AND grado = $grado";
$resultado = mysqli_query($conexion, $check_query);

if (!$resultado) {
    echo json_encode(['status' => 'error', 'message' => 'Error SQL: ' . mysqli_error($conexion)]);
    exit;
}

if (mysqli_num_rows($resultado) == 0) {
    $insert_query = "INSERT INTO progreso_usuario 
                     (usuario_id, nombre_alumno, grado, isla_id, nombre_isla, juego_id, nombre_juego, intentos) 
                     VALUES 
                     ($usuario_id, '$nombre_alumno', $grado, $isla_id, '$nombre_isla', $juego_id, '$nombre_juego', $intentos)";
                     
    if (mysqli_query($conexion, $insert_query)) {
        echo json_encode(['status' => 'success', 'message' => 'Progreso guardado en BD']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error SQL Insert: ' . mysqli_error($conexion)]);
    }
} else {
    echo json_encode(['status' => 'success', 'message' => 'El nivel ya estaba completado antes']);
}
?>