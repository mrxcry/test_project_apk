import express from "express";
import pkg from "pg";

const { Pool } = pkg;
const app = express();
app.use(express.json());

// подключение к базе postgresql
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "testdb",
  password: "password",
  port: 5432,
});

// структура таблиц:
//
// create table events (
//   id serial primary key,
//   name varchar(255),
//   total_seats int
// );
//
// create table bookings (
//   id serial primary key,
//   event_id int references events(id),
//   user_id varchar(255),
//   created_at timestamp default now()
// );

// endpoint для бронирования места
app.post("/api/bookings/reserve", async (req, res) => {
  const { event_id, user_id } = req.body;

  if (!event_id || !user_id) {
    return res.status(400).json({ error: "event_id и user_id обязательны" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // проверяем, существует ли событие
    const eventRes = await client.query(
      "select * from events where id = $1 for update",
      [event_id]
    );

    if (eventRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "событие не найдено" });
    }

    const event = eventRes.rows[0];

    // проверяем, не бронировал ли пользователь уже
    const existingBooking = await client.query(
      "select * from bookings where event_id = $1 and user_id = $2",
      [event_id, user_id]
    );

    if (existingBooking.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "вы уже забронировали это событие" });
    }

    // проверяем наличие свободных мест
    const bookingCount = await client.query(
      "select count(*) from bookings where event_id = $1",
      [event_id]
    );

    if (parseInt(bookingCount.rows[0].count) >= event.total_seats) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "нет свободных мест" });
    }

    // создаем запись о бронировании
    const newBooking = await client.query(
      "insert into bookings (event_id, user_id) values ($1, $2) returning *",
      [event_id, user_id]
    );

    await client.query("COMMIT");

    res.status(201).json(newBooking.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("db error:", err);
    res.status(500).json({ error: "ошибка сервера" });
  } finally {
    client.release();
  }
});

app.listen(3000, () => {
  console.log("server started on port 3000");
});
