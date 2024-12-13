import os
import csv
import socket
import getpass
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
import urllib.request
from utils import obtener_ruta_recurso  # Importa la función desde utils

# Verifica si hay conexión a internet
def hay_internet():
    try:
        urllib.request.urlopen('http://www.google.com', timeout=2)
        return True
    except:
        return False

# Inicializa la conexión con Firebase utilizando credenciales
cred_path = obtener_ruta_recurso("cr.json")
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

db = firestore.client()

DIRECTORIO_CSV = os.path.join(os.path.expanduser("~"), "LABKEY")
CSV_PATH = os.path.join(DIRECTORIO_CSV, "registros_sin_conexion.csv")

# Crea el directorio para el archivo CSV si no existe
def crear_directorio_csv():
    if not os.path.exists(DIRECTORIO_CSV):
        os.makedirs(DIRECTORIO_CSV)

# Obtiene información sobre el equipo
def obtener_ip_equipo():
    try:
        ip_local = socket.gethostbyname(socket.gethostname())
        nombre_equipo = socket.gethostname()
        usuario_sesion = getpass.getuser()
        return ip_local, nombre_equipo, usuario_sesion
    except Exception as e:
        return None, None, f"Error: {str(e)}"

# Guarda datos en un archivo CSV
def guardar_en_csv(matricula, carrera, cuatrimestre):
    crear_directorio_csv()
    existe_archivo = os.path.exists(CSV_PATH)
    try:
        with open(CSV_PATH, 'a', newline='') as archivo_csv:
            writer = csv.writer(archivo_csv)
            if not existe_archivo:
                writer.writerow(['Matrícula', 'Carrera', 'Cuatrimestre', 'IP', 'Nombre del equipo', 'Usuario', 'Fecha', 'Hora'])
            ip_equipo, nombre_equipo, usuario_sesion = obtener_ip_equipo()
            fecha_actual = datetime.now().strftime('%Y-%m-%d')
            hora_actual = datetime.now().strftime('%H:%M:%S')
            writer.writerow([matricula, carrera, cuatrimestre, ip_equipo, nombre_equipo, usuario_sesion, fecha_actual, hora_actual])
        return True, "Datos guardados correctamente."
    except Exception as e:
        return False, f"Error al guardar los datos: {str(e)}"

# Actualiza datos en el CSV al cerrar sesión
def actualizar_csv_sin_conexion(matricula, horas, minutos):
    crear_directorio_csv()
    existe_archivo = os.path.exists(CSV_PATH)
    try:
        with open(CSV_PATH, 'r+', newline='') as archivo_csv:
            reader = csv.DictReader(archivo_csv)
            filas = list(reader)
            nuevos_campos = ['Horas de uso', 'Minutos de uso', 'Hora finalización']
            encabezados_actualizados = reader.fieldnames + [campo for campo in nuevos_campos if campo not in reader.fieldnames]
            if len(encabezados_actualizados) != len(reader.fieldnames):
                archivo_csv.seek(0)
                writer = csv.DictWriter(archivo_csv, fieldnames=encabezados_actualizados)
                writer.writeheader()
                writer.writerows(filas)
                archivo_csv.truncate()

        with open(CSV_PATH, 'r+', newline='') as archivo_csv:
            reader = csv.DictReader(archivo_csv)
            filas = list(reader)
            for fila in filas:
                if fila['Matrícula'] == matricula and not fila.get('Hora finalización'):
                    hora_finalizacion = datetime.now().strftime('%H:%M:%S')
                    fila['Horas de uso'] = horas
                    fila['Minutos de uso'] = minutos
                    fila['Hora finalización'] = hora_finalizacion
            archivo_csv.seek(0)
            writer = csv.DictWriter(archivo_csv, fieldnames=reader.fieldnames)
            writer.writeheader()
            writer.writerows(filas)
            archivo_csv.truncate()
        return True, ""
    except Exception as e:
        return False, f"Error al actualizar el archivo CSV: {str(e)}"

# Registra el uso de un equipo en Firebase
def registrar_uso_firebase(matricula, horas, minutos):
    try:
        ip_equipo, nombre_equipo, usuario_sesion = obtener_ip_equipo()
        # Obtén la fecha y hora actual
        fecha_actual = datetime.now().strftime('%d-%m-%Y')
        hora_actual = datetime.now().strftime('%H:%M:%S')

        registros_ref = db.collection('registros')
        registros_ref.add({
            'matricula': matricula,
            'horas': horas,
            'minutos': minutos,
            'ip_equipo': ip_equipo,
            'nombre_equipo': nombre_equipo,
            'usuario_sesion': usuario_sesion,
            'fecha': fecha_actual,  # Campo para la fecha
            'hora': hora_actual    # Campo para la hora
        })
        return True, "Uso registrado correctamente."
    except Exception as e:
        return False, f"Error al registrar uso: {str(e)}"

# Verifica la autenticación de un usuario en Firebase
def verificar_usuario_firebase(matricula, contrasena):
    try:
        usuarios_ref = db.collection('usuarios')
        usuarios = usuarios_ref.where('matricula', '==', matricula).get()
        if usuarios:
            for usuario in usuarios:
                datos_usuario = usuario.to_dict()
                if datos_usuario['contraseña'] == contrasena:
                    return True, datos_usuario['nombre']
                else:
                    return False, "Contraseña incorrecta."
        else:
            return False, "Matrícula no encontrada."
    except Exception as e:
        return False, f"Error al verificar usuario: {str(e)}"

# Cierra la sesión de un usuario en Firebase
def cerrar_sesion_firebase(matricula):
    try:
        usuarios_ref = db.collection('usuarios')
        usuarios = usuarios_ref.where('matricula', '==', matricula).get()
        if usuarios:
            for usuario in usuarios:
                usuario.reference.update({'sesion_activa': False})
            return True, "Sesión cerrada correctamente."
        return False, "Usuario no encontrado."
    except Exception as e:
        return False, f"Error al cerrar sesión: {str(e)}"
