import express from 'express';
import {
  getAllSolarPanels,
  getSolarPanelsByUser,
  createSolarPanelController,
  updateSolarPanelController,
  deleteSolarPanelController
} from '../controllers/SolarPanel';
import { getAllPurchaseUsers, getTokenListAndUpcomingPaymentsByInvestor } from '../controllers/PurchaseUser';
import { getTokenListAndUpcomingPaymentsByIssuer, updatePayment } from '../controllers/Issuer';

export default (router: express.Router) => {
  router.get('/solar-panels', getAllSolarPanels);
  router.get('/solar-panels/user/:userId', getSolarPanelsByUser);
  router.post('/create-solar-panels', createSolarPanelController);
  router.put('/update-solar-panels/:id', updateSolarPanelController);
  router.delete('/delete-solar-panels/:id', deleteSolarPanelController);
  router.get('/panel-investors', getAllPurchaseUsers);
  router.get('/panels-issuer-tokens/:userId', getTokenListAndUpcomingPaymentsByIssuer);
  router.post('/panels-update-payment', updatePayment);
  router.get('/panels-investor-tokens/:userId', getTokenListAndUpcomingPaymentsByInvestor);
}; 