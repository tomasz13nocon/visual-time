import pg from "pg";

const pool = new pg.Pool({
  database: "visual_time",
});

export { pool as default };
