// =================================================================
// ARCHIVO: librerias/logService.js - VERSIÓN CORREGIDA CON CÁLCULO DE ISLAS
// =================================================================
import { auth, db } from './auth.firebase.js';
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    getDocs, 
    serverTimestamp,
    doc,
    getDoc,
    limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =================================================================
// CONSTANTES Y CONFIGURACIÓN
// =================================================================
const LOGS_COLLECTION = "logs_actividad";
const USUARIOS_COLLECTION = "usuarios";

// Configuración de rangos por puntos
const RANGOS_POR_PUNTOS = [
    { min: 0, max: 99, posicion: 1, nombre: "Novato", color: "#aaa" },
    { min: 100, max: 299, posicion: 2, nombre: "Aprendiz", color: "#00ffaa" },
    { min: 300, max: 599, posicion: 3, nombre: "Programador", color: "#00ffff" },
    { min: 600, max: 999, posicion: 4, nombre: "Experto", color: "#ffaa00" },
    { min: 1000, max: Infinity, posicion: 5, nombre: "Maestro", color: "#ff00ff" }
];

// Configuración de la estructura de cursos
const GRADOS = ['PrimerG', 'SegundoG', 'TercerG'];
const TOTAL_ISLAS = 10;
const TOTAL_JUEGOS_POR_ISLA = 10;
const PUNTOS_POR_JUEGO = 100;

// =================================================================
// FUNCIÓN PRIVADA: Calcular posición del usuario basado en puntos
// =================================================================
function _calcularPosicionDesdePuntos(puntos) {
    for (let rango of RANGOS_POR_PUNTOS) {
        if (puntos >= rango.min && puntos <= rango.max) {
            return { posicion: rango.posicion, nombre: rango.nombre, color: rango.color };
        }
    }
    return { posicion: 1, nombre: "Novato", color: "#aaa" };
}

// =================================================================
// FUNCIÓN PRIVADA: Contar juegos completados en la estructura
// =================================================================
function _contarJuegosCompletados(cursos) {
    if (!cursos) return 0;
    
    let totalCompletados = 0;
    
    GRADOS.forEach(grado => {
        if (cursos[grado]) {
            // Recorrer islas del 1 al 10
            for (let i = 1; i <= TOTAL_ISLAS; i++) {
                const isla = `isla${i}`;
                if (cursos[grado][isla]) {
                    // Recorrer juegos del 1 al 10
                    for (let j = 1; j <= TOTAL_JUEGOS_POR_ISLA; j++) {
                        const juego = `juego${j}`;
                        if (cursos[grado][isla][juego]?.estado === 'completo') {
                            totalCompletados++;
                        }
                    }
                }
            }
        }
    });
    
    return totalCompletados;
}

// =================================================================
// FUNCIÓN PRIVADA: Calcular islas completadas (todas las 10 islas con 10 juegos cada una)
// =================================================================
function _contarIslasCompletadas(cursos) {
    if (!cursos) return 0;
    
    let islasCompletadas = 0;
    
    GRADOS.forEach(grado => {
        if (cursos[grado]) {
            for (let i = 1; i <= TOTAL_ISLAS; i++) {
                const isla = `isla${i}`;
                if (cursos[grado][isla]) {
                    let juegosCompletadosEnIsla = 0;
                    // Verificar cuántos juegos de esta isla están completos
                    for (let j = 1; j <= TOTAL_JUEGOS_POR_ISLA; j++) {
                        const juego = `juego${j}`;
                        if (cursos[grado][isla][juego]?.estado === 'completo') {
                            juegosCompletadosEnIsla++;
                        }
                    }
                    // Si todos los juegos de la isla están completos, la isla está completa
                    if (juegosCompletadosEnIsla === TOTAL_JUEGOS_POR_ISLA) {
                        islasCompletadas++;
                    }
                }
            }
        }
    });
    
    return islasCompletadas;
}

// =================================================================
// FUNCIÓN PRIVADA: Obtener el documento del usuario actual
// =================================================================
async function _getCurrentUserData() {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("No hay una sesión de usuario activa.");
    }
    const userDocRef = doc(db, USUARIOS_COLLECTION, user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
        throw new Error("No se encontraron los datos del usuario en Firestore.");
    }
    return { id: userDoc.id, ...userDoc.data() };
}

// =================================================================
// FUNCIÓN PRINCIPAL: Registrar una acción en los logs
// =================================================================
export async function registrarLog(accion, metadata = {}) {
    console.log(`logService: Intentando registrar acción: "${accion}"`, metadata);
    try {
        const user = auth.currentUser;
        if (!user) {
            console.warn("logService: No hay usuario logueado, no se puede registrar el log.");
            return;
        }

        const userData = await _getCurrentUserData();
        const puntosActuales = userData.puntosTotales || 0;
        const rango = _calcularPosicionDesdePuntos(puntosActuales);

        const logData = {
            usuario: user.email,
            usuarioUID: user.uid,
            accion: accion,
            timestamp: serverTimestamp(),
            posicion: rango.posicion,
            rangoNombre: rango.nombre,
            puntosEnElMomento: puntosActuales,
            metadata: metadata
        };

        const logsRef = collection(db, LOGS_COLLECTION);
        await addDoc(logsRef, logData);
        console.log(`logService: Log registrado exitosamente para ${user.email}`);

    } catch (error) {
        console.error("logService: Error crítico al registrar log:", error);
    }
}

// =================================================================
// FUNCIÓN PRINCIPAL: Obtener el progreso completo del usuario
// =================================================================
export async function obtenerMiProgreso() {
    try {
        const userData = await _getCurrentUserData();
        const puntos = userData.puntosTotales || 0;
        const rango = _calcularPosicionDesdePuntos(puntos);
        const juegosCompletados = _contarJuegosCompletados(userData.cursos);
        const islasCompletadas = _contarIslasCompletadas(userData.cursos);
        
        // Calcular la isla y juego actual (el último juego no completado)
        let gradoActual = null;
        let islaActual = null;
        let juegoActual = null;
        let juegosEnIslaActual = 0;
        
        if (userData.cursos) {
            for (let grado of GRADOS) {
                if (userData.cursos[grado]) {
                    for (let i = 1; i <= TOTAL_ISLAS; i++) {
                        const isla = `isla${i}`;
                        if (userData.cursos[grado][isla]) {
                            let juegosCompletadosEnEstaIsla = 0;
                            for (let j = 1; j <= TOTAL_JUEGOS_POR_ISLA; j++) {
                                const juego = `juego${j}`;
                                if (userData.cursos[grado][isla][juego]?.estado === 'completo') {
                                    juegosCompletadosEnEstaIsla++;
                                } else if (!gradoActual) {
                                    // Encontrar el primer juego no completado
                                    gradoActual = grado;
                                    islaActual = i;
                                    juegoActual = j;
                                    juegosEnIslaActual = juegosCompletadosEnEstaIsla;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Calcular puntos para siguiente rango
        let puntosParaSiguienteRango = 0;
        let siguienteRangoNombre = "Máximo";
        let siguienteRangoColor = "#ff00ff";
        
        const rangoIndex = RANGOS_POR_PUNTOS.findIndex(r => r.posicion === rango.posicion);
        if (rangoIndex < RANGOS_POR_PUNTOS.length - 1) {
            const siguienteRango = RANGOS_POR_PUNTOS[rangoIndex + 1];
            puntosParaSiguienteRango = siguienteRango.min - puntos;
            siguienteRangoNombre = siguienteRango.nombre;
            siguienteRangoColor = siguienteRango.color;
        }
        
        // Calcular porcentaje de progreso general
        const totalJuegosPosibles = GRADOS.length * TOTAL_ISLAS * TOTAL_JUEGOS_POR_ISLA;
        const porcentajeProgreso = (juegosCompletados / totalJuegosPosibles) * 100;
        
        // Calcular progreso en la isla actual
        let progresoIslaActual = 0;
        if (islaActual) {
            progresoIslaActual = (juegosEnIslaActual / TOTAL_JUEGOS_POR_ISLA) * 100;
        }
        
        return {
            puntos: puntos,
            posicion: rango.posicion,
            rango: rango.nombre,
            rangoColor: rango.color,
            nombre: `${userData.nombres} ${userData.apellidos}`,
            juegosCompletados: juegosCompletados,
            islasCompletadas: islasCompletadas,
            totalJuegos: totalJuegosPosibles,
            totalIslas: GRADOS.length * TOTAL_ISLAS,
            porcentajeProgreso: Math.round(porcentajeProgreso),
            puntosParaSiguienteRango: puntosParaSiguienteRango,
            siguienteRango: siguienteRangoNombre,
            siguienteRangoColor: siguienteRangoColor,
            // Información de progreso actual
            gradoActual: gradoActual,
            islaActual: islaActual,
            juegoActual: juegoActual,
            progresoIslaActual: Math.round(progresoIslaActual),
            juegosEnIslaActual: juegosEnIslaActual,
            // Datos completos del usuario
            email: userData.email,
            cursos: userData.cursos
        };
        
    } catch (error) {
        console.error("logService: Error al obtener progreso:", error);
        throw error;
    }
}

// =================================================================
// FUNCIÓN PARA ADMIN: Obtener todos los logs
// =================================================================
export async function obtenerTodosLosLogs(limite = 100) {
    try {
        const logsRef = collection(db, LOGS_COLLECTION);
        const q = query(logsRef, orderBy("timestamp", "desc"), limit(limite));
        const querySnapshot = await getDocs(q);
        
        const logs = [];
        querySnapshot.forEach((doc) => {
            logs.push({ id: doc.id, ...doc.data() });
        });
        console.log(`logService: ${logs.length} logs obtenidos.`);
        return logs;
    } catch (error) {
        console.error("logService: Error al obtener logs:", error);
        throw error;
    }
}

// =================================================================
// FUNCIÓN PARA JUEGOS: Reportar que un juego fue completado
// =================================================================
export async function reportarJuegoCompletado(grado, isla, juego) {
    const accion = `Completó: ${grado}/${isla}/${juego}`;
    await registrarLog(accion, { grado, isla, juego, tipo: "juego_completado" });
}

// =================================================================
// FUNCIÓN PARA JUEGOS: Reportar intento fallido
// =================================================================
export async function reportarIntentoFallido(grado, isla, juego, intentosRestantes) {
    const accion = `Falló en: ${grado}/${isla}/${juego}`;
    await registrarLog(accion, { grado, isla, juego, intentos_restantes: intentosRestantes, tipo: "intento_fallido" });
}

// =================================================================
// FUNCIÓN PARA JUEGOS: Reportar inicio de juego
// =================================================================
export async function reportarInicioDeJuego(grado, isla, juego) {
    const accion = `Inició: ${grado}/${isla}/${juego}`;
    await registrarLog(accion, { grado, isla, juego, tipo: "inicio_juego" });
}