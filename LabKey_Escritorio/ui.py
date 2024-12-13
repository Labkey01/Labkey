import tkinter as tk
from tkinter import messagebox, Toplevel
from PIL import Image, ImageTk
import time
import os
import ctypes
from datetime import datetime
from db import hay_internet, guardar_en_csv, verificar_usuario_firebase, registrar_uso_firebase, cerrar_sesion_firebase, actualizar_csv_sin_conexion
from utils import obtener_ruta_recurso  # Importa la función desde utils

inicio_sesion = None
contador_corriendo = False

def validar_carrera(texto):
    return len(texto) <= 10

def validar_cuatrimestre(texto):
    if texto == "":
        return True
    return texto.isdigit() and len(texto) <= 3

    # Ruta dinámica para el icono
def obtener_ruta_icono():
    ruta_base = os.path.dirname(__file__)
    return os.path.join(ruta_base, "assets/logo.ico")

# Establece el icono de la barra de tareas (solo funciona en Windows)
def configurar_icono_barra_tareas(ventana):
    icono = obtener_ruta_icono()  # Obtén la ruta dinámica del icono
    if os.name == "nt":  # Solo aplica en Windows
        # Configura el identificador único para la barra de tareas
        ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID("com.labkey.registro")
        ventana.iconbitmap(icono)  # Asigna el icono a la ventana

def ventana_usuario():
    global inicio_sesion, contador_corriendo

    ventana = tk.Tk()
    ventana.title("Registro de uso del equipo")
    configurar_icono_barra_tareas(ventana)  # Configura el icono en la barra de tareas
    ventana.iconbitmap(obtener_ruta_icono())  # Asigna el icono a las interfaces

    ventana_ancho = 0
    ventana_alto = 0
    pantalla_ancho = ventana.winfo_screenwidth()
    pantalla_alto = ventana.winfo_screenheight()
    pos_x = (pantalla_ancho // 2) - (ventana_ancho // 2)
    pos_y = (pantalla_alto // 2) - (ventana_alto // 2)
    ventana.geometry(f"{ventana_ancho}x{ventana_alto}+{pos_x}+{pos_y}")
    ventana.overrideredirect(True)
    ventana.attributes('-topmost', True)
    ventana.state('zoomed')  # Esto maximiza la ventana y mantiene los botones visibles

    def bloquear_cierre():
        messagebox.showwarning("Advertencia", "No puedes cerrar la ventana mientras la sesión está activa.")

    ventana.protocol("WM_DELETE_WINDOW", bloquear_cierre)

    def bloquear_alt_f4(event=None):
        messagebox.showwarning("Advertencia", "No puedes cerrar la ventana mientras la sesión no está activa.")

    ventana.bind("<Alt-F4>", bloquear_alt_f4)

    logo_path = obtener_ruta_recurso("assets/logo.png")
    logo_image = Image.open(logo_path).resize((200, 200), Image.LANCZOS)
    logo = ImageTk.PhotoImage(logo_image)
    logo_label = tk.Label(ventana, image=logo)
    logo_label.pack(pady=60)

    matricula_label = tk.Label(ventana, text="Introduce tu matrícula", font=("Arial", 20))
    matricula_label.pack(pady=(10, 2))
    id_usuario = tk.Entry(ventana, font=("Arial", 15), width=30)
    id_usuario.pack(pady=(0, 10))

    contrasena_label = tk.Label(ventana, text="Introduce tu contraseña", font=("Arial", 20))
    contrasena_label.pack(pady=(10, 2))
    contrasena = tk.Entry(ventana, show='*', font=("Arial", 15), width=30)
    contrasena.pack(pady=(0, 20))

    datos_sesion_label = tk.Label(ventana, font=("Arial", 20))
    datos_sesion_label.pack(pady=10)

    tiempo_transcurrido_label = tk.Label(ventana, font=("Arial", 20), text="Tiempo transcurrido: 00:00:00")
    tiempo_transcurrido_label.pack_forget()

    boton_iniciar_sesion = tk.Button(ventana, text="Iniciar sesión", font=("Arial", 20), command=lambda: iniciar_sesion(id_usuario, contrasena))
    boton_iniciar_sesion.pack(pady=10)

    def iniciar_sesion(id_usuario, contrasena):
        global inicio_sesion, contador_corriendo

        id_usuario_valor = id_usuario.get()
        contrasena_valor = contrasena.get()

        if hay_internet():
            exito, resultado = verificar_usuario_firebase(id_usuario_valor, contrasena_valor)
            if exito:
                inicio_sesion = time.time()
                fecha_inicio = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
                contador_corriendo = True
                actualizar_tiempo()
                messagebox.showinfo("Inicio de sesión exitoso", f"Bienvenido {resultado}.")

                datos_sesion_label.config(text=f"Sesión iniciada\nMatrícula: {id_usuario_valor}\nFecha y hora: {fecha_inicio}")

                id_usuario.pack_forget()
                contrasena.pack_forget()
                boton_iniciar_sesion.pack_forget()
                matricula_label.pack_forget()
                contrasena_label.pack_forget()
                tiempo_transcurrido_label.pack(pady=30)

                ventana.overrideredirect(False)
                ventana.attributes('-topmost', False)
                ventana.resizable(True, True)

                ventana.protocol("WM_DELETE_WINDOW", bloquear_cierre)

                boton_cerrar_sesion = tk.Button(ventana, text="Cerrar sesión", font=("Arial", 20), command=lambda: cerrar_sesion(boton_cerrar_sesion, id_usuario_valor))
                boton_cerrar_sesion.pack(pady=10)
            else:
                messagebox.showerror("Error", resultado)
        else:
            messagebox.showwarning("Sin conexión", "No tienes conexión a Internet.")
            ventana_sin_conexion(id_usuario_valor)

    def ventana_sin_conexion(matricula):
        ventana_formulario = Toplevel(ventana)
        ventana_formulario.title("Sin conexión a internet")

        ancho_ventana = 400
        alto_ventana = 300

        ancho_pantalla = ventana.winfo_screenwidth()
        alto_pantalla = ventana.winfo_screenheight()

        pos_x = (ancho_pantalla // 2) - (ancho_ventana // 2)
        pos_y = (alto_pantalla // 2) - (alto_ventana // 2)

        ventana_formulario.geometry(f"{ancho_ventana}x{alto_ventana}+{pos_x}+{pos_y}")

        ventana_formulario.transient(ventana)
        ventana_formulario.grab_set()

        tk.Label(ventana_formulario, font=("Arial", 15), text="Completa los siguientes campos:").pack(pady=10)

        tk.Label(ventana_formulario, font=("Arial", 13), text="Carrera (Abreviada):").pack(pady=5)
        validacion_carrera = ventana_formulario.register(validar_carrera)
        entrada_carrera = tk.Entry(ventana_formulario, validate="key", validatecommand=(validacion_carrera, '%P'))
        entrada_carrera.pack()

        tk.Label(ventana_formulario, font=("Arial", 13), text="Cuatrimestre y Grupo (Ej. 11, 21, 31):").pack(pady=5)
        validacion_cuatrimestre = ventana_formulario.register(validar_cuatrimestre)
        entrada_cuatrimestre = tk.Entry(ventana_formulario, validate="key", validatecommand=(validacion_cuatrimestre, '%P'))
        entrada_cuatrimestre.pack()

        def guardar_datos():
            global inicio_sesion, contador_corriendo

            carrera = entrada_carrera.get()
            cuatrimestre = entrada_cuatrimestre.get()
            if carrera and cuatrimestre:
                exito, mensaje = guardar_en_csv(matricula, carrera, cuatrimestre)
                if exito:
                    messagebox.showinfo("Guardado", mensaje)
                    ventana_formulario.destroy()

                    inicio_sesion = time.time()
                    contador_corriendo = True
                    fecha_inicio = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    datos_sesion_label.config(
                        text=f"Sesión iniciada\nMatrícula: {matricula}\nFecha: {fecha_inicio}"
                    )
                    id_usuario.pack_forget()
                    contrasena.pack_forget()
                    boton_iniciar_sesion.pack_forget()
                    matricula_label.pack_forget()
                    contrasena_label.pack_forget()
                    tiempo_transcurrido_label.pack(pady=10)

                    ventana.overrideredirect(False)
                    ventana.attributes('-topmost', False)
                    ventana.resizable(True, True)

                    ventana.protocol("WM_DELETE_WINDOW", bloquear_cierre)

                    boton_cerrar_sesion = tk.Button(
                        ventana, text="Cerrar sesión", font=("Arial", 20), command=lambda: cerrar_sesion(boton_cerrar_sesion, matricula)
                    )
                    boton_cerrar_sesion.pack(pady=20)
                    actualizar_tiempo()
                else:
                    messagebox.showerror("Error", mensaje)
            else:
                messagebox.showwarning("Advertencia", "Completa todos los campos.")

        tk.Button(ventana_formulario, text="Guardar", command=guardar_datos).pack(pady=20)

    def actualizar_tiempo():
        if contador_corriendo:
            tiempo_actual = time.time()
            tiempo_transcurrido = int(tiempo_actual - inicio_sesion)
            horas = tiempo_transcurrido // 3600
            minutos = (tiempo_transcurrido % 3600) // 60
            segundos = tiempo_transcurrido % 60
            tiempo_transcurrido_label.config(text=f"Tiempo transcurrido: {horas:02}:{minutos:02}:{segundos:02}")
            ventana.after(1000, actualizar_tiempo)

    def cerrar_sesion(boton_cerrar_sesion, matricula):
        global inicio_sesion, contador_corriendo

        if inicio_sesion is not None:
            tiempo_sesion = time.time() - inicio_sesion
            horas = int(tiempo_sesion // 3600)
            minutos = int((tiempo_sesion % 3600) // 60)

            if hay_internet():
                registrar_uso_firebase(matricula, horas, minutos)
                cerrar_sesion_firebase(matricula)
                messagebox.showinfo("Cierre de sesión", f"Sesión finalizada.")
            else:
                exito, mensaje = actualizar_csv_sin_conexion(matricula, horas, minutos)
                if exito:
                    messagebox.showinfo("Cierre de sesión", f"Sesión finalizada sin conexión.\n{mensaje}")
                else:
                    messagebox.showerror("Error", mensaje)

            contador_corriendo = False
            tiempo_transcurrido_label.config(text="Tiempo transcurrido: 00:00:00")
            tiempo_transcurrido_label.pack_forget()

            ventana.overrideredirect(True)
            ventana.attributes('-topmost', True)
            ventana.resizable(False, False)

            datos_sesion_label.config(text="")

            ventana.protocol("WM_DELETE_WINDOW", ventana.destroy)

            id_usuario.delete(0, tk.END)
            contrasena.delete(0, tk.END)
            matricula_label.pack(pady=(10, 2))
            id_usuario.pack(pady=(0, 10))
            contrasena_label.pack(pady=(10, 2))
            contrasena.pack(pady=(0, 20))
            boton_iniciar_sesion.pack(pady=10)

            boton_cerrar_sesion.pack_forget()

    ventana.mainloop()
