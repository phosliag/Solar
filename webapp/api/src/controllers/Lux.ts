import { Request, Response } from 'express';
import { obtenerPrecioElectricidad } from '../services/Lux';

export const getPrecioElectricidad = async (req: Request, res: Response) => {
  try {
    const data = await obtenerPrecioElectricidad();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo el precio de la electricidad' });
  }
}; 