// =================================================================
// ARCHIVO: cursos/PrimerG/isla2/juego1/primerJ.js
// VERSIÓN: CORREGIDA - PARA ESTRUCTURA DE MAPA EN FIREBASE
// =================================================================

// Importamos los servicios de Firebase
import { reportarJuegoCompletado, reportarIntentoFallido, reportarInicioDeJuego } from '../../../../librerias/logService.js';
import { completarJuego } from '../../../../librerias/auth.firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 DOM cargado, inicializando laboratorio de alquimia...");
    
    // --- REFERENCIAS AL DOM ---
    const codeInput = document.getElementById('code-input');
    const runButton = document.getElementById('run-button');
    const resetButton = document.getElementById('reset-button');
    const clearLogButton = document.getElementById('clear-log');
    const startButton = document.getElementById('start-button');
    
    // UI del juego
    const triesCountEl = document.getElementById('tries-count');
    const missionLogEl = document.getElementById('mission-log');
    const victoryModal = document.getElementById('victory-modal');
    const gameoverModal = document.getElementById('gameover-modal');
    const tutorialModal = document.getElementById('tutorial-modal');
    const nextLevelButton = document.getElementById('next-level-button');
    const retryButton = document.getElementById('retry-button');
    const gameContainer = document.getElementById('game-container');
    
    // Elementos del laboratorio
    const potionLiquidEl = document.getElementById('potion-liquid');
    const recipeSteps = [
        document.getElementById('step-1'),
        document.getElementById('step-2'),
        document.getElementById('step-3')
    ];

    // Botones de comandos
    const btnAdd = document.getElementById('btn-add');
    const btnMix = document.getElementById('btn-mix');
    const backToTutorialButton = document.getElementById('back-to-tutorial');
    const backToMapButton = document.getElementById('back-to-map');

    // Verificar elementos críticos
    console.log("✅ startButton encontrado:", !!startButton);
    console.log("✅ gameContainer encontrado:", !!gameContainer);
    console.log("✅ tutorialModal encontrado:", !!tutorialModal);

    // --- CONFIGURACIÓN ---
    const MAX_INTENTOS = 5;
    
    // Esta es la receta correcta que el jugador debe seguir
    const RECETA_CORRECTA = [
        { command: 'agregar', args: ['agua_brillante', 2] },
        { command: 'agregar', args: ['hierba_roja', 1] },
        { command: 'mezclar', args: [5] }
    ];

    // --- VARIABLES DEL JUEGO ---
    let isRunning = false;
    let intentosRestantes = MAX_INTENTOS;
    let recetaActual = [];
    let pasoRecetaActual = 0;
    
    // Variable para guardar el estado cuando se muestra el tutorial
    let savedGameState = {
        code: '',
        intentos: MAX_INTENTOS,
        pasoReceta: 0
    };

    // --- AL INICIAR EL JUEGO, REPORTARLO ---
    (async () => {
        try {
            await reportarInicioDeJuego('PrimerG', 'isla2', 'juego1');
            console.log("✅ Inicio de juego reportado correctamente");
        } catch (error) {
            console.warn("⚠️ No se pudo reportar el inicio del juego, pero el juego continuará.", error);
        }
    })();

    // --- FUNCIONES DEL JUEGO ---

    function logToMission(message, type = 'info') {
        if (!missionLogEl) return;
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `> ${message}`;
        missionLogEl.appendChild(entry);
        missionLogEl.scrollTop = missionLogEl.scrollHeight;
    }

    function startGame() {
        console.log("🎮 FUNCIÓN startGame EJECUTADA");
        if (tutorialModal) tutorialModal.classList.add('hidden');
        if (gameContainer) gameContainer.classList.remove('hidden');
        
        // Si hay estado guardado, restaurarlo
        if (savedGameState.code) {
            if (codeInput) codeInput.value = savedGameState.code;
            intentosRestantes = savedGameState.intentos;
            pasoRecetaActual = savedGameState.pasoReceta;
            updateUI();
            logToMission("📚 Continuando con la práctica...", 'info');
            savedGameState = { code: '', intentos: MAX_INTENTOS, pasoReceta: 0 };
        } else {
            resetGame();
        }
    }

    function resetGame() {
        isRunning = false;
        intentosRestantes = MAX_INTENTOS;
        recetaActual = [];
        pasoRecetaActual = 0;
        
        updateUI();
        resetLabUI();
        
        if (missionLogEl) missionLogEl.innerHTML = '';
        logToMission("🧪 Laboratorio listo. Esperando instrucciones.", 'info');
        logToMission("📜 Receta: 2 'agua_brillante', 1 'hierba_roja', mezclar 5s", 'warning');
        
        hideModals();
        if (runButton) runButton.disabled = false;
        
        // Resetear hint
        if (codeInput) codeInput.value = "// Ejemplo:\n// agregar('agua_brillante', 2);\n// agregar('hierba_roja', 1);\n// mezclar(5);\n";
    }

    function resetLabUI() {
        if (potionLiquidEl) {
            potionLiquidEl.style.height = '0%';
            potionLiquidEl.style.background = '#4fc3f7';
        }
        recipeSteps.forEach(step => {
            if (step) step.classList.remove('completed');
        });
        
        // Resetear ingredientes en estantería
        document.querySelectorAll('.ingredient').forEach(el => el.classList.remove('used'));
    }
    
    function updateUI() {
        if (!triesCountEl) return;
        triesCountEl.textContent = `${intentosRestantes}/${MAX_INTENTOS}`;
        if (intentosRestantes <= 2) {
            triesCountEl.style.color = '#ff6b6b';
        } else {
            triesCountEl.style.color = '#4fc3f7';
        }
    }

    // --- POPUPS ---
    
    function showVictoryModal() {
        logToMission(`🎉 ¡POCIÓN CREADA! Has seguido la receta perfectamente.`, 'success');
        if (victoryModal) victoryModal.classList.remove('hidden');
    }
    
    function showGameOverModal() {
        logToMission("💀 ERROR CRÍTICO - Demasiados intentos fallidos", "error");
        if (gameoverModal) gameoverModal.classList.remove('hidden');
        if (runButton) runButton.disabled = true;
    }
    
    function hideModals() {
        if (victoryModal) victoryModal.classList.add('hidden');
        if (gameoverModal) gameoverModal.classList.add('hidden');
    }

    // --- COMANDOS ---
    
    function addCommandToTextarea(command) {
        if (!codeInput) return;
        const cursorPos = codeInput.selectionStart;
        const textBefore = codeInput.value.substring(0, cursorPos);
        const textAfter = codeInput.value.substring(cursorPos);
        
        codeInput.value = textBefore + command + '\n' + textAfter;
        codeInput.focus();
        codeInput.setSelectionRange(cursorPos + command.length + 1, cursorPos + command.length + 1);
    }

    // --- EJECUCIÓN ---
    
    function onRunProgram() {
        if(isRunning || intentosRestantes <= 0) return;
        if (!codeInput) return;
        
        const userCode = codeInput.value;
        isRunning = true;
        if (runButton) runButton.disabled = true;
        
        // Limpiar estado para esta ejecución
        recetaActual = [];
        pasoRecetaActual = 0;
        resetLabUI();
        logToMission("🔧 Iniciando preparación de la poción...", 'info');

        try {
            // Dividir el código en líneas y filtrar
            const codeLines = userCode.split('\n')
                .map(line => line.trim())
                .filter(line => line !== '' && !line.startsWith('//'));
            
            if (codeLines.length === 0) {
                throw new Error("No hay comandos en el libro de hechizos");
            }
            
            logToMission(`📝 Se encontraron ${codeLines.length} comandos.`, 'info');
            
            // Procesar cada línea
            processCodeLines(codeLines, 0);
            
        } catch (error) {
            logToMission(`❌ Error de sintaxis: ${error.message}`, 'error');
            isRunning = false;
            if (runButton) runButton.disabled = false;
            failAttempt();
        }
    }

    function processCodeLines(codeLines, lineIndex) {
        if (lineIndex >= codeLines.length || !isRunning) {
            // Fin de la ejecución
            logToMission("✅ ...Preparación finalizada. Verificando resultado...", 'info');
            isRunning = false;
            if (runButton) runButton.disabled = false;
            checkWinCondition();
            return;
        }

        const currentCode = codeLines[lineIndex];
        logToMission(`> Ejecutando: ${currentCode}`, 'info');

        // Procesar el comando actual
        processCommand(currentCode, (success) => {
            if (!success || !isRunning) {
                // Si el comando falló o el juego se detuvo
                isRunning = false;
                if (runButton) runButton.disabled = false;
                failAttempt();
                return;
            }
            
            // Esperar un poco y procesar la siguiente línea
            setTimeout(() => {
                processCodeLines(codeLines, lineIndex + 1);
            }, 600);
        });
    }

    /**
     * Parsea y ejecuta un solo comando.
     * Llama al callback(success) al terminar.
     */
    function processCommand(command, callback) {
        // Regex simple para capturar: comando(argumentos)
        const match = command.match(/(\w+)\s*\((.*)\)\s*;?/);
        
        if (!match) {
            logToMission(`❌ Error de Sintaxis: No se entiende '${command}'. ¿Faltan ( ) o ;?`, 'error');
            callback(false);
            return;
        }

        const funcName = match[1];
        const argsStr = match[2];
        
        // Parsear argumentos (simplificado)
        const args = argsStr.split(',')
            .map(arg => arg.trim())
            .map(arg => {
                // Convertir a string (quitando comillas) o número
                if (arg.startsWith("'") && arg.endsWith("'")) {
                    return arg.substring(1, arg.length - 1);
                }
                if (arg.startsWith('"') && arg.endsWith('"')) {
                    return arg.substring(1, arg.length - 1);
                }
                return parseFloat(arg);
            });

        // Verificar el comando y ejecutarlo
        const recetaEsperada = RECETA_CORRECTA[pasoRecetaActual];
        
        if (funcName === 'agregar') {
            const [ingrediente, cantidad] = args;
            
            if (!ingrediente || !cantidad || isNaN(cantidad)) {
                logToMission(`❌ Error en 'agregar': Parámetros incorrectos. (Ej: 'ingrediente', cantidad)`, 'error');
                callback(false);
                return;
            }
            
            // Comprobación de receta
            if (!recetaEsperada || recetaEsperada.command !== 'agregar' || 
                recetaEsperada.args[0] !== ingrediente || recetaEsperada.args[1] !== cantidad) {
                
                logToMission(`💥 ¡KABOOM! Se agregó el ingrediente/cantidad incorrecto.`, 'error');
                if (recetaEsperada) {
                    logToMission(`Esperaba: ${recetaEsperada.args[1]} de '${recetaEsperada.args[0]}'`, 'error');
                }
                if (potionLiquidEl) potionLiquidEl.style.background = '#ff0000'; // Explosión
                callback(false);
                return;
            }
            
            // Éxito
            logToMission(`✅ Añadido ${cantidad} de '${ingrediente}'`, 'success');
            
            // Lógica de UI específica del paso
            if (ingrediente === 'agua_brillante') {
                if (recipeSteps[0]) recipeSteps[0].classList.add('completed');
                if (potionLiquidEl) {
                    potionLiquidEl.style.height = '30%';
                    potionLiquidEl.style.background = '#03a9f4'; // Azul
                }
            } else if (ingrediente === 'hierba_roja') {
                if (recipeSteps[1]) recipeSteps[1].classList.add('completed');
                if (potionLiquidEl) {
                    potionLiquidEl.style.height = '50%';
                    potionLiquidEl.style.background = '#f44336'; // Rojo
                }
            }
            
            const ingredienteEl = document.querySelector(`.ingredient[data-name="${ingrediente}"]`);
            if (ingredienteEl) ingredienteEl.classList.add('used');
            
            pasoRecetaActual++;
            callback(true);
            
        } else if (funcName === 'mezclar') {
            const [tiempo] = args;

            if (isNaN(tiempo)) {
                logToMission(`❌ Error en 'mezclar': Parámetro incorrecto. (Ej: mezclar(5))`, 'error');
                callback(false);
                return;
            }

            // Validar que los ingredientes anteriores estén
            if (pasoRecetaActual !== 2) {
                logToMission(`💥 ¡PUF! Faltan ingredientes antes de mezclar.`, 'error');
                callback(false);
                return;
            }
            
            if (!recetaEsperada || recetaEsperada.command !== 'mezclar' || recetaEsperada.args[0] !== tiempo) {
                logToMission(`💥 ¡PUF! Se mezcló por el tiempo incorrecto.`, 'error');
                logToMission(`Esperaba: ${recetaEsperada.args[0]} segundos`, 'error');
                if (potionLiquidEl) potionLiquidEl.style.background = '#333'; // Se quema
                callback(false);
                return;
            }
            
            // Éxito
            logToMission(`✅ Mezclando por ${tiempo} segundos...`, 'success');
            pasoRecetaActual++;
            if (recipeSteps[2]) recipeSteps[2].classList.add('completed');
            if (potionLiquidEl) {
                potionLiquidEl.style.background = '#66bb6a'; // Poción final verde
                potionLiquidEl.style.height = '60%';
            }
            callback(true);

        } else {
            logToMission(`⚠️ Comando no reconocido: ${funcName}`, 'error');
            callback(false);
        }
    }

    function failAttempt() {
        intentosRestantes--;
        updateUI();
        
        // Reportar intento fallido
        reportarIntentoFallido('PrimerG', 'isla2', 'juego1', intentosRestantes)
            .catch(err => console.warn("No se pudo reportar el intento fallido", err));
        
        if (intentosRestantes <= 0) {
            setTimeout(showGameOverModal, 1000);
        }
    }

    // --- VERIFICACIÓN DE VICTORIA ---
    
    function checkWinCondition() {
        // Se gana si se completaron todos los pasos de la receta
        if (pasoRecetaActual === RECETA_CORRECTA.length) {
            logToMission("🎊 ¡RECETA COMPLETA! ¡Poción de Curación creada!", 'success');
            
            // ✅ AHORA USA LA FUNCIÓN CORREGIDA
            completarJuego('PrimerG', 'isla2', 'juego1')
                .then(() => {
                    console.log("✅ Juego marcado como completo y puntos actualizados.");
                    return reportarJuegoCompletado('PrimerG', 'isla2', 'juego1');
                })
                .then(() => {
                    console.log("✅ Log de juego completado registrado.");
                    // Mostrar mensaje de éxito adicional
                    logToMission("💾 Progreso guardado en Firebase!", 'success');
                })
                .catch(error => {
                    console.error("❌ Error en el proceso de victoria:", error);
                    logToMission(`❌ Error al guardar: ${error.message}`, 'error');
                })
                .finally(() => {
                    setTimeout(showVictoryModal, 1000);
                });
        } else {
            // No se completó
            logToMission("❌ La poción no funciona. No se siguieron todos los pasos.", 'error');
            failAttempt();
        }
    }

    /**
     * Muestra el modal de tutorial/introducción
     */
    function showTutorial() {
        console.log("📚 Mostrando tutorial");
        
        // Guardar el estado actual
        savedGameState = {
            code: codeInput ? codeInput.value : '',
            intentos: intentosRestantes,
            pasoReceta: pasoRecetaActual
        };
        
        if (gameContainer) gameContainer.classList.add('hidden');
        if (tutorialModal) tutorialModal.classList.remove('hidden');
        isRunning = false;
        if (runButton) runButton.disabled = false;
    }

    /**
     * Navega de vuelta al mapa principal.
     */
    function goToMap() {
        if (confirm("¿Estás seguro de que quieres volver al mapa? Se perderá el progreso actual.")) {
            logToMission("🗺️ Regresando al mapa...", 'info');
            window.location.href = '../../mapa1.html';
        }
    }

    // --- EVENT LISTENERS ---
    
    if (codeInput) {
        codeInput.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                onRunProgram();
            }
        });
    }
    
    if (btnAdd) {
        btnAdd.addEventListener('click', () => addCommandToTextarea("agregar('agua_brillante', 2);"));
    }
    
    if (btnMix) {
        btnMix.addEventListener('click', () => addCommandToTextarea("mezclar(5);"));
    }
    
    if (runButton) runButton.addEventListener('click', onRunProgram);
    if (resetButton) resetButton.addEventListener('click', resetGame);
    
    if (clearLogButton) {
        clearLogButton.addEventListener('click', () => {
            if (missionLogEl) missionLogEl.innerHTML = '';
            logToMission("🗑️ Bitácora limpiada", 'info');
        });
    }
    
    if (startButton) {
        startButton.addEventListener('click', () => {
            console.log("👆 Clic en ¡EMPEZAR!");
            startGame();
        });
    }
    
    if (retryButton) retryButton.addEventListener('click', resetGame);

    if (backToTutorialButton) {
        backToTutorialButton.addEventListener('click', showTutorial);
    }
    
    if (backToMapButton) {
        backToMapButton.addEventListener('click', goToMap);
    }
    
    if (nextLevelButton) {
        nextLevelButton.addEventListener('click', goToMap);
    }

    // --- INICIALIZACIÓN ---
    // Mostrar tutorial primero
    if (tutorialModal) {
        tutorialModal.classList.remove('hidden');
        console.log("📚 Tutorial mostrado inicialmente");
    }

    console.log("🧪 Laboratorio de alquimia listo!");
});