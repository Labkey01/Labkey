let reportData = [
    { fecha: '2024-11-28', laboratorio: 'G1', horaInicio: '12:33', horaFin: '12:35', actividad: 'Cristian Daniel Valeriano Hernández' },
    { fecha: '2024-11-28', laboratorio: 'G1', horaInicio: '09:58', horaFin: '9:59', actividad: 'José Alfredo Sorcia Cuellar' },
    { fecha: '2024-11-28', laboratorio: 'G1', horaInicio: '08:22', horaFin: '08:30', actividad: 'Guadalupe Vargas Martínez' },
    { fecha: '2024-11-28', laboratorio: 'G2', horaInicio: '09:35', horaFin: '9:38', actividad: 'Guadalupe Vargas Martínez' },
    { fecha: '2024-11-28', laboratorio: 'G2', horaInicio: '08:10', horaFin: '8:12', actividad: 'José Alfredo Sorcia Cuellar' },
    { fecha: '2024-12-01', laboratorio: 'G2', horaInicio: '8:23', horaFin: '8:25', actividad: 'José Alfredo Sorcia Cuellar' },
    { fecha: '2024-12-01', laboratorio: 'G2', horaInicio: '6:01', horaFin: '6:02', actividad: 'José Alfredo Sorcia Cuellar' },
    { fecha: '2024-12-01', laboratorio: 'G1', horaInicio: '4:09', horaFin: '4:11', actividad: 'Cristian Daniel Valeriano Hernández' },
    { fecha: '2024-12-02', laboratorio: 'G1', horaInicio: '4:40', horaFin: '4:50', actividad: 'Cristian Daniel Valeriano Hernández' },
    { fecha: '2024-12-03', laboratorio: 'G1', horaInicio: '3:04', horaFin: '3:10', actividad: 'Cristian Daniel Valeriano Hernández' },
    { fecha: '2024-12-04', laboratorio: 'G2', horaInicio: '5:03', horaFin: '5:04', actividad: 'Cristian Daniel Valeriano Hernández' },
    { fecha: '2024-12-09', laboratorio: 'G2', horaInicio: '2:10', horaFin: '2:12', actividad: 'Cristian Daniel Valeriano Hernández' },
    { fecha: '2024-12-09', laboratorio: 'G2', horaInicio: '2:20', horaFin: '2:30', actividad: 'Cristian Daniel Valeriano Hernández' },
    { fecha: '2024-12-09', laboratorio: 'G2', horaInicio: '05:01', horaFin: '5:07', actividad: 'Cristian Daniel Valeriano Hernández' },
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
                <td>${item.horaInicio}</td>
                <td>${item.horaFin}</td>
                <td>${item.actividad}</td>
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
        + "Fecha,Laboratorio,Hora de inicio,Hora de fin,Actividad\n" 
        + reportData.map(item => `${item.fecha},${item.laboratorio},${item.horaInicio},${item.horaFin},${item.actividad}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_uso_laboratorio.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Descargar en PDF (Simulación)
document.getElementById('downloadPdf').addEventListener('click', function() {
    const pdfContent = `Reporte de Uso de Laboratorio\n\n` 
        + reportData.map(item => `${item.fecha} - ${item.laboratorio} - ${item.horaInicio} a ${item.horaFin} (${item.actividad})`).join("\n");

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = 'reporte_uso_laboratorio.pdf';
    link.click();
});
