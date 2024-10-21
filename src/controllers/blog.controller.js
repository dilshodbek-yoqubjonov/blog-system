const { fetchData } = require("../config/postgresql");
const { sign, verify } = require("../utils/jwt");

const blogController = {
  // create blog
  create: async (req, res) => {
    try {
      const token = req.headers.token;
      const { id } = verify(token);

      const { title, content, username } = req.body;
      let checkUsername = await fetchData(
        "SELECT * FROM blogs WHERE username = $1",
        username
      );

      if (checkUsername.length > 0) {
        return res.status(404).send({ error: "username is taken" });
      }

      await fetchData(
        "INSERT INTO blogs (title, content, username, user_id) VALUES ($1, $2, $3 , $4)",
        title,
        content,
        username,
        id
      );
      let blogId = await fetchData(
        "SELECT id FROM blogs WHERE username = $1",
        username
      );

      await fetchData(
        "INSERT INTO users_blogs(user_id, blog_id, members_id) VALUES ($1, $2, $3)",
        id,
        blogId[0].id,
        id
      );
      let myBlogs = await fetchData(
        "SELECT * FROM users_blogs WHERE blog_id = $1",
        blogId[0].id
      );
      return res
        .status(200)
        .send({ message: "Congratulations you created new blog", myBlogs });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ error: "Something went wrong.", message: error.message });
    }
  },
  //   get my blogs

  myBlogs: async (req, res) => {
    try {
      const token = req.headers.token;
      const { id } = verify(token);
      let myBlogs = await fetchData(
        "SELECT id, user_id, blog_id, members_id FROM users_blogs WHERE user_id = $1",
        id
      );
      return res.status(200).send({ myBlogs });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ error: "Something went wrong.", message: error.message });
    }
  },
  joinBlog: async (req, res) => {
    try {
      const token = req.headers.token;
      const { id } = verify(token);
      const joinId = req.params.id;
      let checkBlog = await fetchData(
        "SELECT * FROM users_blogs WHERE blog_id = $1 AND members_id = $2",
        joinId,
        id
      );
      if (checkBlog.length > 0) {
        return res.status(404).send({ error: "You already joined this blog" });
      }
      await fetchData(
        "INSERT INTO users_blogs(user_id, blog_id, members_id, updated_at) VALUES ($1, $2, $3, NOW())",
        id,
        joinId,
        id
      );
      let joinedBlog = await fetchData(
        `SELECT blog_id, COUNT(members_id) AS members
            FROM users_blogs
            WHERE blog_id = $1
            GROUP BY blog_id;`,
        joinId
      );
      return res.status(200).send({ joinedBlog });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ error: "Something went wrong.", message: error.message });
    }
  },
  getMyJoinedBlogs: async (req, res) => {
    try {
      const token = req.headers.token;
      const { id } = verify(token);

      let myBlogs = await fetchData(
        "SELECT blog_id FROM users_blogs WHERE members_id = $1",
        id
      );

      return res.status(200).send({ myBlogs });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ error: "Something went wrong.", message: error.message });
    }
  },
  leftFromBlogs: async (req, res) => {
    try {
      const token = req.headers.token;
      const { id } = verify(token);
      const blogId = req.params.id;
      await fetchData(
        "DELETE FROM users_blogs WHERE blog_id = $1 AND members_id = $2",
        blogId,
        id
      );
      return res.status(200).send({ message: "You left from this blog" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ error: "Something went wrong.", message: error.message });
    }
  },
  getUsers: async (req, res) => {
    try {
      const blogId = req.params.id;
      let users = await fetchData(
        "SELECT id, user_id FROM users_blogs WHERE blog_id= $1",
        blogId
      );
      return res.status(200).send({ users });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ error: "Something went wrong.", message: error.message });
    }
  },
  getBlogInfo: async (req, res) => {
    try {
      const blogId = req.params.id;
      let blog = await fetchData(
        `SELECT
            b.id AS blog_id,
            b.title,
            b.content,
            COUNT(ub.members_id) AS members
        FROM
            blogs b
        LEFT JOIN
            users_blogs ub ON b.id = ub.blog_id
        WHERE
            b.id = $1
        GROUP BY
            b.id, b.title, b.content
        ORDER BY
            b.id;
`,
        blogId
      );
      return res.status(200).send({ blog });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ error: "Something went wrong.", message: error.message });
    }
  },
  search: async (req, res) => {
    try {
      const search = req.body.search;

      let blogs = await fetchData(
        `SELECT
    id,
    title,
    content,
    username,
    user_id,
    created_at,
    updated_at
FROM
    blogs
WHERE
    username ILIKE $1
`,
        `%${search}%`
      );

      return res.status(200).send({ blogs });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ error: "Something went wrong.", message: error.message });
    }
  },
  delete: async (req, res) => {
    try {
      const token = req.headers.token;
      const { id } = verify(token);
      const blogId = req.params.id;
      const checkBlog = await fetchData(
        "SELECT * FROM blogs WHERE id = $1",
        blogId
      );
      const checkPermission = await fetchData(
        "SELECT * FROM blogs WHERE user_id = $1 AND id = $2",
        id,
        blogId
      );
      if (checkBlog.length === 0) {
        return res.status(404).send({
          error: "Blog not found",
        });
      }
      if (checkPermission.length === 0) {
        return res.status(404).send({
          error: "You don't have permission to delete it",
        });
      }
      await fetchData(
        "DELETE FROM blogs WHERE user_id = $1 AND id = $2",
        id,
        blogId
      );
      return res.status(200).send({ message: "Blog deleted successfully" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ error: "Something went wrong.", message: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const token = req.headers.token;
      const { id } = verify(token);
      const blogId = req.params.id;
      const checkBlog = await fetchData(
        "SELECT * FROM blogs WHERE id = $1",
        blogId
      );
      const checkPermission = await fetchData(
        "SELECT * FROM blogs WHERE user_id = $1 AND id = $2",
        id,
        blogId
      );
      if (checkBlog.length === 0) {
        return res.status(404).send({
          error: "Blog not found",
        });
      }
      if (checkPermission.length === 0) {
        return res.status(404).send({
          error: "You don't have permission to update it",
        });
      }
      const { title, content, username } = req.body;

      const result = await fetchData(
        `UPDATE blogs
            SET title = $1, content = $2, username = $3, updated_at = NOW()
            WHERE id = $4`,
        title,
        content,
        username,
        blogId
      );

      // Check if the update was successful
      if (result.length === 0) {
        return res.status(404).send({ error: "Blog not found." });
      }

      // Respond with the updated blog data
      return res.status(200).send({ blog: result[0] });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ error: "Something went wrong.", message: error.message });
    }
  },
};

module.exports = blogController;
