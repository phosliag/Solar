import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { Express } from 'express';

export const setupSwagger = (app: Express) => {
    const swaggerDocument = YAML.load(path.join(__dirname, 'bonds.swagger.yaml'));
    
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: "BondConnect API Documentation"
    }));
}; 