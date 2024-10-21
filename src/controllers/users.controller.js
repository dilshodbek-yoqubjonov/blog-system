const { fetchData } = require("../config/postgresql");
const { sign } = require("../utils/jwt");

const userController = {
  register: async (req, res) => {
    try {
      const { name, password, username } = req.body;

      let checkUsername = await fetchData(
        "SELECT * FROM users WHERE username = $1",
        username
      );
      if (checkUsername.length > 0) {
        return res.status(400).send({ error: "Username already exists." });
      }

      await fetchData(
        "INSERT INTO users (name, password, username) VALUES ($1, $2, $3)",
        name,
        password,
        username
      );

      let user = await fetchData(
        "SELECT id FROM users WHERE username = $1",
        username
      );
      const token = sign({ id: user[0].id });

      return res
        .status(201)
        .send({ message: "User created successfully.", token });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ error: "Something went wrong.", message: error.message });
    }
  },
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await fetchData(
        "SELECT * FROM users WHERE username = $1 AND password = $2",
        username,
        password
      );
      if (user.length === 0) {
        return res.status(404).send({ error: "password or username is wrong" });
      }

      const token = sign({ id: user[0].id });
      return res
        .status(200)
        .send({ message: "User logged in successfully.", token });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ error: "Something went wrong.", message: error.message });
    }
  },
};

module.exports = userController;
