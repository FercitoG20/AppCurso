document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 DOM cargado, inicializando juego de números (Sin Firebase)...");
    
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
    const btnSumar = document.getElementById('btn-sumar');
    const victoryModal = document.getElementById('victory-modal');
    const gameoverModal = document.getElementById('gameover-modal');
    const tutorialModal = document.getElementById('tutorial-modal');
    const nextLevelButton = document.getElementById('next-level-button');
    const retryButton = document.getElementById('retry-button');
    const programOutput = document.getElementById('program-output');
    const outputLength = document.getElementById('output-length');
    const positionDisplay = document.getElementById('position-display');
    const directionDisplay = document.getElementById('direction-display');
    const sumDisplay = document.getElementById('sum-display');
    const gameContainer = document.getElementById('game-container');
    const backToTutorialBtn = document.getElementById('back-to-tutorial');
    const backToMapBtn = document.getElementById('back-to-map');

    // --- CONFIGURACIÓN ---
    const MAX_INTENTOS = 5;
    const NUMEROS_OBJETIVO = [1, 2, 3, 4, 5];
    const SUMA_OBJETIVO = 15;

    const levelData = { 
        grid: 8, 
        startX: 1, 
        startY: 1, 
        startDir: 1,
        numbers: [
            {value: 1, x: 2, y: 3},
            {value: 2, x: 5, y: 1},
            {value: 3, x: 8, y: 6},
            {value: 4, x: 3, y: 7},
            {value: 5, x: 6, y: 4}
        ],
        walls: [
            {x: 3, y: 2}, {x: 3, y: 3}, {x: 3, y: 4},
            {x: 5, y: 3}, {x: 5, y: 4}, {x: 5, y: 5},
            {x: 7, y: 4}, {x: 7, y: 5}, {x: 7, y: 6},
            {x: 4, y: 6}, {x: 6, y: 2}
        ],
        prompt: "Encuentra los números 1, 2, 3, 4 y 5 en orden y súmalos",
        hint: `// Ejemplo de código:\nmove();\nmove();\nsumar();\nrotate();\nmove();\nsumar();\n// ¡Suma hasta llegar a 15!`
    };

    // --- VARIABLES DEL JUEGO ---
    let robotState = {};
    let commandQueue = [];
    let isRunning = false;
    let intentosRestantes = MAX_INTENTOS;
    let wallElements = [];
    let numberElements = [];
    let currentSum = 0;
    let collectedNumbers = [];
    let nextNumberIndex = 0;

    // --- FUNCIONES DEL JUEGO ---
    function logToMission(message, type = 'info') {
        if (!missionLogEl) return;
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `> ${message}`;
        missionLogEl.appendChild(entry);
        missionLogEl.scrollTop = missionLogEl.scrollHeight;
    }

    function drawGrid() {
        if (!gridEl) return;
        gridEl.innerHTML = '';
        wallElements = [];
        numberElements = [];
        
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

        levelData.numbers.forEach(number => {
            const numberEl = document.createElement('div');
            numberEl.classList.add('number-cell');
            numberEl.textContent = number.value;
            numberEl.style.gridColumn = number.x;
            numberEl.style.gridRow = number.y;
            numberEl.dataset.value = number.value;
            numberEl.dataset.x = number.x;
            numberEl.dataset.y = number.y;
            gridEl.appendChild(numberEl);
            numberElements.push(numberEl);
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
        currentSum = 0;
        collectedNumbers = [];
        nextNumberIndex = 0;
        
        updateUI();
        resetNumbers();
        
        if (missionLogEl) missionLogEl.innerHTML = '';
        if (codeInput) codeInput.value = levelData.hint;
        
        logToMission(`🎮 Iniciando: Encuentra los números 1 al 5`, 'info');
        logToMission(levelData.prompt, 'warning');
        logToMission("💡 Usa move(), rotate() y sumar() para recolectar números", 'info');
        
        hideModals();
        if (runButton) runButton.disabled = false;
    }
    
    function resetNumbers() {
        numberElements.forEach(numberEl => {
            numberEl.classList.remove('collected');
        });
    }
    
    function updateUI() {
        updateTriesUI();
        updateRobotUI();
        updateSumDisplay();
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
    
    function updateSumDisplay() {
        if (!sumDisplay) return;
        sumDisplay.textContent = currentSum;
        if (programOutput) programOutput.textContent = currentSum;
        if (outputLength) outputLength.textContent = `${currentSum}/${SUMA_OBJETIVO}`;
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
        logToMission(`🎉 ¡PROGRAMA EXITOSO! Sumaste ${currentSum}`, 'success');
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
            logToMission(`🔄 Girado a ${['NORTE', 'ESTE', 'SUR', 'OESTE'][robotState.dir]}`, 'success');
            
        } else if (cleanCommand === 'sumar();') {
            const currentNumber = levelData.numbers.find(
                num => num.x === robotState.x && num.y === robotState.y
            );
            
            if (currentNumber) {
                const expectedNumber = NUMEROS_OBJETIVO[nextNumberIndex];
                if (currentNumber.value === expectedNumber && !collectedNumbers.includes(currentNumber.value)) {
                    currentSum += currentNumber.value;
                    collectedNumbers.push(currentNumber.value);
                    nextNumberIndex++;
                    logToMission(`✅ ¡Sumado ${currentNumber.value}! Total: ${currentSum}`, 'success');
                    
                    const numberEl = numberElements.find(el => 
                        parseInt(el.dataset.x) === currentNumber.x && 
                        parseInt(el.dataset.y) === currentNumber.y
                    );
                    if (numberEl) {
                        numberEl.classList.add('collected');
                    }
                } else if (collectedNumbers.includes(currentNumber.value)) {
                    logToMission(`⚠️ Número ${currentNumber.value} ya fue sumado`, 'warning');
                } else {
                    logToMission(`❌ Número incorrecto. Esperabas ${expectedNumber}, encontraste ${currentNumber.value}`, 'error');
                }
            } else {
                logToMission("❌ No hay número aquí para sumar", 'error');
            }
        }

        updateUI();
        
        if (hitWall) {
            logToMission("🛑 Ejecución detenida", "error");
            isRunning = false;
            if (runButton) runButton.disabled = false;
            intentosRestantes--;
            updateTriesUI();
            
            // Ya no reportamos a Firebase cuando choca contra la pared
            
            if (intentosRestantes <= 0) {
                setTimeout(showGameOverModal, 1000);
            }
            return;
        }

        setTimeout(callback, 400);
    }

    function checkWinCondition() {
        if (currentSum === SUMA_OBJETIVO && collectedNumbers.length === 5) {
            logToMission("🎊 ¡VICTORIA! Completaste la suma 1+2+3+4+5=15", 'success');
            
            // NUEVA LÓGICA: Enviar al guardar_progreso.php usando FormData (Sin Firebase)
            const formData = new FormData();
            formData.append('grado', 1);
            formData.append('isla_id', 1);
            formData.append('nombre_isla', 'Isla 1 - Secuenciación');
            formData.append('juego_id', 2); // Este es el nivel 2
            formData.append('nombre_juego', 'Laberinto de Números');
            
            // Calculamos cuántos intentos le tomó
            const intentosUsados = (MAX_INTENTOS - intentosRestantes) + 1;
            formData.append('intentos', intentosUsados);

            // Ajusta los "../" dependiendo de cuántas carpetas debas salir para llegar a la raíz. 
            // Si segundoJ.js está en "PrimerG/isla1/juego2/", necesitas "../../guardar_progreso.php". 
            // Si está más profundo, agrega otro "../"
            fetch('../../guardar_progreso.php', { 
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log("Respuesta de MySQL:", data);
                setTimeout(showVictoryModal, 1000);
            })
            .catch(error => {
                console.error("Error al guardar en MySQL:", error);
                setTimeout(showVictoryModal, 1000); 
            });

        } else if (currentSum !== SUMA_OBJETIVO && !isRunning) {
            intentosRestantes--;
            updateTriesUI();
            logToMission(`❌ No lograste la suma correcta. Sumaste ${currentSum}, necesitas ${SUMA_OBJETIVO}`, 'error');
            
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

    // --- RUTAS DE NAVEGACIÓN ---
    function goToMap() {
        if (confirm("¿Volver al mapa?")) {
            // Ajusta esta ruta igual que en tu cabecera de PHP
            window.location.href = '/AppCurso/cursos/PrimerG/mapa1.php'; 
        }
    }

    // --- EVENT LISTENERS ---
    if (startButton) startButton.addEventListener('click', startGame);
    if (btnMove) btnMove.addEventListener('click', () => addCommandToTextarea('move();'));
    if (btnRotate) btnRotate.addEventListener('click', () => addCommandToTextarea('rotate();'));
    if (btnSumar) btnSumar.addEventListener('click', () => addCommandToTextarea('sumar();'));
    if (runButton) runButton.addEventListener('click', onRunProgram);
    if (resetButton) resetButton.addEventListener('click', resetGame);
    if (clearLogButton) clearLogButton.addEventListener('click', () => {
        if (missionLogEl) missionLogEl.innerHTML = '';
    });
    if (backToTutorialBtn) backToTutorialBtn.addEventListener('click', showTutorial);
    if (backToMapBtn) backToMapBtn.addEventListener('click', goToMap);
    
    // Al ganar y dar click en "Continuar", volvemos al mapa
    if (nextLevelButton) nextLevelButton.addEventListener('click', () => window.location.href = '/AppCurso/cursos/PrimerG/mapa1.php');
    if (retryButton) retryButton.addEventListener('click', resetGame);

    // --- INICIALIZACIÓN ---
    setupLevel();
    
    if (tutorialModal) {
        tutorialModal.classList.remove('hidden');
        console.log("📚 Tutorial mostrado");
    }

    console.log("🎮 Juego de números listo y libre de Firebase!");
});