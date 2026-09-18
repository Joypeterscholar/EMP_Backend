import { Router } from "express";
import { UserController } from "./users.controller";
import { upload } from "../../utils/upload";
import {
	authenticateUser,
	// authorizeTaggersOrSuperAdmins
} from "../../middlewares/auth.middleware";

const fields = upload.fields([{ name: "image", maxCount: 1 }]);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User authentication, registration, and management
 */
export class UserRoute {
	path = "/user";
	router = Router();
	private userController = new UserController();

	constructor() {
		this.initialiseRoutes();
	}

	private initialiseRoutes(): void {
		/**
		 * @swagger
		 * /user/register:
		 *   post:
		 *     tags: [Users]
		 *     summary: Register a new user
		 *     consumes:
		 *       - multipart/form-data
		 *     parameters:
		 *       - in: formData
		 *         name: email
		 *         required: true
		 *         schema: { type: string, format: email }
		 *       - in: formData
		 *         name: password
		 *         required: true
		 *         schema: { type: string }
		 *       - in: formData
		 *         name: username
		 *         required: true
		 *         schema: { type: string }
		 *       - in: formData
		 *         name: fullname
		 *         schema: { type: string }
		 *       - in: formData
		 *         name: image
		 *         schema: { type: string, format: binary }
		 *     responses:
		 *       200:
		 *         description: User registered successfully
		 *       400:
		 *         description: Validation error
		 */
		this.router.post(
			`${this.path}/register`,
			fields,
			this.userController.signUpTagger
		);

		/**
		 * @swagger
		 * /user/seed-super-admin:
		 *   get:
		 *     tags: [Users]
		 *     summary: Seed the super admin account
		 *     responses:
		 *       201:
		 *         description: SuperAdmin seeded
		 */
		this.router.get(
			`${this.path}/seed-super-admin`,
			fields,
			this.userController.seedSuperAdmin
		);

		/**
		 * @swagger
		 * /user/check-authenticated:
		 *   get:
		 *     tags: [Users]
		 *     summary: Check if current token is authenticated
		 *     security:
		 *       - bearerAuth: []
		 *     responses:
		 *       200:
		 *         description: Auth status
		 */
		this.router.get(
			`${this.path}/check-authenticated`,
			this.userController.CheckIfAuthenticated
		);

		/**
		 * @swagger
		 * /user/login:
		 *   post:
		 *     tags: [Users]
		 *     summary: Login with email and password
		 *     requestBody:
		 *       required: true
		 *       content:
		 *         application/json:
		 *           schema:
		 *             $ref: '#/components/schemas/LoginRequest'
		 *     responses:
		 *       200:
		 *         description: Login successful
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/AuthResponse'
		 *       400:
		 *         description: Invalid credentials
		 */
		this.router.post(`${this.path}/login`, this.userController.LoginAdmin);

		/**
		 * @swagger
		 * /user/register-tagger:
		 *   post:
		 *     tags: [Users]
		 *     summary: Register a new tagger user
		 *     consumes:
		 *       - multipart/form-data
		 *     security:
		 *       - bearerAuth: []
		 *     parameters:
		 *       - in: formData
		 *         name: email
		 *         required: true
		 *         schema: { type: string, format: email }
		 *       - in: formData
		 *         name: password
		 *         required: true
		 *         schema: { type: string }
		 *       - in: formData
		 *         name: username
		 *         required: true
		 *         schema: { type: string }
		 *       - in: formData
		 *         name: role
		 *         required: true
		 *         schema: { type: string }
		 *       - in: formData
		 *         name: location
		 *         schema: { type: string }
		 *       - in: formData
		 *         name: fullname
		 *         schema: { type: string }
		 *       - in: formData
		 *         name: image
		 *         schema: { type: string, format: binary }
		 *     responses:
		 *       200:
		 *         description: Tagger registered
		 */
		this.router.post(
			`${this.path}/register-tagger`,
			fields,
			this.userController.signUpTagger
		);

		/**
		 * @swagger
		 * /user/getusers:
		 *   get:
		 *     tags: [Users]
		 *     summary: Get all users (filtered by role)
		 *     security:
		 *       - bearerAuth: []
		 *     responses:
		 *       200:
		 *         description: List of users
		 */
		this.router.get(
			`${this.path}/getusers`,
			authenticateUser,
			this.userController.getUsers
		);

		/**
		 * @swagger
		 * /user/get-a-user/{id}:
		 *   get:
		 *     tags: [Users]
		 *     summary: Get a user by ID
		 *     security:
		 *       - bearerAuth: []
		 *     parameters:
		 *       - in: path
		 *         name: id
		 *         required: true
		 *         schema: { type: string }
		 *     responses:
		 *       200:
		 *         description: User found
		 *       404:
		 *         description: User not found
		 */
		this.router.get(
			`${this.path}/get-a-user/:id`,
			authenticateUser,
			this.userController.getAUser
		);

		/**
		 * @swagger
		 * /user/update-user/{id}:
		 *   put:
		 *     tags: [Users]
		 *     summary: Update a user
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
		 *         name: username
		 *         schema: { type: string }
		 *       - in: formData
		 *         name: email
		 *         schema: { type: string }
		 *       - in: formData
		 *         name: fullname
		 *         schema: { type: string }
		 *       - in: formData
		 *         name: role
		 *         schema: { type: string }
		 *       - in: formData
		 *         name: location
		 *         schema: { type: string }
		 *       - in: formData
		 *         name: image
		 *         schema: { type: string, format: binary }
		 *     responses:
		 *       200:
		 *         description: User updated
		 */
		this.router.put(
			`${this.path}/update-user/:id`,
			fields,
			authenticateUser,
			this.userController.updateAUser
		);

		/**
		 * @swagger
		 * /user/delete/{id}:
		 *   delete:
		 *     tags: [Users]
		 *     summary: Delete a user
		 *     security:
		 *       - bearerAuth: []
		 *     parameters:
		 *       - in: path
		 *         name: id
		 *         required: true
		 *         schema: { type: string }
		 *     responses:
		 *       200:
		 *         description: User deleted
		 */
		this.router.delete(
			`${this.path}/delete/:id`,
			authenticateUser,
			this.userController.deleteUser
		);

		/**
		 * @swagger
		 * /user/set-two-factor-auth-verification-method:
		 *   post:
		 *     tags: [Users]
		 *     summary: Initiate 2FA setup — sends a TOTP secret
		 *     requestBody:
		 *       required: true
		 *       content:
		 *         application/json:
		 *           schema:
		 *             type: object
		 *             required: [email]
		 *             properties:
		 *               email: { type: string, format: email }
		 *     responses:
		 *       200:
		 *         description: 2FA secret returned
		 */
		this.router.post(
			`${this.path}/set-two-factor-auth-verification-method`,
			this.userController.twoFA
		);

		/**
		 * @swagger
		 * /user/send-reset-verification-token:
		 *   post:
		 *     tags: [Users]
		 *     summary: Request a password reset email
		 *     requestBody:
		 *       required: true
		 *       content:
		 *         application/json:
		 *           schema:
		 *             type: object
		 *             required: [email]
		 *             properties:
		 *               email: { type: string, format: email }
		 *     responses:
		 *       200:
		 *         description: Reset link sent
		 */
		this.router.post(
			`${this.path}/send-reset-verification-token`,
			this.userController.requestPasswordReset
		);

		/**
		 * @swagger
		 * /user/two-factor-auth-verification-token:
		 *   post:
		 *     tags: [Users]
		 *     summary: Verify a 2FA token and complete login or enable 2FA
		 *     requestBody:
		 *       required: true
		 *       content:
		 *         application/json:
		 *           schema:
		 *             type: object
		 *             required: [email, token]
		 *             properties:
		 *               email: { type: string }
		 *               token: { type: string }
		 *     responses:
		 *       200:
		 *         description: 2FA verified
		 */
		this.router.post(
			`${this.path}/two-factor-auth-verification-token`,
			this.userController.twoFAverifyToken
		);

		/**
		 * @swagger
		 * /user/reset-password-verification-token:
		 *   post:
		 *     tags: [Users]
		 *     summary: Reset password using the token from email
		 *     requestBody:
		 *       required: true
		 *       content:
		 *         application/json:
		 *           schema:
		 *             type: object
		 *             required: [token, password]
		 *             properties:
		 *               token: { type: string }
		 *               password: { type: string }
		 *     responses:
		 *       200:
		 *         description: Password reset successful
		 */
		this.router.post(
			`${this.path}/reset-password-verification-token`,
			this.userController.resetPasswordVerifyToken
		);

		/**
		 * @swagger
		 * /user/update-password:
		 *   put:
		 *     tags: [Users]
		 *     summary: Update password by email
		 *     requestBody:
		 *       required: true
		 *       content:
		 *         application/json:
		 *           schema:
		 *             type: object
		 *             required: [email, password]
		 *             properties:
		 *               email: { type: string }
		 *               password: { type: string }
		 *     responses:
		 *       200:
		 *         description: Password updated
		 */
		this.router.put(
			`${this.path}/update-password`,
			this.userController.updatePassword
		);

		/**
		 * @swagger
		 * /user/dashboard:
		 *   get:
		 *     tags: [Users]
		 *     summary: Get dashboard statistics
		 *     security:
		 *       - bearerAuth: []
		 *     responses:
		 *       200:
		 *         description: Dashboard data
		 */
		this.router.get(
			`${this.path}/dashboard`,
			authenticateUser,
			this.userController.dashboard
		);

		/**
		 * @swagger
		 * /user/dashboard-by-location/{locationId}:
		 *   get:
		 *     tags: [Users]
		 *     summary: Get dashboard statistics for a specific location
		 *     security:
		 *       - bearerAuth: []
		 *     parameters:
		 *       - in: path
		 *         name: locationId
		 *         required: true
		 *         schema: { type: string }
		 *     responses:
		 *       200:
		 *         description: Location-specific dashboard data
		 */
		this.router.get(
			`${this.path}/dashboard-by-location/:locationId`,
			authenticateUser,
			this.userController.dashboardByLocation
		);
	}
}
