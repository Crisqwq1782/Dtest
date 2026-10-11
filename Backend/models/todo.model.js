import "dotenv/config";
import format from "pg-format";
import { pool } from "../database/connection.js";

// Creamos una constante con la URL de la aplicación según el entorno
// DOMAIN_URL_APP deberías crearla al momento de desplegar la aplicación
// PORT se debe agregar al archivo .env
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.DOMAIN_URL_APP
    : `http://localhost::${process.env.PORT}`;

const findAll = async ({ limit = 5, order = "ASC", page = 1, user }) => {
  // Consulta para contar el número total de filas en la tabla 'todos'
  const countQuery = "SELECT COUNT(*) FROM todos WHERE user_id = $1";
  const { rows: countResult } = await pool.query(countQuery, [user.user_id]);
  const total_rows = parseInt(countResult[0].count, 10);

  // Calcula el número total de páginas
  const total_pages = Math.ceil(total_rows / limit);

  const query =
    "SELECT * FROM todos WHERE user_id = %s ORDER BY done %s LIMIT %s OFFSET %s";
  const offset = (page - 1) * limit;
  const formattedQuery = format(query, user.user_id, order, limit, offset);
  const { rows } = await pool.query(formattedQuery);

  // Devuelve un array con los resultados y un enlace a cada uno de ellos
  const results = rows.map((row) => {
    return {
      ...row,
      href: `${BASE_URL}/todos/${row.id}`,
    };
  });

  // Devuelve un objeto con los resultados, el número total de páginas y los enlaces a la página siguiente y anterior
  return {
    results,
    total_pages,
    page,
    limit,
    next:
      total_pages <= page
        ? null
        : `${BASE_URL}/todos?limit=${limit}&page=${page + 1}`,
    previous:
      page <= 1 ? null : `${BASE_URL}/todos?limit=${limit}&page=${page - 1}`,
  };
};

const findById = async (id, user) => {
  const query = "SELECT * FROM todos WHERE id = $1 WHERE user_id = $2";
  const { rows } = await pool.query(query, [id, user.user_id]);
  return rows[0];
};

const create = async (todo, user) => {
  console.log({ user });
  const query =
    "INSERT INTO todos (title, done, user_id) VALUES ($1, $2, $3) RETURNING *";
  const { rows } = await pool.query(query, [
    todo.title,
    todo.done,
    user.user_id,
  ]);
  return rows[0];
};

const remove = async (id, user) => {
  const query = "DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *";
  const { rows } = await pool.query(query, [id, user.user_id]);
  return rows[0];
};

const update = async (id, user) => {
  const query =
    "UPDATE todos SET done = NOT done WHERE id = $1 AND user_id = $2 RETURNING *";
  const { rows } = await pool.query(query, [id, user.user_id]);
  return rows[0];
};

export const todoModel = {
  findAll,
  findById,
  create,
  remove,
  update,
};
