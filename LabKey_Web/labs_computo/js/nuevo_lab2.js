import { LKURI } from '../js/properties/properties.js';
import { fetchAPI } from './properties/util.js';

document.addEventListener("DOMContentLoaded", async function () {
    const edificioSelect = document.getElementById("edificio");
    const laboratorioSelect = document.getElementById("numero-laboratorio");
    const abreviacionInput = document.getElementById("abreviacion"); // Campo de abreviación

    edificioSelect.innerHTML = "";

    try {
        // Consumir el endpoint para obtener los edificios y laboratorios
        const accessToken = sessionStorage.getItem("accessToken");
        if (accessToken === null) {
            window.location.href = './incio_sesion.html';
        }
        const edificios = await fetchAPI(`${LKURI}/edificios/list-all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${accessToken}`
            }
        });

        // Llenar el select de edificios
        edificios.forEach(edificio => {
            const option = document.createElement("option");
            option.value = edificio.nombre;
            option.textContent = edificio.nombre;
            edificioSelect.appendChild(option);
        });

        // Manejar cambios en el select de edificios
        edificioSelect.addEventListener("change", function () {
            const selectedEdificioId = edificioSelect.value;

            // Limpiar el select de laboratorios
            laboratorioSelect.innerHTML = "";

            // Buscar los laboratorios del edificio seleccionado
            const selectedEdificio = edificios.find(edificio => edificio.nombre === selectedEdificioId);
            if (selectedEdificio && selectedEdificio.laboratorios) {
                selectedEdificio.laboratorios.forEach(lab => {
                    const labOption = document.createElement("option");
                    labOption.value = lab.numero;
                    labOption.textContent = `Laboratorio ${lab.numero}`;
                    laboratorioSelect.appendChild(labOption);
                });
            }

            // Actualizar la abreviación cuando cambia el edificio
            actualizarAbreviacion();
        });

        // Disparar el evento de cambio para preseleccionar el primer edificio y sus laboratorios
        edificioSelect.dispatchEvent(new Event("change"));
    } catch (error) {
        console.error("Error al cargar los edificios y laboratorios:", error.message);
        alert("No se pudieron cargar los edificios y laboratorios. Por favor, intente nuevamente más tarde.");
    }

    // Manejar cambios en el select de laboratorios y actualizar la abreviación
    laboratorioSelect.addEventListener("change", actualizarAbreviacion);

    // Función para actualizar la abreviación automáticamente
    function actualizarAbreviacion() {
        const edificio = edificioSelect.value; // Obtener valor del edificio
        const laboratorio = laboratorioSelect.value; // Obtener valor del laboratorio

        // Construir la abreviación solo si ambos valores están seleccionados
        if (edificio && laboratorio) {
            abreviacionInput.value = `${edificio}${laboratorio}`; // Formato Edificio + Número Laboratorio
        }
    }
});

// Funcionalidades existentes (Confirmación, modal, carga de imagen, etc.)
document.getElementById('confirmButton').addEventListener('click', async function () {
    const modal = document.getElementById('modal');
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

    const payload = {
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
        if (accessToken === null) {
            window.location.href = './incio_sesion.html';
        }
        const response = await fetchAPI(`${LKURI}/labs/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify(payload),
        });

        if (response.code == 201) {
            modalContent.textContent = 'Laboratorio creado exitosamente';
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

document.querySelector('.close-button').addEventListener('click', function () {
    document.getElementById('modal').style.display = 'none';
});
document.getElementById('acceptButton').addEventListener('click', function () {
    document.getElementById('modal').style.display = 'none';
});

document.getElementById('lab-image').addEventListener('change', function (event) {
    const imagePreview = document.getElementById('imagePreview');
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" class="preview-image">`;
        };

        reader.readAsDataURL(file);
    } else {
        imagePreview.innerHTML = '<p>Imagen</p>';
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
