import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";
import { firebaseConfig } from "./properties/firebaseConfig.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Variables globales
let reportData = [];
let itemsPerPage = 5;
let currentPage = 1;

// Obtener laboratorios únicos desde la colección `laboratorios`
async function fetchLaboratorios() {
    const querySnapshot = await getDocs(collection(db, "laboratorios"));
    const laboratorios = [];

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.abreviacion) {
            laboratorios.push(data.abreviacion); // Agregar solo la abreviación
        }
    });

    return laboratorios; // Retornar el array de abreviaciones
}

// Rellenar el select de laboratorios dinámicamente
async function populateLaboratorioSelect() {
    const laboratorioSelect = document.getElementById("laboratorio");
    laboratorioSelect.innerHTML = "<option value=''>Seleccione el laboratorio</option>"; // Limpiar y agregar opción por defecto

    const laboratorios = await fetchLaboratorios();
    laboratorios.forEach((laboratorio) => {
        const option = document.createElement("option");
        option.value = laboratorio;
        option.textContent = laboratorio;
        laboratorioSelect.appendChild(option);
    });
}

// Obtener datos desde Firebase con filtros aplicados
async function fetchIncidencias(filters) {
    let q = collection(db, "incidencias");
    const constraints = [];

    // Aplicar filtros
    if (filters.laboratorio) {
        constraints.push(where("laboratorio", "==", filters.laboratorio));
    }
    if (filters.estado) {
        constraints.push(where("estado", "==", filters.estado));
    }
    if (filters.fechaInicio && filters.fechaFin) {
        constraints.push(where("fecha", ">=", filters.fechaInicio));
        constraints.push(where("fecha", "<=", filters.fechaFin));
    }

    if (constraints.length > 0) {
        q = query(q, ...constraints);
    }

    const querySnapshot = await getDocs(q);
    const results = [];
    querySnapshot.forEach((doc) => {
        results.push(doc.data());
    });

    return results;
}

// Renderizar la tabla
function renderTable() {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = ""; // Limpiar el contenido previo

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = reportData.slice(start, end);

    paginatedData.forEach((item) => {
        const row = `
            <tr>
                <td>${item.fecha || "N/A"}</td>
                <td>${item.laboratorio || "N/A"}</td>
                <td>${item.hora || "N/A"}</td>
                <td>${item.tipo_incidente || "N/A"}</td>
                <td>${item.resueltoPor || "Sin resolver"}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Manejar paginación
document.getElementById("nextPage").addEventListener("click", () => {
    if (currentPage * itemsPerPage < reportData.length) {
        currentPage++;
        renderTable();
        document.getElementById("currentPage").textContent = currentPage;
    }
});

document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
        document.getElementById("currentPage").textContent = currentPage;
    }
});

// Descargar en Excel
document.getElementById("downloadExcel").addEventListener("click", () => {
    const csvContent = "data:text/csv;charset=utf-8," +
        "Fecha,Laboratorio,Hora,Tipo de Incidencia,Resuelto Por\n" +
        reportData.map(item => `${item.fecha || ""},${item.laboratorio ||  ""},${item.hora || ""},${item.tipo_incidente || ""},${item.resueltoPor || "Sin resolver"}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_incidencias.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Descargar en PDF
document.getElementById("downloadPdf").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título del reporte
    doc.setFontSize(18);
    doc.text("Reporte de Incidencias de Laboratorios", 14, 20);

    // Datos para la tabla
    const tableData = reportData.map((item, index) => [
        index + 1,
        item.fecha || "N/A",
        item.laboratorio || "N/A",
        item.hora || "N/A",
        item.tipo_incidente || "N/A",
        item.resueltoPor || "Sin resolver"
    ]);

    const headers = [["#", "Fecha", "Laboratorio", "Hora", "Tipo de Incidencia", "Resuelto Por"]];

    doc.autoTable({
        head: headers,
        body: tableData,
        startY: 30,
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontSize: 12, halign: "center" },
        bodyStyles: { textColor: [0, 0, 0] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { top: 30 },
        didDrawPage: (data) => {
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.height;
            doc.setFontSize(10);
            doc.text(`Página ${doc.internal.getNumberOfPages()}`, 14, pageHeight - 10);
        }
    });

    doc.save("reporte_incidencias.pdf");
});

// Manejar filtros y mostrar datos
document.getElementById("generarBtn").addEventListener("click", async () => {
    const filters = {
        laboratorio: document.getElementById("laboratorio").value,
        estado: document.getElementById("estado").value,
        fechaInicio: document.getElementById("fechaInicio").value,
        fechaFin: document.getElementById("fechaFin").value
    };

    const reportTableContainer = document.getElementById("reportTableContainer");
    reportTableContainer.style.display = "block";

    reportData = await fetchIncidencias(filters);
    currentPage = 1;
    document.getElementById("currentPage").textContent = currentPage;
    renderTable();
});

// Limpiar filtros
document.getElementById("limpiarBtn").addEventListener("click", () => {
    document.getElementById("laboratorio").value = "";
    document.getElementById("estado").value = "";
    document.getElementById("fechaInicio").value = "";
    document.getElementById("fechaFin").value = "";
    reportData = [];
    renderTable();
});

// Inicializar la página
document.addEventListener("DOMContentLoaded", () => {
    populateLaboratorioSelect(); // Llenar select de laboratorios
});
