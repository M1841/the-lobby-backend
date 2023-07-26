# The Lobby Backend - version 1.2.0

## Description

The Lobby is a long running project of mine, constantly being reinvented using new technologies and ideas. Initially the app was loosely inspired by Reddit, and slowly became a place where users could post content, and interact with other users' content (if I had made it publicly available). This iteration contains a reimagination of the Lobby's backend using Typescript, Node.js. It is still in the early stages, and so far it contains full user authentication using JWT, CRUD operations for users, text posts and top level comments, likes for both posts and comments and customizable CORS handling. The next steps are to implement media content support, nested comment replies, followers, search and more. This project is fully open source and anyone is allowed to clone it and use it it in their own projects. I will be updating the extensive README as I add more features and functionality.

## Table of Contents

-   [Getting Started](#getting-started)
    -   [Prerequisites](#prerequisites)
    -   [Installation](#installation)
-   [Endpoints](#endpoints)

    -   [Root](#root)
        -   [GET /](#github-redirect)
    -   [Auth](#auth)
        -   [POST /api/auth/login](#login)
        -   [GET /api/auth/logout](#logout)
        -   [GET /api/auth/refresh](#refresh)
    -   [Users](#users)
        -   [POST /api/users](#create-or-register-user)
        -   [GET /api/users](#read-all-users)
        -   [GET /api/users/:id](#read-user-by-id)
        -   [PUT /api/users/:id](#update-user-by-id)
        -   [DELETE /api/users/:id](#delete-user-by-id)
    -   [Posts](#posts)
        -   [POST /api/posts](#create-post)
        -   [GET /api/posts](#read-all-posts)
        -   [GET /api/posts/:id](#read-post-by-id)
        -   [GET /api/posts/user/:id](#read-all-posts-by-user-id)
        -   [PUT /api/posts/:id](#update-post-by-id)
        -   [PUT /api/like/:id](#like-post-by-id)
        -   [DELETE /api/posts/:id](#delete-post-by-id)
    -   [Comments](#comments)
        -   [POST /api/comments](#create-comment)
        -   [GET /api/comments](#read-all-comments)
        -   [GET /api/comments/:id](#read-comment-by-id)
        -   [GET /api/comments/user/:id](#read-all-comments-by-user-id)
        -   [GET /api/comments/post/:id](#read-all-comments-by-post-id)
        -   [PUT /api/comments/:id](#update-comment-by-id)
        -   [PUT /api/like/:id](#like-comment-by-id)
        -   [DELETE /api/comments/:id](#delete-comment-by-id)

-   [Changelog](#changelog)
    -   [v1.2.0](#v120)
    -   [v1.1.1](#v111)
    -   [v1.1.0](#v110)
    -   [v1.0.0](#v100)

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

4. Add the URL of your frontend and backend to `config/allowedOrigins.ts` (it contains the URLs I used)

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
-   Possible Responses:
    -   302 Found: Redirects to the GitHub repository

### Auth

#### Login

`POST /api/auth/login`

-   Description: Authenticates a user by username or email (you only need to send one; if both are received, only the username is considered), stores a refresh token in a cookie, and returns an access token. All the cookie handling is built in, so you don't have to worry about it. What you need to do is store the access token somewhere on the frontend, as you will need it to access protected routes.
-   Request Body: Contains a username or email and a password

    Example:

    ```
    {
        "username": "LilySmith82",
        "password": "P@ssw0rd123"
    }
    ```

-   Possible Responses:

    -   200 OK: Success

        Example:

        ```
        {
            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IndpbGx5MDEiLCJ1c2VySUQiOiI2NGJkMWRlZTc4YzYwNDZkYmVjNmI5OGMiLCJpYXQiOjE2OTAyOTU3NDgsImV4cCI6MTY5MDI5NjY0OH0.viNTz6BDc5hn1xpmqQZXr9qfWaZfWa1_hRHh5P9P-p4"
        }
        ```

    -   400 Bad Request: One or more required parameters are missing

        Example:

        ```
        {
            "username": "missing"
        }
        ```

    -   401 Unauthorized: The password provided doesn't belong to the user logging in

        Example:

        ```
        Incorrect password
        ```

    -   404 Not Found: The username or email that were provided don't belong to any registered user

        Example:

        ```
        User does not exist
        ```

#### Logout

`GET /api/auth/logout`

-   Description: Logs out the user by clearing the refresh token cookie and removing the token from the database to prevent it from being used after. You will also need to delete the access token from where you stored it on the frontend.
-   Possible Responses:
    -   204 No Content: The logout was either successful or not necessary

#### Refresh

`GET /api/auth/refresh`

-   Description: Refreshes the access token by checking if the refresh token is valid and returning a new access token if it is. You will need to store the new access token on the frontend and delete the old one.

-   Possible Responses:

    -   200 OK: Access token was refreshed successfully

        Example:

        ```
        {
            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IndpbGx5MDEiLCJ1c2VySUQiOiI2NGJkMWRlZTc4YzYwNDZkYmVjNmI5OGMiLCJpYXQiOjE2OTAyOTU3NDgsImV4cCI6MTY5MDI5NjY0OH0.viNTz6BDc5hn1xpmqQZXr9qfWaZfWa1_hRHh5P9P-p4"
        }
        ```

    -   401 Unauthorized: No refresh tokens were found in the client cookies

        Example:

        ```
        Missing refresh token
        ```

    -   403 Forbidden: The refresh token used is doesn't match the secret, is expired or doesn't belong to a real user

        Example:

        ```
        Invalid refresh token
        ```

### Users

#### Create or register user

`POST /api/users`

-   Description: Registers a new user into the database. This does not also log the user in. If you want the user to be logged in after the registration sure to also call `/api/auth/login` right after.
-   Request Body: Contains a username, email and password

    Example:

    ```
    {
        "username": "WillH19",
        "email": "williamharris@example.com",
        "password": "MidnightOwl91"
    }
    ```

-   Possible Responses:

    -   201 Created: The user successfully registered

    -   400 Bad Request: One or more required parameters are missing

        Example:

        ```
        {
            "email": "missing"
        }
        ```

    -   409 Conflict: The username or email are already used by another user

        Example:

        ```
        {
            "username": "taken"
        }
        ```

#### Read all users

`GET /api/users`

-   Description: Returns the public information of all the users from the database.
-   Possible Responses:

    -   200 OK: Users were fetched successfully

        Example:

        ```
        [
            {
                "_id": "64bd1dee78c6046dbec6b98c",
                "username": "LilySmith82"
            },
            {
                "_id": "64bfdfd6e0877113aefe93dc",
                "username": "WillH19"
            },
            // ...
        ]
        ```

    -   204 No Content: There are no users in the database

#### Read user by ID

`GET /api/users/:id`

-   Description: Returns the public information of the one user with the specified ID. There may also be an endpoint for private information soon. The ID must be added to the end of the URL, like such: `/api/users/64bd1dee78c6046dbec6b98c`
-   Possible Responses:

    -   200 OK: User was fetched successfully

        Example:

        ```
        {
            "_id": "64bd1dee78c6046dbec6b98c",
            "username": "LilySmith82"
        }
        ```

    -   400 Bad Request: No user ID was provided or it's incompatible with the MongoDB `ObjectId` type (12 alphanumeric characters)

        Example:

        ```
        Invalid user ID
        ```

    -   404 Not Found: The user with the specified ID doesn't exist

        Example:

        ```
        User does not exist
        ```

#### Update user by ID

`PUT /api/users/:id`

`Authorization: Bearer [access token]`

-   **PROTECTED ROUTE**: Requires an access token in the authorization header.
-   Description: Updates information about the user (currently username and/or email and/or password). You can send any combination of the three, but you must send at least one. Handling for cases when the user is trying to edit someone else's information (which is currently not allowed) is built in. The example shows a username change. The ID must be added to the end of the URL, like such: `/api/users/64bfdfd6e0877113aefe93dc`
-   Request Body: Any combination of username, email and password

    Example:

    ```
    {
        "username": "Willy_H20"
    }
    ```

-   Possible Responses:

    -   200 OK: User was updated successfully
    -   400 Bad Request: No user ID was provided or it's incompatible with the MongoDB `ObjectId` type (12 alphanumeric characters)

        Example:

        ```
        Invalid user ID
        ```

    -   401 Unauthorized: No access token was provided

        Example:

        ```
        Missing access token
        ```

    -   403 Forbidden: The user is trying to edit someone else's information

        Example:

        ```
        Attempted editing another user's profile
        ```

    -   404 Not Found: No user was found with the specified ID

#### Delete user by ID

`DELETE /api/users/:id`

`Authorization: Bearer [access token]`

-   **PROTECTED ROUTE**: Requires an access token in the authorization header.
-   Description: Deletes the user from the database. Handling for cases when the user is trying to delete someone else's account (which is currently not allowed) is built in as well. One thing to keep in mind, when deleting a user's account, their posts and comments still exist. The ID must be added to the end of the URL, like such: `/api/users/64bfdfd6e0877113aefe93dc`

-   Possible responses:

    -   204 No Content: User account was successfully deleted or it didn't exist in the first place
    -   400 Bad Request: No userID was provided or it's incompatible with the MongoDB `ObjectId` type (12 alphanumeric characters)

        Example:

        ```
        Invalid user ID
        ```

    -   401 Unauthorized: No access token was provided

        Example:

        ```
        Missing access token
        ```

    -   403 Forbidden: The user is trying to delete someone else's account

        Example:

        ```
        Attempted deleting another user's account
        ```

### Posts

#### Create post

`POST /api/posts`

`Authorization: Bearer [access token]`

-   **PROTECTED ROUTE**: Requires an access token in the authorization header.
-   Description: Creates a new post and stores it in the database.
-   Request Body:

    ```

    {
        "content": "Just had an amazing day at the beach! 🏖️🌞"
    }

    ```

-   Possible Responses:

    -   201 Created: Post was created successfully
    -   400 Bad Request: No postcontent was provided

        Example:

        ```
        Missing post content
        ```

    -   401 Unauthorized: No access token was provided

        Example:

        ```
        Missing access token
        ```

#### Read all posts

`GET /api/posts`

-   Description: Returns all the posts from the database.
-   Possible Responses:

    -   200 OK: Posts were fetched successfully

        Example:

        ```

        [
            {
                "_id": "614af8a3a25a2b001f439c01",
                "content": "Just had an amazing day at the beach! 🏖️🌞",
                "userID": "64bfdfd6e0877113aefe93dc",
                "date": "2023-07-25T10:30:00Z",
                "likeIDs": [],
                "commentIDs": [],
                "__v": 0
            },
            {
                "_id": "614af8a3a25a2b001f439c02",
                "content": "Cannot wait to start my new job tomorrow! 🚀",
                "userID": "64bd1dee78c6046dbec6b98c",
                "date": "2023-07-22T18:45:00Z",
                "likeIDs": ["64bfdfd6e0877113aefe93dc", "614af8a3a25a2b001f439c08", "614af8a3a25a2b001f439c09"],
                "commentIDs": ["614af8a3a25a2b001f439c08"],
                "__v": 0
            },
            // ...
        ]

        ```

    -   204 No Content: There are no posts in the database

#### Read post by ID

`GET /api/posts/:id`

-   Description: Returns the one post with the specified ID. The ID must be added to the end of the URL, like such: `/api/posts/614af8a3a25a2b001f439c06`
-   Possible Responses:

    -   200 OK: Post was fetched successfully

        Example:

        ```
        {
            "_id": "614af8a3a25a2b001f439c06",
            "content": "Cannot wait to start my new job tomorrow! 🚀",
            "userID": "64bd1dee78c6046dbec6b98c",
            "date": "2023-07-22T18:45:00Z",
            "likeIDs": ["64bfdfd6e0877113aefe93dc", "614af8a3a25a2b001f439c08", "614af8a3a25a2b001f439c09"],
            "commentIDs": ["614af8a3a25a2b001f439c08"],
            "__v": 0
        }
        ```

    -   400 Bad Request: No post ID was provided or it's incompatible with the MongoDB `ObjectId` type (12 alphanumeric characters)

        Example:

        ```
        Invalid post ID
        ```

    -   404 Not Found: The post with the specified ID doesn't exist

        Example:

        ```
        Post does not exist
        ```

#### Read all posts by user ID

`GET /api/posts/user/:id`

-   Description: Returns all the posts by the user with the specified ID. The user ID must be added to the end of the URL, like such: `/api/posts/user/64bfdfd6e0877113aefe93dc`

-   Possible Responses:

    -   200 OK: Post was fetched successfully

        Example:

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

    -   204 No Content: There are no posts by the user with the specified ID

    -   400 Bad Request: No user ID was provided or it's incompatible with the MongoDB `ObjectId` type (12 alphanumeric characters)

        Example:

        ```
        Invalid user ID
        ```

#### Update post by ID

`PUT /api/posts/:id`

`Authorization: Bearer [access token]`

-   **PROTECTED ROUTE**: Requires an access token in the authorization header.
-   Description: Updates a post's content. You can only update your own posts. The example shows a content change. In the future, when media (picture, video, audio etc) is added, you will be able to update that as well. The ID must be added to the end of the URL, like such: `/api/posts/614af8a3a25a2b001f439c06`
-   Request Body: Since you can only update the content, you only need to send the new content.

    Example:

    ```
    {
        "content": "Looking forward to my first day at my new job tomorrow! 🚀"
    }
    ```

-   Possible Responses:

    -   200 OK: Post was updated successfully

        Example:

        ```
        {
            "_id": "614af8a3a25a2b001f439c06",
            "content": "Looking forward to my first day at my new job tomorrow! 🚀",
            "userID": "64bd1dee78c6046dbec6b98c",
            "date": "2023-07-22T18:45:00Z",
            "likeIDs": ["64bfdfd6e0877113aefe93dc", "614af8a3a25a2b001f439c08", "614af8a3a25a2b001f439c09"],
            "commentIDs": ["614af8a3a25a2b001f439c08"],
            "__v": 1
        }
        ```

    -   400 Bad Request: No post ID was provided or it's incompatible with the MongoDB `ObjectId` type (12 alphanumeric characters)

        Example:

        ```
        Invalid post ID
        ```

    -   401 Unauthorized: No access token was provided

        Example:

        ```
        Missing access token
        ```

    -   404 Not Found: The post with the specified ID doesn't exist

        Example:

        ```
        Post does not exist
        ```

#### Like post by ID

`PUT /api/posts/like/:id`

`Authorization: Bearer [access token]`

-   **PROTECTED ROUTE**: Requires an access token in the authorization header.
-   Description: Adds the user's ID to the post's likeIDs array, or removes it if it's already there. The ID must be added to the end of the URL, like such: `/api/like/614af8a3a25a2b001f439c06`
-   Possible Responses:

    -   200 OK: Post was liked or unliked successfully

    -   400 Bad Request: No post ID was provided or it's incompatible with the MongoDB `ObjectId` type (12 alphanumeric characters)

        Example:

        ```
        Invalid post ID
        ```

    -   401 Unauthorized: No access token was provided

        Example:

        ```
        Missing access token
        ```

    -   404 Not Found: The post with the specified ID doesn't exist

        Example:

        ```
        Post does not exist
        ```

#### Delete post by ID

`DELETE /api/posts/:id`

`Authorization: Bearer [access token]`

-   **PROTECTED ROUTE**: Requires an access token in the authorization header.
-   Description: Deletes the post from the database. You can only delete your own posts. The ID must be added to the end of the URL, like such: `/api/posts/614af8a3a25a2b001f439c06`

-   Possible Responses:

    -   204 No Content: Post was deleted successfully or it didn't exist in the first place

    -   400 Bad Request: No post ID was provided or it's incompatible with the MongoDB `ObjectId` type (12 alphanumeric characters)

        Example:

        ```
        Invalid post ID
        ```

    -   401 Unauthorized: No access token was provided

        Example:

        ```
        Missing access token
        ```

### Comments

#### Create comment

`POST /api/comments`

`Authorization: Bearer [access token]`

-   **PROTECTED ROUTE**: Requires an access token in the authorization header.
-   Description: Creates a new comment and stores it in the database.
-   Request Body: Contains the content of the comment and the ID of the post it belongs to.

    Example:

    ```

    {
        "content": "That's awesome! 🎉",
        "postID": "614af8a3a25a2b001f439c06"
    }

    ```

-   Possible Responses:

    -   201 Created: Comment was created successfully
    -   400 Bad Request: No comment content or post ID was provided

        Example:

        ```
        Missing comment content or post ID
        ```

    -   401 Unauthorized: No access token was provided

        Example:

        ```
        Missing access token
        ```

    -   404 Not Found: The post with the specified ID doesn't exist

        Example:

        ```
        Post does not exist
        ```

#### Read all comments

`GET /api/comments`

-   Description: Returns all the comments from the database.
-   Possible Responses:

    -   200 OK: Comments were fetched successfully
        Example:

        ```
        [
            {
                "_id": "614af8a3a25a2b001f439c08",
                "content": "That's awesome! 🎉",
                "userID": "64bfdfd6e0877113aefe93dc",
                "postID": "614af8a3a25a2b001f439c06",
                "date": "2023-07-22T18:45:00Z",
                "likeIDs": ["64bd1dee78c6046dbec6b98c", "614af8a3a25a2b001f439c09"],
                "__v": 0
            },
            {
                "_id": "614af8a3a25a2b001f439c09",
                "content": "Thanks! 😊",
                "userID": "64bd1dee78c6046dbec6b98c",
                "postID": "614af8a3a25a2b001f439c06",
                "date": "2023-07-22T18:45:00Z",
                "likeIDs": ["64bfdfd6e0877113aefe93dc"],
                "__v": 0
            },
            // ...
        ]
        ```

    -   204 No Content: There are no comments in the database

#### Read comment by ID

`GET /api/comments/:id`

-   Description: Returns the one comment with the specified ID. The ID must be added to the end of the URL, like such: `/api/comments/614af8a3a25a2b001f439c08`
-   Possible Responses:

    -   200 OK: Comment was fetched successfully

        Example:

        ```
        {
            "_id": "614af8a3a25a2b001f439c08",
            "content": "That's awesome! 🎉",
            "userID": "64bfdfd6e0877113aefe93dc",
            "postID": "614af8a3a25a2b001f439c06",
            "date": "2023-07-22T18:45:00Z",
            "likeIDs": ["64bd1dee78c6046dbec6b98c", "614af8a3a25a2b001f439c09"],
            "__v": 0
        }
        ```

    -   400 Bad Request: No comment ID was provided or it's incompatible with the MongoDB `ObjectId` type (12 alphanumeric characters)

        Example:

        ```
        Invalid comment ID
        ```

    -   404 Not Found: The comment with the specified ID doesn't exist

        Example:

        ```
        Comment does not exist
        ```

#### Read all comments by user ID

`GET /api/comments/user/:id`

-   Description: Returns all the comments by the user with the specified ID. The user ID must be added to the end of the URL, like such: `/api/comments/user/64bfdfd6e0877113aefe93dc`
-   Possible Responses:

    -   200 OK: Comments were fetched successfully

        Example:

        ```
        [
            {
                "_id": "614af8a3a25a2b001f439c08",
                "content": "That's awesome! 🎉",
                "userID": "64bfdfd6e0877113aefe93dc",
                "postID": "614af8a3a25a2b001f439c06",
                "date": "2023-07-22T18:45:00Z",
                "likeIDs": ["64bd1dee78c6046dbec6b98c", "614af8a3a25a2b001f439c09"],
                "__v": 0
            }
        ]
        ```

    -   204 No Content: There are no comments by the user with the specified ID

    -   400 Bad Request: No user ID was provided or it's incompatible with the MongoDB `ObjectId` type (12 alphanumeric characters)

        Example:

        ```
        Invalid user ID
        ```

#### Read all comments by post ID

`GET /api/comments/post/:id`

-   Description: Returns all the comments under the post with the specified ID. The post ID must be added to the end of the URL, like such: `/api/comments/post/614af8a3a25a2b001f439c06`
-   Possible Responses:

    -   200 OK: Comments were fetched successfully

        Example:

        ```
        [
            {
                "_id": "614af8a3a25a2b001f439c08",
                "content": "That's awesome! 🎉",
                "userID": "64bfdfd6e0877113aefe93dc",
                "postID": "614af8a3a25a2b001f439c06",
                "date": "2023-07-22T18:45:00Z",
                "likeIDs": ["64bd1dee78c6046dbec6b98c", "614af8a3a25a2b001f439c09"],
                "__v": 0
            },
            {
                "_id": "614af8a3a25a2b001f439c09",
                "content": "Thanks! 😊",
                "userID": "64bd1dee78c6046dbec6b98c",
                "postID": "614af8a3a25a2b001f439c06",
                "date": "2023-07-22T18:45:00Z",
                "likeIDs": ["64bfdfd6e0877113aefe93dc"],
                "__v": 0
            },
            // ...
        ]
        ```

    -   204 No Content: There are no comments under the post with the specified ID

    -   400 Bad Request: No post ID was provided or it's incompatible with the MongoDB `ObjectId` type (12 alphanumeric characters)

        Example:

        ```
        Invalid post ID
        ```

#### Update comment by ID

`PUT /api/comments/:id`

`Authorization: Bearer [access token]`

-   **PROTECTED ROUTE**: Requires an access token in the authorization header.
-   Description: Updates a comment's content. You can only update your own comments. The ID must be added to the end of the URL, like such: `/api/comments/614af8a3a25a2b001f439c08`
-   Request Body: Contains the new content of the comment.

    Example:

    ```
    {
        "content": "So happy for you! 🎉"
    }
    ```

-   Possible Responses:

    -   200 OK: Comment was updated successfully

        Example:

        ```
        {
            "_id": "614af8a3a25a2b001f439c08",
            "content": "So happy for you! 🎉",
            "userID": "64bfdfd6e0877113aefe93dc",
            "postID": "614af8a3a25a2b001f439c06",
            "date": "2023-07-22T18:45:00Z",
            "likeIDs": ["64bd1dee78c6046dbec6b98c", "614af8a3a25a2b001f439c09"],
            "__v": 1
        }
        ```

    -   400 Bad Request: No comment ID was provided or it's incompatible with the MongoDB `ObjectId` type (12 alphanumeric characters)

        Example:

        ```
        Invalid comment ID
        ```

    -   401 Unauthorized: No access token was provided

        Example:

        ```
        Missing access token
        ```

    -   404 Not Found: The comment with the specified ID doesn't exist

        Example:

        ```
        Comment does not exist
        ```

#### Like comment by ID

`PUT /api/comments/like/:id`

`Authorization: Bearer [access token]`

-   **PROTECTED ROUTE**: Requires an access token in the authorization header.
-   Description: Adds the user's ID to the comment's likeIDs array, or removes it if it's already there. The ID must be added to the end of the URL, like such: `/api/comments/like/614af8a3a25a2b001f439c08`
-   Possible Responses:

    -   200 OK: Comment was liked or unliked successfully

    -   400 Bad Request: No comment ID was provided or it's incompatible with the MongoDB `ObjectId` type (12 alphanumeric characters)

        Example:

        ```
        Invalid comment ID
        ```

    -   401 Unauthorized: No access token was provided

        Example:

        ```
        Missing access token
        ```

    -   404 Not Found: The comment with the specified ID doesn't exist

        Example:

        ```
        Comment does not exist
        ```

#### Delete comment by ID

`DELETE /api/comments/:id`

`Authorization: Bearer [access token]`

-   **PROTECTED ROUTE**: Requires an access token in the authorization header.
-   Description: Deletes the comment from the database. You can only delete your own comments. The ID must be added to the end of the URL, like such: `/api/comments/614af8a3a25a2b001f439c08`
-   Possible Responses:

    -   204 No Content: Comment was deleted successfully or it didn't exist in the first place
    -   400 Bad Request: No comment ID was provided or it's incompatible with the MongoDB `ObjectId` type (12 alphanumeric characters)

        Example:

        ```
        Invalid comment ID
        ```

    -   401 Unauthorized: No access token was provided

        Example:

        ```
        Missing access token
        ```

    -   403 Forbidden: The user is trying to delete someone else's comment

        Example:

        ```
        Attempted deleting another user's comment
        ```

## Changelog

### v1.2.0

Release date: 2023-07-26

-   Implemented post likes, comments and comment likes
-   Updated all the endpoints that required an ID to get it from the URL instead of the request body
-   Cleaned up the response messages and made them more consistent
-   Improved the error handling even more
-   Updated the post interface such that all IDs are now ObjectIDs instead of strings, for better compatibility with MongoDB
-   Removed the Hello World endpoint
-   Updated the README, now including all possible responses for each endpoint rather than just the successful ones

### v1.1.1

Release date: 2023-07-25

-   Added a Hello World endpoint for testing
-   Renamed the main file from `server` to `index` for better clarity
-   Updated the README

### v1.1.0

Release date: 2023-07-25

-   Cleaned up and reorganized the routes
-   Improved the way the server checks if the user is authorized to perform certain actions
-   Added a new endpoint for getting all the posts by a specific user
-   Improved the error handling
-   Added ID validation for all the endpoints that require an ID (before, if you sent an invalid ID, the server would crash, now you just get an error message)
-   Moved the custom interfaces to their own file
-   Added a root endpoint that redirects to the GitHub repository
-   Removed the request and error loggers as they were not needed
-   Added extensive documentation

### v1.0.0

Release date: 2023-07-23

-   Initial release
-   Added database connection and basic server setup
-   Set up custom npm scripts for building and running the project in development and production mode
-   Set up the User and Post models
-   Added user authentication, including JSON Web Tokens, refresh tokens and cookie handling
-   Added CRUD operations for users and posts (with protected routes)
-   Added customizable CORS handling
-   Added request and error loggers
