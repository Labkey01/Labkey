import { db } from "./firebase.js"; // Asegúrate de importar correctamente tu configuración de Firebase
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";

document.getElementById("generateButton").onclick = async function () {
    const grupo = document.getElementById("grupo").value; // Obtener el grupo seleccionado
    const fechaInicio = document.getElementById("fecha-inicio").value;
    const fechaFin = document.getElementById("fecha-fin").value;
    const section = document.getElementById("report-table-section");
    const tbody = document.getElementById("report-table").querySelector("tbody");

    // Validar campos
    if (!fechaInicio || !fechaFin) {
        alert("Por favor, selecciona un rango de fechas válido.");
        return;
    }
    if (new Date(fechaInicio) > new Date(fechaFin)) {
        alert("La fecha de inicio no puede ser posterior a la fecha de fin.");
        return;
    }

    try {
        // Construir la consulta para Firestore
        const incidenciasQuery = query(
            collection(db, "incidencias"),
            where("grupo", "==", grupo) // Filtrar por grupo
        );

        const querySnapshot = await getDocs(incidenciasQuery);

        // Filtrar por rango de fechas en el cliente
        const filteredIncidencias = querySnapshot.docs
            .map((doc) => doc.data())
            .filter((incidencia) => {
                const incidenciaFecha = new Date(incidencia.fecha);
                return incidenciaFecha >= new Date(fechaInicio) && incidenciaFecha <= new Date(fechaFin);
            });

        // Limpiar la tabla
        tbody.innerHTML = "";

        if (filteredIncidencias.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No se encontraron datos para el criterio seleccionado.</td></tr>`;
        } else {
            // Agregar los datos filtrados a la tabla
            filteredIncidencias.forEach((incidencia) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${incidencia.matricula}</td>
                    <td>${incidencia.nombre}</td>
                    <td>${incidencia.fecha}</td>
                    <td>${incidencia.hora}</td>
                    <td>${incidencia.estado}</td>
                `;
                tbody.appendChild(row);
            });
        }

        // Mostrar la tabla
        section.classList.remove("hidden");
    } catch (error) {
        console.error("Error al generar el reporte:", error);
        alert("Ocurrió un error al generar el reporte. Por favor, inténtalo nuevamente.");
    }
};

document.getElementById("downloadPDFButton").onclick = function () {
    const grupo = document.getElementById("grupo").value;
    const rows = document.querySelectorAll("#report-table tbody tr");

    if (rows.length === 0) {
        alert("No hay datos para descargar.");
        return;
    }

    // Importar jsPDF y autoTable
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configuración inicial
    const title = `Reporte de Incidencias - Grupo: ${grupo}`;
    doc.setFontSize(18);
    doc.text(title, 10, 10);

    // Configurar datos de la tabla
    const tableHeaders = ["Matrícula", "Nombre", "Fecha", "Hora", "Estado"];
    const tableData = Array.from(rows).map(row => {
        return Array.from(row.querySelectorAll("td")).map(td => td.textContent.trim());
    });

    // Agregar tabla usando autoTable
    doc.autoTable({
        head: [tableHeaders],
        body: tableData,
        startY: 20, // La posición Y inicial de la tabla
        theme: "striped", // Tema visual: "striped", "grid", o "plain"
        headStyles: {
            fillColor: [41, 128, 185], // Azul oscuro para los encabezados
            textColor: 255, // Texto blanco
            fontStyle: "bold",
        },
        bodyStyles: {
            textColor: 50, // Texto negro
        },
        margin: { top: 20, left: 10, right: 10 }, // Márgenes del documento
        styles: {
            fontSize: 10, // Tamaño de fuente
            cellPadding: 5, // Espaciado interno de las celdas
        },
        didDrawPage: function (data) {
            // Agregar número de página en el pie de página
            const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
            doc.setFontSize(10);
            doc.text(`Página ${pageNumber}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        },
    });

    // Guardar PDF con nombre personalizado
    doc.save(`Reporte_Incidencias_${grupo}.pdf`);
};
