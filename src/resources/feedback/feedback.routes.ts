import { Router } from "express";
import { FeedbackController } from "./feedback.controllers";
import { authenticateUser } from "../../middlewares/auth.middleware";
import multer from "multer";

const allowedMimeTypes = [
	"image/png",
	"image/jpeg",
	"image/gif",
	"image/webp",
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"text/plain",
	"video/mp4",
	"video/quicktime",
	"video/x-msvideo",
	"video/webm"
];

const uploadDir = require("os").tmpdir();

const attachmentUpload = multer({
	storage: multer.diskStorage({
		destination: uploadDir,
		filename: (_req, file, cb) => {
			const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
			cb(null, `${unique}-${file.originalname}`);
		},
	}),
	limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
	fileFilter: (_req, file, cb) => {
		if (allowedMimeTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(
				new Error(
					"Unsupported file type. Please upload images, videos, pdf or text files."
				)
			);
		}
	}
}).single("attachment");

/**
 * @swagger
 * tags:
 *   name: Feedback
 *   description: User feedback — submit and manage feedback with attachments
 */
export class FeedbackRoutes {
	public path = "/feedback";
	public router = Router();
	private controller = new FeedbackController();

	constructor() {
		this.initialiseRoutes();
	}

	private initialiseRoutes() {
		/**
		 * @swagger
		 * /feedback:
		 *   post:
		 *     tags: [Feedback]
		 *     summary: Submit feedback with optional attachment
		 *     consumes:
		 *       - multipart/form-data
		 *     security:
		 *       - bearerAuth: []
		 *     parameters:
		 *       - in: formData
		 *         name: message
		 *         required: true
		 *         schema: { type: string, maxLength: 5000 }
		 *       - in: formData
		 *         name: attachment
		 *         schema: { type: string, format: binary }
		 *     responses:
		 *       201:
		 *         description: Feedback submitted
		 *       400:
		 *         description: Validation error
		 */
		this.router.post(
			this.path,
			authenticateUser,
			attachmentUpload,
			(req, res) => this.controller.createFeedback(req, res)
		);

		/**
		 * @swagger
		 * /feedback:
		 *   get:
		 *     tags: [Feedback]
		 *     summary: Get feedback list (admin sees all, users see own)
		 *     security:
		 *       - bearerAuth: []
		 *     parameters:
		 *       - in: query
		 *         name: status
		 *         schema: { type: string, enum: [pending, reviewed, resolved, all] }
		 *     responses:
		 *       200:
		 *         description: List of feedback
		 */
		this.router.get(
			this.path,
			authenticateUser,
			(req, res) => this.controller.getFeedbacks(req, res)
		);

		/**
		 * @swagger
		 * /feedback/{id}/status:
		 *   patch:
		 *     tags: [Feedback]
		 *     summary: Update feedback status (super admin only)
		 *     security:
		 *       - bearerAuth: []
		 *     parameters:
		 *       - in: path
		 *         name: id
		 *         required: true
		 *         schema: { type: string }
		 *     requestBody:
		 *       required: true
		 *       content:
		 *         application/json:
		 *           schema:
		 *             type: object
		 *             required: [status]
		 *             properties:
		 *               status:
		 *                 type: string
		 *                 enum: [pending, reviewed, resolved]
		 *     responses:
		 *       200:
		 *         description: Feedback status updated
		 *       403:
		 *         description: Not authorized
		 */
		this.router.patch(
			`${this.path}/:id/status`,
			authenticateUser,
			(req, res) => this.controller.updateFeedbackStatus(req, res)
		);
	}
}
