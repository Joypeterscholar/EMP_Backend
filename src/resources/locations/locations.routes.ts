import { Router } from "express"
import { LocationController } from "./locations.controllers";
import { upload } from "../../utils/upload";
import { authenticateUser } from "../../middlewares/auth.middleware";

const fields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'model', maxCount: 1 }
])

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: Location management — facilities and sites
 */
export class LocationRoutes {
    path = "/location"
    router = Router();

    private location = new LocationController
    constructor() {
        this.initialiseRoutes();
    }
    private initialiseRoutes(): void {
        /**
         * @swagger
         * /location/create-location:
         *   post:
         *     tags: [Locations]
         *     summary: Create a new location
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
         *         name: image
         *         schema: { type: string, format: binary }
         *     responses:
         *       200:
         *         description: Location created
         */
        this.router.post(
            `${this.path}/create-location`,
            authenticateUser,
            fields,
            this.location.createLocation
        );

        /**
         * @swagger
         * /location/locations:
         *   get:
         *     tags: [Locations]
         *     summary: Get all locations (filtered by user role)
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: List of locations
         */
        this.router.get(
            `${this.path}/locations`,
            authenticateUser,
            this.location.getLocations
        );

        /**
         * @swagger
         * /location/location-update/{id}:
         *   put:
         *     tags: [Locations]
         *     summary: Update a location
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
         *         name: image
         *         schema: { type: string, format: binary }
         *     responses:
         *       200:
         *         description: Location updated
         */
        this.router.put(
            `${this.path}/location-update/:id`,
            authenticateUser,
            fields,
            this.location.updateLocations
        );

        /**
         * @swagger
         * /location/location-delete/{id}:
         *   delete:
         *     tags: [Locations]
         *     summary: Delete a location
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema: { type: string }
         *     responses:
         *       200:
         *         description: Location deleted
         *       400:
         *         description: Cannot delete location with associated models
         */
        this.router.delete(
            `${this.path}/location-delete/:id`,
            authenticateUser,
            this.location.deleteLocations
        );
    }
}
