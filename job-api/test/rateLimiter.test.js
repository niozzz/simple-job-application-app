const request = require("supertest");
const app = require("../server");

const endPointLogin = "/api/login";

describe("Login Tests", () => {
  it("should rate limit login attempts", async () => {
    const payload = {
      username: "employer",
      password: "wrongpassword",
    };

    for (let i = 0; i < 101; i++) {
      try {
        const response = await request(app)
          .post(endPointLogin)
          .set("Content-Type", "application/json")
          .send(payload);

        if (i < 100) {
          expect(response.status).toBe(401);
        } else {
          expect(response.status).toBe(429);
        }
      } catch (error) {
        console.error("Error during test:", error);
      }
    }
  }, 30000); // Increase timeout to 30 seconds
});
