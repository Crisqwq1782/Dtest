import { getDatabaseError } from "../lib/errors/database.error.js";
import { cafeModel } from "../models/cafe.model.js";

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const parseId = (value) => {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
};

const handleError = (res, error) => {
  console.error(error);
  if (error.code) {
    const { code, message } = getDatabaseError(error.code);
    return res.status(code).json({ message });
  }
  return res.status(500).json({ message: "Internal server error" });
};

const read = async (_req, res) => {
  try {
    const cafes = await cafeModel.findAll();
    return res.status(200).json(cafes);
  } catch (error) {
    return handleError(res, error);
  }
};

const create = async (req, res) => {
  if (!isObject(req.body)) {
    return res.status(400).json({ message: "Cafe data must be an object" });
  }

  try {
    const cafe = await cafeModel.create(req.body);
    return res.status(201).json(cafe);
  } catch (error) {
    return handleError(res, error);
  }
};

const update = async (req, res) => {
  if (!isObject(req.body) || String(req.body.id) !== req.params.id) {
    return res.status(400).json({ message: "Cafe ids do not match" });
  }

  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json({ message: "Cafe not found" });
  }

  try {
    const cafe = await cafeModel.update(id, req.body);
    if (!cafe) {
      return res.status(404).json({ message: "Cafe not found" });
    }
    return res.status(200).json(cafe);
  } catch (error) {
    return handleError(res, error);
  }
};

const remove = async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json({ message: "Cafe not found" });
  }

  try {
    const cafe = await cafeModel.remove(id);
    if (!cafe) {
      return res.status(404).json({ message: "Cafe not found" });
    }
    return res.status(200).json({ message: "Cafe deleted" });
  } catch (error) {
    return handleError(res, error);
  }
};

export const cafeController = {
  read,
  create,
  update,
  remove,
};
