import { LKURI } from '../js/properties/properties.js';
import { fetchAPI } from './properties/util.js';

let carreras = [];
let grupos = [];
let carrerasCsv = [];
let gruposCsv = [];

// Modal
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const closeModalBtn = document.getElementById('closeModalBtn');
const closeModalButton = document.querySelector('.close-button');

// Eventos para cerrar el modal
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});
closeModalButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Función para cargar las carreras desde la API
async function cargarCarrerasDesdeAPI() {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
        window.location.href = './inicio_sesion.html';
        return;
    }
    try {
        const response = await fetchAPI(`${LKURI}/carreras/get-list`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${accessToken}`
            }
        });
        if (Array.isArray(response)) {
            carreras = response; // Guardar la respuesta completa
            renderCarreras(); // Llenar tabla y select con carreras
        } else {
            console.error('La respuesta de la API no es un array');
        }
    } catch (error) {
        console.error('Error al cargar las carreras:', error);
    }
}

// Llenar el select y la tabla con las carreras
function renderCarreras() {
    const tableBody = document.getElementById('tableCarrerasBody');
    const selectCarrera = document.getElementById('selectCarrera');

    // Limpiar el contenido previo
    tableBody.innerHTML = '';
    selectCarrera.innerHTML = '<option value="">Selecciona una carrera</option>'; // Resetear select

    // Agregar cada carrera a la tabla y al select
    carreras.forEach(carrera => {
        const row = `<tr><td>${carrera.nombre}</td></tr>`;
        tableBody.innerHTML += row;

        const option = `<option value="${carrera.id}">${carrera.nombre}</option>`;
        selectCarrera.innerHTML += option;
    });
}

// Función para cargar grupos según la carrera seleccionada
async function cargarGruposPorCarrera(carreraId) {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
        window.location.href = './inicio_sesion.html';
        return;
    }

    try {
        const response = await fetchAPI(`${LKURI}/carreras/list-grupos/${carreraId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${accessToken}`
            }
        });

        if (Array.isArray(response)) {
            renderGruposApi(response); // Llenar la tabla de grupos con los datos obtenidos
        } else {
            console.error('La respuesta de la API no es un array');
        }

    } catch (error) {
        console.error('Error al cargar los grupos:', error);
    }
}

// Renderizar los grupos en la tabla
function renderGruposApi(gruposData) {
    const tableBody = document.getElementById('tableGruposBody');

    // Limpiar el contenido previo
    tableBody.innerHTML = '';

    // Agregar cada grupo a la tabla
    gruposData.forEach(grupo => {
        const row = `
            <tr>
                <td>${grupo.idCarrera}</td>
                <td>${grupo.nombre}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Evento para manejar el cambio en el select de carreras
document.getElementById('selectCarrera').addEventListener('change', function () {
    const selectedCarreraId = this.value;

    if (selectedCarreraId) {
        cargarGruposPorCarrera(selectedCarreraId); // Llamar a la función para cargar grupos
    } else {
        // Limpiar la tabla si no hay carrera seleccionada
        document.getElementById('tableGruposBody').innerHTML = '';
    }
});

// Cargar Carreras al iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarCarrerasDesdeAPI();
});

// Cargar Carreras desde CSV
document.getElementById('uploadCarrerasBtn').addEventListener('click', function () {
    const fileInput = document.getElementById('archivoCarreras');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result;
            processCarrerasCSV(content);
        };
        reader.readAsText(file);
    } else {
        alert('Por favor, selecciona un archivo para carreras.');
    }
});

// Procesar CSV de carreras
function processCarrerasCSV(content) {
    const rows = content.split("\n");
    carrerasCsv = rows.slice(1).map(row => row.trim()).filter(row => row !== ""); // Eliminar filas vacías
    renderCarrerasFromCSV();
    document.getElementById('confirmCarrerasBtn').disabled = carrerasCsv.length === 0;

}

// Renderizar carreras desde CSV
function renderCarrerasFromCSV() {
    const tableBody = document.getElementById('tableCarrerasBody');

    // Limpiar el contenido previo
    tableBody.innerHTML = '';

    // Agregar cada carrera a la tabla y al select
    carrerasCsv.forEach(carrera => {
        const row = `<tr><td>${carrera}</td></tr>`;
        tableBody.innerHTML += row;
    });
}

// Confirmar Carreras
document.getElementById('confirmCarrerasBtn').addEventListener('click', async () => {
    try {
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
            window.location.href = './inicio_sesion.html';
            return;
        }

        const apiResponse = await fetchAPI(`${LKURI}/carreras/save-new-careers`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify(carrerasCsv)
        });

        if (apiResponse) {
            if (apiResponse.code == 200) {
                modalTitle.textContent = 'Confirmación de Carreras';
                modalMessage.textContent = `Se han confirmado ${carrerasCsv.length} carreras.`;
                modal.style.display = 'flex';
                carrerasCsv = [];
                location.reload(true);
                return;
            }
            throw new Error("Error al cargar las carreras. Inténtalo más tarde");
        }

    } catch (error) {
        console.log(error.message);
        alert("Error al cargar las carreras");
    }
});

// Cargar Grupos desde CSV
document.getElementById('uploadGruposBtn').addEventListener('click', function () {
    const fileInput = document.getElementById('archivoGrupos');
    const file = fileInput.files[0];
    const selectedCarreraId = document.getElementById('selectCarrera').selectedOptions[0].innerHTML

    if (!selectedCarreraId) {
        alert('Por favor, selecciona una carrera antes de cargar grupos.');
        return;
    }

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result;
            processGruposCSV(content, selectedCarreraId);
        };
        reader.readAsText(file);
    } else {
        alert('Por favor, selecciona un archivo para grupos.');
    }
});

// Procesar CSV de grupos
function processGruposCSV(content, carreraId) {
    const rows = content.split("\n");
    const nuevosGrupos = rows.slice(1).map(row => row.trim()).filter(row => row !== ""); // Eliminar filas vacías

    nuevosGrupos.forEach(grupo => {
        gruposCsv.push({ carrera: carreraId, grupo });
    });

    renderGrupos();
    document.getElementById('confirmGruposBtn').disabled = gruposCsv.length === 0;
}

// Renderizar los grupos en la tabla
function renderGrupos() {
    const tableBody = document.getElementById('tableGruposBody');

    tableBody.innerHTML = '';

    gruposCsv.forEach(item => {
        const row = `
           <tr>
               <td>${item.carrera}</td>
               <td>${item.grupo}</td>
           </tr>
       `;
        tableBody.innerHTML += row;
    });
}

// Confirmar Grupos
document.getElementById('confirmGruposBtn').addEventListener('click', async () => {
    try {
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
            window.location.href = './inicio_sesion.html';
            return;
        }

        const payload = {
            idCarrera: document.getElementById('selectCarrera').value,
            grupos: gruposCsv.map(grupo => grupo.grupo)
        }

        console.log(JSON.stringify(payload));


        const apiResponse = await fetchAPI(`${LKURI}/carreras/save-groups`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify(payload)
        });

        if (apiResponse) {
            if (apiResponse.code == 201) {
                modalTitle.textContent = 'Confirmación de Grupos';
                modalMessage.textContent = `Se han confirmado ${gruposCsv.length} grupos.`;
                modal.style.display = 'flex';
                gruposCsv = [];
                location.reload(true);
                return;
            }
            throw new Error("Error al cargar las grupos. Inténtalo más tarde");
        }

    } catch (error) {
        console.log(error.message);
        alert("Error al cargar las carreras");
    }


});