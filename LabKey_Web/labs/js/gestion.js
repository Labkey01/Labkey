import { db } from "./firebase.js";
import { collection, doc, onSnapshot, setDoc, serverTimestamp, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";

const blockAllBtn = document.getElementById('blockAllBtn');
const unblockAllBtn = document.getElementById('unblockAllBtn'); // Botón para desbloquear todos los lugares

let enableMode = false;
let disableMode = false;
let places = [];
let nextPlaceNumber = 1;
let currentHorario = null;
let acceptBtn = document.getElementById('acceptBtn');
let messageDiv = document.getElementById('message');
let modal = document.getElementById('modal');
let modalMessage = document.getElementById('modalMessage');
let enableBtn = document.getElementById('enableBtn');
let disableBtn = document.getElementById('disableBtn');
let horarioSelect = document.getElementById('horarioSelect');

function createPlaceButton(number, disabled = false) {
    const button = document.createElement('button');
    button.className = 'place';
    button.textContent = number;
    button.dataset.place = number;

    if (disabled) {
        button.classList.add('disabled');
    }

    button.addEventListener('click', function () {
        if (disableMode) {
            button.classList.add('disabled'); // Deshabilitar lugar
        } else if (enableMode) {
            button.classList.remove('disabled'); // Habilitar lugar
        }
    });

    return button;
}

function loadHorariosFromFirestore() {
    const horariosRef = collection(db, "gestionLugares", "estadoActual", "horarios");

    onSnapshot(horariosRef, (snapshot) => {
        horarioSelect.innerHTML = '';
        snapshot.forEach((doc) => {
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = doc.id;
            horarioSelect.appendChild(option);
        });

        // Seleccionar el primer horario si está disponible
        if (horarioSelect.options.length > 0) {
            horarioSelect.value = horarioSelect.options[0].value;
            currentHorario = horarioSelect.value; // Actualizar el horario actual
            loadPlacesFromFirestore(currentHorario);
        }
    });
}

function loadPlacesFromFirestore(horario) {
    const grid = document.getElementById('grid');
    const docRef = doc(db, "gestionLugares", "estadoActual", "horarios", horario);

    onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            const firestorePlaces = data.places || [];

            grid.innerHTML = ''; // Limpiar el grid
            places = [];

            firestorePlaces.forEach(place => {
                const placeButton = createPlaceButton(place.number, place.disabled);
                grid.appendChild(placeButton);
                places.push(placeButton);
                nextPlaceNumber = Math.max(nextPlaceNumber, parseInt(place.number) + 1);
            });

            console.log(`Lugares cargados para el horario ${horario}`);
        } else {
            console.log(`No se encontraron datos para el horario ${horario}.`);
        }
    });
}

function savePlacesToFirestore() {
    if (!currentHorario) {
        console.error('No se ha seleccionado un horario.');
        return;
    }

    const updatedPlaces = places.map(place => ({
        number: parseInt(place.dataset.place),
        disabled: place.classList.contains('disabled'),
    }));

    const docRef = doc(db, "gestionLugares", "estadoActual", "horarios", currentHorario);
    setDoc(docRef, {
        places: updatedPlaces,
        timestamp: serverTimestamp()
    }).then(() => {
        console.log(`Estado actualizado para el horario ${currentHorario} en Firestore`);
        displayMessage(`Cambios guardados para el horario ${currentHorario}.`, 'add');
    }).catch(error => {
        console.error('Error al guardar en Firestore:', error);
        displayMessage('Error al guardar los cambios.', 'disable');
    });
}

blockAllBtn.addEventListener('click', async function () {
    try {
        const horariosSnapshot = await getDocs(collection(db, "gestionLugares", "estadoActual", "horarios"));

        if (horariosSnapshot.empty) {
            displayMessage("No se encontraron horarios para bloquear.", "error");
            return;
        }

        for (const horarioDoc of horariosSnapshot.docs) {
            const horarioRef = doc(db, "gestionLugares", "estadoActual", "horarios", horarioDoc.id);
            const horarioData = horarioDoc.data();
            const updatedPlaces = horarioData.places.map((place) => ({
                ...place,
                disabled: true, // Bloquear cada lugar
            }));

            await updateDoc(horarioRef, { places: updatedPlaces });
        }

        displayMessage("Todos los lugares han sido bloqueados con éxito.", "success");
    } catch (error) {
        console.error("Error al bloquear todos los lugares:", error);
        displayMessage("Error al bloquear todos los lugares. Intente nuevamente.", "error");
    }
});

// Desbloquear todos los lugares en todos los horarios
unblockAllBtn.addEventListener('click', async function () {
    try {
        const horariosSnapshot = await getDocs(collection(db, "gestionLugares", "estadoActual", "horarios"));

        if (horariosSnapshot.empty) {
            displayMessage("No se encontraron horarios para desbloquear.", "error");
            return;
        }

        for (const horarioDoc of horariosSnapshot.docs) {
            const horarioRef = doc(db, "gestionLugares", "estadoActual", "horarios", horarioDoc.id);
            const horarioData = horarioDoc.data();
            const updatedPlaces = horarioData.places.map((place) => ({
                ...place,
                disabled: false, // Desbloquear cada lugar
            }));

            await updateDoc(horarioRef, { places: updatedPlaces });
        }

        displayMessage("Todos los lugares han sido desbloqueados con éxito.", "success");
    } catch (error) {
        console.error("Error al desbloquear todos los lugares:", error);
        displayMessage("Error al desbloquear todos los lugares. Intente nuevamente.", "error");
    }
});

function displayMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = `message active ${type}`;
    setTimeout(() => {
        messageDiv.className = 'message';
    }, 3000);
}

function updateButtonState(activeButton) {
    [enableBtn, disableBtn].forEach(button => button.classList.remove('active'));
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

acceptBtn.addEventListener('click', function () {
    savePlacesToFirestore();

    modalMessage.textContent = 'Los cambios se han guardado correctamente.';
});

horarioSelect.addEventListener('change', function () {
    currentHorario = horarioSelect.value;
    loadPlacesFromFirestore(currentHorario);
});

function closeModal() {
    modal.style.display = 'none';
}

// Cargar los horarios iniciales y los lugares correspondientes
loadHorariosFromFirestore();
