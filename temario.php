<?php $pagina_actual = 'temario'; ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temario | ProgFundamentos</title>
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet">
    <link rel="stylesheet" href="home.css">
</head>
<body>
    <div class="progress-container"><div class="progress-bar" id="scroll-bar"></div></div>
    <div class="ambient-glow"></div>
    
    <?php include 'encabezado.php'; ?>

    <main style="padding-top: 40px;">
        <section class="section-container" style="text-align: center; padding-bottom: 20px;">
            <h1 class="anim-on-scroll" style="font-size: 3rem;">📚 Ruta de <span class="outline">Aprendizaje</span></h1>
            <p class="anim-on-scroll" style="color: var(--text-muted); font-size: 1.2rem;">El desglose completo de tu viaje en la programación.</p>
        </section>

        <section class="section-container" style="padding-top: 0; max-width: 1000px; margin: 0 auto;">
            
            <article class="glass-panel accordion-item anim-on-scroll" style="margin-bottom: 20px; border-radius: 15px; overflow: hidden;">
                <div class="accordion-header" style="padding: 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.1);">
                    <h2 style="margin: 0; font-size: 1.3rem; color: var(--accent);">🎮 1er Grado: Lógica y Algoritmos Creativos</h2>
                    <i class="ri-add-line accordion-icon" style="font-size: 1.5rem; color: var(--accent); transition: 0.3s;"></i>
                </div>
                <div class="accordion-content" style="max-height: 0; overflow: hidden; transition: max-height 0.4s ease; padding: 0 20px;">
                    <ul style="list-style: none; padding: 20px 0; margin: 0;">
                        <li style="padding: 10px 0; border-bottom: 1px solid var(--glass-border);"><strong style="color: var(--text-main);">Unidad 1:</strong> Introducción al Pensamiento Computacional.</li>
                        <li style="padding: 10px 0; border-bottom: 1px solid var(--glass-border);"><strong style="color: var(--text-main);">Unidad 2:</strong> ¿Qué es un Algoritmo?</li>
                        <li style="padding: 10px 0; border-bottom: 1px solid var(--glass-border);"><strong style="color: var(--text-main);">Unidad 3:</strong> Variables y Constantes.</li>
                        <li style="padding: 10px 0; border-bottom: 1px solid var(--glass-border);"><strong style="color: var(--text-main);">🎯 Proyecto:</strong> Calculador de Promedios.</li>
                    </ul>
                </div>
            </article>

            <article class="glass-panel accordion-item anim-on-scroll" style="margin-bottom: 20px; border-radius: 15px; overflow: hidden;">
                <div class="accordion-header" style="padding: 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.1);">
                    <h2 style="margin: 0; font-size: 1.3rem; color: var(--accent);">⚙️ 2do Grado: Estructuras Avanzadas</h2>
                    <i class="ri-add-line accordion-icon" style="font-size: 1.5rem; color: var(--accent); transition: 0.3s;"></i>
                </div>
                <div class="accordion-content" style="max-height: 0; overflow: hidden; transition: max-height 0.4s ease; padding: 0 20px;">
                    <ul style="list-style: none; padding: 20px 0; margin: 0;">
                        <li style="padding: 10px 0; border-bottom: 1px solid var(--glass-border);"><strong style="color: var(--text-main);">Unidad 1:</strong> Estructuras Condicionales.</li>
                        <li style="padding: 10px 0; border-bottom: 1px solid var(--glass-border);"><strong style="color: var(--text-main);">Unidad 2:</strong> Bucles (For, While).</li>
                        <li style="padding: 10px 0; border-bottom: 1px solid var(--glass-border);"><strong style="color: var(--text-main);">Unidad 3:</strong> Arreglos Unidimensionales.</li>
                        <li style="padding: 10px 0; border-bottom: 1px solid var(--glass-border);"><strong style="color: var(--text-main);">🎯 Proyecto:</strong> Juego de Adivinanzas.</li>
                    </ul>
                </div>
            </article>

            <article class="glass-panel accordion-item anim-on-scroll" style="margin-bottom: 20px; border-radius: 15px; overflow: hidden;">
                <div class="accordion-header" style="padding: 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.1);">
                    <h2 style="margin: 0; font-size: 1.3rem; color: var(--accent);">🚀 3er Grado: P.O.O. y Proyectos</h2>
                    <i class="ri-add-line accordion-icon" style="font-size: 1.5rem; color: var(--accent); transition: 0.3s;"></i>
                </div>
                <div class="accordion-content" style="max-height: 0; overflow: hidden; transition: max-height 0.4s ease; padding: 0 20px;">
                    <ul style="list-style: none; padding: 20px 0; margin: 0;">
                        <li style="padding: 10px 0; border-bottom: 1px solid var(--glass-border);"><strong style="color: var(--text-main);">Unidad 1:</strong> Funciones y Modularidad.</li>
                        <li style="padding: 10px 0; border-bottom: 1px solid var(--glass-border);"><strong style="color: var(--text-main);">Unidad 2:</strong> Clases y Objetos.</li>
                        <li style="padding: 10px 0; border-bottom: 1px solid var(--glass-border);"><strong style="color: var(--text-main);">Unidad 3:</strong> Manejo Básico de Archivos.</li>
                        <li style="padding: 10px 0; border-bottom: 1px solid var(--glass-border);"><strong style="color: var(--text-main);">🎯 Proyecto:</strong> Registro de Alumnos.</li>
                    </ul>
                </div>
            </article>

        </section>
    </main>

    <?php include 'pie-pagina.php'; ?>
    <script src="scripts/script.js"></script>
    <script>
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const icon = header.querySelector('.accordion-icon');
                
                if (content.style.maxHeight && content.style.maxHeight !== "0px") {
                    content.style.maxHeight = "0px";
                    icon.style.transform = "rotate(0deg)";
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                    icon.style.transform = "rotate(45deg)";
                }
            });
        });
    </script>
</body>
</html>