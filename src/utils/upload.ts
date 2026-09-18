import multer from "multer";
import path from "path";
import os from "os";

const uploadDir = path.join(os.tmpdir(), "emp-uploads");

const storage = multer.diskStorage({
	destination: uploadDir,
	filename: (_req, file, cb) => {
		const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		cb(null, `${unique}-${file.originalname}`);
	},
});

export const upload = multer({
	storage,
	limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});
