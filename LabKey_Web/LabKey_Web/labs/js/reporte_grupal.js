document.getElementById("generateButton").onclick = function () {
    const section = document.getElementById("report-table-section");
    const tbody = document.getElementById("report-table").querySelector("tbody");

    // Datos de ejemplo
    const students = [
        { matricula: "12345", nombre: "Cristian Daniel Valeriano Hernández", fecha: "2024-12-01", hora: "08:00", asistencia: "Presente" },
        { matricula: "12346", nombre: "José Alfredo Sorcia Cuellar", fecha: "2024-12-02", hora: "10:00", asistencia: "Ausente" },
        { matricula: "12347", nombre: "Guadalupe Vargas Martínez", fecha: "2024-12-03", hora: "12:00", asistencia: "Presente" },
    ];

    // Limpiar el tbody antes de añadir datos nuevos
    tbody.innerHTML = "";

    // Crear filas en la tabla
    students.forEach(student => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${student.matricula}</td>
            <td>${student.nombre}</td>
            <td>${student.fecha}</td>
            <td>${student.hora}</td>
            <td>${student.asistencia}</td>
        `;
        tbody.appendChild(row);
    });

    // Mostrar la tabla
    section.classList.remove("hidden");
};

document.getElementById("downloadButton").onclick = function () {
    const table = document.getElementById("report-table");
    const rows = Array.from(table.rows);

    // Convertir tabla a formato CSV
    let csvContent = "";
    rows.forEach(row => {
        const cells = Array.from(row.cells).map(cell => `"${cell.textContent}"`);
        csvContent += cells.join(",") + "\n";
    });

    // Crear un archivo Blob con el contenido CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    // Crear un enlace para descargar el archivo
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte_grupal.csv";
    a.click();

    // Liberar el objeto URL
    URL.revokeObjectURL(url);
};
