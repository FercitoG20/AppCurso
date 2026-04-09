<?php $pagina_actual = 'contacto'; ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contacto | ProgFundamentos</title>
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet">
    <link rel="stylesheet" href="../../home.css">
    <link rel="stylesheet" href="contacto.css">
</head>
<body>
    <div class="progress-container"><div class="progress-bar" id="scroll-bar"></div></div>
    <div class="ambient-glow"></div>
    
    <?php include '../../encabezado.php'; ?>

    <main style="padding-top: 40px;">
        <section class="section-container" style="text-align: center; padding-bottom: 20px;">
            <h1 class="anim-on-scroll" style="font-size: 3rem;">📞 Ponte en <span class="outline">Contacto</span></h1>
            <p class="anim-on-scroll" style="color: var(--text-muted); font-size: 1.2rem;">¿Dudas o sugerencias? Estamos aquí para impulsarte.</p>
        </section>

        <section class="section-container">
            <div class="contact-grid">
                <aside class="glass-panel contact-info anim-on-scroll">
                    <h3>📬 Información</h3>
                    <div class="contact-details">
                        <div class="contact-item">
                            <i class="ri-map-pin-line"></i>
                            <div>
                                <h4>Dirección</h4>
                                <p>Av. Tecnológico 123, Col. Innovación<br>Ciudad de México</p>
                            </div>
                        </div>
                        <div class="contact-item">
                            <i class="ri-mail-line"></i>
                            <div>
                                <h4>Email</h4>
                                <p><a href="mailto:info@progfundamentos.com">info@progfundamentos.com</a></p>
                            </div>
                        </div>
                        <div class="contact-item">
                            <i class="ri-whatsapp-line"></i>
                            <div>
                                <h4>Teléfono</h4>
                                <p><a href="tel:+525555123456">+52 (55) 5551-2345</a></p>
                            </div>
                        </div>
                    </div>
                    <div class="social-links">
                        <a href="#" class="social-btn"><i class="ri-facebook-fill"></i></a>
                        <a href="#" class="social-btn"><i class="ri-twitter-x-fill"></i></a>
                        <a href="#" class="social-btn"><i class="ri-instagram-line"></i></a>
                        <a href="#" class="social-btn"><i class="ri-github-line"></i></a>
                    </div>
                </aside>

                <article class="glass-panel contact-form-container anim-on-scroll">
                    <h3>✉️ Envíanos un Mensaje</h3>
                    <form id="contactForm">
                        <div class="form-group">
                            <label>Nombre completo</label>
                            <input type="text" id="name" placeholder="Tu nombre" required>
                        </div>
                        <div class="form-group">
                            <label>Correo electrónico</label>
                            <input type="email" id="email" placeholder="tu@email.com" required>
                        </div>
                        <div class="form-group">
                            <label>Mensaje</label>
                            <textarea id="message" placeholder="¿Cómo podemos ayudarte?" required></textarea>
                        </div>
                        <button type="submit" class="btn-theme" style="width: 100%;">Enviar Mensaje ✨</button>
                    </form>
                </article>
            </div>

            <div class="glass-panel map-container anim-on-scroll">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.480112345678!2d-99.16!3d19.43!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDI1JzQ4LjAiTiA5OcKwMDknMzYuMCJX!5e0!3m2!1ses!2smx!4v1234567890" allowfullscreen="" loading="lazy"></iframe>
            </div>

            <div class="faq-section">
                <h2 style="text-align: center; margin: 60px 0 30px;">❓ Preguntas Frecuentes</h2>
                <div class="faq-grid">
                    <div class="glass-panel faq-item anim-on-scroll">
                        <h4>¿Los cursos son gratuitos?</h4>
                        <p>Sí, todos nuestros materiales son de acceso libre para la comunidad.</p>
                    </div>
                    <div class="glass-panel faq-item anim-on-scroll">
                        <h4>¿Obtengo certificado?</h4>
                        <p>Al completar cada grado recibirás una insignia y un certificado digital.</p>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <?php include '../../pie-pagina.php'; ?>
    <script src="../../home.js"></script>
    <script src="contacto.js"></script>
</body>
</html>