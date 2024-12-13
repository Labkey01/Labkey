import { fetchAPI } from "./properties/util.js";
import { LKURI } from "./properties/properties.js";

const recordsPerPage = 10;
let currentPage = 1;
let registros = [];

// Elementos de la interfaz
const recordTableBody = document.getElementById("recordTableBody");
const prevPageButton = document.getElementById("prevPage");
const nextPageButton = document.getElementById("nextPage");
const currentPageSpan = document.getElementById("currentPage");
const searchLab = document.getElementById("searchLab");
const searchBuilding = document.getElementById("searchBuilding");
const searchTime = document.getElementById("searchTime");
const downloadExcelButton = document.getElementById("downloadExcel");

// Función para consumir el API y obtener registros usando `fetchAPI`
async function fetchRecords() {
    try {
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
            window.location.href = "./incio_sesion.html"; // Redirigir si no hay sesión
        }

        // Llamada al API
        registros = await fetchAPI(`${LKURI}/reservas/list-all`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        // Inicializar la tabla con los registros
        currentPage = 1; // Reiniciar la paginación
        const filteredRecords = filterRecords();
        renderRecords(filteredRecords, currentPage);
        handlePagination(filteredRecords);
    } catch (error) {
        console.error("Error al cargar los registros:", error.message);
        alert("Hubo un problema al cargar los registros. Intenta nuevamente más tarde.");
    }
}

// Filtrar registros por búsqueda
const filterRecords = () => {
    const searchLabValue = searchLab.value.toLowerCase();
    const searchBuildingValue = searchBuilding.value.toLowerCase();
    const searchTimeValue = searchTime.value;

    return registros.filter(record =>
        record.laboratorio.toLowerCase().includes(searchLabValue) &&
        record.edificio.toLowerCase().includes(searchBuildingValue) &&
        (!searchTimeValue || record.horario === searchTimeValue)
    );
};

// Renderizar registros en la tabla
const renderRecords = (records, page) => {
    recordTableBody.innerHTML = "";
    const start = (page - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    const recordsToShow = records.slice(start, end);

    recordsToShow.forEach(record => {
        const row = `
            <tr>
                <td>${record.nombre}</td>
                <td>${record.laboratorio}</td>
                <td>${record.edificio}</td>
                <td>${record.hora}</td>
                <td>${record.fecha}</td>
                <td>${record.materia}</td> <!-- Nueva columna -->
            </tr>
        `;
        recordTableBody.innerHTML += row;
    });

    currentPageSpan.textContent = page;
};

// Manejo de la paginación
const handlePagination = (filteredRecords) => {
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage * recordsPerPage >= filteredRecords.length;

    prevPageButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderRecords(filteredRecords, currentPage);
        }
    };

    nextPageButton.onclick = () => {
        if (currentPage * recordsPerPage < filteredRecords.length) {
            currentPage++;
            renderRecords(filteredRecords, currentPage);
        }
    };
};

// Descargar registros como Excel
const downloadExcel = (filteredRecords) => {
    const csvContent = "data:text/csv;charset=utf-8," +
        ["Nombre,Laboratorio,Edificio,Horario,Fecha,Materia"]
            .concat(filteredRecords.map(r => `${r.nombre},${r.laboratorio},${r.edificio},${r.horario},${r.fecha},${r.materia}`))
            .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Registros_Profesores.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Event Listeners
searchLab.addEventListener("input", () => {
    currentPage = 1;
    const filteredRecords = filterRecords();
    renderRecords(filteredRecords, currentPage);
    handlePagination(filteredRecords);
});

searchBuilding.addEventListener("input", () => {
    currentPage = 1;
    const filteredRecords = filterRecords();
    renderRecords(filteredRecords, currentPage);
    handlePagination(filteredRecords);
});

searchTime.addEventListener("change", () => {
    currentPage = 1;
    const filteredRecords = filterRecords();
    renderRecords(filteredRecords, currentPage);
    handlePagination(filteredRecords);
});

downloadExcelButton.addEventListener("click", () => {
    const filteredRecords = filterRecords();
    downloadExcel(filteredRecords);
});

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
    fetchRecords();
});
