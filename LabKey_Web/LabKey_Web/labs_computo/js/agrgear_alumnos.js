// let alumnos = [];

document.getElementById('uploadBtn').addEventListener('click', function () {
    const fileInput = document.getElementById('archivo');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const content = e.target.result;
            processCSV(content);
        };

        reader.readAsText(file);
    } else {
        alert('Por favor, selecciona un archivo.');
    }
});

function processCSV(content) {
    const rows = content.split("\n");
    alumnos = rows.slice(1) // Omitir la primera fila (cabecera)
        .map(row => {
            const [nombre, apellidoPaterno, apellidoMaterno, matricula, correo] = row.split(",");
            // Filtrar filas vacías o incompletas
            if (!nombre || !apellidoPaterno || !apellidoMaterno || !matricula || !correo) {
                return null;
            }
            return { nombre, apellidoPaterno, apellidoMaterno, matricula, correo };
        })
        .filter(alumno => alumno !== null); // Eliminar entradas nulas o inválidas

    renderTable();
    document.getElementById('confirmBtn').disabled = false; // Habilitar el botón de Confirmar
}

function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    alumnos.forEach(alumno => {
        let row = `
            <tr>
                <td>${alumno.nombre}</td>
                <td>${alumno.apellidoPaterno}</td>
                <td>${alumno.apellidoMaterno}</td>
                <td>${alumno.matricula}</td>
                <td>${alumno.correo}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

document.getElementById('confirmBtn').addEventListener('click', function () {
    alumnos.forEach(async (alumno) => {
        try {
            // Crear usuario en Firebase Authentication con la matrícula como contraseña
            await createUser(alumno);
        } catch (error) {
            console.error('Error al crear usuario: ', error);
        }
    });

    // Mostrar el modal de confirmación
    document.getElementById('modal').style.display = 'flex';
});

// Cerrar el modal cuando se hace clic en "Aceptar" o la "X"
document.querySelector('.close-button').addEventListener('click', function () {
    document.getElementById('modal').style.display = 'none';
});

document.getElementById('closeModalBtn').addEventListener('click', function () {
    document.getElementById('modal').style.display = 'none';
});

// Función para crear usuario en Firebase
// Código para procesar y subir usuarios a Firebase Authentication
async function createUser(alumno) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(
            alumno.correo,
            alumno.matricula // Contraseña predeterminada
        );
        console.log("Usuario creado:", userCredential.user.email);

        // Enviar correo de verificación
        await userCredential.user.sendEmailVerification();
    } catch (error) {
        console.error("Error al crear el usuario:", error);
    }z
}

document.getElementById('confirmBtn').addEventListener('click', function () {
    alumnos.forEach(createUser);
});

