import { LKURI } from '../js/properties/properties.js';
import { fetchAPI } from './properties/util.js';

document.addEventListener("DOMContentLoaded", async function () {
    const edificioSelect = document.getElementById("edificio");
    const laboratorioSelect = document.getElementById("numero-laboratorio");
    const nombreInput = document.getElementById("nombre");
    const abreviacionInput = document.getElementById("abreviacion");
    const tipoSelect = document.getElementById("tipo-laboratorio");
    const imagePreview = document.querySelector(".image-preview");
    const comentarios = document.getElementById("comentarios")
    const labImageInput = document.getElementById("lab-image");
    const totalEquipos = document.getElementById('total-equipos');


    // Obtener el parámetro `id` de la URL
    const params = new URLSearchParams(window.location.search);
    const labId = params.get("id");
    if (!labId) {
        alert("No se encontró un ID válido para el laboratorio.");
        window.location.href = './gestion_labs1.html';
        return;
    }

    try {
        // Verificar que el usuario tiene un token válido
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
            window.location.href = './inicio_sesion.html';
            return;
        }

        // Consumir el endpoint para obtener los edificios y llenar los selects
        const edificios = await fetchAPI(`${LKURI}/edificios/list-all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${accessToken}`
            }
        });

        // Llenar el select de edificios
        edificioSelect.innerHTML = '';
        edificios.forEach(edificio => {
            const option = document.createElement("option");
            option.value = edificio.nombre;
            option.textContent = edificio.nombre;
            edificioSelect.appendChild(option);
        });

        // Manejar el cambio en el select de edificios
        edificioSelect.addEventListener("change", function () {
            const selectedEdificio = edificios.find(edificio => edificio.nombre === edificioSelect.value);
            laboratorioSelect.innerHTML = '';

            if (selectedEdificio && selectedEdificio.laboratorios) {
                selectedEdificio.laboratorios.forEach(lab => {
                    const labOption = document.createElement("option");
                    labOption.value = lab.numero;
                    labOption.textContent = `Laboratorio ${lab.numero}`;
                    laboratorioSelect.appendChild(labOption);
                });
            }
        });

        // Consumir el endpoint para obtener los datos del laboratorio
        const labData = await fetchAPI(`${LKURI}/labs/detail/${labId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${accessToken}`
            }
        });

        // Precargar los datos en el formulario
        abreviacionInput.value = labData.abreviacion || '';
        comentarios.value = labData.comment || '';
        totalEquipos.value = labData.capacidad || '0';
        tipoSelect.value = labData.tipo || '';
        edificioSelect.value = labData.edificio || '';

        // Disparar el evento `change` para cargar los laboratorios del edificio seleccionado
        edificioSelect.dispatchEvent(new Event("change"));

        // Seleccionar el laboratorio en el select de laboratorios
        laboratorioSelect.value = labData.numLaboratorio || '';

        // Precargar la imagen en formato Base64 si existe
        if (labData.file) {
            const fileDataUrl = `${labData.file}`;
            imagePreview.innerHTML = `<img src="${fileDataUrl}" alt="Preview" class="image-preview">`;
        } else {
            imagePreview.innerHTML = '<p>No hay imagen disponible</p>';
        }
    } catch (error) {
        console.error("Error al cargar los datos:", error.message);
        alert("No se pudieron cargar los datos. Intente nuevamente más tarde.");
    }
});

// Mostrar el modal de actualización cuando se presiona "Aceptar"
// document.getElementById('acceptEditButton').addEventListener('click', function () {
//     document.getElementById('updateModal').style.display = 'flex';
// });

// Mostrar el modal de confirmación de cancelación cuando se presiona "Cancelar"
document.getElementById('cancelEditButton').addEventListener('click', function () {
    document.getElementById('cancelModal').style.display = 'flex';
});

// Cerrar los modales
document.querySelectorAll('.close-button').forEach(function (btn) {
    btn.addEventListener('click', function () {
        document.getElementById('updateModal').style.display = 'none';
        document.getElementById('cancelModal').style.display = 'none';
    });
});

document.getElementById('acceptUpdateButton').addEventListener('click', function () {
    window.location.href = '../html/gestion_labs1.html'; // Redirige a la página deseada
});

// Redirigir a la lista de laboratorios al confirmar cancelación
document.getElementById('confirmCancelButton').addEventListener('click', function () {
    window.location.href = '../html/gestion_labs1.html';
});


// Funcionalidades existentes (Confirmación, modal, carga de imagen, etc.)
document.getElementById('acceptEditButton').addEventListener('click', async function () {
    const modal = document.getElementById('updateModal');
    const modalContent = document.querySelector('.modal-content h2');

    const edificio = document.getElementById('edificio').value;
    const numeroLaboratorio = document.getElementById('numero-laboratorio').value;
    const abreviacion = document.getElementById('abreviacion').value;
    const totalEquipos = document.getElementById('total-equipos').value;
    const tipoLaboratorio = document.getElementById('tipo-laboratorio').value;
    const comentarios = document.getElementById('comentarios').value;

    const labImageInput = document.getElementById('lab-image');
    let imageBase64 = null;

    if (labImageInput.files[0]) {
        const file = labImageInput.files[0];

        // Comprimir la imagen usando un canvas
        imageBase64 = await compressImage(file, 0.7, 1048487); // Calidad 0.7, límite 1 MB
    }

    const params = new URLSearchParams(window.location.search);
    const labId = params.get("id");

    const payload = {
        id: labId,
        edificio: edificio,
        numLaboratorio: numeroLaboratorio,
        abreviacion: abreviacion,
        capacidad: totalEquipos,
        tecnologia: tipoLaboratorio,
        comment: comentarios,
        image: imageBase64,
    };

    try {
        const accessToken = sessionStorage.getItem("accessToken");
        if (accessToken === null){
            window.location.href = './incio_sesion.html';
        }
        const response = await fetchAPI(`${LKURI}/labs/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify(payload),
        });

        if (response.code == 200) {
            modalContent.textContent = 'Laboratorio actualizado exitosamente';
            modal.style.display = 'flex';

            setTimeout(() => {
                window.location.href = '../html/gestion_labs1.html';
            }, 2000);
        } else {
            const errorData = await response.json();
            modalContent.textContent = `Error: ${errorData.message || 'No se pudo crear el laboratorio'}`;
            modal.style.display = 'flex';
        }
    } catch (error) {
        modalContent.textContent = `Error de conexión: ${error.message}`;
        modal.style.display = 'flex';
    }
});


// Función para comprimir la imagen
async function compressImage(file, quality, maxSize) {
    const img = document.createElement("img");
    const canvas = document.createElement("canvas");
    const reader = new FileReader();

    // Convertir la imagen a Base64 y cargarla en un elemento <img>
    return new Promise((resolve, reject) => {
        reader.onload = (event) => {
            img.src = event.target.result;
        };

        img.onload = () => {
            // Ajustar las dimensiones del canvas para mantener la relación de aspecto
            const MAX_WIDTH = 800; // Cambia según tus necesidades
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height && width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            } else if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            // Convertir a Base64 con calidad ajustada
            const compressedBase64 = canvas.toDataURL(file.type, quality);

            // Verificar el tamaño y ajustar la calidad si es necesario
            const base64Size = atob(compressedBase64.split(",")[1]).length;

            if (base64Size > maxSize) {
                console.warn("La imagen excede el tamaño máximo, reduciendo calidad...");
                resolve(compressImage(file, quality - 0.1, maxSize)); // Reducir calidad
            } else {
                resolve(compressedBase64);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

document.getElementById('lab-image').addEventListener('change', function (event) {
    const imagePreview = document.getElementById('imagePreview');
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" class="image-preview">`;
        };

        reader.readAsDataURL(file);
    } else {
        imagePreview.innerHTML = '<p>Imagen</p>';
    }
});


