// =================================================================
// ARCHIVO: librerias/auth.firebase.js - VERSIÓN CORREGIDA Y LIMPIA
// =================================================================

// =================================================================
// IMPORTACIONES
// =================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc,
  getDoc,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =================================================================
// CONFIGURACIÓN DE FIREBASE
// =================================================================
const firebaseConfig = {
  apiKey: "AIzaSyAElLR2KFoKXPLvBpUxvgtRcYGSEXDfTGM",
  authDomain: "progfundamentos.firebaseapp.com",
  projectId: "progfundamentos",
  storageBucket: "progfundamentos.firebasestorage.app",
  messagingSenderId: "360858453977",
  appId: "1:360858453977:web:a72dd301eaee165eebbbc8",
  measurementId: "G-T9TP6RK9G7"
};

// =================================================================
// INICIALIZACIÓN
// =================================================================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

console.log("✅ Firebase inicializado correctamente");

// =================================================================
// FUNCIONES DE AYUDA
// =================================================================
function showError(form, fieldId, message, type = 'error') {
  console.log(`📝 ${type.toUpperCase()}: ${fieldId} - ${message}`);
  
  let errorSpan = form.querySelector(`small[data-for="${fieldId}"]`);
  if (!errorSpan) {
    errorSpan = form.querySelector('small.error');
  }
  
  if (errorSpan) {
    errorSpan.textContent = message;
    if (type === 'success') {
      errorSpan.style.color = '#22c55e';
      errorSpan.style.fontWeight = 'bold';
      errorSpan.style.background = '#22c55e20';
    } else {
      errorSpan.style.color = '#ef4444';
      errorSpan.style.background = '#ef444420';
    }
    errorSpan.style.display = 'block';
    errorSpan.style.padding = '8px';
    errorSpan.style.borderRadius = '6px';
    errorSpan.style.marginTop = '8px';
    
    if (type === 'error') {
      setTimeout(() => {
        if (errorSpan) errorSpan.style.display = 'none';
      }, 3000);
    }
  } else {
    console.warn(`No se encontró elemento error para: ${fieldId}`);
    if (type === 'error') {
      alert(message);
    }
  }
}

function clearErrors(form) {
  const errorSpans = form.querySelectorAll('small.error');
  errorSpans.forEach(span => {
    span.textContent = '';
    span.style.display = 'none';
  });
}

function setLoading(button, text, disabled, showLoader = false) {
  if (!button) return;
  
  button.disabled = disabled;
  const btnText = button.querySelector('.btn-text');
  const loader = button.querySelector('.loader');
  
  if (btnText) {
    btnText.textContent = text;
  }
  
  if (loader) {
    loader.style.display = showLoader ? 'inline-block' : 'none';
  }
  
  if (!disabled) {
    setTimeout(() => {
      if (btnText && text !== btnText.textContent) {
        btnText.textContent = text;
      }
    }, 2000);
  }
}

// =================================================================
// FUNCIÓN PARA CREAR ESTRUCTURA DE CURSOS
// =================================================================
function crearEstructuraCursos() {
  const grados = ['PrimerG', 'SegundoG', 'TercerG'];
  const islas = Array.from({ length: 10 }, (_, i) => `isla${i + 1}`);
  const juegos = Array.from({ length: 10 }, (_, i) => `juego${i + 1}`);

  const cursos = {};
  grados.forEach(grado => {
    cursos[grado] = {};
    islas.forEach(isla => {
      cursos[grado][isla] = {};
      juegos.forEach(juego => {
        cursos[grado][isla][juego] = { estado: 'incompleto' };
      });
    });
  });
  return cursos;
}

// =================================================================
// FUNCIÓN PARA OBTENER DATOS DEL USUARIO ACTUAL
// =================================================================
export async function getCurrentUserData() {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }
  try {
    const userDocRef = doc(db, "usuarios", user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return { uid: user.uid, ...userDoc.data() };
    } else {
      console.warn("Usuario autenticado pero no tiene documento en Firestore.");
      return null;
    }
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error);
    return null;
  }
}

// =================================================================
// CONFIGURACIÓN DE TOGGLE DE CONTRASEÑA
// =================================================================
function setupPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.toggle');
  if (toggleButtons.length > 0) {
    console.log("🔧 Configurando toggles de contraseña");
    toggleButtons.forEach(button => {
      button.addEventListener('click', () => {
        const pwInput = button.previousElementSibling;
        if (pwInput && pwInput.type === "password") {
          pwInput.type = "text";
          button.textContent = "🙈";
        } else if (pwInput) {
          pwInput.type = "password";
          button.textContent = "👁️";
        }
      });
    });
  }
}

// =================================================================
// LÓGICA DE REGISTRO
// =================================================================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  console.log("📝 Registro: Formulario encontrado");
  
  const registerBtn = document.getElementById('registerBtn');

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("📝 Registro: Procesando...");
    
    if (registerBtn) setLoading(registerBtn, 'Creando cuenta...', true);
    clearErrors(registerForm);

    const nombres = document.getElementById('nombres')?.value.trim() || '';
    const apellidos = document.getElementById('apellidos')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const password = document.getElementById('password')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';

    if (!nombres) {
      showError(registerForm, 'nombres', 'Tu nombre es obligatorio.', 'error');
      if (registerBtn) setLoading(registerBtn, 'Crear Cuenta', false);
      return;
    }
    
    if (!apellidos) {
      showError(registerForm, 'apellidos', 'Tu apellido es obligatorio.', 'error');
      if (registerBtn) setLoading(registerBtn, 'Crear Cuenta', false);
      return;
    }
    
    if (password.length < 6) {
      showError(registerForm, 'password', 'La contraseña debe tener al menos 6 caracteres.', 'error');
      if (registerBtn) setLoading(registerBtn, 'Crear Cuenta', false);
      return;
    }
    
    if (password !== confirmPassword) {
      showError(registerForm, 'confirmPassword', 'Las contraseñas no coinciden.', 'error');
      if (registerBtn) setLoading(registerBtn, 'Crear Cuenta', false);
      return;
    }

    try {
      console.log("📝 Registro: Creando usuario con email:", email);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("✅ Registro: Usuario creado, UID:", user.uid);

      const usuarioRef = doc(db, "usuarios", user.uid);
      await setDoc(usuarioRef, {
        uid: user.uid,
        nombres: nombres,
        apellidos: apellidos,
        email: email,
        cursos: crearEstructuraCursos(),
        puntosTotales: 0,
        fechaRegistro: new Date().toISOString()
      });

      console.log("✅ Registro: Datos guardados en Firestore");
      
      showError(registerForm, 'nombres', '¡Cuenta creada exitosamente! Redirigiendo...', 'success');
      
      setTimeout(() => {
        window.location.href = '../login/login.html';
      }, 1500);

    } catch (error) {
      console.error("❌ Error en registro:", error);
      
      if (error.code === 'auth/email-already-in-use') {
        showError(registerForm, 'email', 'Este correo ya está registrado.', 'error');
      } else if (error.code === 'auth/weak-password') {
        showError(registerForm, 'password', 'La contraseña es muy débil.', 'error');
      } else {
        showError(registerForm, 'email', 'Error: ' + error.message, 'error');
      }
      
      if (registerBtn) setLoading(registerBtn, 'Crear Cuenta', false);
    }
  });
}

// =================================================================
// LÓGICA DE LOGIN
// =================================================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  console.log("🔐 Login: Formulario encontrado");
  
  const loginBtn = document.getElementById('loginBtn');
  const recoverLink = document.getElementById('recoverLink');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("🔐 Login: Procesando inicio de sesión...");
    
    if (loginBtn) {
      loginBtn.disabled = true;
      const btnText = loginBtn.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'Verificando...';
    }
    
    clearErrors(loginForm);

    const email = document.getElementById('email')?.value.trim() || '';
    const password = document.getElementById('password')?.value || '';

    if (!email || !password) {
      if (!email) showError(loginForm, 'email', 'Ingresa tu correo electrónico', 'error');
      if (!password) showError(loginForm, 'password', 'Ingresa tu contraseña', 'error');
      if (loginBtn) {
        loginBtn.disabled = false;
        const btnText = loginBtn.querySelector('.btn-text');
        if (btnText) btnText.textContent = 'Entrar';
      }
      return;
    }

    try {
      console.log("🔐 Login: Intentando autenticar:", email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("✅ Login: Autenticación exitosa!", user.uid);
      
      try {
        const userDocRef = doc(db, "usuarios", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("✅ Login: Datos cargados:", userData.nombres, userData.apellidos);
          showError(loginForm, 'email', `¡Bienvenido ${userData.nombres}! Redirigiendo...`, 'success');
        } else {
          console.warn("⚠️ Login: Usuario no encontrado en Firestore");
          showError(loginForm, 'email', '¡Bienvenido! Redirigiendo...', 'success');
        }
      } catch (firestoreError) {
        console.error("⚠️ Error al verificar Firestore:", firestoreError);
        showError(loginForm, 'email', '¡Bienvenido! Redirigiendo...', 'success');
      }
      
      if (loginBtn) {
        const btnText = loginBtn.querySelector('.btn-text');
        if (btnText) btnText.textContent = '¡Éxito!';
      }
      
      setTimeout(() => {
        console.log("🔐 Login: Redirigiendo a home.html");
        window.location.href = '../home.html';
      }, 1500);

    } catch (error) {
      console.error("❌ Error en login:", error.code, error.message);
      
      let message = "Error al iniciar sesión";
      let field = 'email';
      
      switch (error.code) {
        case 'auth/invalid-email':
          message = "El correo electrónico no es válido";
          field = 'email';
          break;
        case 'auth/user-disabled':
          message = "Esta cuenta ha sido deshabilitada";
          field = 'email';
          break;
        case 'auth/user-not-found':
          message = "No existe una cuenta con este correo";
          field = 'email';
          break;
        case 'auth/wrong-password':
          message = "Contraseña incorrecta";
          field = 'password';
          break;
        case 'auth/invalid-credential':
          message = "Correo o contraseña incorrectos";
          field = 'email';
          break;
        case 'auth/too-many-requests':
          message = "Demasiados intentos. Intenta más tarde";
          field = 'email';
          break;
        case 'auth/network-request-failed':
          message = "Error de conexión. Verifica tu internet";
          field = 'email';
          break;
        default:
          message = error.message;
      }
      
      showError(loginForm, field, message, 'error');
      
      if (loginBtn) {
        loginBtn.disabled = false;
        const btnText = loginBtn.querySelector('.btn-text');
        if (btnText) btnText.textContent = 'Entrar';
      }
    }
  });

  if (recoverLink) {
    recoverLink.addEventListener('click', async (e) => {
      e.preventDefault();
      clearErrors(loginForm);

      const emailInput = document.getElementById('email');
      const email = emailInput?.value.trim();

      if (!email) {
        showError(loginForm, 'email', 'Ingresa tu correo primero', 'error');
        return;
      }
      
      const originalText = recoverLink.textContent;
      recoverLink.textContent = "Enviando...";
      recoverLink.style.pointerEvents = "none";

      try {
        await sendPasswordResetEmail(auth, email);
        showError(loginForm, 'email', '✅ Correo de recuperación enviado. Revisa tu bandeja', 'success');
      } catch (error) {
        console.error("Error al enviar recuperación:", error);
        if (error.code === 'auth/user-not-found') {
          showError(loginForm, 'email', 'No existe una cuenta con este correo', 'error');
        } else {
          showError(loginForm, 'email', 'Error al enviar el correo', 'error');
        }
      } finally {
        recoverLink.textContent = originalText;
        recoverLink.style.pointerEvents = "auto";
      }
    });
  }
}

// =================================================================
// CONFIGURAR TOGGLES DE CONTRASEÑA
// =================================================================
setupPasswordToggles();

// =================================================================
// FUNCIÓN COMPLETAR JUEGO
// =================================================================
export async function completarJuego(grado, isla, juego) {
  const user = auth.currentUser;
  if (!user) throw new Error('No hay sesión activa');
  
  const uid = user.uid;
  const userRef = doc(db, 'usuarios', uid);
  
  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado');
      }
      
      const userData = userDoc.data();
      
      if (!userData.cursos || 
          !userData.cursos[grado] || 
          !userData.cursos[grado][isla] || 
          !userData.cursos[grado][isla][juego]) {
        throw new Error(`No se encontró el juego en: ${grado}/${isla}/${juego}`);
      }
      
      if (userData.cursos[grado][isla][juego].estado === 'completo') {
        console.log('El juego ya estaba completo');
        return;
      }
      
      const nuevosPuntos = (userData.puntosTotales || 0) + 100;
      
      transaction.update(userRef, {
        puntosTotales: nuevosPuntos,
        [`cursos.${grado}.${isla}.${juego}.estado`]: 'completo'
      });
      
      console.log(`✅ Juego completado: ${grado}/${isla}/${juego}`);
    });
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error en completarJuego:', error);
    throw error;
  }
}

// =================================================================
// OBSERVADOR DE AUTENTICACIÓN PARA EL MENÚ
// =================================================================
onAuthStateChanged(auth, async (user) => {
  console.log("👤 Auth State Changed:", user ? `Usuario: ${user.email}` : "No hay usuario");
  
  const currentPath = window.location.pathname;
  if (user && (currentPath.includes('login.html') || currentPath.includes('login/'))) {
    console.log("🔄 Usuario autenticado en página de login, redirigiendo...");
    window.location.href = '../home.html';
    return;
  }
  
  const authLinksContainer = document.getElementById('auth-links-container');
  if (authLinksContainer) {
    if (user) {
      try {
        const userDocRef = doc(db, "usuarios", user.uid);
        const userDoc = await getDoc(userDocRef);
        let nombreUsuario = 'Usuario';
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          nombreUsuario = userData.nombres ? userData.nombres.split(' ')[0] : 'Usuario';
          console.log("✅ Datos cargados para:", nombreUsuario);
        }
        
        authLinksContainer.innerHTML = `
          <span class="nav-username">👋 Hola, ${nombreUsuario}</span>
          <a href="dashboard.html" class="btn-nav-cta-secondary" style="margin-right: 0;">📊 Mi Progreso</a>
          <a href="#" id="logoutBtn" class="btn-nav-cta-secondary">🚪 Cerrar Sesión</a>
        `;
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
              await signOut(auth);
              console.log("✅ Sesión cerrada");
              window.location.href = 'home.html';
            } catch (error) {
              console.error("Error al cerrar sesión:", error);
              alert('Error al cerrar sesión');
            }
          });
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
        authLinksContainer.innerHTML = `
          <span class="nav-username">👋 Hola, Usuario</span>
          <a href="#" id="logoutBtn" class="btn-nav-cta-secondary">🚪 Cerrar Sesión</a>
        `;
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await signOut(auth);
            window.location.href = 'home.html';
          });
        }
      }
    } else {
      authLinksContainer.innerHTML = `
        <a href="login/login.html" class="btn-nav-cta">🔐 Iniciar Sesión</a>
      `;
    }
  }
});

// =================================================================
// FUNCIÓN DE PRUEBA
// =================================================================
export function testFirebaseConnection() {
  console.log("=== PRUEBA FIREBASE ===");
  console.log("App:", app ? "✅" : "❌");
  console.log("Auth:", auth ? "✅" : "❌");
  console.log("Firestore:", db ? "✅" : "❌");
  console.log("===================");
}

// Ejecutar prueba
setTimeout(() => {
  testFirebaseConnection();
}, 1000);