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
    
    // Elementos de la Habitación
    const robotEl = document.getElementById('robot-assistant');
    const robotBubble = document.getElementById('robot-action-bubble');
    const taskListEl = document.getElementById('task-list');

    // Botones de comandos
    const btnFor = document.getElementById('btn-for');
    const btnLet = document.getElementById('btn-let');
    const btnDo = document.getElementById('btn-do');
    
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
    const TASK_LIST = ['limpiar', 'regar', 'cocinar', 'ordenar'];
    const ANIMATION_TIME = 500; // 500ms por tarea
    
    // --- VARIABLES DEL JUEGO ---
    let isRunning = false;
    let vidasRestantes = MAX_VIDAS;
    let tareasCompletadas = new Set();
    let taskListItems = {}; // Para guardar los <li>

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
        resetRoomVisuals();
        
        missionLogEl.innerHTML = '';
        logToMission("Robot listo. Esperando protocolos.", 'info');
        logToMission("Lista: ['limpiar', 'regar', 'cocinar', 'ordenar']", 'info');
        
        hideModals();
        runButton.disabled = false;
        
        // ####################################################################
        // ######               ¡AQUÍ ESTÁ EL ARREGLO!               ######
        // ####################################################################
        // Ya no se pone la solución, solo una pista.
        codeInput.value = "// for (let i = 0; i < lista_de_tareas.length; i++) {\n  // ...\n// }\n";
        // ####################################################################
    }

    function resetRoomVisuals() {
        tareasCompletadas.clear();
        taskListItems = {};
        taskListEl.innerHTML = '';
        
        // Crear la lista de tareas en la pizarra
        TASK_LIST.forEach(taskName => {
            const li = document.createElement('li');
            li.textContent = taskName;
            li.id = `task-${taskName}`;
            taskListEl.appendChild(li);
            taskListItems[taskName] = li; // Guardar referencia
        });
        
        robotEl.style.transform = 'translateX(0px)';
        robotBubble.classList.add('hidden');
    }
    
    function updateUI() {
        triesCountEl.textContent = `${vidasRestantes}/${MAX_VIDAS}`;
        triesCountEl.style.color = (vidasRestantes <= 1) ? '#e74c3c' : '#ffffff';
    }

    // --- POPUPS ---
    
    function showVictoryModal() {
        logToMission(`🎉 ¡VICTORIA! Todas las tareas completadas.`, 'success');
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
    
    async function onRunProgram() {
        if(isRunning) return;
        
        const userCode = codeInput.value;
        if (userCode.trim() === '' || userCode.startsWith('//')) {
            logToMission("No hay protocolos en el editor.", 'error');
            return;
        }
        
        if (!userCode.includes('.length')) {
            logToMission("¡Error! No usaste '.length' en tu bucle 'for'.", 'error');
            failAttempt("Recuerda usar .length para que el bucle sea automático.");
            return;
        }

        isRunning = true;
        runButton.disabled = true;
        resetRoomVisuals();

        // Esta es la lista que el código del usuario usará
        const lista_de_tareas = TASK_LIST;
        
        // Esta es la función que el código del usuario llamará
        async function hacer_tarea(nombre_tarea) {
            logToMission(`...Iniciando tarea: ${nombre_tarea}`, 'loop');
            if (taskListItems[nombre_tarea]) {
                
                // Animar al robot
                let emoji = '❓';
                if(nombre_tarea === 'limpiar') { robotEl.style.transform = 'translateX(100px)'; emoji = '🧹'; }
                if(nombre_tarea === 'regar') { robotEl.style.transform = 'translateX(-100px)'; emoji = '💧'; }
                if(nombre_tarea === 'cocinar') { robotEl.style.transform = 'translateX(50px)'; emoji = '🍳'; }
                if(nombre_tarea === 'ordenar') { robotEl.style.transform = 'translateX(0px)'; emoji = '📚'; }
                
                robotBubble.textContent = emoji;
                robotBubble.classList.remove('hidden');

                await new Promise(resolve => setTimeout(resolve, ANIMATION_TIME)); // Simula tiempo de tarea
                
                taskListItems[nombre_tarea].classList.add('completed');
                tareasCompletadas.add(nombre_tarea);
                
                robotBubble.classList.add('hidden');
                
                logToMission(`✅ Tarea '${nombre_tarea}' completada.`, 'success');
            } else {
                logToMission(`❌ Tarea '${nombre_tarea}' no reconocida.`, 'error');
                throw new Error("Tarea no reconocida");
            }
        }
        
        // --- Ejecución ---
        try {
            // Usamos un constructor de Función Asíncrona para poder usar 'await'
            const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
            const userScript = new AsyncFunction('lista_de_tareas', 'hacer_tarea', userCode);
            
            await userScript(lista_de_tareas, hacer_tarea);

        } catch (e) {
            failAttempt(e.message);
            return;
        }
        
        // El código del usuario (el 'for') termina rápido, pero las tareas
        // ('hacer_tarea') son asíncronas. Debemos esperar a que terminen.
        
        logToMission("...Verificando protocolos...", 'info');
        // Esperamos el tiempo total de todas las animaciones + un búfer
        await new Promise(resolve => setTimeout(resolve, TASK_LIST.length * ANIMATION_TIME + 200));

        // --- Verificación ---
        
        if (tareasCompletadas.size === TASK_LIST.length) {
            logToMission("¡Todas las tareas fueron completadas!", 'success');
            robotEl.style.transform = 'rotate(360deg)'; // Giro de victoria
            setTimeout(showVictoryModal, 500);
        } else if (!userCode.includes('for')) {
            failAttempt("No has usado un bucle 'for'.");
        } else if (tareasCompletadas.size < TASK_LIST.length) {
            failAttempt(`Solo se completaron ${tareasCompletadas.size} de ${TASK_LIST.length} tareas.`);
        } else {
            failAttempt("El protocolo falló. Revisa tu lógica.");
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
    
    btnFor.addEventListener('click', () => addCommandToTextarea("for (let i = 0; i < lista_de_tareas.length; i++) {\n  \n}\n"));
    btnLet.addEventListener('click', () => addCommandToTextarea("  let tarea_actual = lista_de_tareas[i];\n"));
    btnDo.addEventListener('click', () => addCommandToTextarea("  hacer_tarea(tarea_actual);\n"));
    
    runButton.addEventListener('click', onRunProgram);
    resetButton.addEventListener('click', resetGame);
    clearLogButton.addEventListener('click', () => {
        missionLogEl.innerHTML = '';
        logToMission("Robot listo. Esperando protocolos.", 'info');
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