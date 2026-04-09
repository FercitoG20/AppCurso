<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "AppCurso";
$conexion = mysqli_connect($host, $user, $pass, $db);

if (!$conexion) {
    echo "<div style='color: red; font-family: sans-serif;'>";
    echo "<h3>❌ Error de conexión</h3>";
    echo "Detalle: " . mysqli_connect_error();
    echo "</div>";
    die();
}

echo "<div style='color: green; font-family: sans-serif;'>";
echo "<h3>✅ ¡Conexión completada con éxito!</h3>";
echo "Te has conectado a la base de datos: <strong>$db</strong>";
echo "</div>";
?>