const { fetchData } = require("../config/postgresql");
const { sign, verify } = require("../utils/jwt");

const commentsController = {
  create: async (req, res) => {
    try {
      const token = req.headers.token;
      const { id } = verify(token);
      const { content, postId } = req.body;

      if (!content || !postId) {
        return res
          .status(400)
          .send({ error: "Content and Post ID are required." });
      }

      const checkPost = await fetchData(
        "SELECT * FROM posts WHERE id = $1",
        postId
      );

      if (checkPost.length === 0) {
        return res.status(404).send({ error: "Post not found" });
      }

      let result = await fetchData(
        "INSERT INTO comments (content, post_id, user_id) VALUES ($1, $2, $3) RETURNING *",
        content,
        postId,
        id
      );

      return res
        .status(201)
        .send({ message: "Comment created successfully", comment: result[0] });
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
      const { content, commentId } = req.body;

      const updatedComment = await fetchData(
        `UPDATE comments
         SET content = $1, updated_at = NOW()
         WHERE id = $2 AND user_id = $3
         RETURNING *;`,
        content,
        commentId,
        id
      );

      if (updatedComment.length === 0) {
        return res.status(404).send({
          error:
            "Comment not found or you are not authorized to update this comment.",
        });
      }

      return res
        .status(200)
        .send({ message: "Comment updated successfully", updatedComment });
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
      const { id } = verify(token); // Extract the user's id from the token
      const commentId = req.params.id;

      const deletedComment = await fetchData(
        `DELETE FROM comments
         WHERE id = $1 AND user_id = $2
         RETURNING *;`,
        commentId,
        id
      );

      if (deletedComment.length === 0) {
        return res.status(404).send({
          error:
            "Comment not found or you are not authorized to delete this comment.",
        });
      }

      return res
        .status(200)
        .send({ message: "Comment deleted successfully", deletedComment });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ error: "Something went wrong.", message: error.message });
    }
  },
};

module.exports = commentsController;
