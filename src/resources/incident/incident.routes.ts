import { Incident } from './incident.model';
import { upload } from "../../utils/upload";
import { Router } from "express"
import { authenticateUser } from "../../middlewares/auth.middleware";
import { IncidentController } from './incident.controller';


const fields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'model', maxCount: 1 }
])

/**
 * @swagger
 * tags:
 *   name: Incidents
 *   description: Incident reporting — log and track environmental incidents
 */
export class IncidentRoutes {
    path = "/incident"
    router = Router();

    private Incident = new IncidentController()
    constructor() {
        this.initialiseRoutes();
    }
    private initialiseRoutes(): void {
        /**
         * @swagger
         * /incident/create-incident:
         *   post:
         *     tags: [Incidents]
         *     summary: Create a new incident report
         *     consumes:
         *       - multipart/form-data
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: formData
         *         name: name
         *         required: true
         *         schema: { type: string }
         *       - in: formData
         *         name: description
         *         schema: { type: string }
         *       - in: formData
         *         name: image
         *         schema: { type: string, format: binary }
         *     responses:
         *       200:
         *         description: Incident created
         */
        this.router.post(
            `${this.path}/create-incident`,
            authenticateUser,
            fields,
            this.Incident.createIncident
        );

        /**
         * @swagger
         * /incident/update-incident/{id}:
         *   put:
         *     tags: [Incidents]
         *     summary: Update an incident
         *     consumes:
         *       - multipart/form-data
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema: { type: string }
         *       - in: formData
         *         name: name
         *         schema: { type: string }
         *       - in: formData
         *         name: description
         *         schema: { type: string }
         *       - in: formData
         *         name: image
         *         schema: { type: string, format: binary }
         *     responses:
         *       200:
         *         description: Incident updated
         */
        this.router.put(
            `${this.path}/update-incident/:id`,
            authenticateUser,
            fields,
            this.Incident.updateIncident
        );

        /**
         * @swagger
         * /incident/incidents:
         *   get:
         *     tags: [Incidents]
         *     summary: Get all incidents
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: List of incidents
         */
        this.router.get(
            `${this.path}/incidents`,
            authenticateUser,
            this.Incident.getIncident
        );

        /**
         * @swagger
         * /incident/incident-delete/{id}:
         *   delete:
         *     tags: [Incidents]
         *     summary: Delete an incident
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema: { type: string }
         *     responses:
         *       200:
         *         description: Incident deleted
         */
        this.router.delete(
            `${this.path}/incident-delete/:id}`,
            authenticateUser,
            this.Incident.deleteIncident
        );
    }
}
