import { LKURI } from '../js/properties/properties.js';
import { fetchAPI } from './properties/util.js';

let incidencias = [];
let itemsPerPage = 5;
let currentPage = 1;
let currentIncidencia = null;

// Función para consumir el endpoint y cargar las incidencias
async function fetchIncidencias() {
    try {
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
            window.location.href = "./inicio_sesion.html"; // Redirigir si no hay sesión activa
        }

        // Llamada al API
        incidencias = await fetchAPI(`${LKURI}/incidencias/list-all`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        // Renderizar la tabla con los datos obtenidos
        currentPage = 1; // Reiniciar la paginación
        renderTable();
    } catch (error) {
        console.error("Error al cargar las incidencias:", error.message);
        alert("Hubo un problema al cargar las incidencias. Intenta nuevamente más tarde.");
    }
}

// Renderizar la tabla con las incidencias
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedIncidencias = incidencias.slice(start, end);

    paginatedIncidencias.forEach((incidencia, index) => {
        const row = `
            <tr>
                <td>${incidencia.alumno} <br> Matrícula: ${incidencia.matricula}</td>
                <td>${incidencia.laboratorio}</td>
                <td>${incidencia.fecha}</td>
                <td>${incidencia.hora}</td>
                <td>${incidencia.incidencia}</td>
                <td>
                    <button class="action-button" onclick="openResolveModal(${start + index})">Incidencia Resuelta</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    document.getElementById('currentPage').textContent = currentPage;
}

// Función para abrir el modal de resolución
window.openResolveModal = (index) => {
    currentIncidencia = index;

    document.getElementById('modalLaboratorio').value = incidencias[index].laboratorio;
    document.getElementById('tipoIncidencia').value = incidencias[index].incidencia;

    document.getElementById('resolveModal').style.display = 'flex';
};

// Confirmar resolución de incidencia
document.getElementById('confirmResolveBtn').addEventListener('click', function () {
    const resueltoPor = document.getElementById('resueltoPor').value;
    const comentarios = document.getElementById('comentarios').value;

    console.log("Incidencia resuelta por:", resueltoPor);
    console.log("Comentarios:", comentarios);

    // Remover la incidencia resuelta
    incidencias.splice(currentIncidencia, 1);
    renderTable();
    document.getElementById('resolveModal').style.display = 'none';
});

// Cerrar modal de resolución
document.getElementById('closeResolveModal').addEventListener('click', function () {
    document.getElementById('resolveModal').style.display = 'none';
});

// Manejo de paginación
document.getElementById('nextPage').addEventListener('click', function () {
    if (currentPage * itemsPerPage < incidencias.length) {
        currentPage++;
        renderTable();
    }
});

document.getElementById('prevPage').addEventListener('click', function () {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
});

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    fetchIncidencias(); // Cargar las incidencias al iniciar la página
});


// Función para filtrar incidencias dinámicamente
function filterIncidencias() {
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const laboratorio = document.getElementById('laboratorio').value.toLowerCase();

    // Filtrar incidencias según los valores proporcionados
    const filteredIncidencias = incidencias.filter((incidencia) => {
        const matchesFecha = fecha ? incidencia.fecha === fecha : true; // Coincide exactamente con la fecha
        const matchesHora = hora ? incidencia.hora.startsWith(hora) : true; // Coincide con el inicio de la hora
        const matchesLaboratorio = laboratorio ? incidencia.laboratorio.toLowerCase().includes(laboratorio) : true;

        return matchesFecha && matchesHora && matchesLaboratorio;
    });

    // Renderizar la tabla con los resultados filtrados
    renderFilteredTable(filteredIncidencias);
}

// Función para renderizar la tabla con los resultados filtrados
function renderFilteredTable(filteredData) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    if (filteredData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No se encontraron incidencias</td></tr>';
        return;
    }

    filteredData.forEach((incidencia, index) => {
        const row = `
            <tr>
                <td>${incidencia.alumno} <br> Matrícula: ${incidencia.matricula}</td>
                <td>${incidencia.laboratorio}</td>
                <td>${incidencia.fecha}</td>
                <td>${incidencia.hora}</td>
                <td>${incidencia.incidencia}</td>
                <td>
                    <button class="action-button" onclick="openResolveModal(${index})">Incidencia Resuelta</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    document.getElementById('currentPage').textContent = '1'; // Resetea la página mostrada
}

// Escucha de eventos para realizar la búsqueda automáticamente
document.getElementById('fecha').addEventListener('input', filterIncidencias);
document.getElementById('hora').addEventListener('input', filterIncidencias);
document.getElementById('laboratorio').addEventListener('input', filterIncidencias);

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    fetchIncidencias(); // Cargar las incidencias al iniciar la página

    // Renderizar la tabla inicial (sin filtros)
    document.getElementById('fecha').value = ''; // Limpiar el filtro de fecha
    document.getElementById('hora').value = ''; // Limpiar el filtro de hora
    document.getElementById('laboratorio').value = ''; // Limpiar el filtro de laboratorio
});
