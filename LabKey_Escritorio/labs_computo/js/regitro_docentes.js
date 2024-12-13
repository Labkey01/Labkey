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

document.getElementById("clearFilters").addEventListener("click", () => {
    // Limpiar los valores de los campos de texto
    document.getElementById("searchLab").value = "";
    document.getElementById("searchBuilding").value = "";
    document.getElementById("searchTime").value = "";

    // Reiniciar los registros mostrados
    currentPage = 1; // Reinicia la paginación
    renderRecords(registros, currentPage); // Muestra todos los registros
    handlePagination(registros); // Actualiza la paginación
});


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
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage); // Calcula el total de páginas

    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;

    // Actualiza el indicador de página en formato "1/2"
    currentPageSpan.textContent = `${currentPage}/${totalPages}`;

    prevPageButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderRecords(filteredRecords, currentPage);
            currentPageSpan.textContent = `${currentPage}/${totalPages}`;
        }
    };

    nextPageButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderRecords(filteredRecords, currentPage);
            currentPageSpan.textContent = `${currentPage}/${totalPages}`;
        }
    };
};


// Descargar registros como Excel
const downloadExcelFromTable = () => {
    // Obtiene todas las filas de la tabla, excepto la cabecera
    const rows = document.querySelectorAll("#recordTableBody tr");
    const csvRows = [];

    // Agregar cabecera del CSV
    csvRows.push("Nombre,Laboratorio,Edificio,Horario,Fecha,Materia");

    // Recorrer las filas y obtener los datos
    rows.forEach(row => {
        const columns = row.querySelectorAll("td");
        const rowData = Array.from(columns).map(col => `"${col.textContent.trim()}"`); // Encerrar en comillas dobles
        csvRows.push(rowData.join(",")); // Unir columnas con comas
    });

    // Crear contenido CSV
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");

    // Crear enlace para descargar
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Registros_Profesores.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Vincular esta función al botón de descarga
document.getElementById("downloadExcel").addEventListener("click", downloadExcelFromTable);



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
