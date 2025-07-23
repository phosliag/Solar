import express from 'express';
import { getPrecioElectricidad } from '../controllers/Lux';

export default (router: express.Router) => {
  router.get('/luz/precio', getPrecioElectricidad);
}; 