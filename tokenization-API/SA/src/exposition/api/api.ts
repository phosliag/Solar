import express, { Express, Request, Response } from "express";
import cors from 'cors';
import { callContractMethodController, executeContractMethodController, createAccountMultiple, createIndividualAccountRetry } from "../controllers/contract.controller";
import handleControllerCall from "../controllers";

import Logger from "../../helpers/logger.helper";
import Config from "../../types/Config.type";
import { apiKeyMiddleware } from "../middleware/apiKey.middleware";

const app: Express = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'X-API-Key']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiKeyMiddleware);

let logger: Logger;
let config: Config;

/**
 * Initialize de application
 */
export default async function startApi(
  _config: Config,
  _loggger: Logger
) {
  logger = _loggger;
  config = _config;

  setupApi();

  logger.info("STARTING API");
  const appPort = config.PORT || 4000;
  app.listen(appPort, '0.0.0.0');
  logger.info(`Express server running on port ${appPort}...`);
}

function setupApi() {
  app.get(`${config.CONTRACT.ADDRESS ? "" : "/:address"}/:method`, async (req: Request, res: Response) => {
    const contractAddress: string = req.params.address;
    const methodName: string = req.params.method; 
    const requestMade: string = `GET ${config.CONTRACT.ADDRESS ? "" : `/${contractAddress}`}/${methodName}`;

    logger.info(requestMade);
    logger.debug(`${requestMade} ${JSON.stringify(req.headers)} ${JSON.stringify(req.query)} ${JSON.stringify(req.body)}`);

    const resolvedMethod = manageMethodGet(methodName);

    await handleControllerCall(req, res, logger, resolvedMethod);
  });

  app.post(`${config.CONTRACT.ADDRESS ? "" : "/:address"}/:method`, async (req: Request, res: Response) => {
    const contractAddress: string = req.params.address;
    const methodName: string = req.params.method;
    const requestMade: string = `POST ${config.CONTRACT.ADDRESS ? "" : `/${contractAddress}`}/${methodName}`;

    logger.info(requestMade);
    logger.debug(`${requestMade} ${JSON.stringify(req.headers)} ${JSON.stringify(req.query)} ${JSON.stringify(req.body)}`);

    const resolvedMethod = manageMethodPost(methodName);

    await handleControllerCall(req, res, logger, resolvedMethod);
  });
}

function manageMethodGet(method: string): (req: Request, res: Response, logger: Logger) => Promise<any> {
    switch (method) {
        case "":
            return createAccountMultiple;

        case "":
            return createIndividualAccountRetry;

        default:
            return callContractMethodController;
    }
}

function manageMethodPost(method: string): (req: Request, res: Response, logger: Logger) => Promise<any> {
    switch (method) {
        case "createAccount":
            return createAccountMultiple;

        case "createIndividualAccountRetry":
            return createIndividualAccountRetry;

        default:
            return executeContractMethodController;
    }
}
