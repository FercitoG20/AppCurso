// --- 0. Esperar a que la página cargue por completo ---
window.addEventListener('load', init);

// --- 1. Variables Globales ---
let scene, camera, renderer, controls;
let css2dRenderer; // Para las etiquetas HTML
let raycaster, mouse;
const levelMarkers = []; // Grupos de plataformas de nivel
let particleSystem;
const backgroundShapes = [];
const islandCenterObjects = []; // Objetos 3D centrales
let initialCameraPos = new THREE.Vector3(); // Vista inicial
let initialControlsTarget = new THREE.Vector3(); // Target inicial

// Referencias a la UI
const popupEl = document.getElementById('level-popup');
const levelTitleEl = document.getElementById('level-title');
const levelTopicEl = document.getElementById('level-topic');
const playButtonEl = document.getElementById('play-button');
const closeButtonEl = document.getElementById('close-popup');

// --- 2. DATOS DE LAS 10 ISLAS (CATEGORÍAS) ---
const islandCategories = [
    { id: 1, title: "Secuenciación", short: "SEC", topic: "Juego de Sonda", color: 0x00FFCC, theme: "data_spire", centerObjectTheme: "tower" },
    { id: 2, title: "Variables", short: "VAR", topic: "Juego de Núcleo", color: 0x00AACC, theme: "memory_bank", centerObjectTheme: "core_crystal" },
    { id: 3, title: "Funciones", short: "FUN", topic: "Terminal de Hackeo", color: 0x9C27B0, theme: "processor", centerObjectTheme: "neural_net" },
    { id: 4, title: "Condicionales", short: "IF", topic: "Sonda 2.0 (muros)", color: 0xFF9800, theme: "firewall", centerObjectTheme: "logic_gate" },
    { id: 5, title: "Bucles", short: "LOOP", topic: "Amplificador Señal", color: 0xF44336, theme: "data_stream", centerObjectTheme: "infinite_loop_symbol" },
    { id: 6, title: "Arrays", short: "ARR", topic: "Organizador Datos", color: 0x00BCD4, theme: "server_rack", centerObjectTheme: "data_container" },
    { id: 7, title: "Objetos", short: "OBJ", topic: "Configurador Dron", color: 0xFFC107, theme: "module_box", centerObjectTheme: "gear_mechanism" },
    { id: 8, title: "El DOM", short: "DOM", topic: "Editor Holograma", color: 0x607D8B, theme: "hologram", centerObjectTheme: "holographic_projector" },
    { id: 9, title: "Asincronía", short: "ASYNC", topic: "Nódulo de Red", color: 0x4CAF50, theme: "network_node", centerObjectTheme: "network_hub" },
    { id: 10, title: "Clases (OOP)", short: "OOP", topic: "Fábrica Drones", color: 0xAAAAFF, theme: "mainframe", centerObjectTheme: "robot_factory" }
];

// ==========================================================
// ¡ARRAY CORREGIDO CON LOS NOMBRES DE ARCHIVO CORRECTOS!
// ==========================================================
const gameFileNames = [
    "primerJ.html",
    "segundoJ.html",
    "tercerJ.html",
    "cuartoJ.html",
    "quintoJ.html",
    "sextoJ.html",
    "septimoJ.html",
    "octavoJ.html",
    "novenoJ.html",
    "decimoJ.html"
];
// ==========================================================


// --- 3. Función de Inicialización ---
function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000010);
    scene.fog = new THREE.FogExp2(0x000010, 0.01);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 60, 80);
    initialCameraPos.copy(camera.position); // Guardar pos inicial

    // --- Renderizador WebGL ---
    renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#map-canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = 0;
    renderer.domElement.style.left = 0;
    renderer.domElement.style.zIndex = 1;

    // --- Renderizador CSS2D ---
    css2dRenderer = new THREE.CSS2DRenderer();
    css2dRenderer.setSize(window.innerWidth, window.innerHeight);
    css2dRenderer.domElement.style.position = 'absolute';
    css2dRenderer.domElement.style.top = 0;
    css2dRenderer.domElement.style.left = 0;
    css2dRenderer.domElement.style.zIndex = 2;
    css2dRenderer.domElement.style.pointerEvents = 'none';
    document.body.appendChild(css2dRenderer.domElement);

    // --- Controles ---
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1; // Más suave
    controls.rotateSpeed = 0.5; // Rotación más lenta
    controls.maxPolarAngle = Math.PI / 1.8;
    controls.minPolarAngle = Math.PI / 6;
    controls.target.set(0, 0, 0);
    initialControlsTarget.copy(controls.target); // Guardar target inicial

    // --- Luces ---
    const ambientLight = new THREE.AmbientLight(0xAAAAFF, 0.5); scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0x00FFCC, 0.8);
    dirLight.position.set(20, 30, 20); dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048; dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -60; dirLight.shadow.camera.right = 60;
    dirLight.shadow.camera.top = 60; dirLight.shadow.camera.bottom = -60;
    scene.add(dirLight);
    const hemisphereLight = new THREE.HemisphereLight(0x00aaff, 0xff00aa, 0.5); scene.add(hemisphereLight);

    // --- Mundo ---
    const grid = new THREE.GridHelper(300, 100, 0x00ffff, 0x00ffff);
    grid.material.opacity = 0.15; grid.material.transparent = true; grid.position.y = -10; scene.add(grid);

    // --- Partículas ---
    const particleCount = 5000; const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3); const colors = new Float32Array(particleCount * 3);
    const baseColor = new THREE.Color(0x00ffff);
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3]=(Math.random()-0.5)*300; positions[i3+1]=(Math.random()-0.5)*300; positions[i3+2]=(Math.random()-0.5)*300;
        const mixedColor = baseColor.clone().lerp(new THREE.Color(0xff00ff), Math.random() * 0.3);
        colors[i3]=mixedColor.r; colors[i3+1]=mixedColor.g; colors[i3+2]=mixedColor.b;
    }
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const particleMaterial = new THREE.PointsMaterial({ size: 0.5, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.8, depthWrite: false });
    particleSystem = new THREE.Points(particles, particleMaterial); scene.add(particleSystem);

    // --- Formas de Fondo ---
    const bgGeom = new THREE.IcosahedronGeometry(15, 0); const bgMat = new THREE.MeshBasicMaterial({ color: 0x0055aa, wireframe: true, transparent: true, opacity: 0.3 });
    for (let i = 0; i < 5; i++) {
        const shape = new THREE.Mesh(bgGeom, bgMat);
        shape.position.set((Math.random()-0.5)*200, (Math.random()-0.5)*100, (Math.random()-0.5)*200-50);
        shape.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0); shape.scale.setScalar(Math.random()*2+1);
        scene.add(shape); backgroundShapes.push(shape);
    }

    // --- 4. Crear las PLATAFORMAS y ETIQUETAS ---
    loadLevelMarkers();

    // --- 5. Configurar Interacción ---
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    window.addEventListener('click', onMouseClick); // Usar pointerdown

    // --- 6. Configurar Botones UI ---
    closeButtonEl.addEventListener('click', hidePopup);
    const homeButton = document.getElementById('home-button');
    homeButton.addEventListener('click', () => { window.location.href = '../../home.html'; });
    const resetViewButton = document.getElementById('reset-view-button');
    resetViewButton.addEventListener('click', resetCameraView);

    // --- 7. Iniciar Bucle de Animación ---
    animate();

    // --- 8. Manejar redimensionamiento ---
    window.addEventListener('resize', onWindowResize);
}

// --- LÓGICA DE CARGA 10x10 (ACTUALIZADA PARA CSS2DObject) ---
function loadLevelMarkers() {
    const TOTAL_CATEGORIES = islandCategories.length;
    const MAIN_RADIUS = 40;
    const SUB_RADIUS = 10;
    const LEVELS_PER_ISLAND = 10;

    islandCategories.forEach((category, i) => {
        const mainAngle = (i / TOTAL_CATEGORIES) * Math.PI * 2;
        const mainX = MAIN_RADIUS * Math.cos(mainAngle);
        const mainZ = MAIN_RADIUS * Math.sin(mainAngle);
        const mainY = (i % 2) * 3;

        // --- Crear el objeto central de la isla ---
        const centerObject = createIslandCenterObject(category.centerObjectTheme, category.color);
        centerObject.position.set(mainX, mainY + 0.5, mainZ);
        centerObject.userData = { isIslandCenter: true, islandIndex: i, islandData: category, islandCenterPos: new THREE.Vector3(mainX, mainY, mainZ) };
        scene.add(centerObject);
        islandCenterObjects.push(centerObject);

        // --- Etiqueta para el centro de la isla (CSS2D) ---
        const centerLabelDiv = document.createElement('div');
        centerLabelDiv.className = 'island-center-label';
        centerLabelDiv.style.backgroundColor = `rgba(${new THREE.Color(category.color).r*200}, ${new THREE.Color(category.color).g*200}, ${new THREE.Color(category.color).b*200}, 0.3)`;
        centerLabelDiv.style.border = `2px solid ${new THREE.Color(category.color).getStyle()}`;
        centerLabelDiv.innerHTML = `Isla ${i + 1}:<br>${category.title}`;
        const centerLabel = new THREE.CSS2DObject(centerLabelDiv);
        centerLabel.position.set(0, 5, 0); // Posición relativa
        centerObject.add(centerLabel);

        for (let j = 0; j < LEVELS_PER_ISLAND; j++) {
            const levelNum = i * LEVELS_PER_ISLAND + j + 1;
            const isMainPlatform = (j === 0);
            const subAngle = (j / LEVELS_PER_ISLAND) * Math.PI * 2;
            const x = mainX + SUB_RADIUS * Math.cos(subAngle);
            const z = mainZ + SUB_RADIUS * Math.sin(subAngle);
            const y = mainY;

            // --- Creación de Plataforma y Objeto ---
            const platformRadius = isMainPlatform ? 3 : 2;
            const platformGeom = new THREE.CylinderGeometry(platformRadius, platformRadius + 0.2, 0.5, 6);
            const platformMat = new THREE.MeshPhongMaterial({ color: 0x222244, shininess: 50, flatShading: true });
            const topGeom = new THREE.CylinderGeometry(platformRadius * 0.9, platformRadius * 0.9, 0.2, 6);
            const topMat = new THREE.MeshBasicMaterial({ color: category.color });
            const top = new THREE.Mesh(topGeom, topMat); top.position.y = 0.35;
            const platform = new THREE.Mesh(platformGeom, platformMat); platform.receiveShadow = true; platform.castShadow = true; platform.position.y = 0;
            let themeObject;
            if (isMainPlatform) {
                themeObject = createThemeObject(category.theme, category.color);
                themeObject.scale.set(1.2, 1.2, 1.2);
            } else {
                themeObject = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial({ color: category.color }));
            }
            themeObject.position.y = 0.5;

            const levelGroup = new THREE.Group();
            levelGroup.add(platform, top, themeObject);
            levelGroup.position.set(x, y, z);
            levelGroup.lookAt(mainX, y, mainZ);

            // ==========================================================
            // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
            // ==========================================================
            // 'i' es el índice de la isla (0-9). 'category.id' es el ID de la isla (1-10).
            // 'j' es el índice del nivel DENTRO de la isla (0-9).
            
            const islandFolderName = `isla${category.id}`; // p.ej., "isla1", "isla2"
            const gameFolderName = `juego${j + 1}`;       // p.ej., "juego1", "juego2", ... "juego10"
            
            // Usamos 'j' (el índice del nivel) para seleccionar el nombre del archivo
            const gameFileName = gameFileNames[j];       // p.ej., "primerJ.html", "segundoJ.html" ...
            
            // Según tu estructura de carpetas (isla1/juego1/primerJ.html)
            // Asumimos que mapa1.html está en la carpeta 'PrimerG'
            const gamePath = `${islandFolderName}/${gameFolderName}/${gameFileName}`;
            // ==========================================================
            // --- FIN DE LA CORRECCIÓN ---
            // ==========================================================

            levelGroup.userData = {
                level: levelNum, title: `${category.title} - Nivel ${j + 1}`,
                topic: category.topic, 
                path: gamePath, // <-- Aquí se usa la ruta corregida
                locked: false,
                baseY: y, mainX: mainX, mainZ: mainZ,
                islandIndex: i,
                islandCenterPos: new THREE.Vector3(mainX, mainY, mainZ)
            };

            scene.add(levelGroup);
            levelMarkers.push(levelGroup);

            // --- Etiqueta de nivel (CSS2D) ---
            const labelDiv = document.createElement('div');
            labelDiv.className = 'level-label';
            labelDiv.style.backgroundColor = `rgba(${new THREE.Color(category.color).r*200}, ${new THREE.Color(category.color).g*200}, ${new THREE.Color(category.color).b*200}, 0.2)`;
            labelDiv.style.border = `1px solid ${new THREE.Color(category.color).getStyle()}`;
            labelDiv.innerHTML = `${category.short} - ${j + 1}`;
            labelDiv.style.opacity = 0; // Oculta inicialmente

            const levelLabel = new THREE.CSS2DObject(labelDiv);
            levelLabel.position.set(0, isMainPlatform ? 3.5 : 2.5, 0);
            levelLabel.userData = { islandIndex: i }; // Guardar a qué isla pertenece
            levelGroup.add(levelLabel); // Añadir etiqueta al grupo
        }
    });
}

// --- Bucle de Animación (ACTUALIZADO PARA VISIBILIDAD DE ETIQUETAS) ---
let clock = new THREE.Clock();
const ISLAND_VISIBILITY_THRESHOLD = 35; // Distancia para mostrar etiquetas de nivel

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    const delta = clock.getDelta();

    // --- Animación de Niveles ---
    levelMarkers.forEach((levelGroup, index) => {
        levelGroup.children[2].rotation.y = elapsedTime * 0.5; // Objeto temático
        const floatSpeed = 0.4;
        const floatHeight = 0.2;
        levelGroup.position.y = levelGroup.userData.baseY + (Math.sin(elapsedTime * floatSpeed + index) * floatHeight);
    });

    // --- Animación de los objetos centrales ---
    islandCenterObjects.forEach((obj, index) => {
        obj.rotation.y = elapsedTime * 0.2;
        const floatSpeed = 0.3;
        const floatHeight = 0.5;
        obj.position.y = (islandCategories[index].id % 2) * 3 + (Math.sin(elapsedTime * floatSpeed + index * 5) * floatHeight);
        // La etiqueta CSS2D se mueve con él
    });

    // --- Lógica de Visibilidad de Etiquetas de Nivel ---
    const cameraPos = camera.position;
    levelMarkers.forEach(levelGroup => {
        // La etiqueta es el 4to hijo ahora (plataforma, top, objeto, etiqueta)
        const labelObject = levelGroup.children[3];
        if (labelObject && labelObject.isCSS2DObject) {
            const islandCenterPos = levelGroup.userData.islandCenterPos;
            const distanceToIslandCenter = cameraPos.distanceTo(islandCenterPos);
            // Mostrar etiqueta si está cerca de su isla
            labelObject.element.style.opacity = distanceToIslandCenter < ISLAND_VISIBILITY_THRESHOLD ? '1' : '0';
        }
    });

    // --- Animación de Fondo ---
    if (particleSystem) { particleSystem.rotation.y = elapsedTime * 0.05; }
    backgroundShapes.forEach((shape, i) => {
        shape.rotation.x += delta * 0.1 * (i % 2 === 0 ? 1 : -1);
        shape.rotation.y += delta * 0.05 * (i % 3 === 0 ? 1 : -1);
    });

    controls.update();
    TWEEN.update();

    renderer.render(scene, camera);
    css2dRenderer.render(scene, camera); // Renderizar etiquetas
}

// --- Lógica de Interacción (ACTUALIZADA PARA CENTROS DE ISLA) ---
function onMouseClick(event) {
    if (!popupEl.classList.contains('hidden')) {
        hidePopup(); return;
    }
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    // Priorizar clics en objetos centrales
    const centerIntersects = raycaster.intersectObjects(islandCenterObjects, true);
    if (centerIntersects.length > 0) {
        let clickedCenter = centerIntersects[0].object;
         // Buscar el objeto PADRE que tiene userData.isIslandCenter
        while (clickedCenter.parent && !clickedCenter.userData.isIslandCenter) {
             clickedCenter = clickedCenter.parent;
        }
        if (clickedCenter.userData.isIslandCenter) {
             flyToIslandView(clickedCenter);
             return; // No hacer nada más si se hizo clic en un centro
        }
    }

    // Si no se hizo clic en un centro, buscar clics en plataformas de nivel
    const levelIntersects = raycaster.intersectObjects(levelMarkers, true);
    if (levelIntersects.length > 0) {
        let clickedLevel = levelIntersects[0].object;
        while (clickedLevel.parent && !clickedLevel.userData.level) {
            clickedLevel = clickedLevel.parent;
        }
        if (clickedLevel.userData.level) {
            flyToLevel(clickedLevel);
            showPopup(clickedLevel.userData);
        }
    }
}


// --- Animaciones con TWEEN ---
function flyToLevel(levelGroup) {
    const levelPos = levelGroup.position;
    const data = levelGroup.userData;
    new TWEEN.Tween(controls.target)
        .to({ x: levelPos.x, y: levelPos.y + 1, z: levelPos.z }, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut).start();
    const isMainPlatform = (data.level % 10 === 1);
    const zoomDistance = isMainPlatform ? 12 : 5;
    const offsetX = levelPos.x - data.mainX;
    const offsetZ = levelPos.z - data.mainZ;
    const offsetLength = Math.sqrt(offsetX * offsetX + offsetZ * offsetZ) || 1;
    const camX = levelPos.x + (offsetX / offsetLength) * zoomDistance;
    const camZ = levelPos.z + (offsetZ / offsetLength) * zoomDistance;
    const camY = levelPos.y + (isMainPlatform ? 6 : 4);
    new TWEEN.Tween(camera.position)
        .to({ x: camX, y: camY, z: camZ }, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut).start();
}

function flyToIslandView(islandCenterObject) {
    const centerPos = islandCenterObject.userData.islandCenterPos;
    const mainRadius = 40; // Radio principal
    const subRadius = 10;  // Radio del anillo de niveles
    new TWEEN.Tween(controls.target)
        .to({ x: centerPos.x, y: centerPos.y + 2, z: centerPos.z }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut).start();
    // Calcular una posición "exterior" para ver toda la isla
    const direction = centerPos.clone().normalize(); // Vector del origen al centro de la isla
    // Alejarse lo suficiente para ver el anillo de niveles (subRadius) + un margen
    const cameraDistance = mainRadius + subRadius + 15;
    const cameraX = direction.x * cameraDistance;
    const cameraZ = direction.z * cameraDistance;
    const cameraY = centerPos.y + 15; // Vista elevada
    new TWEEN.Tween(camera.position)
        .to({ x: cameraX, y: cameraY, z: cameraZ }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut).start();
}

function resetCameraView() {
    new TWEEN.Tween(controls.target)
        .to({ x: initialControlsTarget.x, y: initialControlsTarget.y, z: initialControlsTarget.z }, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut).start();
    new TWEEN.Tween(camera.position)
        .to({ x: initialCameraPos.x, y: initialCameraPos.y, z: initialCameraPos.z }, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut).start();
}


// --- Lógica de Popup ---
// --- Lógica de Popup ---
// --- Lógica de Popup ---
function showPopup(data) {
    // *** DEBUG: Asegurarnos de que los elementos existen ANTES de usarlos ***
    if (!popupEl || !levelTitleEl || !levelTopicEl || !playButtonEl) {
        console.error("Mapa JS Error CRÍTICO: Elementos de la popup no encontrados en showPopup.");
        return; // Detener si falta algo esencial
    }
    console.log("Mapa JS: showPopup() llamado con datos:", data);

    // Actualizar texto de la popup
    levelTitleEl.innerText = data.title;
    levelTopicEl.innerText = data.topic;

    // === ¡LA LÍNEA CLAVE! ===
    // Asignar la función de redirección al evento onclick del botón
    playButtonEl.onclick = () => {
        // *** DEBUG: Mensaje JUSTO ANTES de redirigir ***
        console.log("Mapa JS: Botón 'Jugar' presionado. Redirigiendo a:", data.path);
        
        // Verificar que data.path tenga un valor
        if (data.path) {
            window.location.href = data.path;
        } else {
            console.error("Mapa JS Error: data.path está vacío o indefinido. No se puede redirigir.");
        }
    };
    // ========================

    // Mostrar la popup
    popupEl.classList.remove('hidden');
    console.log("Mapa JS: Popup mostrada.");
}
function hidePopup() { popupEl.classList.add('hidden'); }

// --- Redimensionamiento ---
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    css2dRenderer.setSize(window.innerWidth, window.innerHeight); // Actualizar ambos
}

// ==========================================================
// --- FUNCIONES COMPLETAS createThemeObject y createIslandCenterObject ---
// ==========================================================
function createThemeObject(theme, color) {
    let obj;
    const material = new THREE.MeshPhongMaterial({ color: color, shininess: 100 });
    const basicMaterial = new THREE.MeshBasicMaterial({ color: color });
    switch (theme) {
        case "data_spire": obj = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2, 8), basicMaterial); obj.position.y = 1; break;
        case "memory_bank": obj = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material); obj.position.y = 1; break;
        case "processor": obj = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.2, 8, 16), material); obj.position.y = 1; obj.rotation.x = Math.PI / 2; break;
        case "firewall": obj = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2), new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.5, side: THREE.DoubleSide })); obj.position.y = 1.5; break;
        case "data_stream": const sp = new THREE.CatmullRomCurve3([new THREE.Vector3(0.5,0,0),new THREE.Vector3(0,0.5,0.5),new THREE.Vector3(-0.5,1,0),new THREE.Vector3(0,1.5,-0.5),new THREE.Vector3(0.5,2,0)]); obj = new THREE.Mesh(new THREE.TubeGeometry(sp, 20, 0.1, 8, false), basicMaterial); obj.position.y = 0.5; break;
        case "server_rack": obj = new THREE.Group(); for(let i=0; i<3; i++){ const b = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 0.8), material); b.position.y = 0.6 + i * 0.4; obj.add(b); } break;
        case "module_box": obj = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material); obj.position.y = 1; break;
        case "hologram": const t1=new THREE.Mesh(new THREE.PlaneGeometry(1,0.5), basicMaterial); t1.position.set(-0.3,1.5,0); t1.rotation.y = Math.PI/8; const t2=t1.clone(); t2.position.x = 0.3; t2.rotation.y = -Math.PI/8; obj = new THREE.Group(); obj.add(t1,t2); break;
        case "trigger": obj = new THREE.Mesh(new THREE.TorusKnotGeometry(0.5, 0.15, 100, 16), material); obj.position.y = 1; break;
        case "network_node": obj = new THREE.Group(); const co = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7,0), material); const ri = new THREE.Mesh(new THREE.TorusGeometry(1,0.05,16,100), basicMaterial); ri.rotation.x = Math.PI/2; obj.add(co,ri); obj.position.y = 1; break;
        case "mainframe": obj = new THREE.Group(); const ba=new THREE.Mesh(new THREE.BoxGeometry(2,1,2), material); ba.position.y = 0.5; const tr1=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,2,8), basicMaterial); tr1.position.set(0.7,1.5,0.7); const tr2=tr1.clone(); tr2.position.set(-0.7,1.5,0.7); obj.add(ba,tr1,tr2); break;
        default: obj = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material); obj.position.y = 1; break;
    }
    obj.traverse(child => { if (child.isMesh) child.castShadow = true; });
    return obj;
}

function createIslandCenterObject(theme, color) {
    let obj;
    const material = new THREE.MeshPhongMaterial({ color: color, shininess: 100, emissive: color, emissiveIntensity: 0.5 });
    const basicMaterial = new THREE.MeshBasicMaterial({ color: color });
    switch (theme) {
        case "tower": obj = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.5, 5, 8), material); obj.position.y = 2.5; break;
        case "core_crystal": obj = new THREE.Mesh(new THREE.IcosahedronGeometry(2, 0), material); obj.position.y = 2; break;
        case "neural_net": obj = new THREE.Group(); const s = new THREE.Mesh(new THREE.SphereGeometry(1.5,16,16), material); const w = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8,1), new THREE.MeshBasicMaterial({ color:0xAAAAFF, wireframe:true, transparent:true, opacity:0.3 })); obj.add(s,w); obj.position.y = 2; break;
        case "logic_gate": obj = new THREE.Group(); const r1=new THREE.Mesh(new THREE.BoxGeometry(0.5,3,0.5), material); r1.position.set(-1,1.5,0); const r2=new THREE.Mesh(new THREE.BoxGeometry(0.5,3,0.5), material); r2.position.set(1,1.5,0); const c=new THREE.Mesh(new THREE.BoxGeometry(3,0.5,0.5), basicMaterial); c.position.y=1.5; obj.add(r1,r2,c); break;
        case "infinite_loop_symbol": const lp=new THREE.CatmullRomCurve3([new THREE.Vector3(2,0,0),new THREE.Vector3(0,0,2),new THREE.Vector3(-2,0,0),new THREE.Vector3(0,0,-2),new THREE.Vector3(2,0,0)]); obj = new THREE.Mesh(new THREE.TubeGeometry(lp,60,0.3,8,true), material); obj.position.y=2; obj.rotation.x=Math.PI/2; break;
        case "data_container": obj = new THREE.Group(); for(let i=0; i<4; i++){ const b=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.8,0.8), material); b.position.y=i*0.9+0.5; obj.add(b); } break;
        case "gear_mechanism": obj = new THREE.Group(); const g1=new THREE.Mesh(new THREE.TorusGeometry(1.5,0.3,16,32), material); g1.position.set(0,1.5,0); g1.rotation.z=Math.PI/6; const g2=g1.clone(); g2.position.set(1.5,0.5,0); g2.rotation.z=-Math.PI/3; obj.add(g1,g2); break;
        case "holographic_projector": obj = new THREE.Group(); const bp=new THREE.Mesh(new THREE.CylinderGeometry(2,2.5,1,8), material); bp.position.y=0.5; const cr=new THREE.Mesh(new THREE.OctahedronGeometry(1.2,0), new THREE.MeshBasicMaterial({ color:0x00ffff, transparent:true, opacity:0.6 })); cr.position.y=2.5; obj.add(bp,cr); break;
        case "network_hub": obj = new THREE.Group(); const ms=new THREE.Mesh(new THREE.SphereGeometry(1.5,16,16), material); for(let i=0; i<5; i++){ const a=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,2,4), basicMaterial); a.position.set(Math.sin(i*Math.PI*2/5)*2,2,Math.cos(i*Math.PI*2/5)*2); obj.add(a); } obj.add(ms); obj.position.y=2; break;
        case "robot_factory": obj = new THREE.Group(); const bo=new THREE.Mesh(new THREE.BoxGeometry(3,2,2), material); bo.position.y=1; const he=new THREE.Mesh(new THREE.SphereGeometry(0.8,16,16), basicMaterial); he.position.y=2.8; const ar=new THREE.Mesh(new THREE.BoxGeometry(0.5,1.5,0.5), material); ar.position.set(1.7,1.5,0); ar.rotation.z=Math.PI/4; obj.add(bo,he,ar); obj.position.y=1; break;
        default: obj = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), material); obj.position.y = 2; break;
    }
    obj.traverse(child => { if (child.isMesh) child.castShadow = true; });
    return obj;
}