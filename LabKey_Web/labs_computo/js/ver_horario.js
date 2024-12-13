let currentPage = 1;
let itemsPerPage = 5;
let data = [];

// Ejemplo de datos cargados
const scheduleData = [
    { Grupo: 'Grupo 1', Laboratorio: 'Lab Computo A', Horario: '08:00 - 10:00', Día: 'Lunes' },
    { Grupo: 'Grupo 2', Laboratorio: 'Lab Computo B', Horario: '10:00 - 12:00', Día: 'Martes' },
    { Grupo: 'Grupo 3', Laboratorio: 'Lab Computo C', Horario: '14:00 - 16:00', Día: 'Miércoles' },
    { Grupo: 'Grupo 4', Laboratorio: 'Lab Computo D', Horario: '08:00 - 10:00', Día: 'Jueves' },
    { Grupo: 'Grupo 5', Laboratorio: 'Lab Computo E', Horario: '12:00 - 14:00', Día: 'Viernes' },
    // Agrega más datos para pruebas
];

// Cargar los datos iniciales
window.onload = function() {
    data = scheduleData;
    renderTable();
};

function renderTable() {
    const tableBody = document.getElementById('scheduleTableBody');
    tableBody.innerHTML = ''; // Limpiar la tabla

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach(row => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${row.Grupo}</td>
            <td>${row.Laboratorio}</td>
            <td>${row.Horario}</td>
            <td>${row.Día}</td>
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
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    data = scheduleData.filter(row => 
        row.Grupo.toLowerCase().includes(searchInput) || 
        row.Laboratorio.toLowerCase().includes(searchInput)
    );
    currentPage = 1; // Reiniciar la paginación al realizar una búsqueda
    renderTable();
}
