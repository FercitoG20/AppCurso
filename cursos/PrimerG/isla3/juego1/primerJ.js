document.addEventListener('DOMContentLoaded', () => {
    
    // --- REFERENCIAS AL DOM ---
    const codeInput = document.getElementById('code-input');
    const runButton = document.getElementById('run-button');
    const resetButton = document.getElementById('reset-button');
    const clearLogButton = document.getElementById('clear-log');
    
    // UI del juego
    const triesCountEl = document.getElementById('tries-count');
    const missionLogEl = document.getElementById('mission-log');
    const victoryModal = document.getElementById('victory-modal');
    const gameoverModal = document.getElementById('gameover-modal');
    const gameoverReasonEl = document.getElementById('gameover-reason');
    const gameContainer = document.getElementById('game-container');
    
    // Elementos del Cofre
    const chestEl = document.getElementById('chest');
    const chestResultEl = document.getElementById('chest-result');
    const sensorDisplay = document.getElementById('sensor-variable-display');
    const test1Box = document.getElementById('test-1');
    const test1Status = document.getElementById('test-1-status');
    const test2Box = document.getElementById('test-2');
    const test2Status = document.getElementById('test-2-status');

    // Botones de comandos
    const btnIf = document.getElementById('btn-if');
    const btnElse = document.getElementById('btn-else');
    const btnOpen = document.getElementById('btn-open');
    const btnIgnore = document.getElementById('btn-ignore');
    
    // Botones de Navegación
    const backToTutorialButton = document.getElementById('back-to-tutorial');
    const backToMapButton = document.getElementById('back-to-map');
    const nextLevelButton = document.getElementById('next-level-button');
    const retryButton = document.getElementById('retry-button');

    // --- REFERENCIAS TUTORIAL ---
    const tutorialModal = document.getElementById('tutorial-modal');
    const startButton = document.getElementById('start-button');
    const tutorialSteps = document.querySelectorAll('.tutorial-step');
    const tutorialPrevBtn = document.getElementById('tutorial-prev');
    const tutorialNextBtn = document.getElementById('tutorial-next');
    const tutorialStepCounter = document.getElementById('tutorial-step-counter');
    const TOTAL_STEPS = tutorialSteps.length;
    let currentStep = 1;


    // --- CONFIGURACIÓN ---
    const MAX_VIDAS = 3;
    
    // --- VARIABLES DEL JUEGO ---
    let isRunning = false;
    let vidasRestantes = MAX_VIDAS;
    let userCode = '';

    // --- LÓGICA DEL TUTORIAL ANIMADO ---
    function showTutorialStep(stepNumber) {
        currentStep = stepNumber;
        tutorialSteps.forEach((step, index) => {
            if (index + 1 === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        tutorialStepCounter.textContent = `Paso ${currentStep} / ${TOTAL_STEPS}`;
        tutorialPrevBtn.disabled = (currentStep === 1);
        
        if (currentStep === TOTAL_STEPS) {
            tutorialNextBtn.classList.add('hidden');
            startButton.classList.remove('hidden');
        } else {
            tutorialNextBtn.classList.remove('hidden');
            startButton.classList.add('hidden');
        }
    }

    tutorialNextBtn.addEventListener('click', () => {
        if (currentStep < TOTAL_STEPS) {
            showTutorialStep(currentStep + 1);
        }
    });

    tutorialPrevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            showTutorialStep(currentStep - 1);
        }
    });
    
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
        vidasRestantes = MAX_VIDAS;
        userCode = '';
        
        updateUI();
        resetVisuals();
        
        missionLogEl.innerHTML = '';
        logToMission("Esperando libro de reglas...", 'info');
        
        hideModals();
        runButton.disabled = false;
        
        codeInput.value = "if (tipo_cofre == 'tesoro') {\n    // Tu decisión aquí\n} else {\n    // Tu otra decisión aquí\n}\n";
    }

    function resetVisuals() {
        chestEl.className = '';
        chestResultEl.className = 'hidden';
        sensorDisplay.textContent = "// Esperando prueba...";

        test1Box.className = 'test-box';
        test1Status.textContent = 'PENDIENTE';
        test1Status.className = 'PENDIENTE';

        test2Box.className = 'test-box';
        test2Status.textContent = 'PENDIENTE';
        test2Status.className = 'PENDIENTE';
    }
    
    function updateUI() {
        triesCountEl.textContent = `${vidasRestantes}/${MAX_VIDAS}`;
        triesCountEl.style.color = (vidasRestantes <= 1) ? '#e74c3c' : '#ffffff';
    }

    // --- POPUPS ---
    
    function showVictoryModal() {
        logToMission(`🎉 ¡VICTORIA! Código superó ambas pruebas.`, 'success');
        victoryModal.classList.remove('hidden');
    }
    
    function showGameOverModal(reason) {
        logToMission(`💀 DERROTA: ${reason}`, "error");
        gameoverReasonEl.textContent = reason;
        gameoverModal.classList.remove('hidden');
        runButton.disabled = true;
    }
    
    function hideModals() {
        victoryModal.classList.add('hidden');
        gameoverModal.classList.add('hidden');
    }
    
    function showTutorial() {
        tutorialModal.classList.remove('hidden');
        showTutorialStep(1); // Reiniciar a la primera página
    }

    // --- COMANDOS ---
    
    function addCommandToTextarea(command) {
        codeInput.value += command + '\n';
        codeInput.focus();
    }

    // --- EJECUCIÓN (¡LA NUEVA LÓGICA!) ---
    
    async function onRunTests() {
        if(isRunning) return;
        
        userCode = codeInput.value;
        if (userCode.trim() === '') {
            logToMission("El libro de reglas está vacío.", 'error');
            return;
        }

        isRunning = true;
        runButton.disabled = true;
        resetVisuals(); // Limpiar el estado visual
        
        // --- PRUEBA 1: TESORO ---
        logToMission("--- Iniciando Prueba 1 ---", 'test');
        const test1_result = await runSingleTest('tesoro', test1Box, test1Status);
        
        if (!test1_result) {
            logToMission("Prueba 1 fallida. Deteniendo ejecución.", 'error');
            failAttempt("Tu código falló en el caso 'tesoro'.");
            return;
        }

        logToMission("Prueba 1 superada. Iniciando Prueba 2...", 'success');
        
        // --- PRUEBA 2: TRAMPA ---
        logToMission("--- Iniciando Prueba 2 ---", 'test');
        const test2_result = await runSingleTest('trampa', test2Box, test2Status);
        
        if (!test2_result) {
            logToMission("Prueba 2 fallida. Deteniendo ejecución.", 'error');
            failAttempt("Tu código falló en el caso 'trampa'.");
            return;
        }

        // --- AMBAS PASARON ---
        logToMission("¡FELICIDADES! Tu código pasó ambas pruebas.", 'success');
        runButton.disabled = false;
        isRunning = false;
        setTimeout(showVictoryModal, 500);
    }
    
    /**
     * Ejecuta una sola prueba (ej. 'tesoro' o 'trampa')
     * Retorna true si pasa, false si falla.
     */
    function runSingleTest(testCase, testBoxEl, testStatusEl) {
        return new Promise((resolve) => {
            let tipo_cofre = testCase;
            let decision = 'ninguna'; // 'abrir' o 'ignorar'
            
            // Actualizar UI
            sensorDisplay.textContent = `tipo_cofre = '${testCase}'`;
            chestEl.classList.add(testCase);
            logToMission(`Caso de prueba: ${testCase}`, 'info');

            // Definir las funciones que el usuario puede llamar
            function abrir_cofre() {
                logToMission("...Decisión: abrir_cofre()", 'info');
                decision = 'abrir';
            }
            function ignorar_cofre() {
                logToMission("...Decisión: ignorar_cofre()", 'info');
                decision = 'ignorar';
            }

            // Ejecutar el código del usuario de forma segura
            try {
                const F = new Function('tipo_cofre', 'abrir_cofre', 'ignorar_cofre', userCode);
                F(tipo_cofre, abrir_cofre, ignorar_cofre);
            } catch (e) {
                logToMission(`❌ Error de sintaxis: ${e.message}`, 'error');
                testStatusEl.textContent = 'FALLO';
                testStatusEl.className = 'FALLO';
                testBoxEl.classList.add('fail');
                resolve(false); // La prueba falla
                return;
            }

            // Verificar la decisión
            let success = false;
            let resultSymbol = '';
            
            if (testCase === 'tesoro') {
                if (decision === 'abrir') {
                    logToMission("¡Correcto! Abriste el tesoro.", 'success');
                    success = true;
                    resultSymbol = '🏆';
                } else {
                    logToMission("¡Error! Ignoraste un tesoro.", 'error');
                    resultSymbol = '❌';
                }
            } 
            else if (testCase === 'trampa') {
                if (decision === 'ignorar') {
                    logToMission("¡Correcto! Ignoraste la trampa.", 'success');
                    success = true;
                    resultSymbol = '✅';
                } else {
                    logToMission("¡Error! Abriste una trampa.", 'error');
                    resultSymbol = '💥';
                }
            }

            // Animar el resultado
            setTimeout(() => {
                chestResultEl.textContent = resultSymbol;
                chestResultEl.className = 'show';
                if (decision === 'abrir') {
                    chestEl.classList.add('open');
                }
                
                // Actualizar el cuadro de prueba
                testStatusEl.textContent = success ? 'ÉXITO' : 'FALLO';
                testStatusEl.className = success ? 'ÉXITO' : 'FALLO';
                testBoxEl.classList.add(success ? 'pass' : 'fail');
                
                // Esperar un poco más antes de resolver
                setTimeout(() => resolve(success), 1500); 
            }, 500);
        });
    }


    function failAttempt(reason) {
        vidasRestantes--;
        updateUI();
        isRunning = false;
        runButton.disabled = false;

        if (vidasRestantes <= 0) {
            setTimeout(() => showGameOverModal("Te has quedado sin vidas. " + reason), 500);
        } else {
            logToMission(`Vidas restantes: ${vidasRestantes}.`, 'error');
        }
    }


    // --- NAVEGACIÓN ---
    function goToMap() {
        logToMission("🗺️ Regresando al mapa...", 'info');
        window.location.href = '../../mapa1.html';
    }

    // --- EVENT LISTENERS ---
    
    codeInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            onRunTests();
        }
    });
    
    btnIf.addEventListener('click', () => addCommandToTextarea("if (tipo_cofre == '...') {\n    \n}"));
    btnElse.addEventListener('click', () => addCommandToTextarea("else {\n    \n}"));
    btnOpen.addEventListener('click', () => addCommandToTextarea("abrir_cofre();"));
    btnIgnore.addEventListener('click', () => addCommandToTextarea("ignorar_cofre();"));
    
    runButton.addEventListener('click', onRunTests);
    resetButton.addEventListener('click', resetGame);
    clearLogButton.addEventListener('click', () => {
        missionLogEl.innerHTML = '';
        logToMission("🗑️ Bitácora limpiada", 'info');
    });
    
    // Listeners de Modales y Navegación
    startButton.addEventListener('click', startGame);
    retryButton.addEventListener('click', resetGame);
    backToTutorialButton.addEventListener('click', showTutorial);
    backToMapButton.addEventListener('click', goToMap);
    nextLevelButton.addEventListener('click', goToMap); 
    
    // --- INICIALIZACIÓN ---
    showTutorialStep(1); // Empezar en el paso 1 del tutorial
    tutorialModal.classList.remove('hidden'); // Mostrar el tutorial
});