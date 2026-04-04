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
    
    // Elementos de la Bóveda
    const accessPanel = document.getElementById('access-panel');
    const accessStatus = document.getElementById('access-status');
    const userDisplay = document.getElementById('user-display');
    const passDisplay = document.getElementById('pass-display');

    // Botones de comandos
    const btnLet = document.getElementById('btn-let');
    const btnDot = document.getElementById('btn-dot');
    const btnLogin = document.getElementById('btn-login');
    
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
    const USUARIO_CORRECTO = 'Graduado';
    const CLAVE_CORRECTA = 1337;
    
    // --- VARIABLES DEL JUEGO ---
    let isRunning = false;
    let vidasRestantes = MAX_VIDAS;

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
        resetVaultVisuals();
        
        missionLogEl.innerHTML = '';
        logToMission("Sistema de bóveda en espera.", 'info');
        logToMission("Objeto 'maletin_secreto' cargado.", 'info');
        
        hideModals();
        runButton.disabled = false;
        
        codeInput.value = "// let usuario = maletin_secreto.id_agente;\n// let codigo = ...\n// ingresar_al_sistema(usuario, codigo);\n";
    }

    function resetVaultVisuals() {
        accessPanel.className = 'denied';
        accessStatus.textContent = 'ACCESO DENEGADO';
        userDisplay.textContent = '---';
        passDisplay.textContent = '---';
    }
    
    function updateUI() {
        triesCountEl.textContent = `${vidasRestantes}/${MAX_VIDAS}`;
        triesCountEl.style.color = (vidasRestantes <= 1) ? '#e74c3c' : '#ffffff';
    }

    // --- POPUPS ---
    
    function showVictoryModal() {
        logToMission(`🎉 ¡VICTORIA! ¡Bóveda abierta!`, 'success');
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
        if (userCode.trim() === '' || userCode.startsWith('//')) {
            logToMission("La terminal está vacía.", 'error');
            return;
        }

        isRunning = true;
        runButton.disabled = true;
        resetVaultVisuals();

        // --- Sandboxing ---
        // Este es el objeto que el juego le "da" al jugador
        const maletin_secreto = { 
            id_agente: 'Graduado', 
            clave_final: 1337, 
            mision: 'Isla10' 
        };
        
        let datosEnviados = {
            id: null,
            clave: null,
            llamada: false
        };

        // Este es el comando base que el jugador DEBE llamar
        function ingresar_al_sistema(id, clave) {
            datosEnviados.llamada = true;
            datosEnviados.id = id;
            datosEnviados.clave = clave;
            
            logToMission(`...Datos recibidos:`, 'info');
            logToMission(`...ID: '${id}'`, 'data');
            logToMission(`...Clave: '${clave}'`, 'data');
            
            userDisplay.textContent = id;
            passDisplay.textContent = clave;
        }
        
        // --- Ejecución ---
        try {
            // Usamos 'new Function' para crear un scope seguro
            // Inyectamos el maletín y la función del sistema
            const F = new Function('maletin_secreto', 'ingresar_al_sistema', userCode);
            F(maletin_secreto, ingresar_al_sistema);

        } catch (e) {
            failAttempt(e.message);
            return;
        }

        // --- Verificación ---
        
        if (!datosEnviados.llamada) {
            failAttempt("No se llamó a 'ingresar_al_sistema'.");
            return;
        }

        if (datosEnviados.id === USUARIO_CORRECTO && datosEnviados.clave === CLAVE_CORRECTA) {
            logToMission("¡Datos correctos! ¡Acceso permitido!", 'success');
            accessPanel.className = 'success';
            accessStatus.textContent = 'ACCESO PERMITIDO';
            setTimeout(showVictoryModal, 1000);
        } else {
            failAttempt("Datos incorrectos. ¡Alarma activada!");
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
    
    btnLet.addEventListener('click', () => addCommandToTextarea("let nombre_var = ...;\n"));
    btnDot.addEventListener('click', () => addCommandToTextarea("maletin_secreto.id_agente\n"));
    btnLogin.addEventListener('click', () => addCommandToTextarea("ingresar_al_sistema(usuario, codigo);\n"));
    
    runButton.addEventListener('click', onRunProgram);
    resetButton.addEventListener('click', resetGame);
    clearLogButton.addEventListener('click', () => {
        missionLogEl.innerHTML = '';
        logToMission("Sistema de bóveda en espera.", 'info');
    });
    
    // Listeners de Modales y Navegación
    startButton.addEventListener('click', startGame);
    retryButton.addEventListener('click', resetGame);
    backToTutorialButton.addEventListener('click', showTutorial);
    backToMapButton.addEventListener('click', goToMap);
    
    // El botón final te lleva al mapa
    nextLevelButton.addEventListener('click', goToMap); 
    
    // --- INICIALIZACIÓN ---
    showTutorialStep(1); // Empezar en el paso 1 del tutorial
    tutorialModal.classList.remove('hidden'); // Mostrar el tutorial
});