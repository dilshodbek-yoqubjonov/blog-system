const express = require("express");
const userController = require("../controllers/users.controller");
const blogController = require("../controllers/blog.controller");
const postsController = require("../controllers/posts.controller");
const commentsController = require("../controllers/comments.controller");
const router = express.Router();
//
//
//
// user router
router.post("/user/register", userController.register);
router.post("/user/login", userController.login);
//
//
//
// blog router
router.get("/blog/my-blog", blogController.myBlogs);
router.get("/blog/join/:id", blogController.joinBlog);
router.get("/blog/my-list/", blogController.getMyJoinedBlogs);
router.get("/blog/left/:id", blogController.leftFromBlogs);
router.get("/blog/get-users/:id", blogController.getUsers);
router.get("/blog/info/:id", blogController.getBlogInfo);
router.post("/blog/search", blogController.search);

// CRUD blogs
router.post("/blog/create", blogController.create);
router.delete("/blog/delete/:id", blogController.delete);
router.put("/blog/update/:id", blogController.update);
//
//
//
// POSTS router
router.post("/post/create/:id", postsController.create);
router.get("/post/all-posts/:id", postsController.getAllPosts);
router.get("/post/by-id/:id", postsController.getById);
router.put("/post/:id", postsController.update);
router.delete("/post/:id", postsController.delete);
router.get("/post/sort-by-date/:id", postsController.sortByDate);
router.get("/post/comments/:id", postsController.postsComment);
//
//
//
// comment router
router.post("/comment/create", commentsController.create);
router.put("/comment", commentsController.update);
router.delete("/comment/:id", commentsController.delete);

module.exports = router;
