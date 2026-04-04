
import { reportarJuegoCompletado, reportarIntentoFallido, reportarInicioDeJuego } from '../../../../librerias/logService.js';
import { completarJuego } from '../../../../librerias/auth.firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 DOM cargado, inicializando juego de colores...");
    
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
    const btnRecoger = document.getElementById('btn-recoger');
    const victoryModal = document.getElementById('victory-modal');
    const gameoverModal = document.getElementById('gameover-modal');
    const tutorialModal = document.getElementById('tutorial-modal');
    const nextLevelButton = document.getElementById('next-level-button');
    const retryButton = document.getElementById('retry-button');
    const programOutput = document.getElementById('program-output');
    const outputLength = document.getElementById('output-length');
    const positionDisplay = document.getElementById('position-display');
    const directionDisplay = document.getElementById('direction-display');
    const shapesFound = document.getElementById('shapes-found');
    const gameContainer = document.getElementById('game-container');
    const backToTutorialBtn = document.getElementById('back-to-tutorial');
    const backToMapBtn = document.getElementById('back-to-map');

    // --- CONFIGURACIÓN ---
    const MAX_INTENTOS = 5;
    const FORMAS_OBJETIVO = ['🔵', '🟢', '🔴', '🟡', '🟣'];
    const NOMBRES_FORMAS = ['AZUL', 'VERDE', 'ROJO', 'AMARILLO', 'MORADO'];
    
    const levelData = { 
        grid: 8, 
        startX: 1, 
        startY: 1, 
        startDir: 1,
        shapes: [
            {shape: '🔵', name: 'AZUL', x: 2, y: 3, class: 'shape-circle'},
            {shape: '🟢', name: 'VERDE', x: 5, y: 1, class: 'shape-circle'},
            {shape: '🔴', name: 'ROJO', x: 8, y: 6, class: 'shape-circle'},
            {shape: '🟡', name: 'AMARILLO', x: 3, y: 7, class: 'shape-circle'},
            {shape: '🟣', name: 'MORADO', x: 6, y: 4, class: 'shape-circle'}
        ],
        walls: [
            {x: 3, y: 2}, {x: 3, y: 3}, {x: 3, y: 4},
            {x: 5, y: 3}, {x: 5, y: 4}, {x: 5, y: 5},
            {x: 7, y: 4}, {x: 7, y: 5}, {x: 7, y: 6},
            {x: 4, y: 6}, {x: 6, y: 2}
        ],
        prompt: "Encuentra los colores en orden: AZUL → VERDE → ROJO → AMARILLO → MORADO",
        hint: `// Ejemplo de código:\nmove();\nmove();\nrecoger();\nrotate();\nmove();\nrecoger();\n// ¡Recolecta los colores en orden!`
    };

    // --- VARIABLES DEL JUEGO ---
    let robotState = {};
    let isRunning = false;
    let intentosRestantes = MAX_INTENTOS;
    let wallElements = [];
    let shapeElements = [];
    let collectedShapes = [];
    let nextShapeIndex = 0;

    // --- FUNCIONES DEL JUEGO ---
    function logToMission(message, type = 'info') {
        if (!missionLogEl) return;
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `> ${message}`;
        missionLogEl.appendChild(entry);
        missionLogEl.scrollTop = missionLogEl.scrollHeight;
        
        // Limitar a 100 entradas
        while (missionLogEl.children.length > 100) {
            missionLogEl.removeChild(missionLogEl.firstChild);
        }
    }

    function drawGrid() {
        if (!gridEl) return;
        gridEl.innerHTML = '';
        wallElements = [];
        shapeElements = [];
        
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

        levelData.shapes.forEach(shape => {
            const shapeEl = document.createElement('div');
            shapeEl.classList.add('shape-cell', shape.class);
            shapeEl.textContent = shape.shape;
            shapeEl.style.gridColumn = shape.x;
            shapeEl.style.gridRow = shape.y;
            shapeEl.dataset.shape = shape.shape;
            shapeEl.dataset.name = shape.name;
            shapeEl.dataset.x = shape.x;
            shapeEl.dataset.y = shape.y;
            gridEl.appendChild(shapeEl);
            shapeElements.push(shapeEl);
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
        collectedShapes = [];
        nextShapeIndex = 0;
        
        updateUI();
        resetShapes();
        
        if (missionLogEl) missionLogEl.innerHTML = '';
        if (codeInput) codeInput.value = levelData.hint;
        
        logToMission(`🎮 Iniciando: Encuentra los colores en orden`, 'info');
        logToMission(levelData.prompt, 'warning');
        logToMission("💡 Usa move(), rotate() y recoger() para recolectar colores", 'info');
        
        hideModals();
        if (runButton) runButton.disabled = false;
    }
    
    function resetShapes() {
        shapeElements.forEach(shapeEl => {
            shapeEl.classList.remove('collected');
            shapeEl.style.opacity = '1';
            shapeEl.style.filter = 'none';
        });
    }
    
    function updateUI() {
        updateTriesUI();
        updateRobotUI();
        updateShapesDisplay();
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
    
    function updateShapesDisplay() {
        if (!shapesFound) return;
        shapesFound.textContent = `${collectedShapes.length}/5`;
        
        if (programOutput) {
            const displayText = collectedShapes.map(s => s.shape).join(' ');
            const missing = 5 - collectedShapes.length;
            programOutput.textContent = displayText + (missing > 0 ? ' ' + '_ '.repeat(missing) : '');
        }
        
        if (outputLength) outputLength.textContent = `${collectedShapes.length}/5`;
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
        logToMission(`🎉 ¡PROGRAMA EXITOSO! Recolectaste todas los colores: ${collectedShapes.map(s => s.name).join(' → ')}`, 'success');
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
        
        reportarInicioDeJuego('PrimerG', 'isla1', 'juego3')
            .catch(err => console.warn("Error reporting:", err));
    }

    function addCommandToTextarea(command) {
        if (!codeInput) return;
        const cursorPos = codeInput.selectionStart;
        const textBefore = codeInput.value.substring(0, cursorPos);
        const textAfter = codeInput.value.substring(cursorPos);
        
        codeInput.value = textBefore + command + '\n' + textAfter;
        codeInput.focus();
        codeInput.setSelectionRange(cursorPos + command.length + 1, cursorPos + command.length + 1);
    }

    function onRunProgram() {
        if(isRunning || intentosRestantes <= 0) return;
        if (!codeInput) return;
        
        const userCode = codeInput.value;
        isRunning = true;
        if (runButton) runButton.disabled = true;
        
        logToMission("🔧 Iniciando ejecución...", 'info');

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

        const currentCode = codeLines[lineIndex].trim();
        
        processCommand(currentCode, () => {
            setTimeout(() => {
                processCodeLines(codeLines, lineIndex + 1);
            }, 400);
        });
    }

    function processCommand(command, callback) {
        let hitWall = false;
        const cleanCommand = command.split('//')[0].trim();
        
        if (cleanCommand === 'move();') {
            let nextX = robotState.x;
            let nextY = robotState.y;
            
            if (robotState.dir === 0) nextY--;
            else if (robotState.dir === 1) nextX++;
            else if (robotState.dir === 2) nextY++;
            else if (robotState.dir === 3) nextX--;

            if (nextX < 1 || nextX > levelData.grid || nextY < 1 || nextY > levelData.grid) {
                hitWall = true;
                logToMission("🚫 Límite del mapa", "error");
            } else if (levelData.walls.some(wall => wall.x === nextX && wall.y === nextY)) {
                hitWall = true;
                logToMission("🚫 Choque con obstáculo", "error");
            } else {
                robotState.x = nextX;
                robotState.y = nextY;
                logToMission(`📍 Movido a [${robotState.x}, ${robotState.y}]`, 'success');
            }
            
        } else if (cleanCommand === 'rotate();') {
            robotState.dir = (robotState.dir + 1) % 4;
            const direcciones = ['NORTE', 'ESTE', 'SUR', 'OESTE'];
            logToMission(`🔄 Girado a ${direcciones[robotState.dir]}`, 'success');
            
        } else if (cleanCommand === 'recoger();') {
            const currentShape = levelData.shapes.find(
                shape => shape.x === robotState.x && shape.y === robotState.y
            );
            
            if (currentShape) {
                const expectedShape = FORMAS_OBJETIVO[nextShapeIndex];
                const expectedName = NOMBRES_FORMAS[nextShapeIndex];
                
                if (currentShape.shape === expectedShape && !collectedShapes.some(s => s.shape === currentShape.shape)) {
                    collectedShapes.push(currentShape);
                    nextShapeIndex++;
                    logToMission(`✅ ¡Recogiste ${currentShape.name} ${currentShape.shape}! Siguiente: ${FORMAS_OBJETIVO[nextShapeIndex] || '¡Completado!'}`, 'success');
                    
                    const shapeEl = shapeElements.find(el => 
                        parseInt(el.dataset.x) === currentShape.x && 
                        parseInt(el.dataset.y) === currentShape.y
                    );
                    if (shapeEl) {
                        shapeEl.classList.add('collected');
                        shapeEl.style.opacity = '0.5';
                        shapeEl.style.filter = 'grayscale(0.5)';
                    }
                } else if (collectedShapes.some(s => s.shape === currentShape.shape)) {
                    logToMission(`⚠️ Color ${currentShape.name} ${currentShape.shape} ya fue recogida`, 'warning');
                } else {
                    logToMission(`❌ Forma incorrecta. Esperabas ${expectedName} ${expectedShape}, encontraste ${currentShape.name} ${currentShape.shape}`, 'error');
                }
            } else {
                logToMission("❌ No hay forma aquí para recoger", 'error');
            }
        } else {
            logToMission(`⚠️ Comando no reconocido: ${cleanCommand}`, 'warning');
        }

        updateUI();
        
        if (hitWall) {
            logToMission("🛑 Ejecución detenida por choque", "error");
            isRunning = false;
            if (runButton) runButton.disabled = false;
            intentosRestantes--;
            updateTriesUI();
            
            reportarIntentoFallido('PrimerG', 'isla1', 'juego3', intentosRestantes)
                .catch(err => console.warn("Error reporting:", err));
            
            if (intentosRestantes <= 0) {
                setTimeout(showGameOverModal, 1000);
            }
            return;
        }

        setTimeout(callback, 400);
    }

    function checkWinCondition() {
        if (collectedShapes.length === 5) {
            logToMission("🎊 ¡VICTORIA! Completaste el patrón de colores", 'success');
            
            completarJuego('PrimerG', 'isla1', 'juego3')
                .then(() => reportarJuegoCompletado('PrimerG', 'isla1', 'juego3'))
                .catch(error => console.error("Error:", error))
                .finally(() => setTimeout(showVictoryModal, 1000));
        } else if (!isRunning && collectedShapes.length < 5) {
            intentosRestantes--;
            updateTriesUI();
            const formasFaltantes = FORMAS_OBJETIVO.slice(collectedShapes.length);
            logToMission(`❌ No completaste el patrón. Te faltan: ${formasFaltantes.join(' → ')}`, 'error');
            
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
    if (btnMove) btnMove.addEventListener('click', () => addCommandToTextarea('move();'));
    if (btnRotate) btnRotate.addEventListener('click', () => addCommandToTextarea('rotate();'));
    if (btnRecoger) btnRecoger.addEventListener('click', () => addCommandToTextarea('recoger();'));
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

    console.log("🎮 Juego de colores listo!");
});