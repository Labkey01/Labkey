# Instalar librerias

- pip install -r requirements.txt

# Iniciaizar el proyecto

- python main.py

# Comprimir en un .exe

- pyinstaller --onefile --noconsole --add-data "assets/*:assets" --add-data "cr.json:." main.py
