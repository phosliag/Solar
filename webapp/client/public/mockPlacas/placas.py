import csv
import random
from datetime import datetime, timedelta

# Producción media diaria monocristalina por año kWh (por panel)
produccion_anual = {
    2020: 1.9,
    2021: 2.0,
    2022: 2.1,
    2023: 2.2,
    2024: 2.3,
}

# Intervalo precios luz €/kWh por año (aprox)
precio_luz_anual = {
    2020: (0.11, 0.15),
    2021: (0.12, 0.16),
    2022: (0.13, 0.18),
    2023: (0.14, 0.20),
    2024: (0.15, 0.22),
}

def generar_datos_diarios(year):
    start_date = datetime(year, 1, 1)
    end_date = datetime(year, 12, 31)
    num_days = (end_date - start_date).days + 1

    produccion_base = produccion_anual[year]
    precio_min, precio_max = precio_luz_anual[year]

    datos = []
    for i in range(num_days):
        fecha = start_date + timedelta(days=i)

        # Producción diaria con variación ±15%
        produccion_dia = round(produccion_base * random.uniform(0.85, 1.15), 2)

        # Precio luz aleatorio dentro del rango anual
        precio_dia = round(random.uniform(precio_min, precio_max), 3)

        datos.append([fecha.strftime("%Y-%m-%d"), produccion_dia, precio_dia])

    return datos

def guardar_csv(datos, year):
    nombre_archivo = f"produccion_placas_luz_{year}.csv"
    with open(nombre_archivo, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["Fecha", "Produccion_Monocristalina_kWh", "Precio_Luz_Euro_kWh"])
        writer.writerows(datos)
    print(f"Archivo guardado: {nombre_archivo}")

if __name__ == "__main__":
    # Generar y guardar datos para todos los años indicados
    for y in produccion_anual.keys():
        datos_ano = generar_datos_diarios(y)
        guardar_csv(datos_ano, y)
