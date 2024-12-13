// Abre el modal al presionar "Generar"
document.getElementById("generateButton").onclick = function() {
    document.getElementById("myModal").style.display = "block";
};

// Cierra el modal al presionar la "X"
document.getElementById("closeModal").onclick = function() {
    document.getElementById("myModal").style.display = "none";
};

// Cierra el modal al hacer clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById("myModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

// Función para limpiar los campos del formulario
document.getElementById("clearButton").onclick = function() {
    document.getElementById("laboratorio").value = "";
    document.getElementById("estatus").value = "";
    document.getElementById("fecha-inicio").value = "";
    document.getElementById("fecha-fin").value = "";
    document.getElementById("hora-inicio").value = "";
    document.getElementById("hora-fin").value = "";
    document.getElementById("incidencia").value = "";
};
