import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EMP Backend API",
      version: "1.0.0",
      description:
        "Environmental Mapping Platform — Backend API for managing models, tags, samples, incidents, locations, feedback, and user authentication.",
      contact: {
        name: "Orion Tech",
      },
    },
    servers: [
      {
        url: "/api",
        description: "API server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "apiKey",
          in: "header",
          name: "Authorization",
          description: 'Enter `Bearer <token>`',
        },
      },
      schemas: {
        // ── Auth ────────────────────────────────────────
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
                accessToken: { type: "string" },
              },
            },
            message: { type: "string" },
          },
        },
        // ── User ────────────────────────────────────────
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            username: { type: "string" },
            email: { type: "string", format: "email" },
            fullname: { type: "string" },
            imageUrl: { type: "string" },
            role: {
              type: "string",
              enum: ["superAdmin", "admin", "reviewer", "tagger", "sampler"],
            },
            isVerified: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        RegisterUser: {
          type: "object",
          required: ["email", "password", "username"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            username: { type: "string" },
            fullname: { type: "string" },
            role: { type: "string" },
            location: { type: "string", description: "Location ID" },
          },
        },
        // ── Model ───────────────────────────────────────
        Model: {
          type: "object",
          properties: {
            _id: { type: "string" },
            modelName: { type: "string" },
            description: { type: "string" },
            slug: { type: "string", example: "FAC-1234" },
            file: { type: "string", description: "Model file URL" },
            coverPicture: { type: "string", description: "Cover photo URL" },
            size: { type: "number" },
            location: { $ref: "#/components/schemas/Location" },
            user: { $ref: "#/components/schemas/User" },
            delete: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CreateModel: {
          type: "object",
          required: ["modelName", "description", "userId", "location"],
          properties: {
            modelName: { type: "string" },
            description: { type: "string" },
            userId: { type: "string" },
            location: { type: "string" },
            size: { type: "number" },
            isComplete: { type: "boolean" },
          },
        },
        // ── Tag ─────────────────────────────────────────
        Tag: {
          type: "object",
          properties: {
            _id: { type: "string" },
            slug: { type: "string", example: "SAM-1234567890" },
            objectName: { type: "string" },
            evidence: { type: "string", description: "Evidence file URL" },
            action: { type: "string" },
            presence: { type: "string", enum: ["positive", "negative"] },
            type: { type: "string", enum: ["sampling", "incident"] },
            taggedInfo: { type: "string" },
            text: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
            model: { $ref: "#/components/schemas/Model" },
            sample: { type: "string" },
            incident: { type: "string" },
            locations: { type: "string" },
            group: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        AddTag: {
          type: "object",
          required: ["objectName", "action", "modelId", "userId", "locations", "type"],
          properties: {
            objectName: { type: "string" },
            action: { type: "string" },
            modelId: { type: "string" },
            userId: { type: "string" },
            locations: { type: "string" },
            sample: { type: "string" },
            incident: { type: "string" },
            taggedInfo: { type: "string" },
            text: { type: "string" },
            presence: { type: "string", enum: ["positive", "negative"] },
            type: { type: "string", enum: ["sampling", "incident"] },
            group: { type: "string" },
          },
        },
        // ── Sample ──────────────────────────────────────
        Sample: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            image: { type: "string", description: "Sample image URL" },
            user: { $ref: "#/components/schemas/User" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CreateSample: {
          type: "object",
          required: ["name", "description"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
          },
        },
        // ── Location ────────────────────────────────────
        Location: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            location: { type: "string" },
            image: { type: "string", description: "Location image URL" },
            user: { $ref: "#/components/schemas/User" },
            models: {
              type: "array",
              items: { type: "string" },
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CreateLocation: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
          },
        },
        // ── Incident ────────────────────────────────────
        Incident: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            image: { type: "string" },
            model: { $ref: "#/components/schemas/Model" },
            user: { $ref: "#/components/schemas/User" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        // ── Granular Tag ────────────────────────────────
        Gtag: {
          type: "object",
          properties: {
            _id: { type: "string" },
            objectName: { type: "string" },
            taggedInfo: { type: "string" },
            image: { type: "string", description: "GTag image URL" },
            modelId: { $ref: "#/components/schemas/Model" },
            userId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CreateGtag: {
          type: "object",
          required: ["model", "objectName", "user"],
          properties: {
            model: { type: "string", description: "Model ID" },
            objectName: { type: "string" },
            taggedInfo: { type: "string" },
            user: { type: "string", description: "User ID" },
          },
        },
        // ── Feedback ────────────────────────────────────
        Feedback: {
          type: "object",
          properties: {
            _id: { type: "string" },
            message: { type: "string" },
            status: {
              type: "string",
              enum: ["pending", "reviewed", "resolved"],
            },
            attachment: {
              type: "object",
              properties: {
                url: { type: "string" },
                filename: { type: "string" },
                mimetype: { type: "string" },
              },
            },
            user: { $ref: "#/components/schemas/User" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CreateFeedback: {
          type: "object",
          required: ["message"],
          properties: {
            message: { type: "string", maxLength: 5000 },
          },
        },
        // ── Comment ─────────────────────────────────────
        Comment: {
          type: "object",
          properties: {
            _id: { type: "string" },
            text: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
            tag: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        AddComment: {
          type: "object",
          required: ["text", "tag", "userId"],
          properties: {
            text: { type: "string" },
            tag: { type: "string", description: "Tag ID" },
            userId: { type: "string" },
          },
        },
        // ── Generic ─────────────────────────────────────
        ErrorResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "error" },
            message: { type: "string" },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            data: {},
            message: { type: "string" },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, "../resources/**/*.routes.ts")],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
