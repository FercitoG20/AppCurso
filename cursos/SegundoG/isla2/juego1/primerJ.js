document.addEventListener('DOMContentLoaded', () => {
    
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

    // ##########################################
    // ######    NUEVAS REFERENCIAS DOM    ######
    // ##########################################
    const backToTutorialButton = document.getElementById('back-to-tutorial');
    const backToMapButton = document.getElementById('back-to-map');
    // ##########################################

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
    let recetaActual = []; // Aquí guardaremos los pasos del jugador
    let pasoRecetaActual = 0; // Para comparar con la RECETA_CORRECTA

    // --- FUNCIONES DEL JUEGO ---

    function logToMission(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `> ${message}`;
        missionLogEl.appendChild(entry);
        missionLogEl.scrollTop = missionLogEl.scrollHeight;
    }

    function startGame() {
        tutorialModal.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        resetGame();
    }

    function resetGame() {
        isRunning = false;
        intentosRestantes = MAX_INTENTOS;
        recetaActual = [];
        pasoRecetaActual = 0;
        
        updateUI();
        resetLabUI();
        
        missionLogEl.innerHTML = '';
        logToMission("Laboratorio listo. Esperando instrucciones.", 'info');
        logToMission("Receta: 2 'agua_brillante', 1 'hierba_roja', mezclar 5s", 'warning');
        
        hideModals();
        runButton.disabled = false;
        
        // Resetear hint
        codeInput.value = "// Ejemplo:\n// agregar('agua_brillante', 2);\n";
    }

    function resetLabUI() {
        potionLiquidEl.style.height = '0%';
        potionLiquidEl.style.background = '#4fc3f7';
        recipeSteps.forEach(step => step.classList.remove('completed'));
        
        // Resetear ingredientes en estantería
        document.querySelectorAll('.ingredient').forEach(el => el.classList.remove('used'));
    }
    
    function updateUI() {
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
        victoryModal.classList.remove('hidden');
    }
    
    function showGameOverModal() {
        logToMission("💀 ERROR CRÍTICO - Demasiados intentos fallidos", "error");
        gameoverModal.classList.remove('hidden');
        runButton.disabled = true;
    }
    
    function hideModals() {
        victoryModal.classList.add('hidden');
        gameoverModal.classList.add('hidden');
    }

    // --- COMANDOS ---
    
    function addCommandToTextarea(command) {
        codeInput.value += command + '\n';
        codeInput.focus();
    }

    // --- EJECUCIÓN ---
    
    function onRunProgram() {
        if(isRunning) return;
        
        const userCode = codeInput.value;
        isRunning = true;
        runButton.disabled = true;
        
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
            runButton.disabled = false;
            failAttempt();
        }
    }

    function processCodeLines(codeLines, lineIndex) {
        if (lineIndex >= codeLines.length || !isRunning) {
            // Fin de la ejecución
            logToMission("✅ ...Preparación finalizada. Verificando resultado...", 'info');
            isRunning = false;
            runButton.disabled = false;
            checkWinCondition();
            return;
        }

        const currentCode = codeLines[lineIndex];
        logToMission(`> Ejecutando: ${currentCode}`, 'info');

        // Procesar el comando actual
        // El callback se llama cuando la "animación" termina
        processCommand(currentCode, (success) => {
            if (!success || !isRunning) {
                // Si el comando falló o el juego se detuvo
                isRunning = false;
                runButton.disabled = false;
                failAttempt();
                return;
            }
            
            // Esperar un poco y procesar la siguiente línea
            setTimeout(() => {
                processCodeLines(codeLines, lineIndex + 1);
            }, 600); // 600ms de delay entre comandos
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
        // 'agua_brillante', 2 -> ["'agua_brillante'", " 2"]
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
                return parseFloat(arg); // Convertir a número
            });

        // Verificar el comando y ejecutarlo
        const recetaEsperada = RECETA_CORRECTA[pasoRecetaActual];
        
        if (funcName === 'agregar') {
            const [ingrediente, cantidad] = args;
            
            if (!ingrediente || !cantidad || isNaN(cantidad)) {
                 logToMission(`❌ Error en 'agregar': Parámetros incorrectos. (Ej: 'ingrediente', cantidad)`, 'error');
                 callback(false); return;
            }
            
            // Comprobación de receta (Paso 1 o 2)
            if (!recetaEsperada || recetaEsperada.command !== 'agregar' || recetaEsperada.args[0] !== ingrediente || recetaEsperada.args[1] !== cantidad) {
                logToMission(`💥 ¡KABOOM! Se agregó el ingrediente/cantidad incorrecto.`, 'error');
                logToMission(`Esperaba: ${recetaEsperada.args[1]} de '${recetaEsperada.args[0]}'`, 'error');
                potionLiquidEl.style.background = '#ff0000'; // Explosión
                callback(false); return;
            }
            
            // Éxito
            logToMission(`✅ Añadido ${cantidad} de '${ingrediente}'`, 'success');
            
            // Lógica de UI específica del paso
            if (ingrediente === 'agua_brillante') {
                recipeSteps[0].classList.add('completed');
                potionLiquidEl.style.height = '30%';
                potionLiquidEl.style.background = '#03a9f4'; // Azul
            } else if (ingrediente === 'hierba_roja') {
                recipeSteps[1].classList.add('completed');
                potionLiquidEl.style.height = '50%';
                potionLiquidEl.style.background = '#f44336'; // Rojo
            }
            
            document.querySelector(`.ingredient[data-name="${ingrediente}"]`).classList.add('used');
            pasoRecetaActual++;
            callback(true);
            
        } else if (funcName === 'mezclar') {
            const [tiempo] = args;

            if (isNaN(tiempo)) {
                 logToMission(`❌ Error en 'mezclar': Parámetro incorrecto. (Ej: mezclar(5))`, 'error');
                 callback(false); return;
            }

            // Validar que los ingredientes anteriores estén
            if (pasoRecetaActual !== 2) {
                 logToMission(`💥 ¡PUF! Faltan ingredientes antes de mezclar.`, 'error');
                 callback(false); return;
            }
            
            if (!recetaEsperada || recetaEsperada.command !== 'mezclar' || recetaEsperada.args[0] !== tiempo) {
                logToMission(`💥 ¡PUF! Se mezcló por el tiempo incorrecto.`, 'error');
                logToMission(`Esperaba: ${recetaEsperada.args[0]} segundos`, 'error');
                potionLiquidEl.style.background = '#333'; // Se quema
                callback(false); return;
            }
            
            // Éxito
            logToMission(`✅ Mezclando por ${tiempo} segundos...`, 'success');
            pasoRecetaActual++;
            recipeSteps[2].classList.add('completed'); // Marcar paso 3
            potionLiquidEl.style.background = '#66bb6a'; // Poción final verde
            potionLiquidEl.style.height = '60%';
            callback(true);

        } else {
            logToMission(`⚠️ Comando no reconocido: ${funcName}`, 'error');
            callback(false);
        }
    }

    function failAttempt() {
        intentosRestantes--;
        updateUI();
        if (intentosRestantes <= 0) {
            setTimeout(showGameOverModal, 1000);
        }
    }

    // --- VERIFICACIÓN DE VICTORIA ---
    
    function checkWinCondition() {
        // Se gana si se completaron todos los pasos de la receta
        if (pasoRecetaActual === RECETA_CORRECTA.length) {
            logToMission("🎊 ¡RECETA COMPLETA! ¡Poción de Curación creada!", 'success');
            setTimeout(showVictoryModal, 1000);
        } else {
            // No se completó
            logToMission("❌ La poción no funciona. No se siguieron todos los pasos.", 'error');
            failAttempt();
        }
    }

    // ##########################################
    // ######    NUEVAS FUNCIONES JS       ######
    // ##########################################
    
    /**
     * Muestra el modal de tutorial/introducción
     */
    function showTutorial() {
        tutorialModal.classList.remove('hidden');
    }

    /**
     * Navega de vuelta al mapa principal.
     * Asumimos que el mapa está en '../../mapa1.html'
     * (Basado en la estructura isla2/juego1/juego1.html)
     */
    function goToMap() {
        logToMission("🗺️ Regresando al mapa...", 'info');
        // Ajusta esta URL a la ubicación real de tu mapa principal
        window.location.href = '../../mapa1.html';
    }
    // ##########################################
    // ######      FIN FUNCIONES NUEVAS    ######
    // ##########################################


    // --- EVENT LISTENERS ---
    
    codeInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            onRunProgram();
        }
    });
    
    btnAdd.addEventListener('click', () => addCommandToTextarea("agregar('ingrediente', cantidad);"));
    btnMix.addEventListener('click', () => addCommandToTextarea("mezclar(tiempo);"));
    
    runButton.addEventListener('click', onRunProgram);
    resetButton.addEventListener('click', resetGame);
    clearLogButton.addEventListener('click', () => {
        missionLogEl.innerHTML = '';
        logToMission("🗑️ Bitácora limpiada", 'info');
    });
    
    startButton.addEventListener('click', startGame);
    retryButton.addEventListener('click', resetGame);

    // --- NUEVOS EVENT LISTENERS ---
    backToTutorialButton.addEventListener('click', showTutorial);
    backToMapButton.addEventListener('click', goToMap);
    
    // El botón de "Continuar" en la victoria también te lleva al mapa
    nextLevelButton.addEventListener('click', goToMap); 
    // --- FIN NUEVOS EVENT LISTENERS ---


    // --- INICIALIZACIÓN ---
    // Mostrar tutorial primero
    tutorialModal.classList.remove('hidden');
});