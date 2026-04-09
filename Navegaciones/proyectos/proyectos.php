<?php $pagina_actual = 'proyectos'; ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proyectos | ProgFundamentos</title>
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet">
    <link rel="stylesheet" href="../../home.css">
    <link rel="stylesheet" href="proyectos.css">
</head>
<body>
    <div class="progress-container"><div class="progress-bar" id="scroll-bar"></div></div>
    <div class="ambient-glow"></div>
    
    <?php include '../../encabezado.php'; ?>

    <main style="padding-top: 40px;">
        <section class="section-container" style="text-align: center; padding-bottom: 20px;">
            <h1 class="anim-on-scroll" style="font-size: 3rem;">🚀 Galería de <span class="outline">Proyectos</span></h1>
            <p class="anim-on-scroll" style="color: var(--text-muted); font-size: 1.2rem;">Explora los increíbles trabajos creados por nuestros estudiantes.</p>
        </section>

        <section class="section-container" style="padding-top: 0;">
            <div class="project-filters anim-on-scroll">
                <button class="filter-btn active" data-filter="all">Todos</button>
                <button class="filter-btn" data-filter="1ro">🎮 1er Grado</button>
                <button class="filter-btn" data-filter="2do">⚙️ 2do Grado</button>
                <button class="filter-btn" data-filter="3ro">🚀 3er Grado</button>
                <button class="filter-btn" data-filter="web">💻 Web</button>
                <button class="filter-btn" data-filter="game">🎯 Juegos</button>
            </div>

            <div class="projects-grid">
                <article class="glass-panel project-card anim-on-scroll" data-grade="1ro" data-category="web">
                    <div class="project-badge">🎮 1er Grado</div>
                    <img src="https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=700&q=80" alt="Calculadora">
                    <div class="project-info">
                        <h3>Calculadora Inteligente</h3>
                        <p>Muestra el paso a paso de cada cálculo, ideal para aprender matemáticas.</p>
                        <div class="project-tech"><span>HTML5</span> <span>JS</span></div>
                        <div class="project-links">
                            <a href="#" class="btn-theme small">Demo</a>
                            <a href="#" class="btn-outline small">Código</a>
                        </div>
                    </div>
                </article>

                <article class="glass-panel project-card anim-on-scroll" data-grade="2do" data-category="game">
                    <div class="project-badge">⚙️ 2do Grado</div>
                    <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=700&q=80" alt="Laberinto">
                    <div class="project-info">
                        <h3>Laberinto Interactivo</h3>
                        <p>Navegación utilizando algoritmos de búsqueda y visualización de caminos.</p>
                        <div class="project-tech"><span>Canvas</span> <span>Data Structures</span></div>
                        <div class="project-links">
                            <a href="#" class="btn-theme small">Jugar</a>
                            <a href="#" class="btn-outline small">Código</a>
                        </div>
                    </div>
                </article>

                <article class="glass-panel project-card anim-on-scroll" data-grade="3ro" data-category="web">
                    <div class="project-badge">🚀 3er Grado</div>
                    <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=700&q=80" alt="Gestor">
                    <div class="project-info">
                        <h3>Gestor de Tareas Fullstack</h3>
                        <p>Gestión con categorías, prioridades y análisis de productividad.</p>
                        <div class="project-tech"><span>React</span> <span>Node.js</span></div>
                        <div class="project-links">
                            <a href="#" class="btn-theme small">Probar</a>
                            <a href="#" class="btn-outline small">Código</a>
                        </div>
                    </div>
                </article>

                <article class="glass-panel project-card anim-on-scroll" data-grade="1ro" data-category="web">
                    <div class="project-badge">🎮 1er Grado</div>
                    <img src="https://images.unsplash.com/photo-1581276879432-15e50529f34b?auto=format&fit=crop&w=700&q=80" alt="Ecosistema">
                    <div class="project-info">
                        <h3>Simulador de Ecosistema</h3>
                        <p>Especies que interactúan demostrando lógica condicional y bucles.</p>
                        <div class="project-tech"><span>JS</span> <span>Simulación</span></div>
                        <div class="project-links">
                            <a href="#" class="btn-theme small">Ver</a>
                            <a href="#" class="btn-outline small">Código</a>
                        </div>
                    </div>
                </article>

                <article class="glass-panel project-card anim-on-scroll" data-grade="2do" data-category="game">
                    <div class="project-badge">⚙️ 2do Grado</div>
                    <img src="https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?auto=format&fit=crop&w=700&q=80" alt="Ajedrez">
                    <div class="project-info">
                        <h3>Ajedrez Programático</h3>
                        <p>IA básica que utiliza árboles de decisión y algoritmos minimax.</p>
                        <div class="project-tech"><span>Algorithms</span> <span>IA</span></div>
                        <div class="project-links">
                            <a href="#" class="btn-theme small">Jugar</a>
                            <a href="#" class="btn-outline small">Código</a>
                        </div>
                    </div>
                </article>

                <article class="glass-panel project-card anim-on-scroll" data-grade="3ro" data-category="web">
                    <div class="project-badge">🚀 3er Grado</div>
                    <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=700&q=80" alt="Plataforma">
                    <div class="project-info">
                        <h3>Plataforma Colaborativa</h3>
                        <p>Sistema para compartir proyectos y feedback en tiempo real.</p>
                        <div class="project-tech"><span>Vue.js</span> <span>Socket.io</span></div>
                        <div class="project-links">
                            <a href="#" class="btn-theme small">Visitar</a>
                            <a href="#" class="btn-outline small">Código</a>
                        </div>
                    </div>
                </article>
            </div>
        </section>

        <section class="section-container">
            <h2 class="anim-on-scroll" style="text-align: center; font-size: 2.5rem; margin-bottom: 10px;">🏆 Estudiantes <span class="outline">Destacados</span></h2>
            <p style="text-align: center; color: var(--text-muted); margin-bottom: 50px;">El talento detrás de las líneas de código.</p>
            
            <div class="students-grid">
                <article class="glass-panel student-card anim-on-scroll">
                    <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=200&q=80" alt="María" class="student-avatar">
                    <h3>María González</h3>
                    <div class="student-grade">🚀 3er Grado</div>
                    <p>Creadora del "Gestor de Tareas Inteligente".</p>
                </article>

                <article class="glass-panel student-card anim-on-scroll">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" alt="Carlos" class="student-avatar">
                    <h3>Carlos Mendoza</h3>
                    <div class="student-grade">⚙️ 2do Grado</div>
                    <p>Desarrolló el motor de IA para el Ajedrez.</p>
                </article>

                <article class="glass-panel student-card anim-on-scroll">
                    <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80" alt="Ana" class="student-avatar">
                    <h3>Ana Rodríguez</h3>
                    <div class="student-grade">🎮 1er Grado</div>
                    <p>Innovadora en herramientas educativas matemáticas.</p>
                </article>

                <article class="glass-panel student-card anim-on-scroll">
                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" alt="Diego" class="student-avatar">
                    <h3>Diego Silva</h3>
                    <div class="student-grade">🚀 3er Grado</div>
                    <p>Líder del equipo de Plataforma Colaborativa.</p>
                </article>
            </div>
        </section>
    </main>

    <?php include '../../pie-pagina.php'; ?>
    <script src="../../home.js"></script>
    <script src="proyectos.js"></script>
</body>
</html>