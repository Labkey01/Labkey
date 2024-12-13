import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { firebaseConfig } from "../js/properties/firebaseConfig.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let itemsPerPage = 5;
let currentPage = 1;
let encargadoToEdit = null;
let encargadoToDelete = null;
let encargados = [];

async function fetchEncargados() {
    const querySnapshot = await getDocs(collection(db, 'administradores'));
    encargados = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderTable();
}

function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    let start = (currentPage - 1) * itemsPerPage;
    let end = start + itemsPerPage;
    let paginatedEncargados = encargados.slice(start, end);

    paginatedEncargados.forEach((encargado, index) => {
        let row = `
            <tr>
                <td>${encargado.nombre}</td>
                <td>${encargado.area}</td>
                <td>${encargado.correo}</td>
                <td>
                    <button class="edit-button" onclick="openEditModal(${start + index})">Editar</button>
                    <button class="delete-button" onclick="openDeleteModal(${start + index})">Eliminar</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    // Actualizar el texto de la paginación
    const totalPages = Math.ceil(encargados.length / itemsPerPage);
    document.getElementById('currentPage').textContent = `${currentPage}/${totalPages}`;
}

// Paginación
document.getElementById('nextPage').addEventListener('click', function () {
    if (currentPage * itemsPerPage < encargados.length) {
        currentPage++;
        renderTable();
    }
});

document.getElementById('prevPage').addEventListener('click', function () {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
});

// Agregar encargado
document.getElementById('addBtn').addEventListener('click', async function () {
    const nombre = document.getElementById('nombre').value;
    const area = document.getElementById('area').value;
    const correo = document.getElementById('correo').value;
    const contraseña = document.getElementById('contraseña').value;

    if (contraseña.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    if (encargados.some(encargado => encargado.correo === correo)) {
        alert('El correo ya está registrado. Por favor usa otro correo.');
        return;
    }

    const nuevoEncargado = { nombre, area, correo, contraseña };

    try {
        // Guardar en Firestore
        const docRef = await addDoc(collection(db, 'administradores'), nuevoEncargado);

        // Actualizar lista local y renderizar
        encargados.push({ id: docRef.id, ...nuevoEncargado });
        renderTable();

        // Limpiar formulario
        document.getElementById('nombre').value = '';
        document.getElementById('area').value = '';
        document.getElementById('correo').value = '';
        document.getElementById('contraseña').value = '';

        // Mostrar el modal de confirmación
        document.getElementById('modal').style.display = 'flex';
    } catch (error) {
        console.error('Error al agregar encargado:', error);
    }
});

// Cerrar los modales
document.querySelectorAll('.close-button').forEach(button => {
    button.addEventListener('click', function () {
        document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    });
});

document.getElementById('closeModalBtn').addEventListener('click', function () {
    document.getElementById('modal').style.display = 'none';
});

// Abrir modal para editar
function openEditModal(index) {
    encargadoToEdit = index;
    const encargado = encargados[encargadoToEdit];
    document.getElementById('editNombre').value = encargado.nombre;
    document.getElementById('editArea').value = encargado.area;
    document.getElementById('editCorreo').value = encargado.correo;
    document.getElementById('editContraseña').value = encargado.contraseña || '';
    document.getElementById('editModal').style.display = 'flex';
}

// Guardar cambios en edición
document.getElementById('saveEditBtn').addEventListener('click', async function () {
    const nombre = document.getElementById('editNombre').value;
    const area = document.getElementById('editArea').value;
    const correo = document.getElementById('editCorreo').value;
    const contraseña = document.getElementById('editContraseña').value;

    if (contraseña.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    try {
        const encargadoRef = doc(db, 'administradores', encargados[encargadoToEdit].id);
        await updateDoc(encargadoRef, { nombre, area, correo, contraseña });

        encargados[encargadoToEdit] = { ...encargados[encargadoToEdit], nombre, area, correo, contraseña };
        renderTable();

        // Mostrar alerta de confirmación
        alert('Encargado editado correctamente');
    } catch (error) {
        console.error('Error al editar encargado:', error);
    }

    document.getElementById('editModal').style.display = 'none';
});

// Abrir modal para eliminar
function openDeleteModal(index) {
    encargadoToDelete = index;
    document.getElementById('deleteModal').style.display = 'flex';
}

// Confirmar eliminación
document.getElementById('confirmDeleteBtn').addEventListener('click', async function () {
    try {
        const encargadoRef = doc(db, 'administradores', encargados[encargadoToDelete].id);
        await deleteDoc(encargadoRef);

        encargados.splice(encargadoToDelete, 1);
        renderTable();
    } catch (error) {
        console.error('Error al eliminar encargado:', error);
    }

    document.getElementById('deleteModal').style.display = 'none';
});

// Cancelar eliminación
document.getElementById('cancelDeleteBtn').addEventListener('click', function () {
    document.getElementById('deleteModal').style.display = 'none';
});

// Cargar y renderizar encargados al inicio
fetchEncargados();

window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
