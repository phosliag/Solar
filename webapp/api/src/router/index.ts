import express from "express";
import obj from "./ProjectObject";
import PurchaseUser from "./PurchaseUser";
import trx from "./trx";
import lux from "./Lux";
import solarPanel from "./SolarPanel";
import RetailMarket from "./RetailMarket";

const router = express.Router();

export default (): express.Router => {
  obj(router)
  PurchaseUser(router)
  trx(router)
  lux(router)
  solarPanel(router)
  RetailMarket(router)
  return router;
};
