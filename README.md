# Blog Management System

## Overview
This project is a blog management system where users can create, join, and manage blogs, as well as make posts and comments. The system includes user authentication, blog membership, and role-based permissions for managing content.

## Features
- **User Registration & Login**
  - `/register`: Users can register for an account.
  - `/login`: Users can log in to access their blogs.

- **Blog Management**
  - `/create`: Create a new blog.
  - `/get-my-blogs`: Get a list of blogs created by the user.
  - `/get-my-joined-blogs`: Get a list of blogs the user has joined.
  - `/get-blog-info`: Get detailed information about a blog by its ID.
  - `/update`: Update a blog. Only the creator can update their blog.
  - `/delete`: Delete a blog. Only the creator can delete their blog.
  - `/search`: Search globally for blogs by username.
  - `/join-blog`: Join a blog.
  - `/leave-blog`: Leave a blog.
  - `/get-users`: Get members of a specific blog.

- **Post Management**
  - `/create`: Create a post in a blog. Only the blog owner can create posts.
  - `/get-all`: Get all posts from a blog by its ID.
  - `/get-by-id`: Get a post by its ID. Views are incremented by 1 each time it's fetched.
  - `/update`: Update a post. Only the blog owner can update posts.
  - `/delete`: Delete a post. Only the blog owner can delete posts.
  - `/sort-by-date`: Sort posts by date in descending order. Posts are fetched by blog ID.
  - `/get-comments`: Get comments associated with a specific post.

- **Comment Management**
  - `/create`: Add a comment to a post.
  - `/update`: Update a comment.
  - `/delete`: Delete a comment.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/blog-management-system.git
   cd blog-management-system
