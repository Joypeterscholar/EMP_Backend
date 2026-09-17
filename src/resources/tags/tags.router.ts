import { Router } from "express";
import { TagController } from "./tags.controller";
import { upload } from "../../utils/upload";

import { authenticateUser } from "../../middlewares/auth.middleware";
const fields = upload.fields([
    { name: 'evidence', maxCount: 1 },
    { name: 'model', maxCount: 1 }
])

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Tag management — sampling and incident tags with evidence
 */
export class TagsRoute {
    path = '/tag';
    router = Router();

    private tag = new TagController();
    constructor() {
        this.initialiseRoutes()
    }

    private initialiseRoutes(): void {
        /**
         * @swagger
         * /tag/add:
         *   post:
         *     tags: [Tags]
         *     summary: Create a new tag (sampling or incident)
         *     consumes:
         *       - multipart/form-data
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: formData
         *         name: objectName
         *         required: true
         *         schema: { type: string }
         *       - in: formData
         *         name: action
         *         required: true
         *         schema: { type: string }
         *       - in: formData
         *         name: modelId
         *         required: true
         *         schema: { type: string }
         *       - in: formData
         *         name: userId
         *         required: true
         *         schema: { type: string }
         *       - in: formData
         *         name: locations
         *         required: true
         *         schema: { type: string }
         *       - in: formData
         *         name: type
         *         required: true
         *         schema: { type: string, enum: [sampling, incident] }
         *       - in: formData
         *         name: sample
         *         schema: { type: string }
         *       - in: formData
         *         name: incident
         *         schema: { type: string }
         *       - in: formData
         *         name: taggedInfo
         *         schema: { type: string }
         *       - in: formData
         *         name: text
         *         schema: { type: string }
         *       - in: formData
         *         name: presence
         *         schema: { type: string, enum: [positive, negative] }
         *       - in: formData
         *         name: group
         *         schema: { type: string }
         *       - in: formData
         *         name: evidence
         *         schema: { type: string, format: binary }
         *     responses:
         *       200:
         *         description: Tag created
         */
        this.router.post(
            `${this.path}/add`,
            authenticateUser,
            fields,
            this.tag.addTag
        );

        /**
         * @swagger
         * /tag/all-tags:
         *   get:
         *     tags: [Tags]
         *     summary: Get all tags
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: List of tags
         */
        this.router.get(
            `${this.path}/all-tags`,
            authenticateUser,
            this.tag.allTags
        );

        /**
         * @swagger
         * /tag/paginated-tags:
         *   get:
         *     tags: [Tags]
         *     summary: Get paginated tags
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: query
         *         name: page
         *         schema: { type: integer, default: 1 }
         *       - in: query
         *         name: limit
         *         schema: { type: integer, default: 20 }
         *     responses:
         *       200:
         *         description: Paginated tags
         */
        this.router.get(
            `${this.path}/paginated-tags`,
            authenticateUser,
            this.tag.paginatedTags
        );

        /**
         * @swagger
         * /tag/update-tag/{id}:
         *   put:
         *     tags: [Tags]
         *     summary: Update a tag
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
         *         name: evidence
         *         schema: { type: string, format: binary }
         *     responses:
         *       200:
         *         description: Tag updated
         */
        this.router.put(
            `${this.path}/update-tag/:id`,
            authenticateUser,
            fields,
            this.tag.updateTag
        );

        /**
         * @swagger
         * /tag/tags-delete/{id}:
         *   delete:
         *     tags: [Tags]
         *     summary: Delete a tag
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema: { type: string }
         *     responses:
         *       200:
         *         description: Tag deleted
         */
        this.router.delete(
            `${this.path}/tags-delete/:id`,
            authenticateUser,
            this.tag.deleteTag
        );

        /**
         * @swagger
         * /tag/delete-model-tags/{id}:
         *   delete:
         *     tags: [Tags]
         *     summary: Delete all tags for a model
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema: { type: string, description: Model ID }
         *     responses:
         *       200:
         *         description: Model tags deleted
         */
        this.router.delete(
            `${this.path}/delete-model-tags/:id}`,
            authenticateUser,
            this.tag.deleteModelTags
        );
    }
}
