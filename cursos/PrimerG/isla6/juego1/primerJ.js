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
    
    // Elementos del Pedestal
    const crystalEl = document.getElementById('crystal');
    const runeEl = document.getElementById('rune');

    // Botones de comandos
    const btnFunction = document.getElementById('btn-function');
    const btnRune = document.getElementById('btn-rune');
    const btnEnergy = document.getElementById('btn-energy');
    
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
    
    // Variables para rastrear el hechizo
    let runaActivada = false;
    let energiaLanzada = false;
    let funcionDefinida = false;
    let funcionLlamada = false;

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
        
        updateUI();
        resetMagicVisuals();
        
        missionLogEl.innerHTML = '';
        logToMission("Pedestal listo. Esperando hechizo.", 'info');
        
        hideModals();
        runButton.disabled = false;
        
        codeInput.value = "// 1. Define tu función aquí\nfunction hechizo_luz() {\n\n}\n\n// 2. Llama a tu función aquí\n";
    }

    function resetMagicVisuals() {
        crystalEl.classList.remove('on');
        runeEl.classList.remove('on');
        runaActivada = false;
        energiaLanzada = false;
        funcionDefinida = false;
        funcionLlamada = false;
    }
    
    function updateUI() {
        triesCountEl.textContent = `${vidasRestantes}/${MAX_VIDAS}`;
        triesCountEl.style.color = (vidasRestantes <= 1) ? '#e74c3c' : '#ffffff';
    }

    // --- POPUPS ---
    
    function showVictoryModal() {
        logToMission(`🎉 ¡VICTORIA! Cristal activado.`, 'success');
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
        
        const userCode = codeInput.value;
        if (userCode.trim() === '') {
            logToMission("El papiro está en blanco.", 'error');
            return;
        }

        isRunning = true;
        runButton.disabled = true;
        resetMagicVisuals();

        // --- Sandboxing ---
        // Estas son las únicas funciones que el usuario puede llamar
        // Se inyectan en el 'eval'
        
        function activar_runa() {
            if (!funcionDefinida) {
                logToMission("¡Magia salvaje! 'activar_runa' solo funciona DENTRO de un hechizo (function).", 'error');
                throw new Error("Magia salvaje detectada");
            }
            logToMission("...Runa activada...", 'spell');
            runaActivada = true;
            runeEl.classList.add('on');
        }

        function lanzar_energia() {
            if (!funcionDefinida) {
                logToMission("¡Magia salvaje! 'lanzar_energia' solo funciona DENTRO de un hechizo (function).", 'error');
                throw new Error("Magia salvaje detectada");
            }
            if (!runaActivada) {
                logToMission("¡Error! Debes activar la runa ANTES de lanzar la energía.", 'error');
                throw new Error("Orden de hechizo incorrecto");
            }
            logToMission("...¡Energía lanzada al cristal!", 'spell');
            energiaLanzada = true;
            crystalEl.classList.add('on');
        }
        
        // --- Ejecución ---
        try {
            // Buscamos si el usuario DEFINIÓ una función
            if (userCode.includes('function')) {
                funcionDefinida = true;
            }
            
            // Buscamos si el usuario LLAMÓ a una función
            // Esto es una simplificación, busca "nombre()"
            if (/\w+\s*\(\s*\)/.test(userCode.split('}').pop() || '')) {
                 funcionLlamada = true;
            }
            
            eval(userCode);

        } catch (e) {
            // Captura errores del 'eval' o de nuestras funciones (Magia salvaje, etc.)
            failAttempt(e.message);
            return;
        }

        // --- Verificación ---
        
        if (!funcionDefinida) {
            failAttempt("No has DEFINIDO una función. (Usa la palabra 'function')");
        } else if (!funcionLlamada) {
            failAttempt("¡Definiste un gran hechizo! Pero olvidaste LLAMARLO. (Escribe 'hechizo_luz();' después de definirlo)");
        } else if (runaActivada && energiaLanzada) {
            logToMission("¡Hechizo completado con éxito!", 'success');
            setTimeout(showVictoryModal, 1000);
        } else if (!runaActivada) {
            failAttempt("El hechizo se lanzó, pero olvidaste 'activar_runa()' DENTRO de él.");
        } else if (!energiaLanzada) {
            failAttempt("El hechizo se lanzó, pero olvidaste 'lanzar_energia()' DENTRO de él.");
        } else {
            failAttempt("El hechizo falló. Revisa tu lógica.");
        }
        
        isRunning = false;
        runButton.disabled = false;
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
        // Ajusta esta ruta
        window.location.href = '../../mapa1.html';
    }

    // --- EVENT LISTENERS ---
    
    codeInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            onRunProgram();
        }
    });
    
    btnFunction.addEventListener('click', () => addCommandToTextarea("function nombre_hechizo() {\n    \n}\n"));
    btnRune.addEventListener('click', () => addCommandToTextarea("    activar_runa();\n"));
    btnEnergy.addEventListener('click', () => addCommandToTextarea("    lanzar_energia();\n"));
    
    runButton.addEventListener('click', onRunProgram);
    resetButton.addEventListener('click', resetGame);
    clearLogButton.addEventListener('click', () => {
        missionLogEl.innerHTML = '';
        logToMission("Pedestal listo. Esperando hechizo.", 'info');
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