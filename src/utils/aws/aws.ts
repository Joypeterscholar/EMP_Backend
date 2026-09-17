import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import fsPromises from "fs/promises";
import { Readable } from "stream";
import config from "../../config/variables";

// ── Single S3 client shared across the entire app ─────────
const s3Client = new S3Client({ region: config.AWS_REGION });

function getPublicUrl(key: string): string {
	return `https://${config.S3_BUCKET_NAME}.s3.${config.AWS_REGION}.amazonaws.com/${key}`;
}

// ── Upload to S3 (replaces all 5 duplicate functions) ─────
export async function uploadToS3(
	body: Buffer | Readable | string,
	key: string
): Promise<string> {
	const stream = typeof body === "string"
		? fs.createReadStream(body)
		: body;

	const command = new PutObjectCommand({
		Bucket: config.S3_BUCKET_NAME,
		Key: key,
		Body: stream,
	});

	await s3Client.send(command);
	return getPublicUrl(key);
}

// ── Delete from S3 ────────────────────────────────────────
export async function deleteFromS3(key: string): Promise<void> {
	const command = new DeleteObjectCommand({
		Bucket: config.S3_BUCKET_NAME,
		Key: key,
	});
	await s3Client.send(command);
}

// ── Local disk helpers ────────────────────────────────────
export async function saveToDisk(fileContent: any, name: string) {
	let nameParts = name.split("/");
	name = nameParts[nameParts.length - 1];
	let fileName = `${__dirname}/${name}`;
	let res = "";
	await fsPromises
		.writeFile(fileName, fileContent)
		.then(() => {
			res = `api/file/${name}`;
		})
		.catch((err) => {
			res = "";
			console.error(err);
		});
	return res;
}

export async function getFileFromDisk(fileName: string): Promise<Buffer> {
	let res: Buffer;
	fileName = `${__dirname}/${fileName}`;
	res = await fsPromises
		.readFile(fileName)
		.then((content) => {
			return content;
		})
		.catch((err) => {
			console.error(err);
			let emptyBuffer = Buffer.alloc(0);
			return emptyBuffer;
		});
	return res;
}

export async function deleteFileFromDisk(fileName: string): Promise<boolean> {
	let res = false;
	fileName = `${__dirname}/${fileName}`;
	await fsPromises
		.rm(fileName)
		.then(() => {
			res = true;
		})
		.catch(console.error);
	return res;
}

// ── URL key extraction ────────────────────────────────────
export function extractAWSKeyFromCoverPhotoUrl(
	coverPhotoUrl: string
): string | null {
	const urlParts = coverPhotoUrl.split("/");
	const coverPhotoIndex = urlParts.indexOf("coverPhoto");
	if (coverPhotoIndex !== -1 && coverPhotoIndex < urlParts.length - 2) {
		return urlParts.slice(coverPhotoIndex + 1).join("/");
	}
	return null;
}

// ── Dev detection (fixed typo: was _ACCESS_KEY_ID) ────────
export function shouldUseLocalDisk(): boolean {
	return (
		config.UPLOAD_MODE === "mongo" ||
		!config.AWS_ACCESS_KEY_ID ||
		!config.AWS_SECRET_ACCESS_KEY
	);
}

// ── Unified upload: routes to S3 or local disk by UPLOAD_MODE ──
export async function uploadFile(
	filePath: string | undefined,
	key: string
): Promise<string> {
	if (!filePath) return "";
	if (config.UPLOAD_MODE === "aws") {
		const url = await uploadToS3(filePath, key);
		// cleanup temp file after S3 upload
		await fsPromises.unlink(filePath).catch(() => {});
		return url;
	}
	return saveToDisk(filePath, key);
}

// ── Unified delete: routes to S3 or local disk by UPLOAD_MODE ──
export async function deleteFile(
	fileUrlOrKey: string,
): Promise<void> {
	if (config.UPLOAD_MODE === "aws") {
		const key = extractAWSKeyFromCoverPhotoUrl(fileUrlOrKey) || fileUrlOrKey;
		await deleteFromS3(key);
	} else {
		// For local disk, extract filename from the URL path
		const parts = fileUrlOrKey.split("/");
		const fileName = parts[parts.length - 1];
		await deleteFileFromDisk(fileName);
	}
}
