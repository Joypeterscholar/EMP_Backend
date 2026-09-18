import { upload } from "../../utils/upload";
import { Router } from "express"
import { authenticateUser } from "../../middlewares/auth.middleware";
import { GtagController } from './granular.controller';


const fields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'model', maxCount: 1 }
])

/**
 * @swagger
 * tags:
 *   name: Granular Tags
 *   description: Granular tagging — detailed per-object annotations on models
 */
export class Granular {
    path = "/Gtags"
    router = Router();

    private gTag = new GtagController()
    constructor() {
        this.initialiseRoutes();
    }
    private initialiseRoutes(): void {
        /**
         * @swagger
         * /Gtags/create-Gtags:
         *   post:
         *     tags: [Granular Tags]
         *     summary: Create a granular tag with image
         *     consumes:
         *       - multipart/form-data
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: formData
         *         name: model
         *         required: true
         *         schema: { type: string, description: Model ID }
         *       - in: formData
         *         name: objectName
         *         required: true
         *         schema: { type: string }
         *       - in: formData
         *         name: user
         *         required: true
         *         schema: { type: string, description: User ID }
         *       - in: formData
         *         name: taggedInfo
         *         schema: { type: string }
         *       - in: formData
         *         name: image
         *         required: true
         *         schema: { type: string, format: binary }
         *     responses:
         *       200:
         *         description: Granular tag created
         */
        this.router.post(
            `${this.path}/create-Gtags`,
            authenticateUser,
            fields,
            this.gTag.createGtag
        );

        /**
         * @swagger
         * /Gtags/gtag-delete/{id}:
         *   delete:
         *     tags: [Granular Tags]
         *     summary: Delete a granular tag
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema: { type: string }
         *     responses:
         *       200:
         *         description: Granular tag deleted
         */
        this.router.delete(
            `${this.path}/gtag-delete/:id`,
            authenticateUser,
            this.gTag.deleteSample
        );
    }
}
