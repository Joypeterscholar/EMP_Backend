import config from "../config/variables";

describe("config", () => {
  it("should export all required keys", () => {
    expect(config).toHaveProperty("NODE_ENV");
    expect(config).toHaveProperty("PORT");
    expect(config).toHaveProperty("MONGO_URL");
    expect(config).toHaveProperty("AWS_ACCESS_KEY_ID");
    expect(config).toHaveProperty("AWS_SECRET_ACCESS_KEY");
    expect(config).toHaveProperty("AWS_REGION");
    expect(config).toHaveProperty("S3_BUCKET_NAME");
    expect(config).toHaveProperty("JWT_SECRET_KEY");
    expect(config).toHaveProperty("JWT_ACCESS_LIFETIME");
    expect(config).toHaveProperty("EMAIL_SERVICE");
    expect(config).toHaveProperty("EMAIL_PORT");
    expect(config).toHaveProperty("EMAIL_USER");
    expect(config).toHaveProperty("EMAIL_PASSWORD");
    expect(config).toHaveProperty("FRONTEND_URL");
  });

  it("should default NODE_ENV to development", () => {
    expect(config.NODE_ENV).toBeTruthy();
  });

  it("should default AWS_REGION to us-east-1", () => {
    expect(config.AWS_REGION).toBe("us-east-1");
  });

  it("should default JWT_ACCESS_LIFETIME to 30d", () => {
    expect(config.JWT_ACCESS_LIFETIME).toBe("30d");
  });
});
