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
    
    // Elementos de la Fiesta
    const songTitleEl = document.getElementById('song-title');
    const villagers = document.querySelectorAll('.villager');

    // Botones de comandos
    const btnPlay = document.getElementById('btn-play');
    const btnList = document.getElementById('btn-list');
    
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
    const CANCION_CORRECTA = 'Rock';
    const SETLIST = ['Pop', 'Rock', 'Clásica', 'Reggae'];
    
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
        resetPartyVisuals();
        
        missionLogEl.innerHTML = '';
        logToMission("Setlist: ['Pop', 'Rock', 'Clásica', 'Reggae']", 'info');
        logToMission("Esperando selección de canción...", 'info');
        
        hideModals();
        runButton.disabled = false;
        
        codeInput.value = "// tocar_cancion(lista_canciones[...]);";
    }

    function resetPartyVisuals() {
        songTitleEl.textContent = "...silencio...";
        villagers.forEach(v => v.classList.remove('dancing'));
    }
    
    function updateUI() {
        triesCountEl.textContent = `${vidasRestantes}/${MAX_VIDAS}`;
        triesCountEl.style.color = (vidasRestantes <= 1) ? '#e74c3c' : '#ffffff';
    }

    // --- POPUPS ---
    
    function showVictoryModal() {
        logToMission(`🎉 ¡VICTORIA! Tocaste '${CANCION_CORRECTA}'.`, 'success');
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
        // Lógica para insertar texto en el editor
        const start = codeInput.selectionStart;
        const end = codeInput.selectionEnd;
        const text = codeInput.value;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);
        
        if (command === "lista_canciones[ ]") {
             codeInput.value = before + "lista_canciones[]" + after;
             codeInput.focus();
             codeInput.setSelectionRange(start + 17, start + 17); // Pone el cursor dentro de []
        } else {
             codeInput.value = before + command + after;
             codeInput.focus();
             codeInput.setSelectionRange(start + command.length, start + command.length);
        }
    }

    // --- LÓGICA DE EJECUCIÓN ---
    
    function onRunProgram() {
        if(isRunning) return;
        
        const userCode = codeInput.value;
        if (userCode.trim() === '' || !userCode.includes('tocar_cancion')) {
            logToMission("¡Error! No llamaste a la función 'tocar_cancion'.", 'error');
            failAttempt("No se llamó a 'tocar_cancion'.");
            return;
        }
        
        // "Hacer trampa" - El jugador escribió el string en lugar de usar el índice
        if (userCode.includes(`'${CANCION_CORRECTA}'`) || userCode.includes(`"${CANCION_CORRECTA}"`)) {
            logToMission("¡Trampa! No escribas el nombre de la canción.", 'error');
            logToMission("¡Debes usar el índice de la lista! Ej: lista_canciones[1]", 'error');
            failAttempt("No uses el nombre de la canción, ¡usa el índice!");
            return;
        }

        isRunning = true;
        runButton.disabled = true;
        resetPartyVisuals();

        let cancionSeleccionada = null;

        // Lista de canciones que el código del usuario puede ver
        const lista_canciones = SETLIST;

        // Función que el código del usuario puede llamar
        function tocar_cancion(cancion) {
            cancionSeleccionada = cancion;
            logToMission(`...Reproduciendo: ${cancion}`, 'info');
        }

        // Ejecutamos el código del usuario de forma segura
        try {
            const F = new Function('lista_canciones', 'tocar_cancion', userCode);
            F(lista_canciones, tocar_cancion);
        } catch (e) {
            logToMission(`❌ Error de sintaxis: ${e.message}`, 'error');
            failAttempt("El código tiene un error de sintaxis.");
            return;
        }

        // --- Verificación ---
        
        // Actualizar la pantalla del DJ
        songTitleEl.textContent = cancionSeleccionada || "???";

        if (cancionSeleccionada === CANCION_CORRECTA) {
            logToMission("¡Canción correcta! ¡La fiesta empieza!", 'success');
            villagers.forEach(v => v.classList.add('dancing'));
            setTimeout(showVictoryModal, 1000);
        } else {
            logToMission(`¡Canción equivocada! Tocaste '${cancionSeleccionada}'. Querían '${CANCION_CORRECTA}'.`, 'error');
            failAttempt(`Tocaste '${cancionSeleccionada}' en lugar de '${CANCION_CORRECTA}'.`);
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
    
    btnPlay.addEventListener('click', () => addCommandToTextarea("tocar_cancion();"));
    btnList.addEventListener('click', () => addCommandToTextarea("lista_canciones[ ]"));
    
    runButton.addEventListener('click', onRunProgram);
    resetButton.addEventListener('click', resetGame);
    clearLogButton.addEventListener('click', () => {
        missionLogEl.innerHTML = '';
        logToMission("Setlist: ['Pop', 'Rock', 'Clásica', 'Reggae']", 'info');
        logToMission("Esperando selección de canción...", 'info');
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