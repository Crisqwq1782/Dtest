import request from "supertest";
import { jest } from "@jest/globals";

const mockTodoModel = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockCafeModel = {
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockUserModel = {
  findOneEmail: jest.fn(),
  create: jest.fn(),
};

jest.unstable_mockModule("../middlewares/auth.middleware.js", () => ({
  authMiddleware: (req, _res, next) => {
    req.user = { user_id: "mock-user-id" };
    next();
  },
}));

jest.unstable_mockModule("../models/user.model.js", () => ({
  userModel: mockUserModel,
}));

jest.unstable_mockModule("../models/todo.model.js", () => ({
  todoModel: mockTodoModel,
}));

jest.unstable_mockModule("../models/cafe.model.js", () => ({
  cafeModel: mockCafeModel,
}));

const { app } = await import("../index.js");
const { todoModel } = await import("../models/todo.model.js");
const { cafeModel } = await import("../models/cafe.model.js");

describe("Operaciones CRUD de todos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /todos devuelve 200 y un arreglo con al menos 1 elemento", async () => {
    mockTodoModel.findAll.mockResolvedValue({
      results: [{ id: "1", title: "Aprender Jest", done: false }],
      total_pages: 1,
      page: 1,
      limit: 5,
      next: null,
      previous: null,
    });

    const response = await request(app).get("/todos");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.results)).toBe(true);
    expect(response.body.results.length).toBeGreaterThan(0);
  });

  test("DELETE /todos/:id devuelve 404 si el id no existe", async () => {
    mockTodoModel.remove.mockResolvedValue(undefined);

    const response = await request(app).delete("/todos/999999");

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: "Todo not found" });
  });

  test("POST /todos agrega un nuevo todo y devuelve 201", async () => {
    const createdTodo = { id: "2", title: "Estudiar Supertest", done: false };
    mockTodoModel.create.mockResolvedValue(createdTodo);

    const response = await request(app)
      .post("/todos")
      .send({ title: "Estudiar Supertest" });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        title: "Estudiar Supertest",
        done: false,
      })
    );
    expect(todoModel.create).toHaveBeenCalledWith(
      { title: "Estudiar Supertest", done: false },
      { user_id: "mock-user-id" }
    );
  });

  test("PUT /todos/:id actualiza el estado del todo", async () => {
    const updatedTodo = { id: "3", title: "Terminar curso", done: true };
    mockTodoModel.update.mockResolvedValue(updatedTodo);

    const response = await request(app).put("/todos/3");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: "3",
        done: true,
      })
    );
    expect(todoModel.update).toHaveBeenCalledWith("3", { user_id: "mock-user-id" });
  });
});

describe("Operaciones CRUD de cafes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /cafes devuelve 200 y un arreglo con al menos 1 objeto", async () => {
    mockCafeModel.findAll.mockResolvedValue([
      { id: 1, nombre: "Café Nanacao" },
    ]);

    const response = await request(app).get("/cafes");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toEqual(
      expect.objectContaining({ id: 1, nombre: "Café Nanacao" })
    );
  });

  test("DELETE /cafes/:id devuelve 404 si el id no existe", async () => {
    mockCafeModel.remove.mockResolvedValue(undefined);

    const response = await request(app).delete("/cafes/999999");

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: "Cafe not found" });
  });

  test("POST /cafes agrega un cafe y devuelve 201", async () => {
    const newCafe = { nombre: "Latte", precio: 2500 };
    mockCafeModel.create.mockResolvedValue({ id: 2, ...newCafe });

    const response = await request(app).post("/cafes").send(newCafe);

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({ id: 2, nombre: "Latte", precio: 2500 })
    );
    expect(cafeModel.create).toHaveBeenCalledWith(newCafe);
  });

  test("PUT /cafes/:id devuelve 400 si el id del parámetro no coincide con el body", async () => {
    const response = await request(app)
      .put("/cafes/2")
      .send({ id: 1, nombre: "Latte" });

    expect(response.statusCode).toBe(400);
    expect(cafeModel.update).not.toHaveBeenCalled();
  });

  test("PUT /cafes/:id actualiza el cafe cuando los ids coinciden", async () => {
    const updatedCafe = { id: 2, nombre: "Latte grande" };
    mockCafeModel.update.mockResolvedValue(updatedCafe);

    const response = await request(app)
      .put("/cafes/2")
      .send(updatedCafe);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(updatedCafe);
    expect(cafeModel.update).toHaveBeenCalledWith(2, updatedCafe);
  });
});
