import { LKURI } from '../js/properties/properties.js';
import { fetchAPI } from './properties/util.js';

// Definir labs en un ámbito global
let labs = [];

const labsPerPage = 4;
let currentPage = 1;
let filteredLabs = [...labs]; // Copia de labs para filtrar

const labListElement = document.getElementById("labList");
const searchBar = document.getElementById("searchBar");

// Modal y botones
const deleteModal = document.getElementById("deleteModal");
const labNameSpan = document.getElementById("labName");
const closeButton = document.querySelector(".close-button");
const cancelDeleteButton = document.getElementById("cancelDelete");
const confirmDeleteButton = document.getElementById("confirmDelete");

let labToDelete = null; // Almacena el laboratorio a eliminar

// Función para abrir el modal
 window.openModal = (labId) => {
    console.log("Abriendo modal para el laboratorio con ID:", labId);
    labToDelete = labs.find(lab => lab.id === labId); // Encontrar laboratorio por ID
    if (labToDelete) {
        labNameSpan.innerText = labToDelete.nombre; // Mostrar nombre en el modal
        deleteModal.style.display = "flex"; // Mostrar el modal
    } else {
        console.log("Laboratorio no encontrado");
    }
};

// Cerrar modal
const closeModal = () => {
    deleteModal.style.display = "none";
};

closeButton.addEventListener("click", closeModal);
cancelDeleteButton.addEventListener("click", closeModal);

// Confirmar eliminación
confirmDeleteButton.addEventListener("click", async () => {
    if (labToDelete) {
        try {
            const accessToken = sessionStorage.getItem("accessToken")
        const response = await fetchAPI(LKURI + "/labs/delete/"+labToDelete.id,
            {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
            }
        )
        if (response.code == 200) {
            console.log(`Lab with id ${labToDelete.id} successfully deleted`);
            reloadLabs();
            closeModal();
            return;
        }
        throw new Error()
        } catch (error) {
            closeModal();
            alert(`No se ha podido eliminar el laboratorio. Intentalo más tarde`)
            return;
        }
        
    }
});

// Renderizar laboratorios
const renderLabs = async (labsToShow, page) => {
    labListElement.innerHTML = "";
    const start = (page - 1) * labsPerPage;
    const end = start + labsPerPage;
    const labsOnPage = labsToShow.slice(start, end);


    labsOnPage.forEach(lab => {
        const labCard = `
            <div class="lab-card">
                <img class="lab-image" src='${lab.file}' alt='Imagen'>
                <div class="lab-details">
                    <p><strong>Laboratorio:</strong> ${lab.nombre}</p>
                    <p><strong>Abreviación:</strong> ${lab.abreviacion}</p>
                    <p><strong>Edificio:</strong> ${lab.edificio}</p>
                    <p><strong>Tipo de Laboratorio:</strong> ${lab.tipo}</p>
                </div>
                <div class="lab-actions">

                    <button class="edit-button" onclick="window.location.href='../html/editar_lab.html?id=${lab.id}'">Editar</button>
                    <button class="download-button" onclick="downloadLabPDF('${lab.id}')">Descargar QR</button>
                    <button class="delete-button" onclick="openModal('${lab.id}')">Eliminar</button>
                </div>

            </div>
        `;
        labListElement.innerHTML += labCard;
    });
};

// Filtrar laboratorios
const filterLabs = (searchText) => {
    return labs.filter(lab =>
        lab.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
        lab.abreviacion.toLowerCase().includes(searchText.toLowerCase())
    );
};

// Manejar paginación
const handlePagination = (labsToShow) => {
    const prevPageButton = document.getElementById("prevPage");
    const nextPageButton = document.getElementById("nextPage");
    const currentPageSpan = document.getElementById("currentPage");

    // Actualizar estado de los botones
    const updatePaginationButtons = () => {
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage * labsPerPage >= labsToShow.length;
    };

    // Vincular eventos de clic
    prevPageButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderLabs(labsToShow, currentPage);
            currentPageSpan.innerText = currentPage;
            updatePaginationButtons();
        }
    };

    nextPageButton.onclick = () => {
        if (currentPage * labsPerPage < labsToShow.length) {
            currentPage++;
            renderLabs(labsToShow, currentPage);
            currentPageSpan.innerText = currentPage;
            updatePaginationButtons();
        }
    };

    // Inicializar botones
    updatePaginationButtons();
};


// Búsqueda en tiempo real
searchBar.addEventListener("input", (e) => {
    const searchText = e.target.value;
    filteredLabs = filterLabs(searchText);
    currentPage = 1; // Reiniciar a la primera página cuando se busca
    renderLabs(filteredLabs, currentPage);
    handlePagination(filteredLabs);
});

// Inicializar la interfaz
document.addEventListener("DOMContentLoaded", async () => {
    await reloadLabs();
});

window.reloadLabs = async () => {
    try {
        const accessToken = sessionStorage.getItem("accessToken");
        labs = await fetchAPI(LKURI + "/labs/get-list", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
        });
        filteredLabs = [...labs]; // Sincronizar filteredLabs con labs
    } catch (error) {
        console.error("Error al cargar laboratorios:", error.message);
    }

    currentPage = 1; // Reiniciar a la primera página
    renderLabs(filteredLabs, currentPage); // Renderizar laboratorios
    handlePagination(filteredLabs); // Actualizar paginación
};


//PDF DECARGAR 
 window.downloadLabPDF = async (labId) => {
    console.log("Aña");
    const lab = labs.find(l => l.id === labId);
    if (!lab) {
        console.error("Laboratorio no encontrado");
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Encabezado con logos
    const universityLogo = "../../img/logo-2.png"; // Ruta del logo de la universidad
    const appLogo = "../../img/labkey_Mesa de trabajo 1.png"; // Ruta del logo de la aplicación

    const loadImage = async (src) => {
        const img = new Image();
        img.src = src;
        return new Promise((resolve) => {
            img.onload = () => resolve(img);
        });
    };

    try {
        const universityImg = await loadImage(universityLogo);
        const appImg = await loadImage(appLogo);

        // Insertar logos en el encabezado
        pdf.addImage(universityImg, "PNG", 20, 10, 30, 30); // Logo de la universidad (izquierda)
        pdf.addImage(appImg, "PNG", 160, 10, 30, 30); // Logo de la aplicación (derecha)
    } catch (error) {
        console.error("Error cargando los logos:", error);
    }

    // Título del PDF
    pdf.setFontSize(18);
    pdf.setTextColor(44, 62, 80); // Azul oscuro
    pdf.text("Información del Laboratorio", 105, 50, { align: "center" });

    pdf.setDrawColor(100); // Línea decorativa
    pdf.line(20, 55, 190, 55);

    // Información del laboratorio
    pdf.setFontSize(12);
    pdf.setTextColor(33, 47, 61);
    pdf.text(`Nombre: ${lab.nombre}`, 20, 70);
    pdf.text(`Abreviación: ${lab.abreviacion}`, 20, 80);
    pdf.text(`Edificio: ${lab.edificio}`, 20, 90);
    pdf.text(`Tipo de Laboratorio: ${lab.tipo}`, 20, 100);

    // Generar QR centrado
    const qrData = `
        Id: ${labId}
        Nombre: ${lab.nombre}
        Edificio: ${lab.edificio}
        Tipo: ${lab.tipo}
        Abreviación: ${lab.abreviacion}
    `;

    try {
        const qrCanvas = document.createElement("canvas");
        await QRCode.toCanvas(qrCanvas, qrData, { width: 600 });

        const qrImageData = qrCanvas.toDataURL("image/png");

        // Insertar el QR centrado
        pdf.addImage(qrImageData, "PNG", 55, 120, 100, 100); // QR de 50x50 px centrado
    } catch (error) {
        console.error("Error generando el código QR:", error);
    }

    // Descargar el PDF
    pdf.save(`Laboratorio_${lab.nombre}.pdf`);
};


