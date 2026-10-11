import bcrypt from "bcryptjs";
import request from "supertest";
import { jest } from "@jest/globals";

process.env.JWT_SECRET = "jest-test-secret";

const mockUserModel = {
  findOneEmail: jest.fn(),
  create: jest.fn(),
};

const mockTodoModel = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

jest.unstable_mockModule("../models/user.model.js", () => ({
  userModel: mockUserModel,
}));

jest.unstable_mockModule("../models/todo.model.js", () => ({
  todoModel: mockTodoModel,
}));

const { app } = await import("../index.js");

describe("POST /users/login and GET /todos with token", () => {
  let token;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserModel.findOneEmail.mockResolvedValue({
      email: "test@test.com",
      user_id: "test-user-id",
      password: bcrypt.hashSync("123123", 10),
    });
    mockTodoModel.findAll.mockResolvedValue({
      results: [{ id: "1", title: "Test todo", done: false }],
      total_pages: 1,
      page: 1,
      limit: 5,
      next: null,
      previous: null,
    });
  });

  it("returns a token after a successful login", async () => {
    const response = await request(app)
      .post("/users/login")
      .send({ email: "test@test.com", password: "123123" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.email).toBe("test@test.com");

    token = response.body.token;
  });

  it("returns todos when the request has the login token", async () => {
    const loginResponse = await request(app)
      .post("/users/login")
      .send({ email: "test@test.com", password: "123123" });
    token = loginResponse.body.token;

    const response = await request(app)
      .get("/todos")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.results).toBeInstanceOf(Array);
    expect(response.body.results.length).toBeGreaterThan(0);
  });
});
