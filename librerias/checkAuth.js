// librerias/checkAuth.js
import { auth } from './auth.firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

export function verificarAutenticacion(redirectUrl = '../../login/login.html') {
    return new Promise((resolve, reject) => {
        // Verificar si ya hay usuario
        if (auth.currentUser) {
            console.log("✅ Usuario ya autenticado:", auth.currentUser.email);
            resolve(auth.currentUser);
            return;
        }
        
        // Esperar cambio de estado
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe(); // Dejar de escuchar después del primer cambio
            if (!user) {
                console.log("❌ No hay sesión activa, redirigiendo a login");
                window.location.href = redirectUrl;
                reject(new Error("No autenticado"));
            } else {
                console.log("✅ Usuario autenticado:", user.email);
                resolve(user);
            }
        });
    });
}