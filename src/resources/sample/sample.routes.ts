import { upload } from "../../utils/upload";
import { SampleController } from './sample.controllers';
import { Router } from "express"
import { authenticateUser } from "../../middlewares/auth.middleware";


const fields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'model', maxCount: 1 }
])

/**
 * @swagger
 * tags:
 *   name: Samples
 *   description: Sample management — create, update, and list environmental samples
 */
export class SampleRoutes {
    path = "/sample"
    router = Router();

    private sample = new SampleController()
    constructor() {
        this.initialiseRoutes();
    }
    private initialiseRoutes(): void {
        /**
         * @swagger
         * /sample/create-samples:
         *   post:
         *     tags: [Samples]
         *     summary: Create a new sample
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
         *         required: true
         *         schema: { type: string }
         *       - in: formData
         *         name: image
         *         schema: { type: string, format: binary }
         *     responses:
         *       200:
         *         description: Sample created
         */
        this.router.post(
            `${this.path}/create-samples`,
            authenticateUser,
            fields,
            this.sample.createSample
        );

        /**
         * @swagger
         * /sample/update-sample/{id}:
         *   put:
         *     tags: [Samples]
         *     summary: Update a sample
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
         *         required: true
         *         schema: { type: string }
         *       - in: formData
         *         name: description
         *         required: true
         *         schema: { type: string }
         *       - in: formData
         *         name: image
         *         schema: { type: string, format: binary }
         *     responses:
         *       200:
         *         description: Sample updated
         */
        this.router.put(
            `${this.path}/update-sample/:id`,
            authenticateUser,
            fields,
            this.sample.updateSample
        );

        /**
         * @swagger
         * /sample/samples:
         *   get:
         *     tags: [Samples]
         *     summary: Get all samples (filtered by user role)
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: List of samples
         */
        this.router.get(
            `${this.path}/samples`,
            authenticateUser,
            this.sample.getSample
        );

        /**
         * @swagger
         * /sample/samples-delete/{id}:
         *   delete:
         *     tags: [Samples]
         *     summary: Delete a sample
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema: { type: string }
         *     responses:
         *       200:
         *         description: Sample deleted
         */
        this.router.delete(
            `${this.path}/samples-delete/:id`,
            authenticateUser,
            this.sample.deleteSample
        );
    }
}
