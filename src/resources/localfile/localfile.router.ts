import { Router } from "express";
import { FilesController } from "./files.controller";

import { authenticateUser } from "../../middlewares/auth.middleware";

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: Local file serving (development only)
 */
export class FilesRoute {
    router = Router();

    path = "/file"

    private controller = new FilesController();
    constructor() {
        this.initialiseRoutes()
    }

    private initialiseRoutes(): void {
        /**
         * @swagger
         * /file/{filename}:
         *   get:
         *     tags: [Files]
         *     summary: Serve a local file by filename
         *     parameters:
         *       - in: path
         *         name: filename
         *         required: true
         *         schema: { type: string }
         *     responses:
         *       200:
         *         description: File content
         *       404:
         *         description: File not found
         */
        this.router.get(
            `${this.path}/:filename`,
            this.controller.getFile
        );
    }
}
