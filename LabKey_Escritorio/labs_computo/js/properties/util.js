export const  fetchAPI = async (url, options = {}) =>{
    try {
        // Realizamos la solicitud HTTP
        const response = await fetch(url, options);

        // Verificamos el código de estado HTTP
        if (!response.ok) {
            // Manejo de errores según el código HTTP
            switch (response.status) {
                case 400:
                    throw new Error("Solicitud incorrecta (400)");
                case 401:
                    window.location.href = './incio_sesion.html';
                case 403:
                    window.location.href = './incio_sesion.html';
                case 404:
                    throw new Error("Recurso no encontrado (404)");
                case 500:
                    throw new Error("Error interno del servidor (500)");
                default:
                    throw new Error(`Error desconocido: ${response.status}`);
            }
        }

        // Convertimos la respuesta a JSON
        const data = await response.json();

        // Retornamos el objeto JSON
        return data;
    } catch (error) {
        // Manejamos cualquier error
        console.error("Error al consumir la API:", error.message);
        throw error; // Relanzamos el error para manejarlo en la llamada
    }
}