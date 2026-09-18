import {
  shouldUseLocalDisk,
  extractAWSKeyFromCoverPhotoUrl,
} from "../utils/aws/aws";

describe("aws utilities", () => {
  describe("shouldUseLocalDisk", () => {
    it("should return a boolean", () => {
      const result = shouldUseLocalDisk();
      expect(typeof result).toBe("boolean");
    });
  });

  describe("extractAWSKeyFromCoverPhotoUrl", () => {
    it("should extract key from a valid S3 URL", () => {
      const url = "https://bucket.s3.amazonaws.com/coverPhoto/user/photo.jpg";
      const key = extractAWSKeyFromCoverPhotoUrl(url);
      expect(key).toBe("user/photo.jpg");
    });

    it("should return null if coverPhoto is not in URL", () => {
      const url = "https://bucket.s3.amazonaws.com/some/other/path.jpg";
      const key = extractAWSKeyFromCoverPhotoUrl(url);
      expect(key).toBeNull();
    });

    it("should return null for empty string", () => {
      const key = extractAWSKeyFromCoverPhotoUrl("");
      expect(key).toBeNull();
    });
  });
});
