<?php
session_start();
if (!isset($_SESSION['usuario_id'])) {
    header("Location: ../../../../Navegaciones/login/login.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Programación para Principiantes - El Tesoro de los Colores</title>
    <link rel="stylesheet" href="primerJ.css">
</head>
<body>

    <div id="victory-modal" class="modal-overlay hidden">
        <div class="modal-content">
            <h1>🎉 ¡FELICIDADES! 🎉</h1>
            <p>¡Has completado el patrón de Colores</p>
            <p><strong>🔵 → 🟢 → 🔴 → 🟡 → 🟣</strong></p>
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
            <h1>👋 ¡BIENVENIDO A LOS COLORES! 👋</h1>
            <div class="tutorial-steps">
                <div class="step">
                    <h3>🎯 OBJETIVO</h3>
                    <p>Encuentra los Colores en el orden correcto para completar el patrón</p>
                </div>
                <div class="step">
                    <h3>🎮 COMANDOS</h3>
                    <p><code>move();</code> - Avanzar<br>
                       <code>rotate();</code> - Girar<br>
                       <code>recoger();</code> - Recoger forma actual</p>
                </div>
                <div class="step">
                    <h3>💡 PATRÓN REQUERIDO</h3>
                    <p>Encuentra los colores en orden:<br>
                       <strong>🔵 Azul → 🟢 Verde → 🔴 Rojo → 🟡 Amarillo → 🟣 Morado</strong></p>
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
                    <h3>COLORES</h3>
                    <div id="shapes-found">0/5</div>
                </div>
            </div>
            
            <div class="pattern-container">
                <h3>📐 PATRÓN REQUERIDO</h3>
                <div class="pattern-display">
                    <span class="pattern-shape">🔵</span>
                    <span class="pattern-arrow">→</span>
                    <span class="pattern-shape">🟢</span>
                    <span class="pattern-arrow">→</span>
                    <span class="pattern-shape">🔴</span>
                    <span class="pattern-arrow">→</span>
                    <span class="pattern-shape">🟡</span>
                    <span class="pattern-arrow">→</span>
                    <span class="pattern-shape">🟣</span>
                </div>
            </div>
        </div>

        <div class="control-panel">
            <div class="panel-header">
                <h1>🖥️ MI PRIMER PROGRAMA - COLORES</h1>
                <div class="level-info">
                    <span id="level-title">Nivel 1: Patrón de Colores</span>
                    <div id="tries-counter">
                        <span>💖 Intentos:</span>
                        <span id="tries-count">5/5</span>
                    </div>
                </div>
            </div>

            <div id="output-display">
                <div class="output-header">
                    <span>📟 COLECCIÓN:</span>
                    <span id="output-length">0/5</span>
                </div>
                <div id="program-output">_ _ _ _ _</div>
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
                <textarea id="code-input" placeholder="// Escribe tu código aquí...&#10;// Ejemplo:&#10;move();&#10;move();&#10;recoger();&#10;// ¡Encuentra los colores en orden!"></textarea>
            </div>

            <div class="action-buttons">
                <div class="command-buttons">
                    <button id="btn-move" class="cmd-btn">🚀 move()</button>
                    <button id="btn-rotate" class="cmd-btn">🔄 rotate()</button>
                    <button id="btn-recoger" class="cmd-btn">🎁 recoger()</button>
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

    <script type="module" src="primerJ.js"></script>
</body>
</html>