import { Router } from "express";
import { CommentController } from "./comments.controllers";
import { authenticateUser } from "../../middlewares/auth.middleware";

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comments on tags
 */
export class CommentRoutes {
    path = "/comment";
    router = Router();

    private Comments = new CommentController()

    constructor() {
        this.initialiseRoutes();
    }
    private initialiseRoutes(): void {
        /**
         * @swagger
         * /comment/add:
         *   post:
         *     tags: [Comments]
         *     summary: Add a comment to a tag
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required: [text, tag, userId]
         *             properties:
         *               text: { type: string }
         *               tag: { type: string, description: Tag ID }
         *               userId: { type: string }
         *     responses:
         *       200:
         *         description: Comment added
         */
        this.router.post(
            `${this.path}/add`,
            authenticateUser,
            this.Comments.addComment
        )
    }
}
