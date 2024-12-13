import { db } from "./firebase.js"; // Importar Firebase
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";

// Variables globales
let tipoIncidenciaCounts = {};


// Función para generar los datos y mostrar resultados
document.getElementById("generateButton").onclick = async function () {
    const resultadosDiv = document.getElementById("resultadosDiv");
    resultadosDiv.innerHTML = "Cargando resultados...";

    try {
        // Query para obtener datos de incidencias en el laboratorio "Idiomas"
        const incidenciasQuery = query(collection(db, "incidencias"), where("laboratorio", "==", "Idiomas"));
        const querySnapshot = await getDocs(incidenciasQuery);

        if (querySnapshot.empty) {
            resultadosDiv.innerHTML = "No se encontraron resultados.";
            return;
        }

        // Mostrar resultados
        let resultadosHTML = "<table><thead><tr>";
        resultadosHTML += `
            <th>Número de Incidencia</th>
            <th>Laboratorio</th>
            <th>Estado</th>
            <th>Tipo de Incidencia</th>
            <th>Detalles</th>
        </tr></thead><tbody>`;

        querySnapshot.forEach(doc => {
            const data = doc.data();
            resultadosHTML += `
                <tr>
                    <td>${data.incidencia_id || "N/A"}</td>
                    <td>${data.laboratorio || "N/A"}</td>
                    <td>${data.estado || "N/A"}</td>
                    <td>${data.tipo_incidente || "N/A"}</td>
                    <td>${data.datos_adicionales || "N/A"}</td>
                </tr>`;
        });

        resultadosHTML += "</tbody></table>";
        resultadosDiv.innerHTML = resultadosHTML;

        // Generar estadísticas para el gráfico
        tipoIncidenciaCounts = {};
        querySnapshot.forEach(doc => {
            const tipo = doc.data().tipo_incidente || "Otro";
            tipoIncidenciaCounts[tipo] = (tipoIncidenciaCounts[tipo] || 0) + 1;
        });

        createChart(tipoIncidenciaCounts);
    } catch (error) {
        console.error("Error al cargar incidencias:", error);
        resultadosDiv.innerHTML = "Ocurrió un error al cargar los datos.";
    }
};

// Función para crear un gráfico con Chart.js
function createChart(data) {
    const ctx = document.getElementById("chartIncidencias").getContext("2d");
    const labels = Object.keys(data);
    const values = Object.values(data);

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Número de Incidencias",
                data: values,
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Función para descargar el PDF
document.getElementById("downloadButton").onclick = async function () {
    if (Object.keys(tipoIncidenciaCounts).length === 0) {
        alert("No hay datos para descargar.");
        return;
    }

    // Configuración de jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text("Reporte de Incidencias - Laboratorio Idiomas", 10, 10);

    // Agregar tabla de datos
    const resultadosDiv = document.getElementById("resultadosDiv");
    const table = resultadosDiv.querySelector("table");

    if (table) {
        const tableRows = Array.from(table.querySelectorAll("tr")).map(row =>
            Array.from(row.querySelectorAll("td, th")).map(cell => cell.textContent.trim())
        );

        doc.autoTable({
            head: [tableRows[0]], // Encabezado de la tabla
            body: tableRows.slice(1), // Cuerpo de la tabla
            startY: 20
        });
    }

    // Agregar gráfico como imagen
    const canvas = document.getElementById("chartIncidencias");
    const chartImage = canvas.toDataURL("image/png");
    doc.addPage();
    doc.setFontSize(16);
    doc.text("Gráfico de Incidencias", 10, 10);
    doc.addImage(chartImage, "PNG", 15, 20, 180, 100);

    // Descargar el PDF
    doc.save("reporte_incidencias.pdf");
};
