import pg from "pg";
console.log(pg.Pool);

const pool = new pg.Pool({
  database: "time_tracker",
});

export { pool as default };
