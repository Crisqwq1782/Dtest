# Aplicación Backend - Módulo Node y Express
Esta aplicación backend corresponde al ejercicio explicado en las guías complementarias del módulo

## Rutas de cafés

La API de cafés requiere ejecutar una vez `database/cafes.sql` conectado a la base de datos indicada por `PGDATABASE` en `.env`. El script crea la tabla y agrega un café inicial para que `GET /cafes` entregue al menos un resultado.

- `GET /cafes`: lista cafés.
- `POST /cafes`: crea un café con un cuerpo JSON, por ejemplo `{"nombre":"Latte","precio":2500}`.
- `PUT /cafes/:id`: reemplaza los datos del café. El `id` del cuerpo debe coincidir con el parámetro.
- `DELETE /cafes/:id`: elimina un café.

Las rutas `/todos` y `/users` existentes se mantienen sin cambios.
