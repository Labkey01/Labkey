import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { firebaseConfig } from "../js/properties/firebaseConfig.js";

let currentPage = 1;
let itemsPerPage = 5;
let originalData = [];
let filteredData = [];

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para cargar datos de registros y usuarios
async function loadData() {
    try {
        const registrosSnapshot = await getDocs(collection(db, "registros"));
        const registrosData = registrosSnapshot.docs.map(doc => doc.data());

        const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
        const usuariosData = usuariosSnapshot.docs.map(doc => doc.data());

        const usuariosMap = usuariosData.reduce((map, usuario) => {
            map[usuario.matricula] = usuario.nombre;
            return map;
        }, {});

        originalData = registrosData.map(registro => ({
            ...registro,
            nombre: usuariosMap[registro.matricula] || "N/A"
        }));

        filteredData = [...originalData];
        renderTable();
        handlePagination();
    } catch (error) {
        console.error("Error al cargar los datos desde Firebase:", error.message);
        alert("No se pudieron cargar los datos.");
    }
}

window.onload = loadData;

function renderTable() {
    const tableBody = document.getElementById("recordsTableBody");
    tableBody.innerHTML = "";

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = filteredData.slice(start, end);

    paginatedData.forEach(row => {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${row.nombre || "N/A"}</td>
            <td>${row.matricula || "N/A"}</td>
            <td>${row.usuario_sesion || "N/A"}</td>
            <td>${row.nombre_equipo || "N/A"}</td>
            <td>${row.fecha || "N/A"}</td>
            <td>${row.hora || "N/A"}</td>
            <td>${row.horas || 0} horas ${row.minutos || 0} minutos</td>
        `;
        tableBody.appendChild(newRow);
    });

    updatePageNumber();
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
    const labInputElement = document.getElementById("searchLab");
    const dateInputElement = document.getElementById("searchDate");
    const timeInputElement = document.getElementById("searchTime");

    const labInput = labInputElement ? labInputElement.value.toLowerCase() : "";
    const dateInput = dateInputElement ? dateInputElement.value : "";
    const timeInput = timeInputElement ? timeInputElement.value : "";

    filteredData = originalData.filter(row =>
        (labInput === "" || (row.usuario_sesion || "").toLowerCase().includes(labInput)) &&
        (dateInput === "" || row.fecha === dateInput) &&
        (timeInput === "" || row.hora.startsWith(timeInput))
    );

    currentPage = 1;
    renderTable();
    handlePagination();
}

function clearFilters() {
    document.getElementById("searchLab").value = "";
    document.getElementById("searchDate").value = "";
    document.getElementById("searchTime").value = "";

    filteredData = [...originalData];
    currentPage = 1;
    renderTable();
    handlePagination();
}

function updatePageNumber() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const pageNumberElement = document.getElementById("pageNumber");
    pageNumberElement.textContent = `${currentPage}/${totalPages}`;
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("searchLab").addEventListener("input", applyFilters);
    document.getElementById("searchDate").addEventListener("change", applyFilters);
    document.getElementById("searchTime").addEventListener("change", applyFilters);
    document.getElementById("clearFiltersBtn").addEventListener("click", clearFilters);
});

// Asegurarse de que las funciones estén disponibles globalmente
window.clearFilters = clearFilters;
