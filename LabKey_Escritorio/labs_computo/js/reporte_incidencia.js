let reportData = [
    { fecha: '2024-11-28', laboratorio: 'G1', edificio: 'Edificio G', horaIncidencia: '10:00', tipoIncidencia: 'Accesorios defectuosos', estado: 'Ing. Cristian Daniel Valeriano' },
    { fecha: '2024-11-28', laboratorio: 'G1', edificio: 'Edificio G', horaIncidencia: '11:00', tipoIncidencia: 'Software', estado: 'Ing. Cristian Daniel Valeriano' },
    { fecha: '2024-11-29', laboratorio: 'G1', edificio: 'Edificio G', horaIncidencia: '9:00', tipoIncidencia: 'Hardware', estado: 'Ing. Cristian Daniel Valeriano' },
    { fecha: '2024-11-29', laboratorio: 'G1', edificio: 'Edificio G', horaIncidencia: '11:00', tipoIncidencia: 'Software', estado: 'Ing. Cristian Daniel Valeriano' },
    { fecha: '2024-11-30', laboratorio: 'G1', edificio: 'Edificio G', horaIncidencia: '2:00', tipoIncidencia: 'Hardware', estado: 'Ing. Cristian Daniel Valeriano' },
    { fecha: '2024-12-30', laboratorio: 'G1', edificio: 'Edificio G', horaIncidencia: '6:00', tipoIncidencia: 'Audio y Video', estado: 'Ing. Cristian Daniel Valeriano' },
    { fecha: '2024-12-30', laboratorio: 'G1', edificio: 'Edificio G', horaIncidencia: '10:00', tipoIncidencia: 'Hardware', estado: 'Ing. Cristian Daniel Valeriano' },
    { fecha: '2024-12-01', laboratorio: 'G1', edificio: 'Edificio G', horaIncidencia: '11:00', tipoIncidencia: 'Software', estado: 'Ing. Cristian Daniel Valeriano' },
    { fecha: '2024-12-01', laboratorio: 'G1', edificio: 'Edificio G', horaIncidencia: '12:00', tipoIncidencia: 'Accesorios defectuosos', estado: 'Ing. Cristian Daniel Valeriano' },
    { fecha: '2024-12-01', laboratorio: 'G1', edificio: 'Edificio G', horaIncidencia: '8:00', tipoIncidencia: 'Audio y Video', estado: 'Ing. Cristian Daniel Valeriano' },
    { fecha: '2024-12-02', laboratorio: 'G1', edificio: 'Edificio G', horaIncidencia: '11:00', tipoIncidencia: 'Hardware', estado: 'Ing. Cristian Daniel Valeriano' },
    { fecha: '2024-12-09', laboratorio: 'G1', edificio: 'Edificio G', horaIncidencia: '1:00', tipoIncidencia: 'Audio y Video', estado: 'Ing. Cristian Daniel Valeriano' },
    // Más datos de ejemplo
];
let itemsPerPage = 5;
let currentPage = 1;

function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // Limpiar el contenido previo

    let start = (currentPage - 1) * itemsPerPage;
    let end = start + itemsPerPage;
    let paginatedData = reportData.slice(start, end);

    paginatedData.forEach(item => {
        let row = `
            <tr>
                <td>${item.fecha}</td>
                <td>${item.laboratorio}</td>
                <td>${item.edificio}</td>
                <td>${item.horaIncidencia}</td>
                <td>${item.tipoIncidencia}</td>
                <td>${item.estado}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

document.getElementById('generarBtn').addEventListener('click', function() {
    const reportTableContainer = document.getElementById('reportTableContainer');
    reportTableContainer.style.display = 'block'; // Mostrar la tabla

    // Renderizar la tabla
    renderTable();
});

document.getElementById('nextPage').addEventListener('click', function() {
    if (currentPage * itemsPerPage < reportData.length) {
        currentPage++;
        renderTable();
        document.getElementById('currentPage').textContent = currentPage;
    }
});

document.getElementById('prevPage').addEventListener('click', function() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
        document.getElementById('currentPage').textContent = currentPage;
    }
});

// Descargar en Excel (Simulación)
document.getElementById('downloadExcel').addEventListener('click', function() {
    // Crear un archivo CSV simulado
    let csvContent = "data:text/csv;charset=utf-8," 
        + "Fecha,Laboratorio,Edificio,Hora de Incidencia,Tipo de Incidencia,Estado\n" 
        + reportData.map(item => `${item.fecha},${item.laboratorio},${item.edificio},${item.horaIncidencia},${item.tipoIncidencia},${item.estado}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_incidencias.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Descargar en PDF (Simulación)
document.getElementById('downloadPdf').addEventListener('click', function() {
    const pdfContent = `Reporte de Incidencias\n\n` 
        + reportData.map(item => `${item.fecha} - ${item.laboratorio} - ${item.edificio} - ${item.horaIncidencia} (${item.tipoIncidencia}) - ${item.estado}`).join("\n");

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = 'reporte_incidencias.pdf';
    link.click();
});