// =================================================================
// ARCHIVO: cursos/PrimerG/isla1/juego4/cuartoJ.js
// JUEGO: El Camino de las Condiciones - Introducción a if/else
// =================================================================

import { reportarJuegoCompletado, reportarIntentoFallido, reportarInicioDeJuego } from '../../../../librerias/logService.js';
import { completarJuego } from '../../../../librerias/auth.firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 DOM cargado, inicializando juego de condiciones...");
    
    // --- REFERENCIAS AL DOM ---
    const robotEl = document.getElementById('robot');
    const gridEl = document.getElementById('grid-world');
    const codeInput = document.getElementById('code-input');
    const runButton = document.getElementById('run-button');
    const resetButton = document.getElementById('reset-button');
    const clearLogButton = document.getElementById('clear-log');
    const startButton = document.getElementById('start-button');
    const triesCountEl = document.getElementById('tries-count');
    const missionLogEl = document.getElementById('mission-log');
    const btnMove = document.getElementById('btn-move');
    const btnRotate = document.getElementById('btn-rotate');
    const btnActivar = document.getElementById('btn-activar');
    const btnIf = document.getElementById('btn-if');
    const btnHayPared = document.getElementById('btn-hayPared');
    const btnHayInterruptor = document.getElementById('btn-hayInterruptor');
    const btnPuedeAvanzar = document.getElementById('btn-puedeAvanzar');
    const victoryModal = document.getElementById('victory-modal');
    const gameoverModal = document.getElementById('gameover-modal');
    const tutorialModal = document.getElementById('tutorial-modal');
    const nextLevelButton = document.getElementById('next-level-button');
    const retryButton = document.getElementById('retry-button');
    const programOutput = document.getElementById('program-output');
    const outputLength = document.getElementById('output-length');
    const positionDisplay = document.getElementById('position-display');
    const directionDisplay = document.getElementById('direction-display');
    const switchesCount = document.getElementById('switches-count');
    const gameContainer = document.getElementById('game-container');
    const backToTutorialBtn = document.getElementById('back-to-tutorial');
    const backToMapBtn = document.getElementById('back-to-map');

    // --- CONFIGURACIÓN ---
    const MAX_INTENTOS = 5;
    
    const levelData = { 
        grid: 8, 
        startX: 1, 
        startY: 1, 
        startDir: 1,
        switches: [
            { id: 1, x: 2, y: 3, activated: false },
            { id: 2, x: 5, y: 1, activated: false },
            { id: 3, x: 8, y: 6, activated: false },
            { id: 4, x: 3, y: 7, activated: false },
            { id: 5, x: 6, y: 4, activated: false }
        ],
        walls: [
            {x: 3, y: 2}, {x: 3, y: 3}, {x: 3, y: 4},
            {x: 5, y: 3}, {x: 5, y: 4}, {x: 5, y: 5},
            {x: 7, y: 4}, {x: 7, y: 5}, {x: 7, y: 6},
            {x: 4, y: 6}, {x: 6, y: 2}
        ],
        prompt: "Activa los 5 interruptores usando condiciones para tomar decisiones",
        hint: `// Ejemplo con condiciones:\nif(hayInterruptor()) {\n    activar();\n}\nif(puedeAvanzar()) {\n    move();\n} else {\n    rotate();\n}`
    };

    // --- VARIABLES DEL JUEGO ---
    let robotState = {};
    let isRunning = false;
    let intentosRestantes = MAX_INTENTOS;
    let wallElements = [];
    let switchElements = [];
    let activatedSwitches = 0;

    // --- FUNCIONES DE CONDICIÓN (para usar en el código) ---
    function hayPared() {
        let nextX = robotState.x;
        let nextY = robotState.y;
        
        if (robotState.dir === 0) nextY--;
        else if (robotState.dir === 1) nextX++;
        else if (robotState.dir === 2) nextY++;
        else if (robotState.dir === 3) nextX--;
        
        // Verificar límites
        if (nextX < 1 || nextX > levelData.grid || nextY < 1 || nextY > levelData.grid) {
            return true;
        }
        
        // Verificar paredes
        return levelData.walls.some(wall => wall.x === nextX && wall.y === nextY);
    }
    
    function hayInterruptor() {
        return levelData.switches.some(sw => sw.x === robotState.x && sw.y === robotState.y && !sw.activated);
    }
    
    function puedeAvanzar() {
        let nextX = robotState.x;
        let nextY = robotState.y;
        
        if (robotState.dir === 0) nextY--;
        else if (robotState.dir === 1) nextX++;
        else if (robotState.dir === 2) nextY++;
        else if (robotState.dir === 3) nextX--;
        
        // Verificar límites
        if (nextX < 1 || nextX > levelData.grid || nextY < 1 || nextY > levelData.grid) {
            return false;
        }
        
        // Verificar paredes
        return !levelData.walls.some(wall => wall.x === nextX && wall.y === nextY);
    }

    // --- FUNCIONES DEL JUEGO ---
    function logToMission(message, type = 'info') {
        if (!missionLogEl) return;
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `> ${message}`;
        missionLogEl.appendChild(entry);
        missionLogEl.scrollTop = missionLogEl.scrollHeight;
        
        while (missionLogEl.children.length > 100) {
            missionLogEl.removeChild(missionLogEl.firstChild);
        }
    }

    function drawGrid() {
        if (!gridEl) return;
        gridEl.innerHTML = '';
        wallElements = [];
        switchElements = [];
        
        gridEl.style.gridTemplateColumns = `repeat(${levelData.grid}, 1fr)`;
        gridEl.style.gridTemplateRows = `repeat(${levelData.grid}, 1fr)`;
        
        for (let y = 1; y <= levelData.grid; y++) {
            for (let x = 1; x <= levelData.grid; x++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                
                if (levelData.walls.some(wall => wall.x === x && wall.y === y)) {
                    cell.classList.add('wall');
                    wallElements.push(cell);
                }
                
                cell.style.gridColumn = x;
                cell.style.gridRow = y;
                gridEl.appendChild(cell);
            }
        }

        levelData.switches.forEach(sw => {
            const switchEl = document.createElement('div');
            switchEl.classList.add('switch-cell');
            if (sw.activated) {
                switchEl.classList.add('activated');
                switchEl.textContent = '✅';
            } else {
                switchEl.textContent = '⚡';
            }
            switchEl.style.gridColumn = sw.x;
            switchEl.style.gridRow = sw.y;
            switchEl.dataset.id = sw.id;
            gridEl.appendChild(switchEl);
            switchElements.push(switchEl);
        });

        if (robotEl) gridEl.appendChild(robotEl);
    }

    function setupLevel() {
        drawGrid();
        
        robotState = {
            x: levelData.startX,
            y: levelData.startY,
            dir: levelData.startDir
        };
        updateRobotUI();
    }

    function resetGame() {
        robotState = {
            x: levelData.startX,
            y: levelData.startY,
            dir: levelData.startDir
        };
        isRunning = false;
        intentosRestantes = MAX_INTENTOS;
        activatedSwitches = 0;
        
        // Resetear estado de interruptores
        levelData.switches.forEach(sw => sw.activated = false);
        
        updateUI();
        drawGrid();
        
        if (missionLogEl) missionLogEl.innerHTML = '';
        if (codeInput) codeInput.value = levelData.hint;
        
        logToMission(`🎮 Iniciando: Activa los 5 interruptores`, 'info');
        logToMission(levelData.prompt, 'warning');
        logToMission("💡 Usa condiciones como if(hayInterruptor()) { activar(); }", 'info');
        
        hideModals();
        if (runButton) runButton.disabled = false;
    }
    
    function updateUI() {
        updateTriesUI();
        updateRobotUI();
        updateSwitchesDisplay();
        updatePositionDisplay();
        updateDirectionDisplay();
    }

    function updateTriesUI() {
        if (!triesCountEl) return;
        triesCountEl.textContent = `${intentosRestantes}/${MAX_INTENTOS}`;
    }

    function updateRobotUI() {
        if (!robotEl) return;
        robotEl.style.gridColumn = robotState.x;
        robotEl.style.gridRow = robotState.y;
        
        const rotations = ['0deg', '90deg', '180deg', '270deg'];
        robotEl.style.transform = `rotate(${rotations[robotState.dir]})`;
    }
    
    function updateSwitchesDisplay() {
        if (!switchesCount) return;
        switchesCount.textContent = `${activatedSwitches}/5`;
        
        if (programOutput) {
            const displayText = Array(5).fill('⚪');
            for (let i = 0; i < activatedSwitches; i++) {
                displayText[i] = '✅';
            }
            programOutput.textContent = displayText.join(' ');
        }
        
        if (outputLength) outputLength.textContent = `${activatedSwitches}/5`;
        
        // Actualizar visualmente los interruptores
        if (switchElements.length > 0) {
            levelData.switches.forEach((sw, idx) => {
                if (switchElements[idx]) {
                    if (sw.activated) {
                        switchElements[idx].classList.add('activated');
                        switchElements[idx].textContent = '✅';
                    } else {
                        switchElements[idx].classList.remove('activated');
                        switchElements[idx].textContent = '⚡';
                    }
                }
            });
        }
    }
    
    function updatePositionDisplay() {
        if (!positionDisplay) return;
        positionDisplay.textContent = `[${robotState.x}, ${robotState.y}]`;
    }
    
    function updateDirectionDisplay() {
        if (!directionDisplay) return;
        const directions = ['↑ NORTE', '→ ESTE', '↓ SUR', '← OESTE'];
        directionDisplay.textContent = directions[robotState.dir];
    }

    function showVictoryModal() {
        logToMission(`🎉 ¡PROGRAMA EXITOSO! Activaste los 5 interruptores`, 'success');
        if (victoryModal) victoryModal.classList.remove('hidden');
    }
    
    function showGameOverModal() {
        logToMission("💀 ERROR CRÍTICO - Demasiados intentos fallidos", "error");
        if (gameoverModal) gameoverModal.classList.remove('hidden');
        if (runButton) runButton.disabled = true;
    }
    
    function hideModals() {
        if (victoryModal) victoryModal.classList.add('hidden');
        if (gameoverModal) gameoverModal.classList.add('hidden');
    }
    
    function startGame() {
        console.log("🎮 FUNCIÓN startGame EJECUTADA");
        if (tutorialModal) tutorialModal.classList.add('hidden');
        if (gameContainer) gameContainer.classList.remove('hidden');
        resetGame();
        
        reportarInicioDeJuego('PrimerG', 'isla1', 'juego4')
            .catch(err => console.warn("Error reporting:", err));
    }

    function addCommandToTextarea(command) {
        if (!codeInput) return;
        const cursorPos = codeInput.selectionStart;
        const textBefore = codeInput.value.substring(0, cursorPos);
        const textAfter = codeInput.value.substring(cursorPos);
        
        codeInput.value = textBefore + command + textAfter;
        codeInput.focus();
        codeInput.setSelectionRange(cursorPos + command.length, cursorPos + command.length);
    }

    function addIfStructure() {
        addCommandToTextarea('if(condicion) {\n    \n}');
    }

    function onRunProgram() {
        if(isRunning || intentosRestantes <= 0) return;
        if (!codeInput) return;
        
        const userCode = codeInput.value;
        isRunning = true;
        if (runButton) runButton.disabled = true;
        
        logToMission("🔧 Iniciando ejecución con condiciones...", 'info');

        try {
            const codeLines = userCode.split('\n')
                .map(line => line.trim())
                .filter(line => line !== '' && !line.startsWith('//'));
            
            if (codeLines.length === 0) {
                throw new Error("El código está vacío");
            }
            
            processCodeLines(codeLines, 0);
            
        } catch (error) {
            logToMission(`❌ Error: ${error.message}`, 'error');
            isRunning = false;
            if (runButton) runButton.disabled = false;
        }
    }

    function processCodeLines(codeLines, lineIndex) {
        if (lineIndex >= codeLines.length || !isRunning) {
            isRunning = false;
            if (runButton) runButton.disabled = false;
            checkWinCondition();
            return;
        }

        const currentCode = codeLines[lineIndex];
        
        // Evaluar el código con acceso a las funciones de condición
        try {
            const evalFunc = new Function('robotState', 'levelData', 'logToMission', `
                let __result = undefined;
                const hayPared = () => {
                    let nextX = robotState.x;
                    let nextY = robotState.y;
                    if (robotState.dir === 0) nextY--;
                    else if (robotState.dir === 1) nextX++;
                    else if (robotState.dir === 2) nextY++;
                    else if (robotState.dir === 3) nextX--;
                    if (nextX < 1 || nextX > ${levelData.grid} || nextY < 1 || nextY > ${levelData.grid}) return true;
                    return ${JSON.stringify(levelData.walls)}.some(wall => wall.x === nextX && wall.y === nextY);
                };
                const hayInterruptor = () => {
                    return ${JSON.stringify(levelData.switches)}.some(sw => sw.x === robotState.x && sw.y === robotState.y && !sw.activated);
                };
                const puedeAvanzar = () => {
                    let nextX = robotState.x;
                    let nextY = robotState.y;
                    if (robotState.dir === 0) nextY--;
                    else if (robotState.dir === 1) nextX++;
                    else if (robotState.dir === 2) nextY++;
                    else if (robotState.dir === 3) nextX--;
                    if (nextX < 1 || nextX > ${levelData.grid} || nextY < 1 || nextY > ${levelData.grid}) return false;
                    return !${JSON.stringify(levelData.walls)}.some(wall => wall.x === nextX && wall.y === nextY);
                };
                const move = () => {
                    let nextX = robotState.x;
                    let nextY = robotState.y;
                    if (robotState.dir === 0) nextY--;
                    else if (robotState.dir === 1) nextX++;
                    else if (robotState.dir === 2) nextY++;
                    else if (robotState.dir === 3) nextX--;
                    if (nextX < 1 || nextX > ${levelData.grid} || nextY < 1 || nextY > ${levelData.grid}) {
                        throw new Error("Límite del mapa");
                    }
                    if (${JSON.stringify(levelData.walls)}.some(wall => wall.x === nextX && wall.y === nextY)) {
                        throw new Error("Choque con pared");
                    }
                    robotState.x = nextX;
                    robotState.y = nextY;
                    logToMission("📍 Movido a [" + robotState.x + ", " + robotState.y + "]", 'success');
                };
                const rotate = () => {
                    robotState.dir = (robotState.dir + 1) % 4;
                    const dirs = ['NORTE', 'ESTE', 'SUR', 'OESTE'];
                    logToMission("🔄 Girado a " + dirs[robotState.dir], 'success');
                };
                const activar = () => {
                    const sw = ${JSON.stringify(levelData.switches)}.find(s => s.x === robotState.x && s.y === robotState.y && !s.activated);
                    if (sw) {
                        sw.activated = true;
                        logToMission("⚡ ¡Interruptor activado!", 'success');
                    } else {
                        logToMission("❌ No hay interruptor aquí o ya está activado", 'error');
                    }
                };
                ${currentCode};
                return robotState;
            `);
            
            const newState = evalFunc(robotState, levelData, logToMission);
            if (newState) robotState = newState;
            
            updateUI();
            
            setTimeout(() => {
                processCodeLines(codeLines, lineIndex + 1);
            }, 400);
            
        } catch (error) {
            logToMission(`❌ Error en línea ${lineIndex + 1}: ${error.message}`, 'error');
            isRunning = false;
            if (runButton) runButton.disabled = false;
            
            intentosRestantes--;
            updateTriesUI();
            
            reportarIntentoFallido('PrimerG', 'isla1', 'juego4', intentosRestantes)
                .catch(err => console.warn("Error reporting:", err));
            
            if (intentosRestantes <= 0) {
                setTimeout(showGameOverModal, 1000);
            }
        }
    }

    function checkWinCondition() {
        activatedSwitches = levelData.switches.filter(sw => sw.activated).length;
        updateSwitchesDisplay();
        
        if (activatedSwitches === 5) {
            logToMission("🎊 ¡VICTORIA! Activaste todos los interruptores", 'success');
            
            completarJuego('PrimerG', 'isla1', 'juego4')
                .then(() => reportarJuegoCompletado('PrimerG', 'isla1', 'juego4'))
                .catch(error => console.error("Error:", error))
                .finally(() => setTimeout(showVictoryModal, 1000));
        } else if (!isRunning && activatedSwitches < 5) {
            intentosRestantes--;
            updateTriesUI();
            logToMission(`❌ No activaste todos los interruptores. Activados: ${activatedSwitches}/5`, 'error');
            
            if (intentosRestantes <= 0) {
                setTimeout(showGameOverModal, 1000);
            }
        }
    }

    function showTutorial() {
        if (gameContainer) gameContainer.classList.add('hidden');
        if (tutorialModal) tutorialModal.classList.remove('hidden');
        isRunning = false;
        if (runButton) runButton.disabled = false;
    }

    function goToMap() {
        if (confirm("¿Volver al mapa?")) {
            window.location.href = '../../mapa1.html';
        }
    }

    // --- EVENT LISTENERS ---
    if (startButton) startButton.addEventListener('click', startGame);
    if (btnMove) btnMove.addEventListener('click', () => addCommandToTextarea('move();\n'));
    if (btnRotate) btnRotate.addEventListener('click', () => addCommandToTextarea('rotate();\n'));
    if (btnActivar) btnActivar.addEventListener('click', () => addCommandToTextarea('activar();\n'));
    if (btnIf) btnIf.addEventListener('click', addIfStructure);
    if (btnHayPared) btnHayPared.addEventListener('click', () => addCommandToTextarea('hayPared()'));
    if (btnHayInterruptor) btnHayInterruptor.addEventListener('click', () => addCommandToTextarea('hayInterruptor()'));
    if (btnPuedeAvanzar) btnPuedeAvanzar.addEventListener('click', () => addCommandToTextarea('puedeAvanzar()'));
    if (runButton) runButton.addEventListener('click', onRunProgram);
    if (resetButton) resetButton.addEventListener('click', resetGame);
    if (clearLogButton) clearLogButton.addEventListener('click', () => {
        if (missionLogEl) missionLogEl.innerHTML = '';
        logToMission('Bitácora limpiada', 'info');
    });
    if (backToTutorialBtn) backToTutorialBtn.addEventListener('click', showTutorial);
    if (backToMapBtn) backToMapBtn.addEventListener('click', goToMap);
    if (nextLevelButton) nextLevelButton.addEventListener('click', () => window.location.href = '../../mapa1.html');
    if (retryButton) retryButton.addEventListener('click', resetGame);

    // --- INICIALIZACIÓN ---
    setupLevel();
    
    if (tutorialModal) {
        tutorialModal.classList.remove('hidden');
        console.log("📚 Tutorial mostrado");
    }

    console.log("🎮 Juego de condiciones listo!");
});