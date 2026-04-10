document.addEventListener('DOMContentLoaded', () => {
    
    const codeInput = document.getElementById('code-input');
    const runButton = document.getElementById('run-button');
    const resetButton = document.getElementById('reset-button');
    const clearLogButton = document.getElementById('clear-log');
    const triesCountEl = document.getElementById('tries-count');
    const missionLogEl = document.getElementById('mission-log');
    const victoryModal = document.getElementById('victory-modal');
    const gameoverModal = document.getElementById('gameover-modal');
    const gameoverReasonEl = document.getElementById('gameover-reason');
    const gameContainer = document.getElementById('game-container');
    const portalVortex = document.getElementById('portal-vortex');
    const rune1Display = document.getElementById('rune-1');
    const rune2Display = document.getElementById('rune-2');
    const btnFunction = document.getElementById('btn-function');
    const btnReturn = document.getElementById('btn-return');
    const btnLet = document.getElementById('btn-let');
    const btnPortal = document.getElementById('btn-portal');
    const backToTutorialButton = document.getElementById('back-to-tutorial');
    const backToMapButton = document.getElementById('back-to-map');
    const nextLevelButton = document.getElementById('next-level-button');
    const retryButton = document.getElementById('retry-button');
    const tutorialModal = document.getElementById('tutorial-modal');
    const startButton = document.getElementById('start-button');
    const tutorialSteps = document.querySelectorAll('.tutorial-step');
    const tutorialPrevBtn = document.getElementById('tutorial-prev');
    const tutorialNextBtn = document.getElementById('tutorial-next');
    const tutorialStepCounter = document.getElementById('tutorial-step-counter');
    const TOTAL_STEPS = tutorialSteps.length;
    let currentStep = 1;
    const MAX_VIDAS = 3;
    const PALABRA_1 = 'LUX';
    const PALABRA_2 = 'NOVA';
    let isRunning = false;
    let vidasRestantes = MAX_VIDAS;
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
        resetPortalVisuals();
        
        missionLogEl.innerHTML = '';
        logToMission("Portal listo. Esperando palabras de poder.", 'info');
        
        hideModals();
        runButton.disabled = false;
        
        codeInput.value = "function traducir_runa(runa) {\n  if (runa == 'alpha') {\n    return 'LUX';\n  }\n  // Añade el 'if' para 'beta'\n}\n\n// 1. Crea 'palabra1'\n// 2. Crea 'palabra2'\n// 3. Llama a activar_portal()\n";
    }

    function resetPortalVisuals() {
        portalVortex.classList.remove('on');
        rune1Display.classList.remove('on');
        rune2Display.classList.remove('on');
        rune1Display.textContent = '?';
        rune2Display.textContent = '?';
    }
    
    function updateUI() {
        triesCountEl.textContent = `${vidasRestantes}/${MAX_VIDAS}`;
        triesCountEl.style.color = (vidasRestantes <= 1) ? '#e74c3c' : '#ffffff';
    }

    
    function showVictoryModal() {
        logToMission(`🎉 ¡VICTORIA! ¡Portal Activado!`, 'success');
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
        showTutorialStep(1);
    }

    
    function addCommandToTextarea(command) {
        codeInput.value += command + '\n';
        codeInput.focus();
    }

    
    function onRunProgram() {
        if(isRunning) return;
        
        const userCode = codeInput.value;
        if (userCode.trim() === '') {
            logToMission("El papiro está en blanco.", 'error');
            return;
        }

        isRunning = true;
        runButton.disabled = true;
        resetPortalVisuals();

        
        let funcionTraductora;
        let portalActivado = false;
        let p1_recibida = undefined;
        let p2_recibida = undefined;

        function activar_portal(p1, p2) {
            portalActivado = true;
            p1_recibida = p1;
            p2_recibida = p2;
            logToMission(`...Recibida llamada a activar_portal con: '${p1}', '${p2}'`, 'info');
        }

        try {
            const userScript = new Function('activar_portal', userCode);
            userScript(activar_portal);

        } catch (e) {
            failAttempt(e.message);
            return;
        }
        let traductor;
        try {
            traductor = eval(`(function() { ${userCode}; return traducir_runa; })()`);
            if (typeof traductor !== 'function') throw new Error("No se definió 'traducir_runa'.");
        } catch(e) {
            failAttempt("No se pudo encontrar la función 'traducir_runa'. ¿La escribiste bien?");
            return;
        }
        let test1 = traductor('alpha');
        let test2 = traductor('beta');
        logToMission(`...Probando traductor('alpha')... Devolvió: '${test1}'`, 'return');
        logToMission(`...Probando traductor('beta')... Devolvió: '${test2}'`, 'return');

        if (test1 !== PALABRA_1 || test2 !== PALABRA_2) {
            failAttempt("La función 'traducir_runa' no devuelve los valores correctos.");
            return;
        }
        
        if (!portalActivado) {
            failAttempt("Definiste la función, pero nunca llamaste a 'activar_portal'.");
            return;
        }
        
        rune1Display.textContent = p1_recibida;
        rune2Display.textContent = p2_recibida;

        if (p1_recibida === PALABRA_1 && p2_recibida === PALABRA_2) {
            logToMission("¡Palabras correctas! ¡Portal activado!", 'success');
            rune1Display.classList.add('on');
            rune2Display.classList.add('on');
            portalVortex.classList.add('on');
            setTimeout(showVictoryModal, 1500);
        } else {
            failAttempt(`Se recibieron las palabras '${p1_recibida}' y '${p2_recibida}'. ¡Incorrecto!`);
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
    function goToMap() {
        logToMission("🗺️ Regresando al mapa...", 'info');
        window.location.href = '../../mapa1.html';
    }
    
    codeInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            onRunProgram();
        }
    });
    
    btnFunction.addEventListener('click', () => addCommandToTextarea("function traducir_runa(runa) {\n  \n}\n"));
    btnReturn.addEventListener('click', () => addCommandToTextarea("    return '...';\n"));
    btnLet.addEventListener('click', () => addCommandToTextarea("let palabra = traducir_runa('...');\n"));
    btnPortal.addEventListener('click', () => addCommandToTextarea("activar_portal(palabra1, palabra2);\n"));
    
    runButton.addEventListener('click', onRunProgram);
    resetButton.addEventListener('click', resetGame);
    clearLogButton.addEventListener('click', () => {
        missionLogEl.innerHTML = '';
        logToMission("Portal listo. Esperando palabras de poder.", 'info');
    });
    
    startButton.addEventListener('click', startGame);
    retryButton.addEventListener('click', resetGame);
    backToTutorialButton.addEventListener('click', showTutorial);
    backToMapButton.addEventListener('click', goToMap);
    
    nextLevelButton.addEventListener('click', goToMap); 
    
    showTutorialStep(1);
    tutorialModal.classList.remove('hidden');
});