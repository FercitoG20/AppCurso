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
    
    // Elementos del Reactor
    const reactorCore = document.getElementById('reactor-core');
    const gaugeNeedle = document.getElementById('gauge-needle');
    const gaugeLabel = document.getElementById('gauge-label');
    const reactorLabel = document.getElementById('reactor-label');

    // Botones de comandos
    const btnLet = document.getElementById('btn-let');
    const btnActivate = document.getElementById('btn-activate');
    
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
    const POTENCIA_REQUERIDA = 100;
    
    // --- VARIABLES DEL JUEGO ---
    let isRunning = false;
    let vidasRestantes = MAX_VIDAS;
    let userCode = '';

    // --- LÓGICA DEL TUTORIAL ANIMADO ---
    function showTutorialStep(stepNumber) {
        currentStep = stepNumber;
        tutorialSteps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 === currentStep);
        });

        tutorialStepCounter.textContent = `Paso ${currentStep} / ${TOTAL_STEPS}`;
        tutorialPrevBtn.disabled = (currentStep === 1);
        
        const isLastStep = (currentStep === TOTAL_STEPS);
        tutorialNextBtn.classList.toggle('hidden', isLastStep);
        startButton.classList.toggle('hidden', !isLastStep);
    }

    tutorialNextBtn.addEventListener('click', () => {
        if (currentStep < TOTAL_STEPS) showTutorialStep(currentStep + 1);
    });

    tutorialPrevBtn.addEventListener('click', () => {
        if (currentStep > 1) showTutorialStep(currentStep - 1);
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
        resetReactorVisuals();
        
        missionLogEl.innerHTML = '';
        logToMission("Reactor listo. Esperando variable de potencia.", 'info');
        
        hideModals();
        runButton.disabled = false;
        
        codeInput.value = "let potencia = 100;\nactivar_reactor(potencia);\n";
    }

    function resetReactorVisuals() {
        reactorCore.className = 'off';
        reactorLabel.textContent = 'REACTOR (APAGADO)';
        // 0% = -90deg, 100% = 90deg
        gaugeNeedle.style.transform = 'translateX(-50%) rotate(-90deg)';
        gaugeLabel.textContent = '0%';
    }
    
    function updateUI() {
        triesCountEl.textContent = `${vidasRestantes}/${MAX_VIDAS}`;
        triesCountEl.style.color = (vidasRestantes <= 1) ? '#e74c3c' : '#ffffff';
    }

    // --- POPUPS ---
    
    function showVictoryModal() {
        logToMission(`🎉 ¡VICTORIA! Reactor estabilizado.`, 'success');
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

    // --- LÓGICA DE EJECUCIÓN ---
    
    function onRunProgram() {
        if(isRunning) return;
        
        userCode = codeInput.value;
        if (userCode.trim() === '') {
            logToMission("El panel de control está vacío.", 'error');
            return;
        }

        isRunning = true;
        runButton.disabled = true;
        resetReactorVisuals();

        let potenciaRecibida = null;
        let funcionLlamada = false;

        // Esta es la función que el código del usuario llamará
        function activar_reactor(potencia) {
            funcionLlamada = true;
            potenciaRecibida = potencia;
            logToMission(`...Recibida llamada a activar_reactor con valor: ${potencia}`, 'info');
        }

        // Usamos 'eval' de forma segura (ish) para ejecutar el código del usuario
        // y permitirle definir 'let'.
        try {
            eval(userCode);
        } catch (e) {
            logToMission(`❌ Error de sintaxis: ${e.message}`, 'error');
            failAttempt("El código tiene un error de sintaxis.");
            return;
        }

        // --- Verificación ---
        
        if (!funcionLlamada) {
            logToMission("¡Error! Nunca se llamó a la función 'activar_reactor(potencia)'.", 'error');
            failAttempt("La función 'activar_reactor' no fue llamada.");
            return;
        }

        if (typeof potenciaRecibida !== 'number') {
            logToMission(`¡Error! Se pasó un valor no numérico al reactor: ${potenciaRecibida}`, 'error');
            failAttempt("No se pasó un número al reactor.");
            return;
        }

        // Animar el medidor
        // Mapear 0-100 a -90deg a 90deg
        let potenciaVisual = Math.max(0, Math.min(100, potenciaRecibida)); // Limitar a 0-100
        let rotacion = (potenciaVisual * 1.8) - 90; // (0*1.8)-90 = -90. (100*1.8)-90 = 90.
        
        gaugeNeedle.style.transform = `translateX(-50%) rotate(${rotacion}deg)`;
        gaugeLabel.textContent = `${potenciaVisual}%`;

        // Comprobar victoria/derrota
        if (potenciaRecibida === POTENCIA_REQUERIDA) {
            logToMission("¡Potencia correcta! Reactor activado.", 'success');
            reactorCore.className = 'on';
            reactorLabel.textContent = 'REACTOR (ONLINE)';
            setTimeout(showVictoryModal, 1200); // Esperar a la animación
        } else {
            logToMission(`¡Potencia incorrecta! Se esperaban ${POTENCIA_REQUERIDA} pero se recibieron ${potenciaRecibida}.`, 'error');
            failAttempt(`Potencia incorrecta: ${potenciaRecibida}.`);
        }
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
        // Ajusta esta ruta si tu mapa no está dos niveles arriba
        window.location.href = '../../mapa1.html';
    }

    // --- EVENT LISTENERS ---
    
    codeInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            onRunProgram();
        }
    });
    
    btnLet.addEventListener('click', () => addCommandToTextarea("let nombre_variable = valor;"));
    btnActivate.addEventListener('click', () => addCommandToTextarea("activar_reactor(nombre_variable);"));
    
    runButton.addEventListener('click', onRunProgram);
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