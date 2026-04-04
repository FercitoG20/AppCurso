// =================================================================
// ARCHIVO: cursos/PrimerG/isla1/juego4/cuartoJ.js
// JUEGO: La Fábrica de Repeticiones - VERSIÓN SIMPLIFICADA Y FUNCIONAL
// =================================================================

import { reportarJuegoCompletado, reportarIntentoFallido, reportarInicioDeJuego } from '../../../../librerias/logService.js';
import { completarJuego } from '../../../../librerias/auth.firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 DOM cargado, inicializando juego de bucles...");
    
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
    const btnRecolectar = document.getElementById('btn-recolectar');
    const btnRepetir = document.getElementById('btn-repetir');
    const btnFor = document.getElementById('btn-for');
    const victoryModal = document.getElementById('victory-modal');
    const gameoverModal = document.getElementById('gameover-modal');
    const tutorialModal = document.getElementById('tutorial-modal');
    const nextLevelButton = document.getElementById('next-level-button');
    const retryButton = document.getElementById('retry-button');
    const programOutput = document.getElementById('program-output');
    const outputLength = document.getElementById('output-length');
    const positionDisplay = document.getElementById('position-display');
    const directionDisplay = document.getElementById('direction-display');
    const progressDisplay = document.getElementById('progress-display');
    const circlesCount = document.getElementById('circles-count');
    const trianglesCount = document.getElementById('triangles-count');
    const squaresCount = document.getElementById('squares-count');
    const efficiencyStar = document.getElementById('efficiency-star');
    const linesUsed = document.getElementById('lines-used');
    const loopsUsed = document.getElementById('loops-used');
    const gameContainer = document.getElementById('game-container');
    const backToTutorialBtn = document.getElementById('back-to-tutorial');
    const backToMapBtn = document.getElementById('back-to-map');

    // --- CONFIGURACIÓN SIMPLE ---
    const MAX_INTENTOS = 5;
    
    // Mapa más simple: 8x8 sin paredes complicadas
    const levelData = { 
        grid: 8,
        startX: 1,
        startY: 1,
        startDir: 1, // 0=N,1=E,2=S,3=O
        figures: [
            // Zona 1: Círculos (fila 2, columnas 2-6)
            { type: 'circle', shape: '🔵', name: 'CÍRCULO', x: 2, y: 2, collected: false },
            { type: 'circle', shape: '🔵', name: 'CÍRCULO', x: 3, y: 2, collected: false },
            { type: 'circle', shape: '🔵', name: 'CÍRCULO', x: 4, y: 2, collected: false },
            { type: 'circle', shape: '🔵', name: 'CÍRCULO', x: 5, y: 2, collected: false },
            { type: 'circle', shape: '🔵', name: 'CÍRCULO', x: 6, y: 2, collected: false },
            // Zona 2: Triángulos (fila 5, columnas 2-6)
            { type: 'triangle', shape: '🟢', name: 'TRIÁNGULO', x: 2, y: 5, collected: false },
            { type: 'triangle', shape: '🟢', name: 'TRIÁNGULO', x: 3, y: 5, collected: false },
            { type: 'triangle', shape: '🟢', name: 'TRIÁNGULO', x: 4, y: 5, collected: false },
            { type: 'triangle', shape: '🟢', name: 'TRIÁNGULO', x: 5, y: 5, collected: false },
            { type: 'triangle', shape: '🟢', name: 'TRIÁNGULO', x: 6, y: 5, collected: false },
            // Zona 3: Cuadrados (fila 8, columnas 2-6)
            { type: 'square', shape: '🔴', name: 'CUADRADO', x: 2, y: 8, collected: false },
            { type: 'square', shape: '🔴', name: 'CUADRADO', x: 3, y: 8, collected: false },
            { type: 'square', shape: '🔴', name: 'CUADRADO', x: 4, y: 8, collected: false },
            { type: 'square', shape: '🔴', name: 'CUADRADO', x: 5, y: 8, collected: false },
            { type: 'square', shape: '🔴', name: 'CUADRADO', x: 6, y: 8, collected: false }
        ],
        walls: [], // Sin paredes para simplificar
        prompt: "Recolecta 5 círculos, luego 5 triángulos y finalmente 5 cuadrados",
        hint: `// Ejemplo con bucle:\nrepetir(5) {\n    move();\n    recolectar();\n}\n// Luego baja y repite`
    };

    // --- VARIABLES DEL JUEGO ---
    let robotState = {};
    let isRunning = false;
    let intentosRestantes = MAX_INTENTOS;
    let figureElements = [];
    let collectedCircles = 0;
    let collectedTriangles = 0;
    let collectedSquares = 0;
    let totalCollected = 0;
    let codeLinesCount = 0;
    let loopsCount = 0;

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
        figureElements = [];
        
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

        levelData.figures.forEach((figure, idx) => {
            const figureEl = document.createElement('div');
            figureEl.classList.add('figure-cell');
            figureEl.textContent = figure.shape;
            figureEl.style.gridColumn = figure.x;
            figureEl.style.gridRow = figure.y;
            
            // Asignar clase según tipo
            if (figure.type === 'circle') figureEl.classList.add('figure-circle');
            else if (figure.type === 'triangle') figureEl.classList.add('figure-triangle');
            else if (figure.type === 'square') figureEl.classList.add('figure-square');
            
            gridEl.appendChild(figureEl);
            figureElements.push(figureEl);
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
        collectedCircles = 0;
        collectedTriangles = 0;
        collectedSquares = 0;
        totalCollected = 0;
        codeLinesCount = 0;
        loopsCount = 0;
        
        // Resetear estado de figuras
        levelData.figures.forEach(figure => figure.collected = false);
        
        updateUI();
        drawGrid();
        
        if (missionLogEl) missionLogEl.innerHTML = '';
        if (codeInput) codeInput.value = levelData.hint;
        
        logToMission(`🎮 Iniciando juego de bucles`, 'info');
        logToMission(`🎯 Recolecta: 🔵🔵🔵🔵🔵 🟢🟢🟢🟢🟢 🔴🔴🔴🔴🔴`, 'warning');
        logToMission(`💡 Usa repetir(5) { move(); recolectar(); } para optimizar`, 'info');
        
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
    }

    function updateRobotUI() {
        if (!robotEl) return;
        robotEl.style.gridColumn = robotState.x;
        robotEl.style.gridRow = robotState.y;
        
        const rotations = ['0deg', '90deg', '180deg', '270deg'];
        robotEl.style.transform = `rotate(${rotations[robotState.dir]})`;
    }
    
    function updateCounters() {
        collectedCircles = levelData.figures.filter(f => f.type === 'circle' && f.collected).length;
        collectedTriangles = levelData.figures.filter(f => f.type === 'triangle' && f.collected).length;
        collectedSquares = levelData.figures.filter(f => f.type === 'square' && f.collected).length;
        totalCollected = collectedCircles + collectedTriangles + collectedSquares;
        
        if (circlesCount) circlesCount.textContent = `${collectedCircles}/5`;
        if (trianglesCount) trianglesCount.textContent = `${collectedTriangles}/5`;
        if (squaresCount) squaresCount.textContent = `${collectedSquares}/5`;
        if (progressDisplay) progressDisplay.textContent = `${totalCollected}/15`;
        if (outputLength) outputLength.textContent = `${totalCollected}/15`;
        
        if (programOutput) {
            const circlesBar = '🔵'.repeat(collectedCircles) + '⚪'.repeat(5 - collectedCircles);
            const trianglesBar = '🟢'.repeat(collectedTriangles) + '⚪'.repeat(5 - collectedTriangles);
            const squaresBar = '🔴'.repeat(collectedSquares) + '⚪'.repeat(5 - collectedSquares);
            programOutput.innerHTML = `${circlesBar} ${trianglesBar} ${squaresBar}`;
        }
        
        // Actualizar visualmente las figuras
        figureElements.forEach((el, idx) => {
            if (levelData.figures[idx].collected) {
                el.classList.add('collected');
            } else {
                el.classList.remove('collected');
            }
        });
        
        // Calcular estrellas por eficiencia
        let stars = 1;
        if (loopsCount >= 3 && codeLinesCount <= 12) stars = 3;
        else if (loopsCount >= 2 && codeLinesCount <= 20) stars = 2;
        if (efficiencyStar) efficiencyStar.innerHTML = '⭐'.repeat(stars);
        if (linesUsed) linesUsed.textContent = codeLinesCount;
        if (loopsUsed) loopsUsed.textContent = loopsCount;
    }

    function showVictoryModal() {
        const stars = efficiencyStar ? efficiencyStar.innerHTML.length : 1;
        logToMission(`🎉 ¡VICTORIA! Recolectaste todas las 15 figuras`, 'success');
        logToMission(`🏆 Eficiencia: ${stars} estrella(s)`, 'success');
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
        console.log("🎮 Iniciando juego...");
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

    function recolectar() {
        const figure = levelData.figures.find(f => f.x === robotState.x && f.y === robotState.y && !f.collected);
        if (figure) {
            figure.collected = true;
            logToMission(`⭐ ¡Recolectaste ${figure.name} ${figure.shape}!`, 'success');
            updateCounters();
        } else {
            const existingFigure = levelData.figures.find(f => f.x === robotState.x && f.y === robotState.y);
            if (existingFigure && existingFigure.collected) {
                logToMission(`⚠️ Ya recolectaste esta figura`, 'warning');
            } else {
                logToMission(`❌ No hay figura aquí`, 'error');
            }
        }
    }

    // ========== EJECUTOR DE CÓDIGO CON BUCLES ==========
    async function executeCode(code) {
        // Contar líneas y bucles
        const codeLines = code.split('\n')
            .map(line => line.trim())
            .filter(line => line !== '' && !line.startsWith('//'));
        codeLinesCount = codeLines.length;
        
        const loopPattern = /repetir\s*\(|for\s*\(/g;
        const matches = code.match(loopPattern);
        loopsCount = matches ? matches.length : 0;
        
        // Limpiar el código
        let cleanCode = code.replace(/\/\/.*$/gm, '');
        
        // Parsear línea por línea
        const lines = cleanCode.split('\n');
        let i = 0;
        
        while (i < lines.length) {
            let line = lines[i].trim();
            if (line === '') {
                i++;
                continue;
            }
            
            // Detectar repetir(n) { ... }
            if (line.startsWith('repetir(')) {
                const match = line.match(/repetir\((\d+)\)\s*\{/);
                if (match) {
                    const n = parseInt(match[1]);
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
                    
                    // Ejecutar el bloque n veces
                    for (let r = 0; r < n; r++) {
                        for (let bline of bloqueLines) {
                            if (bline === 'move();') await move();
                            else if (bline === 'rotate();') await rotate();
                            else if (bline === 'recolectar();') await recolectar();
                            else if (bline !== '') logToMission(`⚠️ Comando no válido: ${bline}`, 'warning');
                            await new Promise(resolve => setTimeout(resolve, 200));
                        }
                    }
                    continue;
                }
            }
            
            // Detectar for(i=0;i<n;i++) { ... }
            if (line.startsWith('for')) {
                const match = line.match(/for\s*\(\s*let\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\+\+\s*\)\s*\{/);
                if (match) {
                    const start = parseInt(match[1]);
                    const end = parseInt(match[2]);
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
                    
                    // Ejecutar el bloque
                    for (let j = start; j < end; j++) {
                        for (let bline of bloqueLines) {
                            if (bline === 'move();') await move();
                            else if (bline === 'rotate();') await rotate();
                            else if (bline === 'recolectar();') await recolectar();
                            else if (bline !== '') logToMission(`⚠️ Comando no válido: ${bline}`, 'warning');
                            await new Promise(resolve => setTimeout(resolve, 200));
                        }
                    }
                    continue;
                }
            }
            
            // Comandos simples
            if (line === 'move();') await move();
            else if (line === 'rotate();') await rotate();
            else if (line === 'recolectar();') await recolectar();
            else if (line !== '' && !line.includes('{') && !line.includes('}')) {
                logToMission(`⚠️ Comando no reconocido: ${line}`, 'warning');
            }
            
            i++;
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
    
    async function onRunProgram() {
        if (isRunning || intentosRestantes <= 0) return;
        if (!codeInput) return;
        
        const userCode = codeInput.value;
        isRunning = true;
        if (runButton) runButton.disabled = true;
        
        logToMission(`🔧 Ejecutando código...`, 'info');
        
        // Guardar estado por si falla
        const savedState = {
            robot: { ...robotState },
            figures: JSON.parse(JSON.stringify(levelData.figures)),
            circles: collectedCircles,
            triangles: collectedTriangles,
            squares: collectedSquares
        };
        
        try {
            await executeCode(userCode);
            
            // Verificar victoria
            if (totalCollected === 15) {
                logToMission("🎊 ¡VICTORIA! Completaste la recolección", 'success');
                completarJuego('PrimerG', 'isla1', 'juego4')
                    .then(() => reportarJuegoCompletado('PrimerG', 'isla1', 'juego4'))
                    .catch(error => console.error("Error:", error))
                    .finally(() => setTimeout(showVictoryModal, 1000));
            } else {
                logToMission(`✅ Ejecución completada. Progreso: ${totalCollected}/15`, 'success');
            }
            
        } catch (error) {
            logToMission(`❌ Error: ${error.message}`, 'error');
            // Restaurar estado
            robotState = savedState.robot;
            levelData.figures = savedState.figures;
            collectedCircles = savedState.circles;
            collectedTriangles = savedState.triangles;
            collectedSquares = savedState.squares;
            totalCollected = collectedCircles + collectedTriangles + collectedSquares;
            updateUI();
            drawGrid();
            
            intentosRestantes--;
            updateUI();
            
            reportarIntentoFallido('PrimerG', 'isla1', 'juego4', intentosRestantes)
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
    if (btnRecolectar) btnRecolectar.addEventListener('click', () => addCommandToTextarea('recolectar();\n'));
    if (btnRepetir) btnRepetir.addEventListener('click', () => addCommandToTextarea('repetir(5) {\n    \n}'));
    if (btnFor) btnFor.addEventListener('click', () => addCommandToTextarea('for (let i = 0; i < 5; i++) {\n    \n}'));
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

    console.log("🎮 Juego de bucles listo!");
});