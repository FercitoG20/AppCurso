document.addEventListener('DOMContentLoaded', () => {

    const handleScroll = () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const progressBar = document.getElementById("scroll-bar");
        if(progressBar) progressBar.style.width = scrolled + "%";
    };
    window.addEventListener('scroll', handleScroll);

    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');

    if (mobileBtn && navMenu) {
        mobileBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    const btnTheme = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';

    const setTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            if(btnTheme) btnTheme.innerText = 'MODO CLARO';
        } else {
            document.body.classList.remove('dark-mode');
            if(btnTheme) btnTheme.innerText = 'MODO OSCURO';
        }
        localStorage.setItem('theme', theme);
    };
    
    setTheme(savedTheme);

    if(btnTheme) {
        btnTheme.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-mode');
            setTheme(isDark ? 'light' : 'dark');
        });
    }

    document.querySelectorAll('.scroll-to').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === "#") return;
            if(targetId.startsWith("#")) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const offset = 100;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    if(navMenu && navMenu.classList.contains('active')) navMenu.classList.remove('active');
                }
            }
        });
    });

    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const elementsToAnimate = document.querySelectorAll('.anim-on-scroll'); 
    elementsToAnimate.forEach((el, index) => {
        if (el.classList.contains('course-card')) {
            el.style.transitionDelay = `${index * 0.1}s`;
        }
        observer.observe(el);
    });

    const canvas = document.getElementById('constellation-canvas');
    if (canvas && typeof THREE !== 'undefined' && typeof THREE.OrbitControls !== 'undefined') {
        const scene = new THREE.Scene();
        const container = canvas.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        
        camera.position.set(1.2, 0.5, 1.8);

        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.8;
        controls.target.set(0, 0, 0);

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
            uniforms: shaderUniforms, vertexShader: vertexShader, fragmentShader: fragmentShader,
            transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
        });

        const dataCore = new THREE.Mesh(coreGeometry, coreMaterial);
        scene.add(dataCore);
        
        const light1 = new THREE.PointLight(0x00ffff, 1.5, 8);
        light1.position.set(2, 2, 2);
        scene.add(light1);
        
        const light2 = new THREE.PointLight(0x883997, 1.5, 8);
        light2.position.set(-2, -2, 2);
        scene.add(light2);

        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();
            shaderUniforms.uTime.value = elapsedTime;
            light1.position.x = Math.sin(elapsedTime * 0.7) * 2;
            light1.position.y = Math.cos(elapsedTime * 0.5) * 2;
            light2.position.x = Math.sin(elapsedTime * 0.3) * -2;
            light2.position.y = Math.cos(elapsedTime * 0.4) * -2;
            controls.update();
            renderer.render(scene, camera);
        }

        window.addEventListener('resize', () => {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        });

        animate();
    }

    const gifCarousel = document.getElementById('hero-gif-carousel'); 
    if (gifCarousel) {
        const gifContainers = gifCarousel.querySelectorAll('.gif-container');
        if (gifContainers.length > 0) {
            let currentGifIndex = 0;
            const cycleInterval = 3000; 

            function activateGif(index) {
                gifContainers.forEach((container, i) => {
                    container.classList.toggle('gif-active', i === index);
                });
            }
            
            activateGif(currentGifIndex); 
            setInterval(() => {
                currentGifIndex = (currentGifIndex + 1) % gifContainers.length; 
                activateGif(currentGifIndex);
            }, cycleInterval);
        }
    }

    const botonesInfo = document.querySelectorAll('.btn-info');
    if (botonesInfo.length > 0) {
        botonesInfo.forEach(boton => {
            boton.addEventListener('click', (event) => {
                const link = boton.dataset.link;
                if (link && !boton.disabled) { 
                    event.preventDefault(); 
                    window.location.href = link; 
                }
            });
        });
    }

});