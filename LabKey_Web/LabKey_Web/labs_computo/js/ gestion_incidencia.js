import { firebaseConfig } from "../js/properties/firebaseConfig.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, query } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let incidencias = [];
let administradores = [];
let itemsPerPage = 5;
let currentPage = 1;
let currentIncidencia = null;

// Cargar administradores
async function fetchAdministradores() {
    try {
        const adminQuery = query(collection(db, "administradores"));
        const adminSnapshot = await getDocs(adminQuery);
        administradores = adminSnapshot.docs.map(doc => doc.data().nombre || "Encargado desconocido");
    } catch (error) {
        console.error("Error al cargar administradores:", error);
        alert("Error al cargar administradores. Intenta de nuevo.");
    }
}

// Cargar incidencias
async function fetchIncidencias() {
    try {
        const incQuery = query(collection(db, "incidencias"));
        const incSnapshot = await getDocs(incQuery);
        incidencias = incSnapshot.docs.map(doc => ({
            id: doc.id,
            nombre: doc.data().nombre || "Sin reportar",
            laboratorio: doc.data().laboratorio || "Desconocido",
            fecha: doc.data().fecha || "No especificada",
            hora: doc.data().hora || "No especificada",
            incidencia: doc.data().tipo_incidente || "No especificada",
            estado: doc.data().estado || "Desconocido",
            datosAdicionales: doc.data().datos_adicionales || "Sin información adicional",
            resueltoPor: doc.data().resueltoPor || "N/A",
            comentarios: doc.data().comentarios || "Sin comentarios"
        }));
        renderTable();
    } catch (error) {
        console.error("Error al cargar incidencias:", error);
        alert("Error al cargar incidencias. Intenta de nuevo.");
    }
}

// Filtrar incidencias según Fecha, Hora y Laboratorio
document.getElementById("searchBtn").addEventListener("click", () => {
    const fecha = document.getElementById("fecha").value.trim();
    const hora = document.getElementById("hora").value.trim();
    const laboratorio = document.getElementById("laboratorio").value.trim().toLowerCase();

    // Filtrar incidencias que coincidan con los criterios
    const filteredIncidencias = incidencias.filter((incidencia) => {
        const matchesFecha = fecha ? incidencia.fecha === fecha : true; // Filtrar por fecha exacta
        const matchesHora = hora ? incidencia.hora.startsWith(hora) : true; // Filtrar por hora parcial
        const matchesLaboratorio = laboratorio
            ? incidencia.laboratorio.toLowerCase().includes(laboratorio)
            : true; // Filtrar por texto parcial de laboratorio

        return matchesFecha && matchesHora && matchesLaboratorio;
    });

    // Renderizar la tabla con los resultados filtrados
    renderFilteredTable(filteredIncidencias);
});

// Función para limpiar filtros y mostrar todas las incidencias
document.getElementById("clearFiltersBtn").addEventListener("click", () => {
    // Limpiar los campos de filtro
    document.getElementById("fecha").value = "";
    document.getElementById("hora").value = "";
    document.getElementById("laboratorio").value = "";

    // Renderizar la tabla completa con todas las incidencias
    renderTable();
});


// Renderizar tabla
function renderTable() {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedIncidencias = incidencias.slice(start, end);

    paginatedIncidencias.forEach((incidencia, index) => {
        const actionButton = incidencia.estado === "Sin resolver"
            ? `<button class="action-button red" onclick="openResolveModal(${start + index})">Resolver Incidencia</button>`
            : `<button class="action-button green" onclick="openViewResolvedModal(${start + index})">Ver Incidencia</button>`;

        const row = `
            <tr>
                <td>${incidencia.nombre}</td>
                <td>${incidencia.laboratorio}</td>
                <td>${incidencia.fecha}</td>
                <td>${incidencia.hora}</td>
                <td>${incidencia.incidencia}</td>
                <td>${incidencia.estado}</td>
                <td>${actionButton}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    updatePaginationIndicator();
}

// Actualizar indicador de paginación
function updatePaginationIndicator() {
    const currentPageIndicator = document.getElementById("currentPage");
    const totalPages = Math.ceil(incidencias.length / itemsPerPage);
    currentPageIndicator.textContent = `${currentPage}/${totalPages}`;
}


// Renderizar tabla filtrada
function renderFilteredTable(filteredData) {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";

    if (filteredData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7">No se encontraron incidencias.</td></tr>';
        return;
    }

    filteredData.forEach((incidencia, index) => {
        const actionButton = incidencia.estado === "Sin resolver"
            ? `<button class="action-button red" onclick="openResolveModal(${index})">Resolver Incidencia</button>`
            : `<button class="action-button green" onclick="openViewResolvedModal(${index})">Ver Incidencia</button>`;

        const row = `
            <tr>
                <td>${incidencia.nombre}</td>
                <td>${incidencia.laboratorio}</td>
                <td>${incidencia.fecha}</td>
                <td>${incidencia.hora}</td>
                <td>${incidencia.incidencia}</td>
                <td>${incidencia.estado}</td>
                <td>${actionButton}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Abrir modal para resolver incidencia
window.openResolveModal = (index) => {
    currentIncidencia = index;
    const incidencia = incidencias[index];

    document.getElementById("tipoIncidencia").value = incidencia.incidencia;
    document.getElementById("modalLaboratorio").value = incidencia.laboratorio;

    const resueltoPorSelect = document.getElementById("resueltoPor");
    resueltoPorSelect.innerHTML = administradores.map(admin => `<option value="${admin}">${admin}</option>`).join("");

    document.getElementById("resolveModal").style.display = "flex";
};

// Confirmar resolución
document.getElementById("confirmResolveBtn").addEventListener("click", async () => {
    try {
        const resueltoPor = document.getElementById("resueltoPor").value;
        const comentarios = document.getElementById("comentarios").value;

        if (!resueltoPor || !comentarios) {
            alert("Por favor completa todos los campos.");
            return;
        }


        const incidencia = incidencias[currentIncidencia];
        const docRef = doc(db, "incidencias", incidencia.id);

        await updateDoc(docRef, {
            estado: "Resuelta",
            resueltoPor,
            comentarios
        });

        incidencia.estado = "Resuelta";
        incidencia.resueltoPor = resueltoPor;
        incidencia.comentarios = comentarios;

        renderTable();
        document.getElementById("resolveModal").style.display = "none";

        alert("La incidencia ha sido marcada como resuelta.");
    } catch (error) {
        console.error("Error al actualizar incidencia:", error);
        alert("Error al marcar la incidencia como resuelta. Intenta de nuevo.");
    }
});

// Abrir modal para ver incidencia resuelta
window.openViewResolvedModal = (index) => {
    const incidencia = incidencias[index];

    document.getElementById("viewTipoIncidencia").value = incidencia.incidencia;
    document.getElementById("viewLaboratorio").value = incidencia.laboratorio;
    document.getElementById("viewEstado").value = incidencia.estado;
    document.getElementById("viewResueltoPor").value = incidencia.resueltoPor || "N/A";
    document.getElementById("viewComentarios").value = incidencia.comentarios || "Sin comentarios";
    document.getElementById("viewDatosAdicionales").value = incidencia.datosAdicionales;

    document.getElementById("viewResolvedModal").style.display = "flex";
};

// Cerrar modales
document.getElementById("closeResolveModal").addEventListener("click", () => {
    document.getElementById("resolveModal").style.display = "none";
});

document.getElementById("closeViewResolvedModal").addEventListener("click", () => {
    document.getElementById("viewResolvedModal").style.display = "none";
});

// Inicializar y agregar eventos
document.addEventListener("DOMContentLoaded", async () => {
    await fetchAdministradores();
    await fetchIncidencias();

    const searchResolvedBtn = document.getElementById("searchResolvedBtn");
    if (searchResolvedBtn) {
        searchResolvedBtn.addEventListener("click", () => {
            const incidenciasResueltas = incidencias.filter(incidencia => incidencia.estado === "Resuelta");
            renderFilteredTable(incidenciasResueltas);
        });
    } else {
        console.error("El botón 'Buscar incidencias resueltas' no existe en el DOM.");
    }

    const searchUnresolvedBtn = document.getElementById("searchUnresolvedBtn");
    if (searchUnresolvedBtn) {
        searchUnresolvedBtn.addEventListener("click", () => {
            const incidenciasSinResolver = incidencias.filter(incidencia => incidencia.estado === "Sin resolver");
            renderFilteredTable(incidenciasSinResolver);
        });
    } else {
        console.error("El botón 'Buscar incidencias sin resolver' no existe en el DOM.");
    }

    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");

    if (prevPageBtn) {
        prevPageBtn.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener("click", () => {
            if (currentPage * itemsPerPage < incidencias.length) {
                currentPage++;
                renderTable();
            }
        });
    }
});
