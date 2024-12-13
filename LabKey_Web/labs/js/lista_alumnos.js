function toggleAttendance(box) {
    if (box.textContent === 'X') {
        box.textContent = '✓';
        box.classList.add('present');
    } else {
        box.textContent = 'X';
        box.classList.remove('present');
    }
}

function submitAttendance() {
    // Mostrar modal
    document.getElementById('modal').style.display = 'block';

    // Limpiar tabla
    const tableBody = document.getElementById('student-table-body');
    tableBody.innerHTML = '';
}

function closeModal() {
    // Ocultar modal
    document.getElementById('modal').style.display = 'none';
}

function filterByHour() {
    const hour = document.getElementById('hora').value;
    const tableBody = document.getElementById('student-table-body');

    // Generar datos simulados según la hora
    const data = [
        { nombre: 'Guadalupe Vargas Martínez ', matricula: '1721110652', correo: '1721110652@utectulancingo.edu.mx', carrera: 'Dessarrollo y Gestión de Software', grado: 'IDyGS101' },
        { nombre: 'Cristian Daniel Valeriano Hernández', matricula: '1721110069', correo: '1721110069@utectulancingo.edu.mx', carrera: 'Dessarrollo y Gestión de Software', grado: 'IDyGS101' },
        { nombre: 'José Alfredo Sorcia Cuellar', matricula: '1721110137', correo: '1721110137@utectulancingo.edu.mx', carrera: 'Dessarrollo y Gestión de Software', grado: 'IDyGS101' },
        
    ];

    // Llenar la tabla con datos de ejemplo (modificar con datos reales)
    tableBody.innerHTML = '';
    data.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.nombre}</td>
            <td>${student.matricula}</td>
            <td>${student.correo}</td>
            <td>${student.carrera}</td>
            <td>${student.grado}</td>
            <td><div class="attendance-box" onclick="toggleAttendance(this)">X</div></td>
        `;
        tableBody.appendChild(row);
    });
}
