document.getElementById('loadBtn').addEventListener('click', function() {
    const fileInput = document.getElementById('excelFile');
    const file = fileInput.files[0];

    if (!file) {
        alert("Por favor selecciona un archivo.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Lee la primera hoja (único horario)
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        populateTable(jsonData);
    };

    reader.readAsArrayBuffer(file);
});

function populateTable(data) {
    const tableBody = document.getElementById('previewTableBody');
    tableBody.innerHTML = ''; // Limpiar la tabla antes de llenarla

    // Llena la tabla con los datos
    data.slice(1).forEach(row => { // Omite el encabezado de la primera fila
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${row[0] || ''}</td>
            <td>${row[1] || ''}</td>
            <td>${row[2] || ''}</td>
            <td>${row[3] || ''}</td>
            <td>${row[4] || ''}</td>
            <td>${row[5] || ''}</td>
        `;
        tableBody.appendChild(newRow);
    });

    document.getElementById('tableContainer').style.display = 'block'; // Mostrar la tabla
}

document.getElementById('uploadBtn').addEventListener('click', function() {
    alert('Horario cargado correctamente.');
    // Aquí puedes agregar la funcionalidad para enviar los datos al servidor
});

document.getElementById('cancelBtn').addEventListener('click', function() {
    if (confirm("¿Estás seguro que deseas cancelar?")) {
        document.getElementById('tableContainer').style.display = 'none';
        document.getElementById('excelFile').value = ''; // Limpiar el archivo cargado
    }
});
