// Asegúrate de que estas variables globales estén definidas por el entorno de Canvas.
// Si se ejecuta fuera de Canvas, es posible que necesites definirlas manualmente para pruebas.
// Estas variables son proporcionadas por el entorno de Canvas para la configuración de Firebase y la autenticación.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-carwash-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    // Tus credenciales de Firebase proporcionadas como respaldo si __firebase_config no está definido
    apiKey: "AIzaSyBCj6dQCNl5Zg39Fy7IFApapd9Nnnv84dc",
    authDomain: "carwash-e59c6.firebaseapp.com",
    projectId: "carwash-e59c6",
    storageBucket: "carwash-e59c6.firebasestorage.app",
    messagingSenderId: "1042737326508",
    appId: "1:1042737326508:web:9f128ff11160fe340f3209",
    measurementId: "G-9HR2TCPPM9"
  };
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Importaciones del SDK modular de Firebase. Estas líneas deben estar presentes en tu archivo JavaScript
// cuando uses el SDK modular de Firebase.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let userId = null; 
async function authenticateUser() {
    try {
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
            console.log("Sesión iniciada con token personalizado.");
        } else {
            await signInAnonymously(auth);
            console.log("Sesión iniciada de forma anónima.");
        }
    } catch (error) {
        console.error("Error de autenticación de Firebase:", error);
        showToast("❌ Error de autenticación."); 
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        userId = user.uid; // 
        console.log("ID de usuario:", userId);
    } else {
        userId = null; 
        console.log("No hay ningún usuario con sesión iniciada.");
    }
});

document.addEventListener('DOMContentLoaded', authenticateUser);

/**
 * Alterna la visibilidad de diferentes secciones en la aplicación (por ejemplo, "Insertar Cliente" o "Buscar Cliente").
 * @param {string} id - El ID de la sección que se va a mostrar.
 */
function showSection(id) {
    document.querySelectorAll('.seccion').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    if (id === 'insertar') {
        document.getElementById('resultado').innerHTML = '';
        document.getElementById('criterio').value = '';
    }
}

async function insertarCliente() {
    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const placa = document.getElementById('placa').value.trim();

    if (!nombre || !telefono || !placa) {
        showToast('Por favor llena todos los campos.'); 
        return;
    }

    if (!userId) {
        showToast('❌ Error: Usuario no autenticado. Intenta recargar la página.'); 
        console.error('Operación de Firestore intentada sin usuario autenticado.');
        return;
    }

    try {
        await addDoc(collection(db, 'clientes'), {
            nombre: nombre,
            telefono: telefono,
            placa: placa,
            createdAt: new Date(),
            createdBy: userId
        });

        document.getElementById('nombre').value = '';
        document.getElementById('telefono').value = '';
        document.getElementById('placa').value = '';
        showToast("✅ Cliente agregado correctamente"); 

    } catch (error) {
        console.error('Error al guardar cliente:', error);
        showToast("❌ Error al guardar cliente"); 
    }
}

async function buscarCliente() {
    const criterio = document.getElementById('criterio').value.trim().toLowerCase();
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = "🔍 Buscando..."; 

    if (!criterio) {
        resultadoDiv.innerHTML = '<p>Por favor ingresa un criterio de búsqueda.</p>';
        return;
    }

    if (!userId) {
        showToast('❌ Error: Usuario no autenticado. Intenta recargar la página.'); 
        console.error('Operación de Firestore intentada sin usuario autenticado.');
        resultadoDiv.innerHTML = '<p>Error al cargar clientes.</p>';
        return;
    }

    try {

        const clientesCol = collection(db, 'clientes');
        const querySnapshot = await getDocs(clientesCol);

        let encontrado = false;
        resultadoDiv.innerHTML = ''; 

        
        querySnapshot.forEach(doc => {
            const data = doc.data();
           
            if (
                data.nombre.toLowerCase().includes(criterio) ||
                data.placa.toLowerCase().includes(criterio)
            ) {
               
                resultadoDiv.innerHTML += `
                    <div style="background-color: #fff; color: #000; padding: 10px; margin: 10px 0; border-radius: 8px;">
                        <p><strong>Nombre:</strong> ${data.nombre}</p>
                        <p><strong>Teléfono:</strong> ${data.telefono}</p>
                        <p><strong>Placa:</strong> ${data.placa}</p>
                    </div>`;
                encontrado = true; 
            }
        });

        
        if (!encontrado) {
            resultadoDiv.innerHTML = '<p>No se encontró ningún cliente con ese criterio.</p>';
        }
    } catch (error) {
        console.error('Error al buscar cliente:', error);
        showToast("❌ Error al buscar cliente"); 
        resultadoDiv.innerHTML = '<p>Error al cargar clientes.</p>';
    }
}

/**
 * Muestra una notificación temporal de "toast" con un mensaje dado.
 * El "toast" se ocultará automáticamente después de 3 segundos.
 * @param {string} mensaje - El texto del mensaje que se mostrará en el "toast".
 */
function showToast(mensaje) {
    const toast = document.getElementById("toast");
    toast.textContent = mensaje; 
    toast.classList.add("show"); 
    setTimeout(() => {
        toast.classList.remove("show"); 
    }, 3000); 
}


window.showSection = showSection;
window.insertarCliente = insertarCliente;
window.buscarCliente = buscarCliente;
window.showToast = showToast;
