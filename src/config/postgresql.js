let { Pool } = require("pg")

let pool = new Pool({
    host: "localhost",
    port: 5432,
    database: "exam",
    password: "1234",
    user: "postgres"
})

pool.connect((err) => {
    if (err) {
        console.log(err);
    }
    console.log("connected to postgresql");
})

const fetchData = async(query, ...params) => {
    let client = await pool.connect()
    try {
        let { rows } = await client.query(query, params.length ? params : null)
        return rows
    } catch (error) {
     console.log(error);

    } finally {
        client.release()
    }
}

module.exports = {fetchData}
