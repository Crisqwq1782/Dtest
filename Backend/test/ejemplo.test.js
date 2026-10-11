const sumar = (a, b) => a + b;

describe("Probando Jest", () => {
  it("Sumar 10 + 20 y el resultado debe ser 30", () => {
    expect(sumar(10, 20)).toBe(30);
  });
});
