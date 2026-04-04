// =================================================================
// ARCHIVO: cursos/PrimerG/isla1/juego5/quintoJ.js
// JUEGO: La Fábrica de Variables - Variables y condiciones en secuencia
// =================================================================

import { reportarJuegoCompletado, reportarIntentoFallido, reportarInicioDeJuego } from '../../../../librerias/logService.js';
import { completarJuego } from '../../../../librerias/auth.firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 DOM cargado, inicializando juego de variables...");
    
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
    const btnVariable = document.getElementById('btn-variable');
    const btnIf = document.getElementById('btn-if');
    const btnWhile = document.getElementById('btn-while');
    const victoryModal = document.getElementById('victory-modal');
    const gameoverModal = document.getElementById('gameover-modal');
    const tutorialModal = document.getElementById('tutorial-modal');
    const nextLevelButton = document.getElementById('next-level-button');
    const retryButton = document.getElementById('retry-button');
    const programOutput = document.getElementById('program-output');
    const outputLength = document.getElementById('output-length');
    const positionDisplay = document.getElementById('position-display');
    const directionDisplay = document.getElementById('direction-display');
    const boxesCount = document.getElementById('boxes-count');
    const variablesUsed = document.getElementById('variables-used');
    const loopsUsed = document.getElementById('loops-used');
    const gameContainer = document.getElementById('game-container');
    const backToTutorialBtn = document.getElementById('back-to-tutorial');
    const backToMapBtn = document.getElementById('back-to-map');

    // --- CONFIGURACIÓN ---
    const MAX_INTENTOS = 5;
    const TOTAL_BOXES = 5;
    
    // Mapa 8x8 con cajas en una línea
    const levelData = { 
        grid: 8,
        startX: 1,
        startY: 1,
        startDir: 1, // 0=N,1=E,2=S,3=O
        boxes: [
            { id: 1, x: 2, y: 1, collected: false },
            { id: 2, x: 3, y: 1, collected: false },
            { id: 3, x: 4, y: 1, collected: false },
            { id: 4, x: 5, y: 1, collected: false },
            { id: 5, x: 6, y: 1, collected: false }
        ],
        walls: [], // Sin paredes para facilitar el aprendizaje
        prompt: "Recolecta las 5 cajas usando variables para contar",
        hint: `// Ejemplo con variable contador:\ncontador = 0;\nwhile(contador < 5) {\n    move();\n    recoger();\n    contador = contador + 1;\n}`
    };

    // --- VARIABLES DEL JUEGO ---
    let robotState = {};
    let isRunning = false;
    let intentosRestantes = MAX_INTENTOS;
    let boxElements = [];
    let collectedBoxes = 0;
    let variablesCount = 0;
    let loopsCount = 0;
    let userVariables = new Set();

    // --- FUNCIONES DEL JUEGO ---
    function logToMission(message, type = 'info') {
        if (!missionLogEl) return;
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `> ${message}`;
        missionLogEl.appendChild(entry);
        missionLogEl.scrollTop = missionLogEl.scrollHeight;
        
        while (missionLogEl.children.length > 50) {
            missionLogEl.removeChild(missionLogEl.firstChild);
        }
    }

    function drawGrid() {
        if (!gridEl) return;
        gridEl.innerHTML = '';
        boxElements = [];
        
        gridEl.style.gridTemplateColumns = `repeat(${levelData.grid}, 1fr)`;
        gridEl.style.gridTemplateRows = `repeat(${levelData.grid}, 1fr)`;
        
        for (let y = 1; y <= levelData.grid; y++) {
            for (let x = 1; x <= levelData.grid; x++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.style.gridColumn = x;
                cell.style.gridRow = y;
                gridEl.appendChild(cell);
            }
        }

        levelData.boxes.forEach((box, idx) => {
            const boxEl = document.createElement('div');
            boxEl.classList.add('box-cell');
            boxEl.textContent = '📦';
            boxEl.style.gridColumn = box.x;
            boxEl.style.gridRow = box.y;
            gridEl.appendChild(boxEl);
            boxElements.push(boxEl);
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
        collectedBoxes = 0;
        variablesCount = 0;
        loopsCount = 0;
        userVariables.clear();
        
        // Resetear estado de cajas
        levelData.boxes.forEach(box => box.collected = false);
        
        updateUI();
        drawGrid();
        
        if (missionLogEl) missionLogEl.innerHTML = '';
        if (codeInput) codeInput.value = levelData.hint;
        
        logToMission(`🎮 Iniciando juego de variables`, 'info');
        logToMission(`🎯 Recolecta ${TOTAL_BOXES} cajas 📦 en orden`, 'warning');
        logToMission(`💡 Usa variables como "contador" para llevar la cuenta`, 'info');
        logToMission(`📝 Ejemplo: contador = 0; while(contador < 5) { ... }`, 'info');
        
        hideModals();
        if (runButton) runButton.disabled = false;
    }
    
    function updateUI() {
        if (triesCountEl) triesCountEl.textContent = `${intentosRestantes}/${MAX_INTENTOS}`;
        updateRobotUI();
        updateCounters();
        if (positionDisplay) positionDisplay.textContent = `[${robotState.x}, ${robotState.y}]`;
        
        const directions = ['↑ NORTE', '→ ESTE', '↓ SUR', '← OESTE'];
        if (directionDisplay) directionDisplay.textContent = directions[robotState.dir];
        
        if (variablesUsed) variablesUsed.textContent = variablesCount;
        if (loopsUsed) loopsUsed.textContent = loopsCount;
    }

    function updateRobotUI() {
        if (!robotEl) return;
        robotEl.style.gridColumn = robotState.x;
        robotEl.style.gridRow = robotState.y;
        
        const rotations = ['0deg', '90deg', '180deg', '270deg'];
        robotEl.style.transform = `rotate(${rotations[robotState.dir]})`;
    }
    
    function updateCounters() {
        collectedBoxes = levelData.boxes.filter(box => box.collected).length;
        
        if (boxesCount) boxesCount.textContent = `${collectedBoxes}/${TOTAL_BOXES}`;
        
        if (programOutput && outputLength) {
            outputLength.textContent = `contador = ${collectedBoxes}`;
            programOutput.innerHTML = `contador = ${collectedBoxes}<br>📦 ${'📦'.repeat(collectedBoxes)}${'⬜'.repeat(TOTAL_BOXES - collectedBoxes)}`;
        }
        
        // Actualizar visualmente las cajas
        boxElements.forEach((el, idx) => {
            if (levelData.boxes[idx].collected) {
                el.classList.add('collected');
            } else {
                el.classList.remove('collected');
            }
        });
    }

    function showVictoryModal() {
        logToMission(`🎉 ¡VICTORIA! Recolectaste las ${TOTAL_BOXES} cajas`, 'success');
        logToMission(`📊 Variables usadas: ${variablesCount}, Bucles: ${loopsCount}`, 'info');
        if (victoryModal) victoryModal.classList.remove('hidden');
    }
    
    function showGameOverModal() {
        logToMission("💀 GAME OVER - Demasiados intentos fallidos", "error");
        if (gameoverModal) gameoverModal.classList.remove('hidden');
        if (runButton) runButton.disabled = true;
    }
    
    function hideModals() {
        if (victoryModal) victoryModal.classList.add('hidden');
        if (gameoverModal) gameoverModal.classList.add('hidden');
    }
    
    function startGame() {
        console.log("🎮 Iniciando juego de variables...");
        if (tutorialModal) tutorialModal.classList.add('hidden');
        if (gameContainer) gameContainer.classList.remove('hidden');
        resetGame();
        
        reportarInicioDeJuego('PrimerG', 'isla1', 'juego5')
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

    // ========== FUNCIONES DE MOVIMIENTO ==========
    function move() {
        let nextX = robotState.x;
        let nextY = robotState.y;
        
        if (robotState.dir === 0) nextY--;
        else if (robotState.dir === 1) nextX++;
        else if (robotState.dir === 2) nextY++;
        else if (robotState.dir === 3) nextX--;

        if (nextX < 1 || nextX > levelData.grid || nextY < 1 || nextY > levelData.grid) {
            throw new Error("¡Límite del mapa!");
        }
        
        robotState.x = nextX;
        robotState.y = nextY;
        logToMission(`📍 Movido a [${robotState.x}, ${robotState.y}]`, 'success');
        updateUI();
    }

    function rotate() {
        robotState.dir = (robotState.dir + 1) % 4;
        const dirs = ['NORTE', 'ESTE', 'SUR', 'OESTE'];
        logToMission(`🔄 Girado a ${dirs[robotState.dir]}`, 'success');
        updateUI();
    }

    function recoger() {
        const box = levelData.boxes.find(b => b.x === robotState.x && b.y === robotState.y && !b.collected);
        if (box) {
            box.collected = true;
            logToMission(`📦 ¡Recogiste caja #${box.id}! Total: ${collectedBoxes + 1}/${TOTAL_BOXES}`, 'success');
            updateCounters();
        } else {
            const existingBox = levelData.boxes.find(b => b.x === robotState.x && b.y === robotState.y);
            if (existingBox && existingBox.collected) {
                logToMission(`⚠️ Ya recogiste esta caja`, 'warning');
            } else {
                logToMission(`❌ No hay caja aquí`, 'error');
            }
        }
    }

    // ========== EJECUTOR DE CÓDIGO CON VARIABLES ==========
    async function executeCode(code) {
        // Detectar variables y bucles
        const variablePattern = /[a-zA-Z_][a-zA-Z0-9_]*\s*=/g;
        const loopPattern = /while\s*\(|for\s*\(/g;
        
        const variableMatches = code.match(variablePattern);
        if (variableMatches) {
            variableMatches.forEach(match => {
                const varName = match.split('=')[0].trim();
                if (varName && !['if', 'while', 'for', 'function', 'return'].includes(varName)) {
                    userVariables.add(varName);
                }
            });
            variablesCount = userVariables.size;
        }
        
        const loopMatches = code.match(loopPattern);
        loopsCount = loopMatches ? loopMatches.length : 0;
        
        // Limpiar el código
        let cleanCode = code.replace(/\/\/.*$/gm, '');
        
        // Parsear línea por línea
        const lines = cleanCode.split('\n');
        let i = 0;
        
        // Contexto de variables para el usuario
        const context = {};
        
        while (i < lines.length) {
            let line = lines[i].trim();
            if (line === '') {
                i++;
                continue;
            }
            
            // Detectar asignación de variable
            const assignMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
            if (assignMatch && !line.startsWith('if') && !line.startsWith('while') && !line.startsWith('for')) {
                const varName = assignMatch[1];
                const expression = assignMatch[2].replace(/;$/, '');
                
                // Evaluar expresión simple
                let value;
                if (expression === '0') value = 0;
                else if (expression === '1') value = 1;
                else if (expression === 'contador + 1') value = (context['contador'] || 0) + 1;
                else if (expression.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
                    value = context[expression] || 0;
                } else {
                    value = parseInt(expression) || 0;
                }
                
                context[varName] = value;
                logToMission(`📊 Variable ${varName} = ${value}`, 'info');
                i++;
                continue;
            }
            
            // Detectar while(condicion) { ... }
            if (line.startsWith('while')) {
                const match = line.match(/while\s*\(\s*([^)]+)\s*\)\s*\{/);
                if (match) {
                    const condition = match[1];
                    let bloqueLines = [];
                    i++;
                    let braceCount = 1;
                    
                    while (i < lines.length && braceCount > 0) {
                        let currentLine = lines[i].trim();
                        if (currentLine.includes('{')) braceCount++;
                        if (currentLine.includes('}')) braceCount--;
                        if (braceCount > 0 && currentLine !== '}') {
                            bloqueLines.push(currentLine);
                        }
                        i++;
                    }
                    
                    // Evaluar condición y ejecutar bloque
                    let shouldContinue = true;
                    while (shouldContinue) {
                        // Evaluar condición
                        const conditionValue = evaluateCondition(condition, context);
                        
                        if (!conditionValue) {
                            shouldContinue = false;
                            break;
                        }
                        
                        // Ejecutar bloque
                        for (let bline of bloqueLines) {
                            await executeLine(bline, context);
                        }
                        
                        // Actualizar condición después de cada iteración
                        const newConditionValue = evaluateCondition(condition, context);
                        if (!newConditionValue) shouldContinue = false;
                    }
                    continue;
                }
            }
            
            // Detectar if(condicion) { ... }
            if (line.startsWith('if')) {
                const match = line.match(/if\s*\(\s*([^)]+)\s*\)\s*\{/);
                if (match) {
                    const condition = match[1];
                    let bloqueLines = [];
                    i++;
                    let braceCount = 1;
                    
                    while (i < lines.length && braceCount > 0) {
                        let currentLine = lines[i].trim();
                        if (currentLine.includes('{')) braceCount++;
                        if (currentLine.includes('}')) braceCount--;
                        if (braceCount > 0 && currentLine !== '}') {
                            bloqueLines.push(currentLine);
                        }
                        i++;
                    }
                    
                    // Evaluar condición
                    const conditionValue = evaluateCondition(condition, context);
                    
                    if (conditionValue) {
                        for (let bline of bloqueLines) {
                            await executeLine(bline, context);
                        }
                    }
                    continue;
                }
            }
            
            // Comandos simples
            await executeLine(line, context);
            i++;
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
    
    function evaluateCondition(condition, context) {
        // Reemplazar variables con sus valores
        let evalCondition = condition;
        for (let [key, value] of Object.entries(context)) {
            evalCondition = evalCondition.replace(new RegExp(key, 'g'), value);
        }
        
        // Evaluar comparaciones simples
        if (evalCondition.includes('<')) {
            const [left, right] = evalCondition.split('<');
            return parseInt(left) < parseInt(right);
        }
        if (evalCondition.includes('>')) {
            const [left, right] = evalCondition.split('>');
            return parseInt(left) > parseInt(right);
        }
        if (evalCondition.includes('==')) {
            const [left, right] = evalCondition.split('==');
            return parseInt(left) === parseInt(right);
        }
        
        return false;
    }
    
    async function executeLine(line, context) {
        line = line.trim();
        
        if (line === 'move();') await move();
        else if (line === 'rotate();') await rotate();
        else if (line === 'recoger();') await recoger();
        else if (line.startsWith('contador =')) {
            // Ya se maneja en la asignación
        }
        else if (line !== '' && !line.includes('{') && !line.includes('}') && !line.startsWith('if') && !line.startsWith('while')) {
            logToMission(`⚠️ Comando no reconocido: ${line}`, 'warning');
        }
    }
    
    async function onRunProgram() {
        if (isRunning || intentosRestantes <= 0) return;
        if (!codeInput) return;
        
        const userCode = codeInput.value;
        isRunning = true;
        if (runButton) runButton.disabled = true;
        
        logToMission(`🔧 Ejecutando código con variables...`, 'info');
        
        // Guardar estado por si falla
        const savedState = {
            robot: { ...robotState },
            boxes: JSON.parse(JSON.stringify(levelData.boxes)),
            collected: collectedBoxes
        };
        
        try {
            await executeCode(userCode);
            
            // Verificar victoria
            if (collectedBoxes === TOTAL_BOXES) {
                logToMission("🎊 ¡VICTORIA! Recolectaste todas las cajas", 'success');
                completarJuego('PrimerG', 'isla1', 'juego5')
                    .then(() => reportarJuegoCompletado('PrimerG', 'isla1', 'juego5'))
                    .catch(error => console.error("Error:", error))
                    .finally(() => setTimeout(showVictoryModal, 1000));
            } else {
                logToMission(`✅ Ejecución completada. Progreso: ${collectedBoxes}/${TOTAL_BOXES}`, 'success');
            }
            
        } catch (error) {
            logToMission(`❌ Error: ${error.message}`, 'error');
            // Restaurar estado
            robotState = savedState.robot;
            levelData.boxes = savedState.boxes;
            collectedBoxes = savedState.collected;
            updateUI();
            drawGrid();
            
            intentosRestantes--;
            updateUI();
            
            reportarIntentoFallido('PrimerG', 'isla1', 'juego5', intentosRestantes)
                .catch(err => console.warn("Error reporting:", err));
            
            if (intentosRestantes <= 0) {
                setTimeout(showGameOverModal, 1000);
            }
        }
        
        isRunning = false;
        if (runButton) runButton.disabled = false;
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
    if (btnRecoger) btnRecoger.addEventListener('click', () => addCommandToTextarea('recoger();\n'));
    if (btnVariable) btnVariable.addEventListener('click', () => addCommandToTextarea('contador = 0;\n'));
    if (btnIf) btnIf.addEventListener('click', () => addCommandToTextarea('if(contador < 5) {\n    \n}'));
    if (btnWhile) btnWhile.addEventListener('click', () => addCommandToTextarea('while(contador < 5) {\n    \n}'));
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

    console.log("🎮 Juego de variables listo!");
});