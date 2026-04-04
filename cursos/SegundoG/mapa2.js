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
// ##################################################################
// ######         MODIFICADO: NUEVOS TEMAS GRADO 2         ######
// ##################################################################
const islandCategories = [
    { id: 1, title: "Eventos", short: "EVT", topic: "Juego del Detector", color: 0xFFA500, theme: "whispering_woods", centerObjectTheme: "sensor_shrine" },
    { id: 2, title: "DOM", short: "DOM", topic: "Juego del Jardinero", color: 0x228B22, theme: "giant_tree", centerObjectTheme: "world_tree" },
    { id: 3, title: "Clases (OOP)", short: "OOP", topic: "Juego del Gremio", color: 0xB0C4DE, theme: "forge_city", centerObjectTheme: "anvil_shrine" },
    { id: 4, title: "Asincronía", short: "ASY", topic: "Juego del Mensajero", color: 0x8A2BE2, theme: "storm_peak", centerObjectTheme: "relay_tower" },
    { id: 5, title: "Promesas", short: "PRO", topic: "Juego del Voto", color: 0xFFD700, theme: "sun_temple", centerObjectTheme: "glowing_orb" },
    { id: 6, title: "APIs", short: "API", topic: "Juego del Oráculo", color: 0xAFEEEE, theme: "crystal_cave", centerObjectTheme: "scrying_pool" },
    { id: 7, title: "JSON", short: "JSON", topic: "Juego del Mercader", color: 0xDC143C, theme: "desert_bazaar", centerObjectTheme: "scroll_library" },
    { id: 8, title: "Storage", short: "MEM", topic: "Juego de la Bóveda", color: 0x778899, theme: "sunken_ruins", centerObjectTheme: "treasure_chest" },
    { id: 9, title: "Depuración", short: "BUG", topic: "Juego del Detective", color: 0x32CD32, theme: "misty_swamp", centerObjectTheme: "magnifying_glass" },
    { id: 10, title: "Proyecto Final", short: "PROY", topic: "La Ciudadela", color: 0xFFFFFF, theme: "floating_citadel", centerObjectTheme: "final_portal" }
];
// ##################################################################
// ######                  FIN DE MODIFICACIÓN               ######
// ##################################################################

// --- 3. Función Principal de Inicialización ---
function init() {
    // 3.1. Configuración de la Escena
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 10, 150);

    // 3.2. Configuración de la Cámara
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 50, 70);
    initialCameraPos.copy(camera.position);

    // 3.3. Configuración del Renderer
    const canvas = document.getElementById('map-canvas');
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // 3.4. Configuración del Renderer CSS2D (para etiquetas)
    css2dRenderer = new THREE.CSS2DRenderer();
    css2dRenderer.setSize(window.innerWidth, window.innerHeight);
    css2dRenderer.domElement.style.position = 'absolute';
    css2dRenderer.domElement.style.top = '0px';
    css2dRenderer.domElement.style.pointerEvents = 'none'; // Importante
    document.body.appendChild(css2dRenderer.domElement);

    // 3.5. Configuración de Controles
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 30;
    controls.maxDistance = 120;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.target.set(0, 0, 0);
    initialControlsTarget.copy(controls.target);

    // 3.6. Configuración de Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // 3.7. Raycaster para Interacción
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // 3.8. Crear el Mundo
    createWorld();

    // 3.9. Añadir Event Listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onMouseClick, false);
    
    // Listeners de la UI
    closeButtonEl.addEventListener('click', hideLevelPopup);
    document.getElementById('reset-view-button').addEventListener('click', resetCamera);
    document.getElementById('home-button').addEventListener('click', () => {
        // Asume que la página de inicio está en la raíz del proyecto
        window.location.href = '../../home.html'; 
    });

    // 3.10. Iniciar el Bucle de Animación
    animate();
}

// --- 4. Funciones de Creación del Mundo ---

function createWorld() {
    // 4.1. Crear el Océano/Vacío
    const oceanGeometry = new THREE.CylinderGeometry(80, 100, 20, 32);
    const oceanMaterial = new THREE.MeshPhongMaterial({
        color: 0x050a1a,
        transparent: true,
        opacity: 0.8
    });
    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.position.y = -15;
    scene.add(ocean);

    // 4.2. Crear las 10 Islas de Categorías
    const numIslands = 10;
    const radius = 45;

    for (let i = 0; i < numIslands; i++) {
        const angle = (i / numIslands) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const category = islandCategories[i];
        createIsland(x, z, category);
    }

    // 4.3. Crear fondo
    createStarfield();
    createBackgroundShapes();
}

function createIsland(x, z, category) {
    const islandGroup = new THREE.Group();
    islandGroup.position.set(x, 0, z);

    // 4.2.1. Base de la Isla
    const islandGeometry = new THREE.CylinderGeometry(8, 7, 3, 16);
    const islandMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a, // Roca oscura
        roughness: 0.8,
        metalness: 0.1
    });
    const islandBase = new THREE.Mesh(islandGeometry, islandMaterial);
    islandBase.receiveShadow = true;
    islandGroup.add(islandBase);

    // 4.2.2. Superficie (tierra/pasto)
    const topGeometry = new THREE.CylinderGeometry(7.5, 7, 1, 16);
    const topMaterial = new THREE.MeshStandardMaterial({
        color: 0x556B2F, // Verde musgo oscuro
        roughness: 1.0
    });
    const topSurface = new THREE.Mesh(topGeometry, topMaterial);
    topSurface.position.y = 2;
    topSurface.receiveShadow = true;
    islandGroup.add(topSurface);

    // 4.2.3. Objeto Central (basado en el tema)
    const centerObject = createIslandCenter(category.centerObjectTheme, category.color);
    centerObject.position.y = 3;
    islandGroup.add(centerObject);
    islandCenterObjects.push(centerObject); // Para animación

    // 4.2.4. Decoración de la Isla (basado en el tema)
    const themeGroup = createIslandTheme(category.theme);
    islandGroup.add(themeGroup);

    // 4.2.5. Plataformas de Niveles (10 por isla)
    const levelGroup = createLevelPlatforms(category);
    levelGroup.userData = { isLevelGroup: true, islandId: category.id };
    islandGroup.add(levelGroup);
    
    // 4.2.6. Etiqueta de la Isla (HTML)
    const labelDiv = document.createElement('div');
    labelDiv.className = 'level-label';
    labelDiv.textContent = category.title.toUpperCase();
    labelDiv.style.color = `#${category.color.toString(16)}`;
    labelDiv.style.textShadow = `0 0 10px #${category.color.toString(16)}`;
    
    const islandLabel = new THREE.CSS2DObject(labelDiv);
    islandLabel.position.set(0, 15, 0); // Elevada sobre la isla
    islandGroup.add(islandLabel);

    scene.add(islandGroup);
}

function createLevelPlatforms(category) {
    const group = new THREE.Group();
    const numLevels = 10;
    const levelRadius = 5;

    for (let i = 0; i < numLevels; i++) {
        const levelGroup = new THREE.Group();
        const angle = (i / numLevels) * Math.PI * 2;
        const x = Math.cos(angle) * levelRadius;
        const z = Math.sin(angle) * levelRadius;

        const platGeom = new THREE.BoxGeometry(1.5, 0.5, 1.5);
        const platMat = new THREE.MeshStandardMaterial({
            color: 0x555555,
            roughness: 0.7
        });
        const platform = new THREE.Mesh(platGeom, platMat);
        platform.position.set(x, 3.5 + (i * 0.2), z); // Se elevan un poco
        platform.castShadow = true;
        
        // El "rayo" de luz
        const lightGeom = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
        const lightMat = new THREE.MeshBasicMaterial({
            color: category.color,
            transparent: true,
            opacity: 0.6
        });
        const lightRay = new THREE.Mesh(lightGeom, lightMat);
        lightRay.position.y = 0.75;
        
        levelGroup.add(platform);
        levelGroup.add(lightRay);

        // Guardar datos para el raycaster
        levelGroup.userData = {
            isPlatform: true,
            islandId: category.id,
            levelNum: i + 1,
            title: `Isla ${category.id}: ${category.title}`,
            topic: `Nivel ${i + 1}: ${category.topic}`
        };
        
        levelMarkers.push(levelGroup); // Añadir al array para raycasting
        group.add(levelGroup);
    }
    return group;
}

// 4.4. Crear Fondo (Estrellas / Partículas)
function createStarfield() {
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = [];

    for (let i = 0; i < particleCount; i++) {
        positions.push(
            (Math.random() - 0.5) * 300,
            (Math.random() - 0.5) * 300,
            (Math.random() - 0.5) * 300
        );
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    // MODIFICADO: Color de partículas (dorado)
    const material = new THREE.PointsMaterial({
        color: 0xF1C40F,
        size: 0.15,
        transparent: true,
        opacity: 0.7
    });
    
    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
}

// 4.5. Crear Formas de Fondo
function createBackgroundShapes() {
    const numShapes = 30;
    const range = 200;
    // MODIFICADO: Color dorado
    const material = new THREE.MeshBasicMaterial({
        color: 0xF1C40F,
        transparent: true,
        opacity: 0.05,
        wireframe: true
    });

    for (let i = 0; i < numShapes; i++) {
        const geometry = new THREE.IcosahedronGeometry(Math.random() * 10 + 5, 0);
        const shape = new THREE.Mesh(geometry, material);
        shape.position.set(
            (Math.random() - 0.5) * range,
            (Math.random() - 0.5) * range,
            (Math.random() - 0.5) * range
        );
        shape.rotation.set(Math.random(), Math.random(), Math.random());
        backgroundShapes.push(shape);
        scene.add(shape);
    }
}


// --- 5. Funciones de Creación de Modelos 3D (Temáticos) ---

// ##################################################################
// ######      MODIFICADO: NUEVOS TEMAS DE PLATAFORMA      ######
// ##################################################################
function createIslandTheme(theme) {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: 0x6B8E23, roughness: 0.8 }); // Verde/Café
    const basicMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });

    switch (theme) {
        case "whispering_woods": // Arboles delgados
            for (let i = 0; i < 5; i++) {
                const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3 + Math.random() * 2, 6), new THREE.MeshStandardMaterial({color: 0x8B4513}));
                trunk.position.set((Math.random() - 0.5) * 10, 3.5, (Math.random() - 0.5) * 10);
                group.add(trunk);
            }
            break;
        case "giant_tree": // Raíces
            const root1 = new THREE.Mesh(new THREE.TorusGeometry(3, 0.5, 8, 16), material);
            root1.rotation.x = Math.PI / 2;
            root1.position.y = 2.5;
            const root2 = root1.clone();
            root2.rotation.y = Math.PI / 3;
            group.add(root1, root2);
            break;
        case "forge_city": // Edificios simples
            for (let i = 0; i < 3; i++) {
                const bld = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3 + Math.random(), 1.5), new THREE.MeshStandardMaterial({color: 0x696969}));
                bld.position.set((Math.random() - 0.5) * 8, 3, (Math.random() - 0.5) * 8);
                group.add(bld);
            }
            break;
        case "storm_peak": // Rocas puntiagudas
            for (let i = 0; i < 4; i++) {
                const rock = new THREE.Mesh(new THREE.ConeGeometry(1, 3 + Math.random() * 3, 5), new THREE.MeshStandardMaterial({color: 0x778899}));
                rock.position.set((Math.random() - 0.5) * 10, 3, (Math.random() - 0.5) * 10);
                group.add(rock);
            }
            break;
        case "sun_temple": // Pilares
            for (let i = 0; i < 4; i++) {
                const angle = i * Math.PI / 2;
                const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 4, 8), new THREE.MeshStandardMaterial({color: 0xFFF8DC}));
                pillar.position.set(Math.cos(angle) * 5, 4, Math.sin(angle) * 5);
                group.add(pillar);
            }
            break;
        case "crystal_cave": // Cristales
            for (let i = 0; i < 6; i++) {
                const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.5 + Math.random(), 0), new THREE.MeshStandardMaterial({color: 0xAFEEEE, roughness: 0.1}));
                crystal.position.set((Math.random() - 0.5) * 10, 3, (Math.random() - 0.5) * 10);
                group.add(crystal);
            }
            break;
        case "desert_bazaar": // Carpas
            for (let i = 0; i < 3; i++) {
                const tent = new THREE.Mesh(new THREE.ConeGeometry(2, 2, 6), new THREE.MeshStandardMaterial({color: 0xDC143C}));
                tent.position.set((Math.random() - 0.5) * 8, 3, (Math.random() - 0.5) * 8);
                group.add(tent);
            }
            break;
        case "sunken_ruins": // Pilares rotos
             for (let i = 0; i < 3; i++) {
                const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2, 8), new THREE.MeshStandardMaterial({color: 0x708090}));
                pillar.position.set((Math.random() - 0.5) * 10, 3, (Math.random() - 0.5) * 10);
                pillar.rotation.z = (Math.random() - 0.5) * 0.5;
                group.add(pillar);
            }
            break;
        case "misty_swamp": // "Árboles" de pantano (esferas)
            for (let i = 0; i < 4; i++) {
                const tree = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshStandardMaterial({color: 0x556B2F}));
                tree.position.set((Math.random() - 0.5) * 10, 3, (Math.random() - 0.5) * 10);
                group.add(tree);
            }
            break;
        case "floating_citadel": // Cristales flotantes
            for (let i = 0; i < 5; i++) {
                const crystal = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.5, 0.5), new THREE.MeshStandardMaterial({color: 0xFFFFFF, roughness: 0}));
                crystal.position.set((Math.random() - 0.5) * 10, 4 + Math.random(), (Math.random() - 0.5) * 10);
                group.add(crystal);
            }
            break;
    }
    return group;
}

// ##################################################################
// ######      MODIFICADO: NUEVOS OBJETOS CENTRALES        ######
// ##################################################################
function createIslandCenter(theme, color) {
    let obj = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: color, roughness: 0.2, metalness: 0.1 });
    const basicMaterial = new THREE.MeshBasicMaterial({ color: color, wireframe: true });

    switch (theme) {
        case "sensor_shrine": // Santuario (Isla 1)
            const base = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.5, 8), material);
            const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3, 6), material);
            p1.position.set(1, 2, 0);
            const p2 = p1.clone();
            p2.position.set(-1, 2, 0);
            obj.add(base, p1, p2);
            break;
        case "world_tree": // Árbol Gigante (Isla 2)
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.5, 5, 8), new THREE.MeshStandardMaterial({ color: 0x8B4513 }));
            const leaves = new THREE.Mesh(new THREE.SphereGeometry(3, 8, 6), material);
            trunk.position.y = 2.5;
            leaves.position.y = 6;
            obj.add(trunk, leaves);
            break;
        case "anvil_shrine": // Yunque (Isla 3)
            const anvilBase = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 2), material);
            const anvilTop = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 1.5), material);
            anvilBase.position.y = 0.5;
            anvilTop.position.y = 1.5;
            obj.add(anvilBase, anvilTop);
            break;
        case "relay_tower": // Torre (Isla 4)
            const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1, 6, 8), material);
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), new THREE.MeshBasicMaterial({color: color, wireframe: true}));
            tower.position.y = 3;
            sphere.position.y = 6.5;
            obj.add(tower, sphere);
            break;
        case "glowing_orb": // Orbe (Isla 5)
            const orb = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 16), new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.5 }));
            orb.position.y = 2.5;
            obj.add(orb);
            break;
        case "scrying_pool": // Pozo (Isla 6)
            const pool = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 1, 16), material);
            const water = new THREE.Mesh(new THREE.CircleGeometry(1.8, 16), new THREE.MeshBasicMaterial({color: 0xAFEEEE}));
            pool.position.y = 0.5;
            water.position.y = 1.01;
            water.rotation.x = -Math.PI / 2;
            obj.add(pool, water);
            break;
        case "scroll_library": // Pergaminos (Isla 7)
            for(let i=0; i<5; i++){
                const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2, 8), material);
                scroll.position.set(Math.random()-0.5, 1 + i*0.5, Math.random()-0.5);
                scroll.rotation.x = Math.PI/2;
                obj.add(scroll);
            }
            break;
        case "treasure_chest": // Cofre (Isla 8)
            const chest = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 1.5), new THREE.MeshStandardMaterial({color: 0xCD853F}));
            chest.position.y = 1;
            obj.add(chest);
            break;
        case "magnifying_glass": // Lupa (Isla 9)
            const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3, 8), material);
            const lensRing = new THREE.Mesh(new THREE.TorusGeometry(1, 0.2, 8, 16), material);
            handle.position.y = 1.5;
            lensRing.position.y = 3.5;
            obj.add(handle, lensRing);
            obj.rotation.x = Math.PI / 4;
            break;
        case "final_portal": // Portal (Isla 10)
            const g1 = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.3, 16, 32), material);
            g1.position.set(0, 1.5, 0);
            g1.rotation.z = Math.PI / 6;
            const g2 = g1.clone();
            g2.position.set(1.5, 0.5, 0);
            g2.rotation.z = -Math.PI / 3;
            obj.add(g1, g2);
            break;
    }
    obj.castShadow = true;
    obj.traverse(child => { if (child.isMesh) child.castShadow = true; });
    return obj;
}


// --- 6. Bucle de Animación y Event Handlers ---

function animate() {
    requestAnimationFrame(animate);

    // 6.1. Actualizar Controles
    controls.update();
    
    // 6.2. Animaciones
    const time = Date.now() * 0.0005;
    
    // Animar objetos centrales (flotar)
    islandCenterObjects.forEach(obj => {
        obj.position.y = 4 + Math.sin(time + obj.position.x) * 0.5;
    });

    // Animar fondo
    particleSystem.rotation.y = time * 0.1;
    backgroundShapes.forEach(shape => {
        shape.rotation.x += 0.001;
        shape.rotation.y += 0.002;
    });

    // 6.3. Renderizar
    renderer.render(scene, camera);
    css2dRenderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    css2dRenderer.setSize(window.innerWidth, window.innerHeight);
}

// 6.4. Manejador de Clics
function onMouseClick(event) {
    // Si el popup está abierto, no hacer nada
    if (!popupEl.classList.contains('hidden')) {
        return;
    }

    // Calcular posición del mouse en coordenadas del dispositivo normalizadas (-1 a +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Actualizar el raycaster
    raycaster.setFromCamera(mouse, camera);

    // Calcular objetos intersectando el rayo
    const intersects = raycaster.intersectObjects(levelMarkers, true);

    if (intersects.length > 0) {
        let clickedObject = intersects[0].object;
        
        // Buscar el grupo padre que tiene los datos
        while (clickedObject && !clickedObject.userData.isPlatform) {
            clickedObject = clickedObject.parent;
        }

        if (clickedObject) {
            const data = clickedObject.userData;
            showLevelPopup(data);
            focusOnObject(clickedObject);
        }
    }
}

// --- 7. Funciones de UI y Cámara ---

function showLevelPopup(data) {
    levelTitleEl.textContent = data.title;
    levelTopicEl.textContent = data.topic;
    
    // Configurar el botón de Jugar
    playButtonEl.onclick = () => {
        navigateToLevel(data.islandId, data.levelNum);
    };
    
    popupEl.classList.remove('hidden');
}

function hideLevelPopup(event) {
    // Evitar que el clic se propague al canvas y re-seleccione
    if (event) event.stopPropagation();
    
    popupEl.classList.add('hidden');
}

function navigateToLevel(islandId, levelNum) {
    console.log(`Navegando a Isla ${islandId}, Nivel ${levelNum}...`);
    // ##################################################################
    // ######      MODIFICADO: RUTA PARA ESTRUCTURA GRADO 2      ######
    // ##################################################################
    // Asume que mapa2.html está en "GRADO 2/mapa2/"
    // y los juegos están en "GRADO 2/islaX/juego1/"
    window.location.href = `../isla${islandId}/juego${levelNum}/juego1.html`;
    // ##################################################################
}

// 7.4. Mover la cámara
function focusOnObject(object) {
    const targetPosition = new THREE.Vector3();
    object.getWorldPosition(targetPosition);

    // Calcular una posición de cámara "detrás" y "arriba" del objeto
    // desde el punto de vista del centro (0,0,0)
    const offset = targetPosition.clone().normalize().multiplyScalar(20); // 20 unidades hacia atrás
    const camPos = targetPosition.clone().add(offset).add(new THREE.Vector3(0, 10, 0)); // 10 unidades arriba

    // Ocultar el botón de reset
    document.getElementById('reset-view-button').style.display = 'none';

    // Animar cámara
    new TWEEN.Tween(camera.position)
        .to(camPos, 1000)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();

    // Animar target
    new TWEEN.Tween(controls.target)
        .to(targetPosition, 1000)
        .easing(TWEEN.Easing.Cubic.Out)
        .onComplete(() => {
            // Mostrar botón de volver al mapa (aún no implementado)
            // document.getElementById('back-to-map').style.display = 'block';
        })
        .start();
}

function resetCamera() {
    // Ocultar botón de volver al mapa
    // document.getElementById('back-to-map').style.display = 'none';
    
    // Mostrar botón de reset
    document.getElementById('reset-view-button').style.display = 'block';

    hideLevelPopup();

    new TWEEN.Tween(camera.position)
        .to(initialCameraPos, 1000)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();

    new TWEEN.Tween(controls.target)
        .to(initialControlsTarget, 1000)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
}

// Bucle para que TWEEN funcione
function animateTweens(time) {
    requestAnimationFrame(animateTweens);
    TWEEN.update(time);
}
animateTweens();