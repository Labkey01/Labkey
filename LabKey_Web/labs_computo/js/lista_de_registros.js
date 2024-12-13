import { fetchAPI } from "./properties/util.js";
import { LKURI } from "./properties/properties.js";

let currentPage = 1;
let itemsPerPage = 5;
let originalData = [];
let filteredData = [];

// Cargar los datos iniciales desde el servicio
window.onload = async function () {
    try {
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
            window.location.href = "./inicio_sesion.html";
            return;
        }

        // Consumir el servicio
        originalData = await fetchAPI(`${LKURI}/registro/list-all`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!Array.isArray(originalData)) {
            throw new Error("Los datos obtenidos no son válidos");
        }

        // Inicializar datos filtrados y renderizar tabla
        filteredData = [...originalData];
        renderTable();
        handlePagination();
    } catch (error) {
        console.error("Error al cargar los registros:", error.message);
        alert("No se pudieron cargar los registros. Intenta nuevamente más tarde.");
    }
};

function renderTable() {
    const tableBody = document.getElementById("recordsTableBody");
    tableBody.innerHTML = ""; // Limpiar la tabla

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = filteredData.slice(start, end);

    paginatedData.forEach(row => {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${row.nombre}</td>
            <td>${row.matricula}</td>
            <td>${row.laboratorio}</td>
            <td>${row.edificio}</td>
            <td>${row.nequipo}</td>
            <td>${row.fecha}</td>
            <td>${row.hora}</td>
            <td>${row.tiempo}</td>
        `;
        tableBody.appendChild(newRow);
    });

    document.getElementById("pageNumber").textContent = currentPage;
}

function handlePagination() {
    const prevPageButton = document.getElementById("prevPage");
    const nextPageButton = document.getElementById("nextPage");

    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage * itemsPerPage >= filteredData.length;

    prevPageButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
            handlePagination();
        }
    };

    nextPageButton.onclick = () => {
        if (currentPage * itemsPerPage < filteredData.length) {
            currentPage++;
            renderTable();
            handlePagination();
        }
    };
}

function applyFilters() {
    const labInput = document.getElementById("searchLab").value.toLowerCase();
    const buildingInput = document.getElementById("searchBuilding").value.toLowerCase();
    const dateInput = document.getElementById("searchDate").value;
    const timeInput = document.getElementById("searchTime").value;

    filteredData = originalData.filter(row =>
        (labInput === "" || row.laboratorio.toLowerCase().includes(labInput)) &&
        (buildingInput === "" || row.edificio.toLowerCase().includes(buildingInput)) &&
        (dateInput === "" || row.fecha === dateInput) &&
        (timeInput === "" || row.hora.startsWith(timeInput))
    );

    currentPage = 1; // Reiniciar la paginación al aplicar filtros
    renderTable();
    handlePagination();
}

// Limpiar filtros y restaurar datos originales
function clearFilters() {
    document.getElementById("searchLab").value = "";
    document.getElementById("searchBuilding").value = "";
    document.getElementById("searchDate").value = "";
    document.getElementById("searchTime").value = "";

    filteredData = [...originalData];
    currentPage = 1; // Reiniciar la paginación
    renderTable();
    handlePagination();
}

// Escuchar eventos en los campos de filtro
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("searchLab").addEventListener("input", applyFilters);
    document.getElementById("searchBuilding").addEventListener("input", applyFilters);
    document.getElementById("searchDate").addEventListener("change", applyFilters);
    document.getElementById("searchTime").addEventListener("change", applyFilters);

    // Botón para limpiar filtros
    document.getElementById("clearFiltersBtn").addEventListener("click", clearFilters);
});
