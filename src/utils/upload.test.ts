import { upload } from "./upload";
import multer from "multer";

describe("upload", () => {
  it("should be a multer instance", () => {
    expect(upload).toBeDefined();
    expect(typeof upload.single).toBe("function");
    expect(typeof upload.fields).toBe("function");
  });

  it("should have 50MB file size limit", () => {
    const limits = (upload as any).limits;
    expect(limits.fileSize).toBe(50 * 1024 * 1024);
  });
});
