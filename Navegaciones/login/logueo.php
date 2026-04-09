<?php
session_start();
include '../../conexion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email    = mysqli_real_escape_string($conexion, $_POST['email']);
    $password = $_POST['password'];
    $sql = "SELECT id, nombres, apellido_paterno, apellido_materno, password FROM usuarios WHERE email = '$email' LIMIT 1";
    $resultado = mysqli_query($conexion, $sql);

    if (mysqli_num_rows($resultado) === 1) {
        $usuario = mysqli_fetch_assoc($resultado);
        if (password_verify($password, $usuario['password'])) {
            $_SESSION['usuario_id'] = $usuario['id'];
            $_SESSION['usuario_nombre'] = $usuario['nombres'];
            $_SESSION['usuario_paterno'] = $usuario['apellido_paterno'];
            $_SESSION['usuario_materno'] = $usuario['apellido_materno'];
        
            header("Location: ../../home.php");
            exit;
        } else {
            header("Location: login.php?error=password_incorrecto");
            exit;
        }
    } else {
        header("Location: login.php?error=no_existe");
        exit;
    }
} else {
    header("Location: login.php");
    exit;
}