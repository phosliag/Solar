import express from 'express';
import {
  getAllSolarPanels,
  getSolarPanelsByUser,
  createSolarPanelController,
  updateSolarPanelController,
  deleteSolarPanelController
} from '../controllers/SolarPanel';
import { getAllPurchaseUsers, getTokenListAndUpcomingPaymentsByInvestor, getPendingPayments, updatePayment } from '../controllers/PurchaseUser';

export default (router: express.Router) => {
  router.get('/solar-panels', getAllSolarPanels);
  router.get('/solar-panels/user/:userId', getSolarPanelsByUser);
  router.post('/create-solar-panels', createSolarPanelController);
  router.put('/update-solar-panels/:id', updateSolarPanelController);
  router.delete('/delete-solar-panels/:id', deleteSolarPanelController);
  router.get('/panel-investors', getAllPurchaseUsers);
  router.post('/panels-update-payment', updatePayment);
  router.get('/panels-investor-tokens/:userId', getTokenListAndUpcomingPaymentsByInvestor);
  router.get('/panels-pending-payments', getPendingPayments);
}; 