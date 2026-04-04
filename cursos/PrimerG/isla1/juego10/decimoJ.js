// =================================================================
// ARCHIVO: cursos/PrimerG/isla1/juego1/primerJ.js
// VERSIÓN: CORREGIDA - RUTAS DE IMPORTACIÓN ARREGLADAS
// =================================================================

// ✅ RUTA CORREGIDA: sube 4 niveles hasta la raíz
import { reportarJuegoCompletado, reportarIntentoFallido, reportarInicioDeJuego } from '../../../../librerias/logService.js';
import { completarJuego } from '../../../../librerias/auth.firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 DOM cargado, inicializando juego...");
    
    // --- REFERENCIAS AL DOM ---
    const robotEl = document.getElementById('robot');
    const gridEl = document.getElementById('grid-world');
    const levelTitleEl = document.getElementById('level-title');
    const codeInput = document.getElementById('code-input');
    const runButton = document.getElementById('run-button');
    const resetButton = document.getElementById('reset-button');
    const clearLogButton = document.getElementById('clear-log');
    const startButton = document.getElementById('start-button');
    
    // Elementos de UI
    const triesCountEl = document.getElementById('tries-count');
    const missionLogEl = document.getElementById('mission-log');
    const btnMove = document.getElementById('btn-move');
    const btnRotate = document.getElementById('btn-rotate');
    const btnPrint = document.getElementById('btn-print');
    const victoryModal = document.getElementById('victory-modal');
    const gameoverModal = document.getElementById('gameover-modal');
    const tutorialModal = document.getElementById('tutorial-modal');
    const nextLevelButton = document.getElementById('next-level-button');
    const retryButton = document.getElementById('retry-button');
    const programOutput = document.getElementById('program-output');
    const outputLength = document.getElementById('output-length');
    const positionDisplay = document.getElementById('position-display');
    const directionDisplay = document.getElementById('direction-display');
    const lettersFound = document.getElementById('letters-found');
    const gameContainer = document.getElementById('game-container');
    const backToTutorialBtn = document.getElementById('back-to-tutorial');
    const backToMapBtn = document.getElementById('back-to-map');

    // Verificar elementos críticos
    console.log("✅ startButton encontrado:", !!startButton);
    console.log("✅ gameContainer encontrado:", !!gameContainer);
    console.log("✅ tutorialModal encontrado:", !!tutorialModal);

    // --- CONFIGURACIÓN ---
    const MAX_INTENTOS = 5;

    // === NIVEL CON LETRAS REVUELTAS ===
    const allLevelData = [
        { 
            grid: 8, 
            startX: 1, 
            startY: 1, 
            startDir: 1,
            letters: [
                {char: 'H', x: 2, y: 3},
                {char: 'E', x: 5, y: 1},
                {char: 'L', x: 8, y: 6},
                {char: 'L', x: 3, y: 7},
                {char: 'O', x: 6, y: 4},
                {char: 'W', x: 1, y: 5},
                {char: 'O', x: 4, y: 8},
                {char: 'R', x: 7, y: 2},
                {char: 'L', x: 2, y: 8},
                {char: 'D', x: 8, y: 1}
            ],
            walls: [
                {x: 3, y: 2}, {x: 3, y: 3}, {x: 3, y: 4},
                {x: 5, y: 3}, {x: 5, y: 4}, {x: 5, y: 5},
                {x: 7, y: 4}, {x: 7, y: 5}, {x: 7, y: 6},
                {x: 4, y: 6}, {x: 6, y: 2}
            ],
            prompt: "Encuentra las letras de HELLO WORLD en el orden correcto",
            hint: `// Ejemplo de código:\nmove();\nrotate();\nmove();\nprint();\n// ¡Sigue explorando!`
        }
    ];

    // --- VARIABLES DEL JUEGO ---
    let currentLevelIndex = 0;
    let currentLevelData = {};
    let robotState = {};
    let commandQueue = [];
    let isRunning = false;
    let intentosRestantes = MAX_INTENTOS;
    let wallElements = [];
    let letterElements = [];
    let currentOutput = "";
    let foundLetters = 0;
    let currentLine = 0;

    // Variable para guardar el estado cuando se muestra el tutorial
    let savedGameState = {
        code: '',
        output: '',
        robotState: null,
        intentos: MAX_INTENTOS,
        foundLetters: 0
    };

    // --- FUNCIONES DEL JUEGO ---

    function getLevelFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const level = parseInt(urlParams.get('level') || '1');
        return Math.max(0, Math.min(allLevelData.length - 1, level - 1));
    }
    
    function logToMission(message, type = 'info') {
        if (!missionLogEl) return;
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `> ${message}`;
        missionLogEl.appendChild(entry);
        missionLogEl.scrollTop = missionLogEl.scrollHeight;
    }

    function drawGrid(size) {
        if (!gridEl) return;
        gridEl.innerHTML = '';
        wallElements = [];
        letterElements = [];
        
        gridEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        gridEl.style.gridTemplateRows = `repeat(${size}, 1fr)`;
        
        for (let y = 1; y <= size; y++) {
            for (let x = 1; x <= size; x++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                
                if (currentLevelData.walls.some(wall => wall.x === x && wall.y === y)) {
                    cell.classList.add('wall');
                    wallElements.push(cell);
                }
                
                cell.style.gridColumn = x;
                cell.style.gridRow = y;
                gridEl.appendChild(cell);
            }
        }

        currentLevelData.letters.forEach(letter => {
            const letterEl = document.createElement('div');
            letterEl.classList.add('letter-cell');
            letterEl.textContent = letter.char;
            letterEl.style.gridColumn = letter.x;
            letterEl.style.gridRow = letter.y;
            letterEl.dataset.char = letter.char;
            letterEl.dataset.x = letter.x;
            letterEl.dataset.y = letter.y;
            gridEl.appendChild(letterEl);
            letterElements.push(letterEl);
        });

        if (robotEl) gridEl.appendChild(robotEl);
    }

    function setupLevel() {
        currentLevelData = allLevelData[currentLevelIndex];
        if (levelTitleEl) levelTitleEl.innerText = `Nivel 1: Hello World`;
        if (codeInput) codeInput.value = currentLevelData.hint;
        drawGrid(currentLevelData.grid);
        
        robotState = {
            x: currentLevelData.startX,
            y: currentLevelData.startY,
            dir: currentLevelData.startDir
        };
        updateRobotUI();
    }

    function resetGame() {
        robotState = {
            x: currentLevelData.startX,
            y: currentLevelData.startY,
            dir: currentLevelData.startDir
        };
        commandQueue = [];
        isRunning = false;
        intentosRestantes = MAX_INTENTOS;
        currentOutput = "";
        foundLetters = 0;
        currentLine = 0;
        
        updateUI();
        resetLetters();
        
        if (missionLogEl) missionLogEl.innerHTML = '';
        if (codeInput) codeInput.style.background = 'transparent';
        
        logToMission(`🎮 Iniciando nivel ${currentLevelIndex + 1}`, 'info');
        logToMission(currentLevelData.prompt, 'warning');
        logToMission("💡 Usa move(), rotate() y print() para escribir HELLO WORLD", 'info');
        
        hideModals();
        if (runButton) runButton.disabled = false;
    }
    
    function resetLetters() {
        letterElements.forEach(letterEl => {
            letterEl.classList.remove('typed');
        });
    }
    
    function updateUI() {
        updateTriesUI();
        updateRobotUI();
        updateProgramOutput();
        updatePositionDisplay();
        updateDirectionDisplay();
        updateLettersFound();
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
    
    function updateProgramOutput() {
        if (!outputLength || !programOutput) return;
        outputLength.textContent = `${currentOutput.length}/10`;
        programOutput.textContent = currentOutput + '_';
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
    
    function updateLettersFound() {
        if (!lettersFound) return;
        lettersFound.textContent = `${foundLetters}/10`;
    }

    function showVictoryModal() {
        logToMission(`🎉 ¡PROGRAMA EXITOSO! Has escrito: "${currentOutput}"`, 'success');
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
        
        if (savedGameState.code) {
            if (codeInput) codeInput.value = savedGameState.code;
            currentOutput = savedGameState.output;
            if (savedGameState.robotState) {
                robotState = {...savedGameState.robotState};
            }
            intentosRestantes = savedGameState.intentos;
            foundLetters = savedGameState.foundLetters;
            updateUI();
            updateProgramOutput();
            savedGameState = { code: '', output: '', robotState: null, intentos: MAX_INTENTOS, foundLetters: 0 };
        } else {
            resetGame();
        }
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
            }, 500);
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

            if (nextX < 1 || nextX > currentLevelData.grid || nextY < 1 || nextY > currentLevelData.grid) {
                hitWall = true;
                logToMission("🚫 Límite del mapa", "error");
            } else if (currentLevelData.walls.some(wall => wall.x === nextX && wall.y === nextY)) {
                hitWall = true;
                logToMission("🚫 Choque con obstáculo", "error");
            } else {
                robotState.x = nextX;
                robotState.y = nextY;
                logToMission(`📍 Movido a [${robotState.x}, ${robotState.y}]`, 'success');
            }
            
        } else if (cleanCommand === 'rotate();') {
            robotState.dir = (robotState.dir + 1) % 4;
            logToMission(`🔄 Girado`, 'success');
            
        } else if (cleanCommand === 'print();') {
            const currentLetter = currentLevelData.letters.find(
                letter => letter.x === robotState.x && letter.y === robotState.y
            );
            
            if (currentLetter) {
                const expectedLetter = "HELLOWORLD"[currentOutput.length];
                if (currentLetter.char === expectedLetter) {
                    currentOutput += currentLetter.char;
                    foundLetters++;
                    logToMission(`✅ Letra '${currentLetter.char}'`, 'success');
                    
                    const letterEl = letterElements.find(el => 
                        parseInt(el.dataset.x) === currentLetter.x && 
                        parseInt(el.dataset.y) === currentLetter.y
                    );
                    if (letterEl) {
                        letterEl.classList.add('typed');
                    }
                } else {
                    logToMission(`❌ Letra incorrecta`, 'error');
                }
            } else {
                logToMission("❌ No hay letra aquí", 'error');
            }
        }

        updateUI();
        
        if (hitWall) {
            logToMission("🛑 Ejecución detenida", "error");
            isRunning = false;
            if (runButton) runButton.disabled = false;
            intentosRestantes--;
            updateTriesUI();
            
            reportarIntentoFallido('PrimerG', 'isla1', 'juego1', intentosRestantes)
                .catch(err => console.warn("Error reporting:", err));
            
            if (intentosRestantes <= 0) {
                setTimeout(showGameOverModal, 1000);
            }
            return;
        }

        setTimeout(callback, 500);
    }

    function checkWinCondition() {
        const targetText = "HELLOWORLD";
        
        if (currentOutput === targetText) {
            logToMission("🎊 ¡VICTORIA!", 'success');
            
            completarJuego('PrimerG', 'isla1', 'juego1')
                .then(() => reportarJuegoCompletado('PrimerG', 'isla1', 'juego1'))
                .catch(error => console.error("Error:", error))
                .finally(() => setTimeout(showVictoryModal, 1000));
        } else {
            intentosRestantes--;
            updateTriesUI();
            
            if (intentosRestantes <= 0) {
                setTimeout(showGameOverModal, 1000);
            }
        }
    }

    function showTutorial() {
        savedGameState = {
            code: codeInput ? codeInput.value : '',
            output: currentOutput,
            robotState: {...robotState},
            intentos: intentosRestantes,
            foundLetters: foundLetters
        };
        
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
    if (startButton) {
        startButton.addEventListener('click', () => {
            console.log("👆 Clic en ¡EMPEZAR!");
            startGame();
        });
    }

    if (btnMove) btnMove.addEventListener('click', () => addCommandToTextarea('move();'));
    if (btnRotate) btnRotate.addEventListener('click', () => addCommandToTextarea('rotate();'));
    if (btnPrint) btnPrint.addEventListener('click', () => addCommandToTextarea('print();'));
    
    if (runButton) runButton.addEventListener('click', onRunProgram);
    if (resetButton) resetButton.addEventListener('click', resetGame);
    if (clearLogButton) {
        clearLogButton.addEventListener('click', () => {
            if (missionLogEl) missionLogEl.innerHTML = '';
        });
    }
    
    if (backToTutorialBtn) backToTutorialBtn.addEventListener('click', showTutorial);
    if (backToMapBtn) backToMapBtn.addEventListener('click', goToMap);
    if (nextLevelButton) {
        nextLevelButton.addEventListener('click', () => window.location.href = '../../mapa1.html');
    }
    if (retryButton) retryButton.addEventListener('click', resetGame);

    // --- INICIALIZACIÓN ---
    currentLevelIndex = getLevelFromURL();
    setupLevel();
    
    if (tutorialModal) {
        tutorialModal.classList.remove('hidden');
        console.log("📚 Tutorial mostrado");
    }

    console.log("🎮 Juego listo!");
});