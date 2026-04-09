<?php
include '../../conexion.php'; 

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    $nombres  = mysqli_real_escape_string($conexion, $_POST['nombres']);
    $paterno  = mysqli_real_escape_string($conexion, $_POST['paterno']);
    $materno  = mysqli_real_escape_string($conexion, $_POST['materno']);
    $email    = mysqli_real_escape_string($conexion, $_POST['email']);
    $password = $_POST['password'];

    if (empty($nombres) || empty($paterno) || empty($email) || empty($password)) {
        header("Location: registro.php?error=vacio");
        exit;
    }

    $checkEmail = "SELECT email FROM usuarios WHERE email = '$email' LIMIT 1";
    $resultado = mysqli_query($conexion, $checkEmail);

    if (mysqli_num_rows($resultado) > 0) {
        header("Location: registro.php?error=email_existe");
        exit;
    }

    $passHash = password_hash($password, PASSWORD_BCRYPT);

    $sql = "INSERT INTO usuarios (nombres, apellido_paterno, apellido_materno, email, password, rol) 
            VALUES ('$nombres', '$paterno', '$materno', '$email', '$passHash', 'estudiante')";

    if (mysqli_query($conexion, $sql)) {
        header("Location: registro.php?success=1");
        exit;
    } else {
        die("Error crítico en el sistema: " . mysqli_error($conexion));
    }

    mysqli_close($conexion);
} else {
    header("Location: registro.php");
    exit;
}