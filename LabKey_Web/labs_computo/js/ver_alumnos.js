let alumnos = [
    { nombre: 'Alumno 1', matricula: '12345', correo: 'alumno1@ejemplo.com' },
    { nombre: 'Alumno 2', matricula: '12346', correo: 'alumno2@ejemplo.com' },
    { nombre: 'Alumno 3', matricula: '12347', correo: 'alumno3@ejemplo.com' }
];
let itemsPerPage = 5;
let currentPage = 1;
let currentAlumno = null;

function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    let start = (currentPage - 1) * itemsPerPage;
    let end = start + itemsPerPage;
    let paginatedAlumnos = alumnos.slice(start, end);

    paginatedAlumnos.forEach((alumno, index) => {
        let row = `
            <tr>
                <td>${alumno.nombre}</td>
                <td>${alumno.matricula}</td>
                <td>${alumno.correo}</td>
                <td>
                    <button class="action-button edit" onclick="openEditModal(${start + index})">Editar</button>
                    <button class="action-button delete" onclick="openDeleteModal(${start + index})">Eliminar</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

document.getElementById('nextPage').addEventListener('click', function() {
    if (currentPage * itemsPerPage < alumnos.length) {
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

// Función para abrir el modal de edición
function openEditModal(index) {
    currentAlumno = index;
    document.getElementById('editNombre').value = alumnos[index].nombre;
    document.getElementById('editCorreo').value = alumnos[index].correo;
    document.getElementById('editModal').style.display = 'flex';
}

// Función para abrir el modal de eliminación
function openDeleteModal(index) {
    currentAlumno = index;
    document.getElementById('deleteModal').style.display = 'flex';
}

// Guardar los cambios editados
document.getElementById('saveEditBtn').addEventListener('click', function() {
    let nombre = document.getElementById('editNombre').value;
    let correo = document.getElementById('editCorreo').value;

    alumnos[currentAlumno].nombre = nombre;
    alumnos[currentAlumno].correo = correo;

    renderTable();
    document.getElementById('editModal').style.display = 'none';
});

// Eliminar alumno
document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
    alumnos.splice(currentAlumno, 1);
    renderTable();
    document.getElementById('deleteModal').style.display = 'none';
});

// Cerrar modales
document.getElementById('closeEditModal').addEventListener('click', function() {
    document.getElementById('editModal').style.display = 'none';
});

document.getElementById('closeDeleteModal').addEventListener('click', function() {
    document.getElementById('deleteModal').style.display = 'none';
});

// Renderizar la tabla inicialmente
renderTable();

// Cerrar modal de edición al hacer clic en la "X"
document.getElementById('closeEditModal').addEventListener('click', function() {
    document.getElementById('editModal').style.display = 'none';
});

// Cerrar modal de eliminación al hacer clic en la "X"
document.getElementById('closeDeleteModal').addEventListener('click', function() {
    document.getElementById('deleteModal').style.display = 'none';
});

