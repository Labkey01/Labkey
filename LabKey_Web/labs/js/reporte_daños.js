import { db } from "./firebase.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";

// Helper function: Show a loading message in a dropdown
function setLoadingMessage(selectElement, message) {
    const option = document.createElement("option");
    option.disabled = true;
    option.selected = true;
    option.textContent = message;
    selectElement.appendChild(option);
}

// Load "tipo_incidente" options from "incidencias"
async function loadTiposDeIncidenciaFromIncidencias() {
    const tipoIncidenciaSelect = document.getElementById("incidencia");
    tipoIncidenciaSelect.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "incidencias"));
        const tipos = new Set();

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.tipo_incidente) tipos.add(data.tipo_incidente);
        });

        tipoIncidenciaSelect.innerHTML = "<option value=''>Seleccione el tipo de incidencia</option>";
        tipos.forEach((tipo) => {
            const option = document.createElement("option");
            option.value = tipo;
            option.textContent = tipo;
            tipoIncidenciaSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar tipos de incidencia:", error);
        tipoIncidenciaSelect.innerHTML = "";
        setLoadingMessage(tipoIncidenciaSelect, "Error al cargar tipos de incidencia");
    }
}

// Filter incidencias based on the fixed laboratorio ("Idiomas") and optional tipo_incidente
// Filter incidencias based on the fixed laboratorio ("Idiomas") and optional tipo_incidente
async function filterIncidencias() {
    const tipoIncidencia = document.getElementById("incidencia").value || null;
    const tableSection = document.getElementById("report-table-section");
    const tableBody = document.querySelector("#report-table tbody");

    // Clear the table before showing new results
    tableBody.innerHTML = "";

    try {
        const laboratorio = "Idiomas";

        let incidenciasQuery;
        if (tipoIncidencia) {
            incidenciasQuery = query(
                collection(db, "incidencias"),
                where("laboratorio", "==", laboratorio),
                where("tipo_incidente", "==", tipoIncidencia)
            );
        } else {
            incidenciasQuery = query(
                collection(db, "incidencias"),
                where("laboratorio", "==", laboratorio)
            );
        }

        const querySnapshot = await getDocs(incidenciasQuery);

        if (querySnapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No se encontraron incidencias.</td></tr>`;
            return;
        }

        const dataRows = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${data.incidencia_id || "N/A"}</td>
                <td>${data.laboratorio || "N/A"}</td>
                <td>${data.estado || "N/A"}</td>
                <td>${data.tipo_incidente || "N/A"}</td>
                <td>${data.datos_adicionales || "N/A"}</td>
            `;
            tableBody.appendChild(row);
            dataRows.push([
                data.incidencia_id || "N/A",
                data.laboratorio || "N/A",
                data.estado || "N/A",
                data.tipo_incidente || "N/A",
                data.datos_adicionales || "N/A",
            ]);
        });

        if (tableSection.classList.contains("hidden")) {
            tableSection.classList.remove("hidden");
        }



        const downloadPDFButton = document.getElementById("downloadPDFButton");
        if (downloadPDFButton) {
            downloadPDFButton.onclick = () => downloadPDF(dataRows, laboratorio);
        }
    } catch (error) {
        console.error("Error al filtrar incidencias:", error);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Error al cargar datos.</td></tr>`;
    }
}

// Download results as PDF
async function downloadPDF(dataRows, laboratorio) {
    const { jsPDF } = window.jspdf; // Asegúrate de que este script esté cargado

    if (!jsPDF) {
        alert("Error: jsPDF no está disponible. Verifica que la librería esté incluida correctamente.");
        return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Reporte de Incidencias - Laboratorio: ${laboratorio}`, 10, 10);

    const headers = ["Numero de incidencia", "Laboratorio", "Estado", "Tipo de Incidencia", "Detalles"];
    const body = dataRows.map(row => row.map(cell => cell.toString()));

    doc.autoTable({
        head: [headers],
        body: body,
        startY: 20,
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        bodyStyles: { textColor: 50 },
        margin: { top: 20, left: 10, right: 10 },
        styles: { fontSize: 10, cellPadding: 5 },
        didDrawPage: function (data) {
            const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
            doc.setFontSize(10);
            doc.text(`Página ${pageNumber}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        },
    });

    doc.save(`Reporte_Incidencias_${laboratorio}.pdf`);
}


// Load dropdown options and set up event listeners
document.addEventListener("DOMContentLoaded", () => {
    loadTiposDeIncidenciaFromIncidencias();
    document.getElementById("generateButton").addEventListener("click", filterIncidencias);
});

