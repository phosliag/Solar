import mongoose from "mongoose";
import { PrecioLuz } from '../db/PrecioLuz';

const API_TOKEN = '66bb839fb51673d9d6100b755161246c65bd27342e29a5c175e145c7f5716186';

export async function obtenerPrecioElectricidad() {
    // Obtener la fecha de hoy en formato YYYY-MM-DD (zona Madrid)
    const hoyMadrid = new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' });
    const fechaHoy = new Date(hoyMadrid).toISOString().slice(0, 10);
    console.log('fecha', fechaHoy);
    
    await mongoose.connect('mongodb://localhost:27017/Luz');

    // Buscar si ya existe el documento para hoy
    const docExistente = await PrecioLuz.findOne({ fecha: fechaHoy });
    console.log(docExistente)
    if (docExistente) {
      console.log(`✅ Datos ya existen en MongoDB para la fecha ${fechaHoy}`);
      docExistente.precios.forEach((precio: number, hora: number) => {
        const horaStr = hora.toString().padStart(2, '0') + ':00';
        console.log(`${horaStr} -> ${precio} €/kWh`);
      });
      return { fecha: fechaHoy, precios: docExistente.precios };
    }
  
    // Si no existe, hacer fetch
    const url = 'https://api.esios.ree.es/indicators/1001';
    const respuesta = await fetch(url, {
      headers: {
        'Accept': 'application/json; application/vnd.esios-api-v1+json',
        'Authorization': `Token token="${API_TOKEN}"`,
      },
      // redirect: 'follow'
    });
  
    if (!respuesta.ok) {
      throw new Error(`Error HTTP ${respuesta.status}`);
    }
  
    const datos = await respuesta.json();
    const valores = datos.indicator.values;
  
    // Imprimir precios horarios del día actual
    const precios: number[] = new Array(24).fill(null);
    valores.forEach((valor: any) => {
      const horaUTC = new Date(valor.datetime);
      const horaMadrid = new Date(horaUTC.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
      const hora = horaMadrid.getHours();
      const precio = Number((valor.value / 1000).toFixed(5)); // €/MWh a €/kWh
      precios[hora] = precio;
      const horaStr = horaMadrid.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      console.log(`${horaStr} -> ${precio} €/kWh`);
    });
  
    // Obtener la fecha de los datos (primer valor)
    const fecha = fechaHoy;
  
    // Guardar en MongoDB
    try {
      const doc = new PrecioLuz({ fecha, precios });
      await doc.save();
      console.log('✅ Documento guardado en MongoDB (Mongoose):', { fecha, precios });
    } catch (err) {
      console.error('❌ Error guardando en MongoDB (Mongoose):', err);
    }
    return { fecha, precios };
}