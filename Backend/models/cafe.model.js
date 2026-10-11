import { pool } from "../database/connection.js";

const findAll = async () => {
  const query =
    "SELECT data || jsonb_build_object('id', id) AS cafe FROM cafes ORDER BY id";
  const { rows } = await pool.query(query);
  return rows.map(({ cafe }) => cafe);
};

const create = async (cafe) => {
  const { id: _id, ...data } = cafe;
  const query =
    "INSERT INTO cafes (data) VALUES ($1::jsonb) RETURNING data || jsonb_build_object('id', id) AS cafe";
  const { rows } = await pool.query(query, [JSON.stringify(data)]);
  return rows[0].cafe;
};

const update = async (id, cafe) => {
  const { id: _bodyId, ...data } = cafe;
  const query =
    "UPDATE cafes SET data = $2::jsonb WHERE id = $1 RETURNING data || jsonb_build_object('id', id) AS cafe";
  const { rows } = await pool.query(query, [id, JSON.stringify(data)]);
  return rows[0]?.cafe;
};

const remove = async (id) => {
  const query = "DELETE FROM cafes WHERE id = $1 RETURNING id";
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const cafeModel = {
  findAll,
  create,
  update,
  remove,
};
