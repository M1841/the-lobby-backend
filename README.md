# The Lobby Backend - version 1.1.0

## Table of Contents

-   [Description](#description)
-   [Getting Started](#getting-started)
    -   [Prerequisites](#prerequisites)
    -   [Installation](#installation)
-   [Endpoints](#endpoints)
    -   [Root](#root)
        -   [GET /](#github-redirect)
        -   [GET /hello](#hello-world)
    -   [Auth](#auth)
        -   [POST /api/auth/login](#login)
        -   [GET /api/auth/logout](#logout)
        -   [GET /api/auth/refresh](#refresh)
    -   [Users](#users)
        -   [POST /api/users](#create-or-register-user)
        -   [GET /api/users](#read-all-users)
        -   [GET /api/users/:id](#read-user-by-id)
        -   [PUT /api/users](#update-user)
        -   [DELETE /api/users](#delete-user)
    -   [Posts](#posts)
        -   [POST /api/posts](#create-post)
        -   [GET /api/posts](#read-all-posts)
        -   [GET /api/posts/:id](#read-post-by-id)
        -   [GET /api/posts/user/:id](#read-all-posts-by-user-id)
        -   [PUT /api/posts](#update-post)
        -   [DELETE /api/posts](#delete-post)

## Description

The Lobby is a long running project of mine, constantly being reinvented using new technologies and ideas. Initially the app was loosely inspired by Reddit, and slowly became a place where users could post content, and interact with other users' content (if I had made it publicly available). This specific repository contains a reimagination of the Lobby's backend using Typescript, Node.js & MongoDB. It is still in the early stages, and so far it contains full user authentication using JWT, CRUD operations for users and text posts and customizable CORS handling. The next steps are to implement media content support, likes, comments, followers, search and more. This project is fully open source and anyone is allowed to clone it and use it it in their own projects. I will be updating this README as I add more features and functionality. I also intend to deploy the API, using a dummy database, so that anyone can try it out without having to clone the repository.

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18.16.1 or higher)
-   npm or other package managers
-   A [MongoDB](https://mongodb.com/) database - [Tutorial](https://youtu.be/-PdjUx9JZ2E) (2:05 - 8:47)

### Installation

1. Clone the repository

```
git clone https://github.com/m1841/the-lobby-backend.git
cd the-lobby-backend
```

2. Install the dependencies

```
npm install
```

3. Create a .env file in the root directory and add the following environment variables ( replace the values with your own and remove the brackets)

```
PORT=[choose a port]
DATABASE_URI=[your mongodb database uri]
ACCESS_TOKEN_SECRET=[any random string]
REFRESH_TOKEN_SECRET=[any random string]
```

4. Add the URL of your frontend and backend to `config/allowedOrigins.ts` (I added some examples, feel free to delete them)

```
const allowedOrigins: string[] = [
    "http://localhost:8080",
    "http://localhost:5173"
];
```

5. Build and run the project

```
npm run build
npm run start
```

6. (Optional) If you want to run the project in development mode

```
npm run dev
```

## Endpoints

### Root

#### GitHub Redirect

`GET /`

-   Description: Redirects to the GitHub repository of the project
-   Request Body: `None`
-   Response Body: `None`

`GET /hello`

-   Description: Returns a simple "Hello World" message. This is just a test endpoint to make sure the server is running.
-   Request Body: `None`
-   Response Body: `Hello World!`

### Auth

#### Login

`POST /api/auth/login`

-   Description: Authenticates a user by username or email (you only need to send one; if both are received, only the username is considered), stores a refresh token in a cookie, and returns an access token. All the cookie handling is built in, so you don't have to worry about it. What you need to do is store the access token somewhere on the frontend, as you will need it to access protected routes.
-   Request Body:

```
{
    "username": "LilySmith82",
    "email": "lily_smith82@example.com",
    "password": "P@ssw0rd123"
}
```

-   Response Body if successful:

```
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IndpbGx5MDEiLCJ1c2VySUQiOiI2NGJkMWRlZTc4YzYwNDZkYmVjNmI5OGMiLCJpYXQiOjE2OTAyOTU3NDgsImV4cCI6MTY5MDI5NjY0OH0.viNTz6BDc5hn1xpmqQZXr9qfWaZfWa1_hRHh5P9P-p4"
}
```

#### Logout

`GET /api/auth/logout`

-   Description: Logs out the user by clearing the refresh token cookie and removing the token from the database to prevent it from being used after. You will also need to delete the access token from where you stored it on the frontend.
-   Request Body: `None`
-   Response Body: `None`

#### Refresh

`GET /api/auth/refresh`

-   Description: Refreshes the access token by checking if the refresh token is valid and returning a new access token if it is. You will need to store the new access token on the frontend and delete the old one.
-   Request Body: `None`

-   Response Body if successful:

```
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IndpbGx5MDEiLCJ1c2VySUQiOiI2NGJkMWRlZTc4YzYwNDZkYmVjNmI5OGMiLCJpYXQiOjE2OTAyOTU3NDgsImV4cCI6MTY5MDI5NjY0OH0.viNTz6BDc5hn1xpmqQZXr9qfWaZfWa1_hRHh5P9P-p4"
}
```

### Users

#### Create or register user

`POST /api/users`

-   Description: Registers a new user into the database.
-   Request Body:

```
{
    "username": "WillH19",
    "email": "williamharris@example.com",
    "password": "MidnightOwl91"
}
```

-   Response Body if successful:

```
{
    "message": "New user WillH19 was registered"
}

```

#### Read all users

`GET /api/users`

-   Description: Returns the public information of all the users from the database.
-   Request Body: `None`
-   Response Body if successful:

```
[
    {
        "id": "64bd1dee78c6046dbec6b98c",
        "username": "LilySmith82"
    },
    {
        "id": "64bfdfd6e0877113aefe93dc",
        "username": "WillH19"
    },
    // ...
]
```

#### Read user by ID

`GET /api/users/:id`

-   Description: Returns the public information of the one user with the specified ID. There may also be an endpoint for private information soon. The ID should be added to the end of the URL, like such: `/api/users/64bd1dee78c6046dbec6b98c`
-   Request Body: `None`
-   Response Body if successful:

```
{
    "id": "64bd1dee78c6046dbec6b98c",
    "username": "LilySmith82"
}
```

#### Update user

`PUT /api/users` -

-   **[PROTECTED ROUTE]**: Requires an access token in the authorization header.
-   Description: Updates information about the user (currently username and/or email and/or password). You can send any combination of the three, but you must send at least one. Handling for cases when the user is trying to edit someone else's information (which is currently not allowed) is built in. The example shows a username change.
-   Request Body:

```
{
    "id": "64bfdfd6e0877113aefe93dc",
    "username": "Willy_H20"
}
```

-   Response Body if successful:

```
{
    "message": "Successfully changed WillH19's username to Willy_H20"
}
```

#### Delete user

`DELETE /api/users`

-   **[PROTECTED ROUTE]**: Requires an access token in the authorization header.
-   Description: Deletes the user from the database. Handling for cases when the user is trying to delete someone else's account (which is currently not allowed) is built in as well.
-   Request Body:

```
{
    "id": "64bfdfd6e0877113aefe93dc"
}
```

-   Response Body if successful:

```
{
    "message": "Successfully deleted Willy_H20's account"
}
```

### Posts

#### Create post

`POST /api/posts`

-   **[PROTECTED ROUTE]**: Requires an access token in the authorization header.
-   Description: Creates a new post and stores it in the database.
-   Request Body:

```
{
    "content": "Just had an amazing day at the beach! 🏖️🌞"
}
```

-   Response Body if successful:

```
{
    "content": "Just had an amazing day at the beach! 🏖️🌞",
    "userID": "64bfdfd6e0877113aefe93dc",
    "date": "2023-07-25T10:30:00Z",
    "likeIDs": [],
    "commentIDs": [],
    "_id": "614af8a3a25a2b001f439c01",
    "__v": 0
}
```

#### Read all posts

`GET /api/posts`

-   Description: Returns all the posts from the database.
-   Request Body: `None`
-   Response Body:

```
[
    {
        "_id": "614af8a3a25a2b001f439c06",
        "content": "Excited to start my new job tomorrow! 🚀",
        "userID": "64bd1dee78c6046dbec6b98c",
        "date": "2023-07-22T18:45:00Z",
        "likeIDs": ["64bfdfd6e0877113aefe93dc", "614af8a3a25a2b001f439c08", "614af8a3a25a2b001f439c09"],
        "commentIDs": ["614af8a3a25a2b001f439c08"],
        "__v": 1
    },
    {
        "_id": "614af8a3a25a2b001f439c01",
        "content": "Just had an amazing day at the beach! 🏖️🌞",
        "userID": "64bfdfd6e0877113aefe93dc",
        "date": "2023-07-25T10:30:00Z",
        "likeIDs": [],
        "commentIDs": [],
        "__v": 0
    },
    // ...
]
```

#### Read post by ID

`GET /api/posts/:id`

-   Description: Returns the one post with the specified ID. The ID should be added to the end of the URL, like such: `/api/posts/614af8a3a25a2b001f439c06`
-   Request Body: `None`
-   Response Body if successful:

```
{
    "_id": "614af8a3a25a2b001f439c06",
    "content": "Excited to start my new job tomorrow! 🚀",
    "userID": "64bd1dee78c6046dbec6b98c",
    "date": "2023-07-22T18:45:00Z",
    "likeIDs": ["64bfdfd6e0877113aefe93dc", "614af8a3a25a2b001f439c08", "614af8a3a25a2b001f439c09"],
    "commentIDs": ["614af8a3a25a2b001f439c08"],
    "__v": 1
}
```

#### Read all posts by user ID

`GET /api/posts/user/:id`

-   Description: Returns all the posts by the user with the specified ID. The ID should be added to the end of the URL, like such: `/api/posts/user/64bfdfd6e0877113aefe93dc`
-   Request Body: `None`
-   Response Body if successful:

```
{
    "_id": "614af8a3a25a2b001f439c01",
    "content": "Just had an amazing day at the beach! 🏖️🌞",
    "userID": "64bfdfd6e0877113aefe93dc",
    "date": "2023-07-25T10:30:00Z",
    "likeIDs": [],
    "commentIDs": [],
    "__v": 0
}
```

#### Update post

`PUT /api/posts`

-   **[PROTECTED ROUTE]**: Requires an access token in the authorization header.
-   Description: Updates a post's content. You can only update your own posts. The example shows a content change. In the future, when media (picture, video, audio etc) is added, you will be able to update that as well.
-   Request Body:

```
{
    "id": "614af8a3a25a2b001f439c06",
    "content": "Looking forward to my first day at my new job tomorrow! 🚀"
}
```

-   Response Body if successful:

```
{
    "_id": "614af8a3a25a2b001f439c06",
    "content": "Looking forward to my first day at my new job tomorrow! 🚀",
    "userID": "64bd1dee78c6046dbec6b98c",
    "date": "2023-07-22T18:45:00Z",
    "likeIDs": ["64bfdfd6e0877113aefe93dc", "614af8a3a25a2b001f439c08", "614af8a3a25a2b001f439c09"],
    "commentIDs": ["614af8a3a25a2b001f439c08"],
    "__v": 2
}
```

#### Delete post

`DELETE /api/posts`

-   **[PROTECTED ROUTE]**: Requires an access token in the authorization header.
-   Description: Deletes the post from the database. You can only delete your own posts.
-   Request Body:

```
{
    "id": "614af8a3a25a2b001f439c06"
}
```

-   Response Body if successful:

```
{
    "message": "Successfully deleted post 614af8a3a25a2b001f439c06"
}
```
