let currentPage = 1;
let itemsPerPage = 5;
let data = [];

// Ejemplo de datos cargados
const usageData = [
    { Nombre: 'Juan Pérez', Matrícula: '12345', Grupo: 'Grupo 1', Carrera: 'Ingeniería', Edificio: 'A', Laboratorio: 'Lab 1', 'No. Equipo': '1', Hora: '08:00', Fecha: '2024-10-20' },
    { Nombre: 'María Gómez', Matrícula: '12346', Grupo: 'Grupo 2', Carrera: 'Ciencias', Edificio: 'B', Laboratorio: 'Lab 2', 'No. Equipo': '2', Hora: '09:00', Fecha: '2024-10-20' },
    { Nombre: 'Carlos López', Matrícula: '12347', Grupo: 'Grupo 3', Carrera: 'Idiomas', Edificio: 'A', Laboratorio: 'Lab 3', 'No. Equipo': '3', Hora: '10:00', Fecha: '2024-10-21' },
    // Agrega más datos para pruebas
];

// Cargar los datos iniciales
window.onload = function() {
    data = usageData;
    renderTable();
};

function renderTable() {
    const tableBody = document.getElementById('usageTableBody');
    tableBody.innerHTML = ''; // Limpiar la tabla

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach(row => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${row.Nombre}</td>
            <td>${row.Matrícula}</td>
            <td>${row.Grupo}</td>
            <td>${row.Carrera}</td>
            <td>${row.Edificio}</td>
            <td>${row.Laboratorio}</td>
            <td>${row['No. Equipo']}</td>
            <td>${row.Hora}</td>
            <td>${row.Fecha}</td>
        `;
        tableBody.appendChild(newRow);
    });

    document.getElementById('pageNumber').textContent = currentPage;
}

function nextPage() {
    if (currentPage * itemsPerPage < data.length) {
        currentPage++;
        renderTable();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function searchTable() {
    const dateInput = document.getElementById('searchDate').value;
    const timeInput = document.getElementById('searchTime').value;
    const groupInput = document.getElementById('searchGroup').value.toLowerCase();
    const careerInput = document.getElementById('searchCareer').value.toLowerCase();
    const labInput = document.getElementById('searchLab').value.toLowerCase();

    data = usageData.filter(row => 
        (row.Fecha.includes(dateInput)) &&
        (row.Hora.includes(timeInput)) &&
        (row.Grupo.toLowerCase().includes(groupInput)) &&
        (row.Carrera.toLowerCase().includes(careerInput)) &&
        (row.Laboratorio.toLowerCase().includes(labInput))
    );
    currentPage = 1; // Reiniciar la paginación al realizar una búsqueda
    renderTable();
}
