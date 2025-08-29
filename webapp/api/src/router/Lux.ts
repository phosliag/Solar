import express from 'express';
import { getPrecioElectricidad } from '../controllers/Luz';

export default (router: express.Router) => {
  router.get('/luz/precio', getPrecioElectricidad);
}; 