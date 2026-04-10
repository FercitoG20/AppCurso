<?php
session_start();

// 1. Verificamos que el usuario haya iniciado sesión
if (!isset($_SESSION['usuario_id'])) {
    header("Location: ../../../../Navegaciones/login/login.php");
    exit();
}

// 2. Conectamos a la BD para saber su progreso REAL
include '../../../../conexion.php'; 

$id_user = $_SESSION['usuario_id'];
$nivel_de_este_juego = 2; 

// 3. Buscamos cuál es el nivel máximo que ha completado en el grado 1
$query = "SELECT MAX(juego_id) as max_nivel FROM progreso_usuario WHERE usuario_id = '$id_user' AND grado = 1";
$res = mysqli_query($conexion, $query);
$row = mysqli_fetch_assoc($res);

// Si no ha jugado nada, su max_nivel es 0. 
// El nivel permitido siempre es el nivel máximo que pasó + 1.
$max_nivel_completado = $row['max_nivel'] ? (int)$row['max_nivel'] : 0;
$nivel_permitido = $max_nivel_completado + 1;

// 4. Comparamos: Si el nivel permitido es menor al nivel de este juego, lo bloqueamos
if ($nivel_permitido < $nivel_de_este_juego) {
    header("Location: ../../../../mapa1.php?mensaje=nivel_bloqueado");
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Programación para Principiantes - Laberinto de Números</title>
    <link rel="stylesheet" href="segundoJ.css">
</head>
<body>
    <div id="victory-modal" class="modal-overlay hidden">
        <div class="modal-content">
            <h1>🎉 ¡FELICIDADES! 🎉</h1>
            <p>¡Has completado tu primer programa matemático!</p>
            <p><strong>"1 + 2 + 3 + 4 + 5 = 15" ejecutado correctamente</strong></p>
            <button id="next-level-button">Continuar 🚀</button>
        </div>
    </div>
    
    <div id="gameover-modal" class="modal-overlay hidden">
        <div class="modal-content">
            <h1>💀 ¡ERROR! 💀</h1>
            <p>Demasiados intentos fallidos</p>
            <button id="retry-button">Intentar de Nuevo 🔄</button>
        </div>
    </div>

    <div id="tutorial-modal" class="modal-overlay">
        <div class="modal-content tutorial">
            <h1>👋 ¡BIENVENIDO A NÚMEROS! 👋</h1>
            <div class="tutorial-steps">
                <div class="step">
                    <h3>🎯 OBJETIVO</h3>
                    <p>Encuentra los números en orden y súmalos para obtener <strong>"15"</strong></p>
                </div>
                <div class="step">
                    <h3>🎮 COMANDOS</h3>
                    <p><code>move();</code> - Avanzar<br>
                       <code>rotate();</code> - Girar<br>
                       <code>sumar();</code> - Sumar número actual</p>
                </div>
                <div class="step">
                    <h3>💡 CONSEJO</h3>
                    <p>Encuentra los números en orden:<br>
                       <strong>1 → 2 → 3 → 4 → 5</strong><br>
                       La suma total debe ser 15</p>
                </div>
            </div>
            <button id="start-button">¡EMPEZAR! 💻</button>
        </div>
    </div>

    <div id="game-container" class="hidden">
        <div class="game-world">
            <div id="grid-world">
                <div id="robot">🤖</div>
            </div>
            
            <div class="live-info">
                <div class="info-card">
                    <h3>POSICIÓN</h3>
                    <div id="position-display">[1, 1]</div>
                </div>
                <div class="info-card">
                    <h3>DIRECCIÓN</h3>
                    <div id="direction-display">→ ESTE</div>
                </div>
                <div class="info-card">
                    <h3>SUMA ACTUAL</h3>
                    <div id="sum-display">0</div>
                </div>
            </div>
        </div>

        <div class="control-panel">
            <div class="panel-header">
                <h1>🖥️ MI PRIMER PROGRAMA MATEMÁTICO</h1>
                <div class="level-info">
                    <span id="level-title">Nivel 2: Suma del 1 al 5</span>
                    <div id="tries-counter">
                        <span>💖 Intentos:</span>
                        <span id="tries-count">5/5</span>
                    </div>
                </div>
            </div>

            <div id="output-display">
                <div class="output-header">
                    <span>📟 SUMA TOTAL:</span>
                    <span id="output-length">0/15</span>
                </div>
                <div id="program-output">0</div>
            </div>

            <div id="mission-log-container">
                <div class="log-header">
                    <span>📋 BITÁCORA</span>
                    <button id="clear-log">🗑️</button>
                </div>
                <div id="mission-log"></div>
            </div>

            <div class="code-editor">
                <div class="editor-header">
                    <span>📝 EDITOR</span>
                    <span class="editor-tips">💡 Ctrl+Enter</span>
                </div>
                <textarea id="code-input" placeholder="// Escribe tu código aquí...&#10;// Ejemplo:&#10;move();&#10;move();&#10;sumar();&#10;// ¡Encuentra los números 1,2,3,4,5!"></textarea>
            </div>

            <div class="action-buttons">
                <div class="command-buttons">
                    <button id="btn-move" class="cmd-btn">🚀 move()</button>
                    <button id="btn-rotate" class="cmd-btn">🔄 rotate()</button>
                    <button id="btn-sumar" class="cmd-btn">➕ sumar()</button>
                </div>
                <div class="control-buttons">
                    <button id="run-button" class="primary-btn">▶ EJECUTAR</button>
                    <button id="reset-button" class="secondary-btn">🔄 REINICIAR</button>
                </div>
                <div class="navigation-buttons">
                    <button id="back-to-tutorial" class="help-btn">📚 VER TUTORIAL</button>
                    <button id="back-to-map" class="map-btn">🗺️ VOLVER AL MAPA</button>
                </div>
            </div>
        </div>
    </div>

    <script type="module" src="segundoJ.js"></script>
</body>
</html>