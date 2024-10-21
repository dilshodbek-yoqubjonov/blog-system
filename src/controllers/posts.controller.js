const { fetchData } = require("../config/postgresql");
const { sign, verify } = require("../utils/jwt");

const postsController = {
  create: async (req, res) => {
    try {
      const token = req.headers.token;
      const { id } = verify(token);
      const postId = req.params.id;

      const checkBlog = await fetchData(
        "SELECT * FROM blogs WHERE id = $1",
        postId
      );

      const checkOwnerOfBlog = await fetchData(
        "SELECT * FROM users_blogs WHERE blog_id = $1 AND user_id = $2",
        postId,
        id
      );

      if (checkOwnerOfBlog.length === 0) {
        return res.status(403).send({
          error: "You are not the owner of this blog",
        });
      }

      if (checkBlog.length === 0) {
        return res.status(404).send({
          error: "Blog not found",
        });
      }

      const { title, content } = req.body;

      await fetchData(
        "INSERT INTO posts (title, content, user_id, blog_id) VALUES ($1, $2, $3, $4)",
        title,
        content,
        id,
        postId
      );

      let myBlogs = await fetchData(
        "SELECT * FROM posts WHERE blog_id = $1 AND user_id = $2",
        postId,
        id
      );
      let blogPost_id = myBlogs.at(-1).id;

      await fetchData(
        "INSERT INTO blogs_posts(blog_id, post_id) VALUES ($1, $2)",
        postId,
        blogPost_id
      );

      return res.status(201).send({
        message: "Congratulations, you created a new post successfully.",
        myBlogs,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        error: "Something went wrong.",
        message: error.message,
      });
    }
  },

  getAllPosts: async (req, res) => {
    const postId = req.params.id;

    try {
      const posts = await fetchData(
        `SELECT
            p.id,
            p.title,
            p.content,
            p.blog_id,
            p.user_id,
            p.created_at,
            p.updated_at
          FROM
            posts p
          JOIN
            blogs_posts bp ON p.id = bp.post_id
          WHERE
            bp.blog_id = $1`,
        postId
      );
      return res.status(200).send({ posts });
    } catch (error) {
      console.error("Error fetching posts:", error);
      return res.status(500).send({
        error: "Something went wrong.",
        message: error.message,
      });
    }
  },
  getById: async (req, res) => {
    const postId = req.params.id;
    try {
      const posts = await fetchData(
        `SELECT
            p.id,
            p.title,
            p.content,
            p.blog_id,
            p.user_id,
            p.created_at,
            p.updated_at
          FROM
            posts p
          where
            p.id = $1`,
        postId
      );
      return res.status(200).send({ posts });
    } catch (error) {
      console.error("Error fetching posts:", error);
      return res.status(500).send({
        error: "Something went wrong.",
        message: error.message,
      });
    }
  },
  update: async (req, res) => {
    try {
      const postId = req.params.id;
      const { title, content } = req.body;
      const token = req.headers.token;
      const { id } = verify(token);

      let checkOwnerOfBlog = await fetchData(
        "SELECT * FROM posts WHERE user_id = $1 AND id = $2",
        id,
        postId
      );
      if (checkOwnerOfBlog.length === 0) {
        return res.status(403).send({
          error: "You are not the owner of this blog",
        });
      }

      const [data] = await fetchData(
        `SELECT
            p.id,
            p.title,
            p.content,
            p.blog_id,
            p.user_id,
            p.created_at,
            p.updated_at
          FROM
            posts p
          where
            p.id = $1`,
        postId
      );

      const result = await fetchData(
        `UPDATE posts
         SET title = $1, content = $2, user_id = $3, updated_at = NOW()
         WHERE user_id = $3 AND id = $4`,
        title,
        content,
        id,
        postId
      );

      const updatedPost = await fetchData(
        `SELECT
            p.id,
            p.title,
            p.content,
            p.blog_id,
            p.user_id,
            p.created_at,
            p.updated_at
          FROM
            posts p
          where
            p.id = $1`,
        postId
      );

      return res
        .status(200)
        .send({ message: "Post updated successfully.", updatedPost });
    } catch (error) {
      console.error("Error updating blog:", error);
      return res
        .status(500)
        .send({ error: "Something went wrong.", message: error.message });
    }
  },
  delete: async (req, res) => {
    try {
      const postId = req.params.id;
      const token = req.headers.token;
      const { id } = verify(token);

      const checkOwnerOfBlog = await fetchData(
        "SELECT * FROM posts WHERE user_id = $1 AND id = $2",
        id,
        postId
      );
      if (checkOwnerOfBlog.length === 0) {
        return res.status(403).send({
          error: "You are not the owner of this blog",
        });
      }
      const result = await fetchData(
        `DELETE FROM posts
         WHERE id = $1 AND user_id = $2`,
        postId,
        id
      );
      return res.status(200).send({ message: "Post deleted successfully." });
    } catch (error) {
      console.error("Error deleting post:", error);
      return res.status(500).send({
        error: "Something went wrong.",
        message: error.message,
      });
    }
  },
  sortByDate: async (req, res) => {
    try {
      const blogId = req.params.id;

      const sortedPosts = await fetchData(
        `SELECT id, title, content, blog_id, user_id, created_at, updated_at
         FROM posts
         WHERE blog_id = $1
         ORDER BY created_at ASC`,
        blogId
      );

      return res.status(200).send(sortedPosts);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ error: "Something went wrong.", message: error.message });
    }
  },
  postsComment: async (req, res) => {
    try {
      const postId = req.params.id;

      const comments = await fetchData(
        `SELECT
           c.id,
           c.content,
           c.created_at,
           u.username AS commenter
         FROM
           comments c
         JOIN
           users u ON c.user_id = u.id
         WHERE
           c.post_id = $1
         ORDER BY
           c.created_at ASC`,
        postId
      );

      if (comments.length === 0) {
        return res
          .status(404)
          .send({ message: "No comments found for this post." });
      }

      return res.status(200).send({ comments });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ error: "Something went wrong.", message: error.message });
    }
  },
  
};
module.exports = postsController;
