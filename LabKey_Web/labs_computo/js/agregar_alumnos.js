import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { firebaseConfig } from "../js/properties/firebaseConfig.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let alumnos = [];
let alumnosFiltrados = [];

// Validar si la matrícula ya existe en Firestore
async function matriculaExiste(matricula) {
    const q = query(collection(db, "usuarios"), where("matricula", "==", matricula));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
}

// Validar si el correo ya existe en Firestore
async function correoExiste(correo) {
    const q = query(collection(db, "usuarios"), where("correo", "==", correo));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
}

// Agregar un alumno individual
document.getElementById("addIndividualBtn").addEventListener("click", async function () {
    const nombre = document.getElementById("nombre").value.trim();
    const apellidoPaterno = document.getElementById("apellidoPaterno").value.trim();
    const apellidoMaterno = document.getElementById("apellidoMaterno").value.trim();
    const curp = document.getElementById("curp").value.trim(); // Obtenemos el valor del campo CURP
    const matricula = document.getElementById("matricula").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const grupo = document.getElementById("grupoIndividual").value.trim();

    if (!nombre || !apellidoPaterno || !apellidoMaterno || !matricula || !correo || !grupo || !curp) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    try {
        // Validar si la matrícula ya existe
        if (await matriculaExiste(matricula)) {
            alert("La matrícula ya está en uso. Por favor, usa otra matrícula.");
            return;
        }

        // Validar si el correo ya existe
        if (await correoExiste(correo)) {
            alert("El correo ya está en uso. Por favor, usa otro correo.");
            return;
        }

        // Crear usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, correo, matricula);
        const user = userCredential.user;

        // Enviar correo de verificación
        await sendEmailVerification(user);

        // Guardar datos adicionales en Firestore, incluyendo el campo 'contraseña' y 'curp'
        await setDoc(doc(db, "usuarios", user.uid), {
            matricula,
            nombre,
            apellidoPaterno,
            apellidoMaterno,
            correo,
            grupo,
            curp, // Agregar campo 'curp'
            contraseña: matricula, // Agregar campo 'contraseña'
            rol: "estudiante",
            sesion_activa: false,
            firstLogin: true,
        });

        alert("Alumno registrado correctamente.");
        document.getElementById("matricula").value = "";
        document.getElementById("nombre").value = "";
        document.getElementById("apellidoPaterno").value = "";
        document.getElementById("apellidoMaterno").value = "";
        document.getElementById("correo").value = "";
        document.getElementById("grupoIndividual").value = "";
        document.getElementById("curp").value = ""; // Limpiar campo CURP
    } catch (error) {
        // Manejar errores específicos
        if (error.code === "auth/email-already-in-use") {
            alert("El correo ya está registrado en Firebase Authentication.");
        } else {
            console.error("Error al registrar el alumno:", error);
            alert("No se pudo registrar al alumno. Revisa la consola para más detalles.");
        }
    }
});

// Leer y procesar archivo CSV
document.getElementById("uploadBtn").addEventListener("click", function () {
    const fileInput = document.getElementById("archivo");
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result;
            processCSV(content);
        };
        reader.readAsText(file);
    } else {
        alert("Por favor, selecciona un archivo.");
    }
});

function processCSV(content) {
    const rows = content.split("\n");
    alumnos = rows.slice(1).map((row) => {
        const [ matricula, nombre, apellidoPaterno, apellidoMaterno, curp, correo ] = row.split(",");
        if (!matricula || !nombre || !apellidoPaterno || !apellidoMaterno || !curp || !correo) return null;
        return { matricula, nombre, apellidoPaterno, apellidoMaterno, curp, correo };
    }).filter((alumno) => alumno !== null);

    renderTable();
    document.getElementById("confirmBtn").disabled = false;
}

function renderTable() {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";

    alumnos.forEach((alumno) => {
        const row = `
            <tr>
                <td>${alumno.matricula}</td>
                <td>${alumno.nombre}</td>
                <td>${alumno.apellidoPaterno}</td>
                <td>${alumno.apellidoMaterno}</td>
                <td>${alumno.curp}</td>
                <td>${alumno.correo}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}
// Confirmar carga masiva
document.getElementById("confirmBtn").addEventListener("click", async function () {
    const grupo = document.getElementById("grupo").value.trim();

    if (!grupo) {
        alert("Por favor, completa el campo de grupo.");
        return;
    }

    // Usamos Promise.all para asegurarnos de que todos los registros se procesen antes de continuar
    const promises = alumnos.map(async (alumno) => {
        try {
            // Validar si la matrícula ya existe
            if (await matriculaExiste(alumno.matricula)) {
                console.error(`La matrícula ${alumno.matricula} ya está en uso. Registro omitido.`);
                return;
            }

            // Validar si el correo ya existe
            if (await correoExiste(alumno.correo)) {
                console.error(`El correo ${alumno.correo} ya está en uso. Registro omitido.`);
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, alumno.correo.trim(), alumno.matricula.trim());
            const user = userCredential.user;

            await sendEmailVerification(user);

            // Guardar datos adicionales en Firestore, incluyendo el campo 'contraseña' y 'curp'
            await setDoc(doc(db, "usuarios", user.uid), {
                ...alumno,
                grupo,
                contraseña: alumno.matricula, // Agregar campo 'contraseña'
                rol: "estudiante",
                sesion_activa: false,
                firstLogin: true,
            });

            console.log(`Alumno ${alumno.nombre} registrado correctamente en Firestore.`);
        } catch (error) {
            console.error("Error al registrar un alumno:", error);
            // Aquí puedes registrar los errores en una base de datos de logs si es necesario
            if (error.code === "auth/email-already-in-use") {
                console.error(`El correo ${alumno.correo} ya está en uso.`);
            } else {
                console.error("Error desconocido:", error);
            }
        }
    });

    // Espera a que todas las promesas se resuelvan antes de mostrar el mensaje
    await Promise.all(promises);

    alert("Carga de alumnos completada.");
    alumnos = [];
    renderTable();
    document.getElementById("confirmBtn").disabled = true;
});

// DESCARGAR FILTROS
// Buscar por grupo
document.getElementById("searchBtn").addEventListener("click", function () {
    const grupo = document.getElementById("searchGrupo").value.trim();

    if (!grupo) {
        alert("Por favor, ingresa un grupo para buscar.");
        return;
    }

    // Filtrar los alumnos que pertenecen al grupo ingresado
    alumnosFiltrados = alumnos.filter((alumno) => alumno.grupo.toLowerCase() === grupo.toLowerCase());

    if (alumnosFiltrados.length === 0) {
        alert("No se encontraron alumnos para el grupo especificado.");
    } else {
        alert(`${alumnosFiltrados.length} alumno(s) encontrado(s) para el grupo ${grupo}.`);
    }

    renderFilteredTable(); // Llamar a la función para renderizar la tabla con los resultados filtrados
});

// Renderiza los alumnos filtrados en la tabla
function renderFilteredTable() {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = ""; // Clear the table

    alumnosFiltrados.forEach((alumno) => {
        const row = `
            <tr>
                <td>${alumno.matricula}</td>
                <td>${alumno.nombre}</td>
                <td>${alumno.apellidoPaterno}</td>
                <td>${alumno.apellidoMaterno}</td>
                <td>${alumno.curp}</td>
                <td>${alumno.correo}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}
// Limpiar búsqueda
document.getElementById("clearBtn").addEventListener("click", function () {
    document.getElementById("searchGrupo").value = "";  // Limpiar campo de búsqueda
    alumnosFiltrados = [];  // Restablecer el arreglo de alumnos filtrados
    renderTable();  // Llamar a la función que renderiza la tabla con todos los alumnos
});

// Renderiza la tabla completa (todos los alumnos)
function renderTablee() {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";

    alumnos.forEach((alumno) => {
        const row = `
            <tr>
                <td>${alumno.matricula}</td>
                <td>${alumno.nombre}</td>
                <td>${alumno.apellidoPaterno}</td>
                <td>${alumno.apellidoMaterno}</td>
                <td>${alumno.curp}</td>
                <td>${alumno.correo}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}




