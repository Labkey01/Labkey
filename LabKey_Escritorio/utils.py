import os
import sys

def obtener_ruta_recurso(ruta_relativa):
    """Obtiene la ruta del recurso empaquetado o desde el sistema."""
    if hasattr(sys, '_MEIPASS'):  # Verifica si se ejecuta como un ejecutable empaquetado
        return os.path.join(sys._MEIPASS, ruta_relativa)
    return os.path.join(os.path.dirname(__file__), ruta_relativa)  # Devuelve la ruta relativa al script actual
