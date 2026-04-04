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
    
    // Elementos del Templo
    const templeGate = document.getElementById('temple-gate');
    const magicCrystal = document.getElementById('cristal_magico'); // ¡Importante!

    // Botones de comandos
    const btnGet = document.getElementById('btn-get');
    const btnListen = document.getElementById('btn-listen');
    const btnOpen = document.getElementById('btn-open');
    
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
    const TOTAL_STEPS = 5;
    let currentStep = 1;

    // --- CONFIGURACIÓN ---
    const MAX_VIDAS = 3;
    
    // --- VARIABLES DEL JUEGO ---
    let isRunning = false;
    let vidasRestantes = MAX_VIDAS;
    let listenerVinculado = false; // Para saber si el código del usuario funcionó

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
        listenerVinculado = false;
        
        updateUI();
        resetTempleVisuals();
        
        missionLogEl.innerHTML = '';
        logToMission("Templo sellado. Esperando vinculación de evento.", 'info');
        
        hideModals();
        runButton.disabled = false;
        
        // Limpiar cualquier listener anterior
        // Esto es un truco: clonamos el nodo para borrar todos los listeners
        const newCrystal = magicCrystal.cloneNode(true);
        magicCrystal.parentNode.replaceChild(newCrystal, magicCrystal);
        // Volvemos a "agarrar" la referencia al nuevo cristal
        magicCrystal = document.getElementById('cristal_magico');

        codeInput.value = "// let cristal = document.getElementById('cristal_magico');\n// cristal.addEventListener('click', function() {\n//   ...\n// });\n";
    }

    function resetTempleVisuals() {
        templeGate.classList.remove('open');
    }
    
    function updateUI() {
        triesCountEl.textContent = `${vidasRestantes}/${MAX_VIDAS}`;
        triesCountEl.style.color = (vidasRestantes <= 1) ? '#e74c3c' : '#ffffff';
    }

    // --- POPUPS ---
    
    function showVictoryModal() {
        logToMission(`🎉 ¡VICTORIA! Evento 'click' dominado.`, 'success');
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

    // --- ¡LÓGICA DE EJECUCIÓN! ---
    
    // Esta es la función que el usuario DEBE llamar desde su listener
    function abrir_puerta() {
        if (!listenerVinculado) {
            logToMission("¡Error! 'abrir_puerta()' solo puede ser llamada por un evento.", 'error');
            failAttempt("El comando se usó fuera de un 'listener'.");
            return;
        }

        logToMission("¡Clic detectado! Ejecutando 'abrir_puerta()'...", 'event');
        templeGate.classList.add('open');
        
        // Damos tiempo a la animación antes de mostrar la victoria
        setTimeout(showVictoryModal, 1000);
    }
    
    
    function onRunProgram() {
        if(isRunning) return;
        
        const userCode = codeInput.value;
        if (userCode.trim() === '' || userCode.startsWith('//')) {
            logToMission("No hay protocolos en el papiro.", 'error');
            return;
        }
        
        // --- Verificación de "Trampa" ---
        // Si el usuario intenta llamar a abrir_puerta() directamente
        if (userCode.includes("abrir_puerta()") && !userCode.includes("addEventListener")) {
            logToMission("¡Error! La puerta es muy pesada. Solo se puede abrir con el poder de un 'clic' en el cristal.", 'error');
            failAttempt("No se puede llamar a 'abrir_puerta()' directamente.");
            return;
        }

        isRunning = true;
        runButton.disabled = true;
        
        try {
            // "Vincular" el 'document' y 'abrir_puerta' al scope del código
            // Le damos al usuario acceso al 'document' real y a nuestra función 'abrir_puerta'
            const F = new Function('document', 'abrir_puerta', userCode);
            F(document, abrir_puerta);
            
            // Si el código se ejecuta sin error, asumimos que el listener está puesto
            listenerVinculado = true;
            logToMission("Protocolo de 'clic' vinculado.", 'success');
            logToMission("Ahora, ¡haz clic en el cristal en el mundo del juego!", 'info');

        } catch (e) {
            logToMission(`❌ Error de sintaxis: ${e.message}`, 'error');
            failAttempt(e.message);
            isRunning = false;
            runButton.disabled = false;
            return;
        }
        
        // El juego ahora NO termina. Simplemente espera a que el usuario
        // haga clic en el cristal. La función 'abrir_puerta' se encargará de la victoria.
        isRunning = false; 
        // Dejamos el botón deshabilitado para que no vinculen 100 veces
    }
    
    function failAttempt(reason) {
        vidasRestantes--;
        updateUI();
        isRunning = false;
        runButton.disabled = false; // Permitir re-intentar

        if (vidasRestantes <= 0) {
            setTimeout(() => showGameOverModal("Te has quedado sin vidas. " + reason), 500);
        } else {
            logToMission(`Vidas restantes: ${vidasRestantes}.`, 'error');
        }
    }

    // --- NAVEGACIÓN ---
    function goToMap() {
        logToMission("🗺️ Regresando al mapa...", 'info');
        // Ruta para volver al mapa del Grado 2
        window.location.href = '../../mapa2.html';
    }

    // --- EVENT LISTENERS ---
    
    codeInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            onRunProgram();
        }
    });
    
    btnGet.addEventListener('click', () => addCommandToTextarea("let cristal = document.getElementById('cristal_magico');\n"));
    btnListen.addEventListener('click', () => addCommandToTextarea("cristal.addEventListener('click', function() {\n  \n});\n"));
    btnOpen.addEventListener('click', () => addCommandToTextarea("  abrir_puerta();\n"));
    
    runButton.addEventListener('click', onRunProgram);
    resetButton.addEventListener('click', resetGame);
    clearLogButton.addEventListener('click', () => {
        missionLogEl.innerHTML = '';
        logToMission("Templo sellado. Esperando vinculación de evento.", 'info');
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