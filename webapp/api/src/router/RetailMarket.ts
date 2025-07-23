import express from 'express';
import {
  getAllRetailMarketItems,
  getRetailMarketItem,
  addRetailMarketItem,
  updateRetailMarketItem,
  deleteRetailMarketItem
} from '../controllers/RetailMarket';

export default (router: express.Router) => {
  router.get('/retail-market', getAllRetailMarketItems);
  router.get('/retail-market/:id', getRetailMarketItem);
  router.post('/retail-market', addRetailMarketItem);
  router.put('/retail-market/:id', updateRetailMarketItem);
  router.delete('/retail-market/:id', deleteRetailMarketItem);
}; 