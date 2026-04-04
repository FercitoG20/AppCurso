// --- SCRIPT GLOBAL (PARA TODAS LAS PÁGINAS) ---
document.addEventListener('DOMContentLoaded', () => {

    console.log("¡script.js cargado!"); 

    // 1. Efecto de "sticky header"
    const header = document.querySelector('header');
    if (header) {
        const headerHeight = header.offsetHeight;
        window.addEventListener('scroll', () => {
            if (window.scrollY > headerHeight) {
                header.style.background = 'rgba(26, 26, 46, 0.9)';
                header.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.25)';
            } else {
                header.style.background = 'rgba(26, 26, 46, 0.8)';
                header.style.boxShadow = 'none';
            }
        });
    }

    // 2. Scroll Progress Indicator
    const scrollProgress = document.getElementById('scroll-progress');
    if (scrollProgress) {
        window.addEventListener('scroll', () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = window.scrollY;
            const progress = (scrolled / totalHeight) * 100;
            scrollProgress.style.width = progress + '%';
        });
    }

    // 3. Animación 3D "Núcleo de Datos" - SOLO EN LADO IZQUIERDO
    const canvas = document.getElementById('constellation-canvas');
    if (canvas && typeof THREE !== 'undefined' && typeof THREE.OrbitControls !== 'undefined') {

        console.log("Cargando escena 3D 'Núcleo de Datos' para lado izquierdo...");

        // 1. Configuración Básica
        const scene = new THREE.Scene();
        
        // Obtener dimensiones del contenedor
        const container = canvas.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        
        // Posicionar cámara para vista óptima en el espacio izquierdo
        camera.position.set(1.2, 0.5, 1.8);

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });
        
        // Configurar renderer con las dimensiones del contenedor
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // 2. Controles
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.8;
        controls.target.set(0, 0, 0);

        // 3. Geometría y Material
        const shaderUniforms = {
            uTime: { value: 0 },
            uColor1: { value: new THREE.Color(0x00ffff) },
            uColor2: { value: new THREE.Color(0x883997) }
        };
        
        const vertexShader = `
            uniform float uTime;
            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vNormal;

            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                
                float displacement = sin(position.y * 5.0 + uTime * 0.8) * 0.05 + sin(position.x * 5.0 + uTime * 0.8) * 0.05;
                vec3 newPosition = position + normal * displacement;

                vPosition = (modelViewMatrix * vec4(newPosition, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
        `;
        
        const fragmentShader = `
            uniform float uTime;
            uniform vec3 uColor1;
            uniform vec3 uColor2;
            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vNormal;

            void main() {
                float pattern = sin(vUv.y * 20.0 + uTime * 1.5) * 0.5 + 0.5;
                vec3 viewDir = normalize(-vPosition);
                float fresnel = 1.0 - dot(normalize(vNormal), viewDir);
                fresnel = pow(fresnel, 2.5);
                vec3 baseColor = mix(uColor1, uColor2, pattern);
                vec3 finalColor = mix(baseColor, uColor1, fresnel);
                float pulse = sin(uTime * 1.2) * 0.5 + 0.5;
                float alpha = (fresnel * 0.8 + 0.2) + pulse * 0.2;
                gl_FragColor = vec4(finalColor, alpha);
            }
        `;

        const coreGeometry = new THREE.TorusKnotGeometry(0.6, 0.2, 200, 32);
        const coreMaterial = new THREE.ShaderMaterial({
            uniforms: shaderUniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const dataCore = new THREE.Mesh(coreGeometry, coreMaterial);
        scene.add(dataCore);
        
        // 4. Luces
        const light1 = new THREE.PointLight(0x00ffff, 1.5, 8);
        light1.position.set(2, 2, 2);
        scene.add(light1);
        
        const light2 = new THREE.PointLight(0x883997, 1.5, 8);
        light2.position.set(-2, -2, 2);
        scene.add(light2);

        // 5. Interacción - solo en el área del canvas
        const clock = new THREE.Clock();

        // El canvas ya está configurado para pointer-events en CSS
        // No necesitamos lógica adicional de límites porque el canvas
        // solo ocupa el lado izquierdo

        // 6. Bucle de Animación
        function animate() {
            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();
            
            shaderUniforms.uTime.value = elapsedTime;

            // Animar las luces
            light1.position.x = Math.sin(elapsedTime * 0.7) * 2;
            light1.position.y = Math.cos(elapsedTime * 0.5) * 2;
            light2.position.x = Math.sin(elapsedTime * 0.3) * -2;
            light2.position.y = Math.cos(elapsedTime * 0.4) * -2;
            
            controls.update();
            renderer.render(scene, camera);
        }

        // 7. Manejador de Redimensión específico para el contenedor
        function handleResize() {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;

            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }

        window.addEventListener('resize', handleResize);

        // Iniciar la animación
        animate();

    }

    // 4. Lógica del Carrusel de GIFs
    const gifCarousel = document.getElementById('hero-gif-carousel'); 
    if (gifCarousel) {
        const gifContainers = gifCarousel.querySelectorAll('.gif-container');
        if (gifContainers.length > 0) {
            let currentGifIndex = 0;
            const cycleInterval = 3000; 

            function activateGif(index) {
                gifContainers.forEach((container, i) => {
                    if (i === index) {
                        container.classList.add('gif-active');
                    } else {
                        container.classList.remove('gif-active');
                    }
                });
            }
            
            activateGif(currentGifIndex); 

            setInterval(() => {
                currentGifIndex = (currentGifIndex + 1) % gifContainers.length; 
                activateGif(currentGifIndex);
            }, cycleInterval);

            console.log("Carrusel de GIFs del Hero inicializado.");
        }
    }

    // 5. Lógica de botones (data-link)
    const botonesInfo = document.querySelectorAll('.btn-info');
    if (botonesInfo.length > 0) {
        botonesInfo.forEach(boton => {
            boton.addEventListener('click', (event) => {
                const link = boton.dataset.link;
                if (link && !boton.disabled) { 
                    event.preventDefault(); 
                    console.log("Redirigiendo a:", link); 
                    window.location.href = link; 
                }
            });
        });
    }

    // 6. Desplazamiento suave
    const scrollLinks = document.querySelectorAll('.scroll-to-courses');
    const targetElement = document.getElementById('cursos');
    if (targetElement && scrollLinks.length > 0) {
        scrollLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    // 7. Animación "Fade In" para elementos al hacer scroll
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const elementsToAnimate = document.querySelectorAll('.anim-on-scroll, .section-title, .course-card, #hero-gif-carousel'); 
    elementsToAnimate.forEach((el, index) => {
        let delay = 0;
         if (el.classList.contains('course-card')) {
             const cardIndex = Array.from(elementsToAnimate).filter(e => e.classList.contains('course-card')).indexOf(el);
             delay = 0.3 + cardIndex * 0.1;
         } else if (el.id === 'hero-gif-carousel') {
             delay = 0.5;
         } else if (el.classList.contains('section-title')) {
             delay = 0.1;
         }
         el.style.transitionDelay = `${delay}s`;
        observer.observe(el);
    });

}); // Fin del DOMContentLoaded