let enableMode = false;
let disableMode = false;
let places = [];
let nextPlaceNumber = 1;
let acceptBtn = document.getElementById('acceptBtn');
let messageDiv = document.getElementById('message');
let modal = document.getElementById('modal');
let modalMessage = document.getElementById('modalMessage');
let enableBtn = document.getElementById('enableBtn');
let disableBtn = document.getElementById('disableBtn');
let addBtn = document.getElementById('addBtn');

function createPlaceButton(number) {
    const button = document.createElement('button');
    button.className = 'place';
    button.textContent = number;
    button.dataset.place = number;

    button.addEventListener('click', function () {
        if (disableMode) {
            if (!button.classList.contains('disabled')) {
                button.classList.add('disabled');
            } else {
                displayMessage('Este lugar ya está inhabilitado.', 'disable');
            }
        } else if (enableMode) {
            if (button.classList.contains('disabled')) {
                button.classList.remove('disabled');
            } else {
                displayMessage('Este lugar ya está habilitado.', 'enable');
            }
        }
    });

    return button;
}

function generateInitialPlaces() {
    const grid = document.getElementById('grid');
    for (let i = 1; i <= 45; i++) {
        const placeButton = createPlaceButton(i);
        grid.appendChild(placeButton);
        places.push(placeButton);
        nextPlaceNumber++;
    }
}

function addMorePlaces() {
    const grid = document.getElementById('grid');
    for (let i = 0; i < 5; i++) {
        const placeButton = createPlaceButton(nextPlaceNumber);
        grid.appendChild(placeButton);
        places.push(placeButton);
        nextPlaceNumber++;
    }
    displayMessage('Se han agregado más lugares.', 'add');
}

function displayMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = `message active ${type}`;
    setTimeout(() => {
        messageDiv.className = 'message';
    }, 3000);
}

function updateButtonState(activeButton) {
    [enableBtn, disableBtn, addBtn].forEach(button => {
        button.classList.remove('active');
    });
    activeButton.classList.add('active');
}

enableBtn.addEventListener('click', function () {
    enableMode = true;
    disableMode = false;
    acceptBtn.disabled = false;
    updateButtonState(enableBtn);
});

disableBtn.addEventListener('click', function () {
    disableMode = true;
    enableMode = false;
    acceptBtn.disabled = false;
    updateButtonState(disableBtn);
});

addBtn.addEventListener('click', function () {
    addMorePlaces();
    updateButtonState(addBtn);
});

acceptBtn.addEventListener('click', function () {
    const action = enableMode ? 'habilitados' : 'inhabilitados';
    const modifiedPlaces = places.filter(place =>
        enableMode ? !place.classList.contains('disabled') : place.classList.contains('disabled')
    );

    modalMessage.textContent = `Se han ${action} correctamente ${modifiedPlaces.length} lugares.`;
    modal.style.display = 'block';
});

function closeModal() {
    modal.style.display = 'none';
}

// Generar los lugares iniciales
generateInitialPlaces();
