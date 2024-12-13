import { db } from "./firebase.js"; // Asegúrate de importar correctamente tu configuración de Firebase
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";

// Función para obtener la fecha actual en formato "yyyy-MM-dd"
function getCurrentDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Mes con dos dígitos
    const dd = String(today.getDate()).padStart(2, '0'); // Día con dos dígitos
    return `${yyyy}-${mm}-${dd}`;
}

// Función para filtrar por hora y cargar datos de Firebase
async function filterByHour() {
    const hour = document.getElementById('hora').value; // Obtener la hora seleccionada
    const tableBody = document.getElementById('student-table-body');
    
    // Limpiar la tabla antes de rellenarla
    tableBody.innerHTML = '';

    try {
        const currentDate = getCurrentDate(); // Obtener la fecha actual

        // Consultar la colección "reservaciones" en Firebase Firestore
        const q = query(
            collection(db, "reservaciones"),
            where("hora", "==", hour), // Filtrar por hora
            where("fecha", "==", currentDate) // Filtrar por la fecha actual
        );
        const querySnapshot = await getDocs(q);

        // Verificar si hay datos
        if (querySnapshot.empty) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6" style="text-align: center;">No hay alumnos registrados para esta hora</td>
            `;
            tableBody.appendChild(row);
            return;
        }

        // Recorrer los documentos y poblar la tabla
        querySnapshot.forEach((doc) => {
            const reservation = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${reservation.nombre}</td>
                <td>${reservation.matricula}</td>
                <td>${reservation.correo || '-'}</td>
                <td>${reservation.carrera || '-'}</td>
                <td>${reservation.grupo || '-'}</td>
                <td><div class="attendance-box" onclick="toggleAttendance(this)">X</div></td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error al cargar los datos de Firebase:", error);
    }
}

// Alternar asistencia
function toggleAttendance(box) {
    if (box.textContent === 'X') {
        box.textContent = '✓';
        box.classList.add('present');
    } else {
        box.textContent = 'X';
        box.classList.remove('present');
    }
}

// Subir lista de asistencia
function submitAttendance() {
    const modal = document.getElementById('modal');
    modal.style.display = 'block';
}

// Cerrar modal
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}
