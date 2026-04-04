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
    
    // Elementos del Taller
    const golemTierra = document.getElementById('golem_tierra');
    const golemFuego = document.getElementById('golem_fuego');
    const golemHielo = document.getElementById('golem_hielo');
    const golemMap = {
        'golem_tierra': golemTierra,
        'golem_fuego': golemFuego,
        'golem_hielo': golemHielo
    };

    // Botones de comandos
    const btnFunction = document.getElementById('btn-function');
    const btnScan = document.getElementById('btn-scan');
    const btnCall = document.getElementById('btn-call');
    
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
    const GOLEMS_A_ESCANEAR = ['golem_tierra', 'golem_fuego', 'golem_hielo'];
    
    // --- VARIABLES DEL JUEGO ---
    let isRunning = false;
    let vidasRestantes = MAX_VIDAS;
    let golemsEscaneados = new Set(); // Para rastrear cuáles se escanearon

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
        resetGolemVisuals();
        
        missionLogEl.innerHTML = '';
        logToMission("Taller listo. Esperando escaneo de golems.", 'info');
        
        hideModals();
        runButton.disabled = false;
        
        codeInput.value = "function escanear_golem(objetivo) {\n  // Tu código aquí\n}\n\n// Llama a tu función 3 veces aquí\n";
    }

    function resetGolemVisuals() {
        golemsEscaneados.clear();
        golemTierra.classList.remove('on');
        golemFuego.classList.remove('on');
        golemHielo.classList.remove('on');
    }
    
    function updateUI() {
        triesCountEl.textContent = `${vidasRestantes}/${MAX_VIDAS}`;
        triesCountEl.style.color = (vidasRestantes <= 1) ? '#e74c3c' : '#ffffff';
    }

    // --- POPUPS ---
    
    function showVictoryModal() {
        logToMission(`🎉 ¡VICTORIA! Todos los golems escaneados.`, 'success');
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
            logToMission("El esquema está en blanco.", 'error');
            return;
        }

        isRunning = true;
        runButton.disabled = true;
        resetGolemVisuals();

        // --- Sandboxing ---
        // Este es el "comando base" que la función del jugador debe llamar.
        function escanear_componente(nombre) {
            logToMission(`...Recibido comando para escanear: ${nombre}`, 'scan');
            if (golemMap[nombre]) {
                golemMap[nombre].classList.add('on');
                golemsEscaneados.add(nombre);
                logToMission(`✅ Componente '${nombre}' escaneado con éxito.`, 'success');
            } else {
                logToMission(`❌ Componente '${nombre}' no reconocido.`, 'error');
                throw new Error("Componente no reconocido");
            }
        }
        
        // --- Ejecución ---
        try {
            // new Function es más seguro que 'eval'
            // Inyectamos el comando base 'escanear_componente'
            const F = new Function('escanear_componente', userCode);
            F(escanear_componente);

        } catch (e) {
            // Captura errores de sintaxis o de 'escanear_componente'
            failAttempt(e.message);
            return;
        }

        // --- Verificación ---
        
        if (golemsEscaneados.size === 3) {
            logToMission("¡Todos los golems fueron escaneados!", 'success');
            setTimeout(showVictoryModal, 1000);
        } else if (!userCode.includes('function')) {
            failAttempt("No has DEFINIDO una función (falta la palabra 'function').");
        } else if (golemsEscaneados.size < 3) {
            failAttempt(`Solo se escanearon ${golemsEscaneados.size} de 3 golems. ¡Llama a tu función 3 veces!`);
        } else {
            failAttempt("El escaneo falló. Revisa tu lógica.");
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
    
    btnFunction.addEventListener('click', () => addCommandToTextarea("function escanear_golem(objetivo) {\n    \n}\n"));
    btnScan.addEventListener('click', () => addCommandToTextarea("    escanear_componente(objetivo);\n"));
    btnCall.addEventListener('click', () => addCommandToTextarea("escanear_golem('');\n"));
    
    runButton.addEventListener('click', onRunProgram);
    resetButton.addEventListener('click', resetGame);
    clearLogButton.addEventListener('click', () => {
        missionLogEl.innerHTML = '';
        logToMission("Taller listo. Esperando escaneo de golems.", 'info');
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