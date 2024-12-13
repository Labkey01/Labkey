
let enableMode = false;
let disableMode = false;
let places = document.querySelectorAll('.place');
let acceptBtn = document.getElementById('acceptBtn');
let messageDiv = document.getElementById('message');
let modal = document.getElementById('modal');
let modalMessage = document.getElementById('modalMessage');
let closeModalBtn = document.getElementById('closeModalBtn');

// Inicialmente deshabilitar el botón de "Aceptar"
acceptBtn.disabled = true;

// Modo habilitar o deshabilitar
document.getElementById('enableBtn').addEventListener('click', function() {
    enableMode = true;
    disableMode = false;
    messageDiv.textContent = '';
    acceptBtn.disabled = false; // Habilitar el botón de "Aceptar"
});

document.getElementById('disableBtn').addEventListener('click', function() {
    disableMode = true;
    enableMode = false;
    messageDiv.textContent = '';
    acceptBtn.disabled = false; // Habilitar el botón de "Aceptar"
});

// Acción al hacer clic en las posiciones
places.forEach(place => {
    place.addEventListener('click', function() {
        if (disableMode) {
            if (!place.classList.contains('disabled')) {
                place.classList.add('disabled');
                messageDiv.textContent = '';
            } else {
                messageDiv.textContent = 'El lugar ya está inhabilitado.';
            }
        } else if (enableMode) {
            if (place.classList.contains('disabled')) {
                place.classList.remove('disabled');
                messageDiv.textContent = '';
            } else {
                messageDiv.textContent = 'El lugar ya está habilitado.';
            }
        }
    });
});

// Mostrar el modal al hacer clic en "Aceptar"
acceptBtn.addEventListener('click', function() {
    if (enableMode) {
        modalMessage.textContent = 'Equipos habilitados correctamente';
    } else if (disableMode) {
        modalMessage.textContent = 'Equipos deshabilitados correctamente';
    }
    modal.style.display = 'flex';
    acceptBtn.disabled = true; // Deshabilitar el botón de "Aceptar" después de confirmar
});

// Cerrar el modal al hacer clic en el botón "Aceptar" o la "X"
closeModalBtn.addEventListener('click', closeModal);
document.querySelector('.close-button').addEventListener('click', closeModal);

function closeModal() {
    modal.style.display = 'none';
    enableMode = false;
    disableMode = false;
}
