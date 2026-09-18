import { Router } from "express";
import { ModelController } from "./model.controller";
import { upload } from "../../utils/upload";
import { authenticateUser, authorizeTaggersOrSuperAdmins } from "../../middlewares/auth.middleware";

const fields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'model', maxCount: 1 },
    { name: 'twoD', maxCount: 1 }
])

/**
 * @swagger
 * tags:
 *   name: Models
 *   description: 3D model management — create, update, soft-delete, restore
 */
export class ModelRoute {
    path = "/model";
    router = Router();
    private model = new ModelController();

    constructor() {
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        /**
         * @swagger
         * /model/create-models:
         *   post:
         *     tags: [Models]
         *     summary: Create a new model with files
         *     consumes:
         *       - multipart/form-data
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: formData
         *         name: modelName
         *         required: true
         *         schema: { type: string }
         *       - in: formData
         *         name: description
         *         required: true
         *         schema: { type: string }
         *       - in: formData
         *         name: userId
         *         required: true
         *         schema: { type: string }
         *       - in: formData
         *         name: location
         *         required: true
         *         schema: { type: string }
         *       - in: formData
         *         name: size
         *         schema: { type: number }
         *       - in: formData
         *         name: isComplete
         *         schema: { type: boolean }
         *       - in: formData
         *         name: image
         *         required: true
         *         schema: { type: string, format: binary }
         *       - in: formData
         *         name: model
         *         required: true
         *         schema: { type: string, format: binary }
         *       - in: formData
         *         name: twoD
         *         schema: { type: string, format: binary }
         *     responses:
         *       200:
         *         description: Model created
         *       400:
         *         description: Validation error
         */
        this.router.post(
            `${this.path}/create-models`,
            authenticateUser,
            fields,
            this.model.createModel
        );

        /**
         * @swagger
         * /model/create-coverPhoto:
         *   post:
         *     tags: [Models]
         *     summary: Add a cover photo to a model
         *     consumes:
         *       - multipart/form-data
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: Cover photo uploaded
         */
        this.router.post(
            `${this.path}/create-coverPhoto`,
            authenticateUser,
            fields,
            this.model.createModelCoverPhoto
        );

        /**
         * @swagger
         * /model/get-models/:
         *   get:
         *     tags: [Models]
         *     summary: Get all models (filtered by user role)
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: List of models
         */
        this.router.get(
            `${this.path}/get-models/`,
            authenticateUser,
            this.model.getModels
        );

        /**
         * @swagger
         * /model/get-softed-models/:
         *   get:
         *     tags: [Models]
         *     summary: Get soft-deleted models
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: List of soft-deleted models
         */
        this.router.get(
            `${this.path}/get-softed-models/`,
            authenticateUser,
            this.model.getSoftedModel
        );

        /**
         * @swagger
         * /model/restore-softed-models/{id}:
         *   get:
         *     tags: [Models]
         *     summary: Restore a single soft-deleted model
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema: { type: string }
         *     responses:
         *       200:
         *         description: Model restored
         */
        this.router.get(
            `${this.path}/restore-softed-models/:id`,
            authenticateUser,
            this.model.restoreSoftedModel
        );

        /**
         * @swagger
         * /model/restore-softed-models/:
         *   post:
         *     tags: [Models]
         *     summary: Restore multiple soft-deleted models
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required: [modelIds]
         *             properties:
         *               modelIds:
         *                 type: array
         *                 items: { type: string }
         *     responses:
         *       200:
         *         description: Models restored
         */
        this.router.post(
            `${this.path}/restore-softed-models/`,
            authenticateUser,
            this.model.restoreSoftedModels
        );

        /**
         * @swagger
         * /model/get-a-models/{id}:
         *   get:
         *     tags: [Models]
         *     summary: Get a single model by ID (with populated tags)
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema: { type: string }
         *     responses:
         *       200:
         *         description: Model found
         */
        this.router.get(`${this.path}/get-a-models/:id?`, authenticateUser, this.model.getAModel);

        /**
         * @swagger
         * /model/delete-a-models/{id}:
         *   delete:
         *     tags: [Models]
         *     summary: Permanently delete a model
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema: { type: string }
         *     responses:
         *       200:
         *         description: Model deleted
         */
        this.router.delete(`${this.path}/delete-a-models/:id?`, authenticateUser, this.model.deletAModel);

        /**
         * @swagger
         * /model/soft-delete-models/:
         *   post:
         *     tags: [Models]
         *     summary: Soft-delete multiple models
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required: [modelIds]
         *             properties:
         *               modelIds:
         *                 type: array
         *                 items: { type: string }
         *     responses:
         *       200:
         *         description: Models soft-deleted
         */
        this.router.post(`${this.path}/soft-delete-models/`, authenticateUser, this.model.softDeletAModel);

        /**
         * @swagger
         * /model/delete-models/:
         *   delete:
         *     tags: [Models]
         *     summary: Delete multiple models permanently
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required: [modelIds]
         *             properties:
         *               modelIds:
         *                 type: array
         *                 items: { type: string }
         *     responses:
         *       200:
         *         description: Models deleted
         */
        this.router.delete(`${this.path}/delete-models/`, authenticateUser, this.model.deletAModel);

        /**
         * @swagger
         * /model/get-updated-models:
         *   get:
         *     tags: [Models]
         *     summary: Get models updated within a time range
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: query
         *         name: startTime
         *         required: true
         *         schema: { type: string, format: date-time }
         *       - in: query
         *         name: endTime
         *         required: true
         *         schema: { type: string, format: date-time }
         *     responses:
         *       200:
         *         description: Updated models
         */
        this.router.get(`${this.path}/get-updated-models`, authenticateUser, this.model.getUpdatedModels);

        /**
         * @swagger
         * /model/update-model/{id}:
         *   post:
         *     tags: [Models]
         *     summary: Update a model (files + metadata)
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
         *         name: modelName
         *         schema: { type: string }
         *       - in: formData
         *         name: description
         *         schema: { type: string }
         *       - in: formData
         *         name: location
         *         schema: { type: string }
         *       - in: formData
         *         name: isComplete
         *         schema: { type: boolean }
         *       - in: formData
         *         name: image
         *         schema: { type: string, format: binary }
         *       - in: formData
         *         name: twoD
         *         schema: { type: string, format: binary }
         *     responses:
         *       200:
         *         description: Model updated
         */
        this.router.post(`${this.path}/update-model/:id`, authenticateUser, fields, this.model.UpdatedModel);

        /**
         * @swagger
         * /model/{modelId}/object-group:
         *   post:
         *     tags: [Models]
         *     summary: Create an object group for a model
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: modelId
         *         required: true
         *         schema: { type: string }
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required: [name]
         *             properties:
         *               name: { type: string }
         *               cameraPosition: { type: object }
         *               cameraDirection: { type: object }
         *               cameraRotation: { type: object }
         *     responses:
         *       201:
         *         description: Object group created
         */
        this.router.post(
            `${this.path}/:modelId/object-group`,
            authenticateUser,
            this.model.createObjectGroup
        );

        /**
         * @swagger
         * /model/{modelId}/object-group:
         *   get:
         *     tags: [Models]
         *     summary: Get all object groups for a model
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: modelId
         *         required: true
         *         schema: { type: string }
         *     responses:
         *       200:
         *         description: List of object groups
         */
        this.router.get(
            `${this.path}/:modelId/object-group`,
            authenticateUser,
            this.model.getObjectGroupsByModel
        );

        /**
         * @swagger
         * /model/{modelId}/object-group/{objectGroupId}:
         *   delete:
         *     tags: [Models]
         *     summary: Delete an object group
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: modelId
         *         required: true
         *         schema: { type: string }
         *       - in: path
         *         name: objectGroupId
         *         required: true
         *         schema: { type: string }
         *     responses:
         *       200:
         *         description: Object group deleted
         */
        this.router.delete(
            `${this.path}/:modelId/object-group/:objectGroupId`,
            authenticateUser,
            this.model.deleteObjectGroup
        );
    }
}
