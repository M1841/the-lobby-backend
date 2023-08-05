# The Lobby Backend - version 1.5.1

## Description

The Lobby is a long running project of mine, constantly being reinvented using new technologies and ideas. Initially the app was loosely inspired by Reddit, and slowly became a place where users could post content, and interact with other users' content (if I had made it publicly available). This iteration contains a reimagination of the Lobby's backend using Typescript and Node.js and is fully open source, anyone being allowed to clone it and use it it in their own projects. I will be updating the extensive README as I add more features and functionality. Right now it contains full user authentication using JWT, search and CRUD operations for users, multi-media posts and nested text comments, likes, followers and customizable CORS handling. I hope you enjoy it and find it useful!

## Table of Contents

-   [Getting Started](#getting-started)
    -   [Use the API directly](#use-the-api-directly)
    -   [Self-hosting](#self-hosting)
        -   [Prerequisites](#prerequisites)
        -   [Installation](#installation)
-   [Endpoints](#endpoints)

    -   [Root](#root)
        -   [GET /](#github-redirect)
    -   [Search](#search)
        -   [GET /api/search](#search-all)
    -   [Uploads](#uploads)
        -   [GET /api/uploads/:id](#read-file)
    -   [Auth](#auth)
        -   [POST /api/auth/login](#login)
        -   [GET /api/auth/logout](#logout)
        -   [GET /api/auth/refresh](#refresh)
    -   [Users](#users)
        -   [POST /api/users](#create-or-register-user)
        -   [GET /api/users](#read-all-users)
        -   [GET /api/users/:id](#read-user-by-id)
        -   [PUT /api/users/:id](#update-user-by-id)
        -   [PUT /api/users/follow/:id](#follow-user-by-id)
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
    -   [v1.5.1](#v151)
    -   [v1.5.0](#v150)
    -   [v1.4.0](#v140)
    -   [v1.3.0](#v130)
    -   [v1.2.1](#v121)
    -   [v1.2.0](#v120)
    -   [v1.1.1](#v111)
    -   [v1.1.0](#v110)
    -   [v1.0.0](#v100)

## Getting Started

### Use the API directly

The API is currently hosted on Render and can be accessed at https://the-lobby-backend.onrender.com. You can make requests to the API using the [endpoints described below](#endpoints).

### Self-hosting

If you want to host the project yourself, use it as a template or just play around with it, follow the steps below:

#### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18.16.1 or higher)
-   npm or other package managers
-   A [MongoDB](https://mongodb.com/) database - [Tutorial](https://youtu.be/-PdjUx9JZ2E) (2:05 - 8:47)

#### Installation

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

4. Add the URL of your frontend and backend to `config/allowedOrigins.ts` (at first it contains the URLs I used)

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

-   Description: Redirects to the GitHub repository of the project. Also reached if the user tries to access a non-existent endpoint.
-   Possible Responses:
    -   302 Found: Redirects to the GitHub repository

### Search

#### Search all

`GET /api/search/:query`

-   Description: Returns all the users, posts and comments that match the specified query, which is not case-sensitive, can contain multiple words and for now has to be an exact match. The query must be added to the end of the URL, like such: `/api/search/new job`
-   Request Body: Contains the search options (true or false), all of which are optional. If none are provided, the search will be performed on all three types of documents.

    Example:

    ```
    {
        "posts": true,
        "comments": true
    }
    ```

-   Possible Responses:

    -   200 OK: Search was successful. Returns an object containing the results for each type of document. Each array contains the documents that match the query and options. Empty arrays are returned if there are no results for a specific type of document, and no array is returned if the option is not provided or set to `false`.

        Example:

        ```
        {
            "posts": [
                {
                    "_id": "614af8a3a25a2b001f439c02",
                    "content": "Looking forward to my first day at my new job tomorrow! 🚀",
                    "userID": "64bd1dee78c6046dbec6b98c",
                    "date": "2023-07-22T18:45:00Z",
                    "likeIDs": ["64bfdfd6e0877113aefe93dc", "614af8a3a25a2b001f439c08", "614af8a3a25a2b001f439c09"],
                    "commentIDs": ["614af8a3a25a2b001f439c08, 614af8a3a25a2b001f439c09"],
                    "__v": 1
                }
            ],
            "comments": []
            // notice how the comments array is empty because the option was set to true but there are no results
            // and no users array is returned because the option was not provided
        }
        ```

    -   204 No Content: There are no results for the specified query and options
    -   400 Bad Request: No query was provided

        Example:

        ```
        No search query was provided
        ```

### Uploads

#### Read file

`GET /api/uploads/:id`

-   Description: Returns a file with the specified ID from the database. The ID must be added to the end of the URL, like such: `/uploads/64cd010abb97ac82ceb62070`
-   Possible Responses:
    -   200 OK: The file was found and returned
    -   404 Not Found: No file was found with the specified ID

### Auth

#### Login

`POST /api/auth/login`

-   Description: Authenticates a user by username or email (you only need to send one; if both are received, only the username is considered) and password, stores a refresh token in a cookie, and returns an access token. All the cookie handling is built in, so you don't have to worry about it. What you need to do is store the access token somewhere on the frontend, as you will need it to access protected routes.
-   Request Body: Contains a username (or email) and a password

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

-   Description: Registers a new user into the database. This does not also log the user in. If you want the user to be autmatically logged in after the registration, call `POST /api/auth/login` right after.
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
                "username": "LilySmith82",
                "displayName": "Lily",
                "bio": "I'm a software engineer from the UK. I love to travel and take photos.",
                "location": "London, UK",
                "pictureID": "64cd010abb97ac82ceb62070",
                "followerIDs": ["64bfdfd6e0877113aefe93dc"],
                "followingIDs": []
            },
            {
                "_id": "64bfdfd6e0877113aefe93dc",
                "username": "WillH19"
                "followerIDs": [],
                "displayName": "Willy",
                "bio": "",
                "location": "New York, USA",
                "followingIDs": ["64bd1dee78c6046dbec6b98c"]
            },
            // ...
        ]
        ```

    -   204 No Content: There are no users in the database

#### Read user by ID

`GET /api/users/:id`

-   Description: Returns the public information of a user with the specified ID. There may also be an endpoint for private information in the future. The ID must be added to the end of the URL, like such: `/api/users/64bd1dee78c6046dbec6b98c`
-   Possible Responses:

    -   200 OK: User was fetched successfully

        Example:

        ```
        {
            "_id": "64bd1dee78c6046dbec6b98c",
            "username": "LilySmith82",
            "displayName": "Lily",
            "bio": "I'm a software engineer from the UK. I love to travel and take photos.",
            "location": "London, UK",
            "pictureID": "64cd010abb97ac82ceb62070",
            "followerIDs": ["64bfdfd6e0877113aefe93dc"],
            "followingIDs": []
        }
        ```

    -   400 Bad Request: No user ID was provided or it's incompatible with the MongoDB `ObjectId` type (12 alphanumeric characters)

        Example:

        ```
        Invalid user ID
        ```

    -   404 Not Found: No user was found with the specified ID

        Example:

        ```
        User does not exist
        ```

#### Update user by ID

`PUT /api/users/:id`

`Authorization: Bearer [access token]`

-   **PROTECTED ROUTE**: Requires an access token in the authorization header.
-   Description: Updates information about the user ( username, email, password, display name, bio, location, profile picture). You can send any combination of the seven, but you must send at least one. Handling for cases when the user is trying to edit someone else's information (which is currently not allowed) is built in. When a new profile picture is uploaded, the old one is deleted from the database. The example shows a display name and location change. The ID must be added to the end of the URL, like such: `/api/users/64bfdfd6e0877113aefe93dc`
-   Request Body: Any combination of username, email and password

    Example:

    ```
    {
        "displayName": "Willy",
        "location": "New York, USA",
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

        Example:

        ```
        User does not exist
        ```

    -   409 Conflict: The username or email are already used by another user (only if they're trying to change their username or email)

        Example:

        ```
        {
            "username": "taken"
        }
        ```

    -   413 Payload Too Large: The profile picture is too large or there are too many files

        Example:

        ```
        {
            "sizeLimit": "10MB"
            "filesOverSizeLimit": ["profilePicture"]
        }
        ```

        or

        ```
        Too many files. Maximum is 1
        ```

    -   415 Unsupported Media Type: The profile picture is not a valid image file. Supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.svg`

        Example:

        ```
        {
            "filesWithWrongFormats": ["profilePicture"]
        }
        ```

#### Follow user by ID

`PUT /api/users/follow/:id`

`Authorization: Bearer [access token]`

-   **PROTECTED ROUTE**: Requires an access token in the authorization header.
-   Description: Follows or unfollows a user with the specified ID. The ID must be added to the end of the URL, like such: `/api/users/follow/64bd1dee78c6046dbec6b98c`
-   Possible Responses:

    -   200 OK: User was followed or unfollowed successfully
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

    -   404 Not Found: No user was found with the specified ID

        Example:

        ```
        User does not exist
        ```

    -   409 Conflict: The user is trying to follow themselves

        Example:

        ```
        Attempted following self
        ```

#### Delete user by ID

`DELETE /api/users/:id`

`Authorization: Bearer [access token]`

-   **PROTECTED ROUTE**: Requires an access token in the authorization header.
-   Description: Deletes the user from the database. Handling for cases when the user is trying to delete someone else's account (which is currently not allowed) is built in as well. Deleting a user also deletes their profile picture from the database. The ID must be added to the end of the URL, like such: `/api/users/64bfdfd6e0877113aefe93dc`

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
-   Request Body: Text content and optionally media files (images, video or audio). The example shows a post with just text content.

    ```

    {
        "content": "Just had an amazing day at the beach! 🏖️🌞"
    }

    ```

-   Possible Responses:

    -   201 Created: Post was created successfully
    -   400 Bad Request: No post content was provided

        Example:

        ```
        Missing post content
        ```

    -   401 Unauthorized: No access token was provided

        Example:

        ```
        Missing access token
        ```

    -   413 Payload Too Large: The media is too large or there are too many files

        Example:

        ```
        {
            "sizeLimit": "10MB",
            "filesOverSizeLimit": ["image3", "video1"]
        }
        ```

        or

        ```
        Too many files. Maximum is 10
        ```

    -   415 Unsupported Media Type: The media files are not valid formats. Supported formats:

        -   image: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.svg`
        -   video: `.mp4`, `.avi`, `.mkv`, `.wmv`, `.flv`, `.webm`
        -   audio: `.mp3`, `.wav`, `.ogg`, `.aac`, `.flac`, `.m4a`

        Example:

        ```
        {
            "filesWithWrongFormats": ["image3", "video1"]
        }
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
                "_id": "614af8a3a25a2b001f439c02",
                "content": "Cannot wait to start my new job tomorrow! 🚀",
                "userID": "64bd1dee78c6046dbec6b98c",
                "date": "2023-07-22T18:45:00Z",
                "likeIDs": ["64bfdfd6e0877113aefe93dc", "614af8a3a25a2b001f439c08", "614af8a3a25a2b001f439c09"],
                "commentIDs": ["614af8a3a25a2b001f439c08"],
                "__v": 0
            },
            {
                "_id": "614af8a3a25a2b001f439c01",
                "content": "Just had an amazing day at the beach! 🏖️🌞",
                "userID": "64bfdfd6e0877113aefe93dc",
                "date": "2023-07-25T10:30:00Z",
                "likeIDs": [],
                "commentIDs": [],
                "__v": 0
            }
            // ...
        ]

        ```

    -   204 No Content: There are no posts in the database

#### Read post by ID

`GET /api/posts/:id`

-   Description: Returns a post with the specified ID. The ID must be added to the end of the URL, like such: `/api/posts/614af8a3a25a2b001f439c06`
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

    -   404 Not Found: No post was found with the specified ID

        Example:

        ```
        Post does not exist
        ```

#### Read all posts by user ID

`GET /api/posts/user/:id`

-   Description: Returns all the posts by a user with the specified ID. The user ID must be added to the end of the URL, like such: `/api/posts/user/64bfdfd6e0877113aefe93dc`

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
-   Description: Updates the content of a post with the specified ID. You can only update your own posts. The example shows a text content change. The ID must be added to the end of the URL, like such: `/api/posts/614af8a3a25a2b001f439c06`
-   Request Body: Text content and optionally media files (images, video or audio). If any media files are uploaded, the old ones will be deleted and replaced. If no media files are uploaded, the old ones will remain unchanged.

    Example:

    ```
    {
        "content": "Looking forward to my first day at my new job tomorrow! 🚀"
    }
    ```

-   Possible Responses:

    -   200 OK: Post was updated successfully

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

    -   404 Not Found: No post was found with the specified ID

        Example:

        ```
        Post does not exist
        ```

    -   413 Payload Too Large: The media is too large or there are too many files

        Example:

        ```
        {
            "sizeLimit": "10MB",
            "filesOverSizeLimit": ["image3", "video1]
        }
        ```

        or

        ```
        Too many files. Maximum is 10
        ```

    -   415 Unsupported Media Type: The media files are not valid formats. Supported formats:

        -   image: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.svg`
        -   video: `.mp4`, `.avi`, `.mkv`, `.wmv`, `.flv`, `.webm`
        -   audio: `.mp3`, `.wav`, `.ogg`, `.aac`, `.flac`, `.m4a`

        Example:

        ```
        {
            "filesWithWrongFormats": ["image3", "video1"]
        }
        ```

#### Like post by ID

`PUT /api/posts/like/:id`

`Authorization: Bearer [access token]`

-   **PROTECTED ROUTE**: Requires an access token in the authorization header.
-   Description: Likes or unlikes a post with the specified ID. The ID must be added to the end of the URL, like such: `/api/like/614af8a3a25a2b001f439c06`
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

    -   404 Not Found: No post was found with the specified ID

        Example:

        ```
        Post does not exist
        ```

#### Delete post by ID

`DELETE /api/posts/:id`

`Authorization: Bearer [access token]`

-   **PROTECTED ROUTE**: Requires an access token in the authorization header.
-   Description: Deletes a post's content, userID and links to media files. Deleting a post also deletes the attached media files from the database, but not the comments under it. You can only delete your own posts. The ID must be added to the end of the URL, like such: `/api/posts/614af8a3a25a2b001f439c06`

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
-   Description: Creates a new comment and stores it in the database, under a post or comment with the specified ID. The ID must be added to the request body as `parentID`.
-   Request Body: Contains the content of the comment and the ID of the post or comment it belongs to.

    Example:

    ```

    {
        "content": "That's awesome! 🎉",
        "parentID": "614af8a3a25a2b001f439c06"
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

    -   404 Not Found: No post was found with the specified ID

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
                "parentID": "614af8a3a25a2b001f439c06",
                "commentIDs": ["614af8a3a25a2b001f439c09"],
                "date": "2023-07-22T18:45:00Z",
                "likeIDs": ["64bd1dee78c6046dbec6b98c", "614af8a3a25a2b001f439c09"],
                "__v": 0
            },
            {
                "_id": "614af8a3a25a2b001f439c09",
                "content": "Thanks! 😊",
                "userID": "64bd1dee78c6046dbec6b98c",
                "parentID": "614af8a3a25a2b001f439c06",
                "commentIDs": [],
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

-   Description: Returns a comment with the specified ID. The ID must be added to the end of the URL, like such: `/api/comments/614af8a3a25a2b001f439c08`
-   Possible Responses:

    -   200 OK: Comment was fetched successfully

        Example:

        ```
        {
            "_id": "614af8a3a25a2b001f439c08",
            "content": "That's awesome! 🎉",
            "userID": "64bfdfd6e0877113aefe93dc",
            "parentID": "614af8a3a25a2b001f439c06",
            "commentIDs": ["614af8a3a25a2b001f439c09"],
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

    -   404 Not Found: No comment was found with the specified ID

        Example:

        ```
        Comment does not exist
        ```

#### Read all comments by user ID

`GET /api/comments/user/:id`

-   Description: Returns all the comments by a user with the specified ID. Lower level comments are not returned, but they can be fetched recursively using the `commentIDs` field. The user ID must be added to the end of the URL, like such: `/api/comments/user/64bfdfd6e0877113aefe93dc`
-   Possible Responses:

    -   200 OK: Comments were fetched successfully

        Example:

        ```
        [
            {
                "_id": "614af8a3a25a2b001f439c08",
                "content": "That's awesome! 🎉",
                "userID": "64bfdfd6e0877113aefe93dc",
                "parentID": "614af8a3a25a2b001f439c06",
                "commentIDs": ["614af8a3a25a2b001f439c09"],
                "date": "2023-07-22T18:45:00Z",
                "likeIDs": ["64bd1dee78c6046dbec6b98c", "614af8a3a25a2b001f439c09"],
                "__v": 0
            },
            // ...
        ]
        ```

    -   204 No Content: There are no comments by the user with the specified ID

    -   400 Bad Request: No user ID was provided or it's incompatible with the MongoDB `ObjectId` type (12 alphanumeric characters)

        Example:

        ```
        Invalid user ID
        ```

#### Read all comments by post or comment ID

`GET /api/comments/parent/:id`

-   Description: Returns all the top level comments under a post or nested under comment with the specified ID. Lower level comments are not returned, but they can be fetched recursively using the `commentIDs` field. The ID must be added to the end of the URL, like such: `/api/comments/parent/614af8a3a25a2b001f439c06`.
-   Possible Responses:

    -   200 OK: Comments were fetched successfully

        Example:

        ```
        [
            {
                "_id": "614af8a3a25a2b001f439c08",
                "content": "That's awesome! 🎉",
                "userID": "64bfdfd6e0877113aefe93dc",
                "parentID": "614af8a3a25a2b001f439c06",
                "commentIDs": ["614af8a3a25a2b001f439c09"],
                "date": "2023-07-22T18:45:00Z",
                "likeIDs": ["64bd1dee78c6046dbec6b98c", "614af8a3a25a2b001f439c09"],
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

    -   404 Not Found: No comment was found with the specified ID

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

    -   404 Not Found: No comment was found with the specified ID

        Example:

        ```
        Comment does not exist
        ```

#### Delete comment by ID

`DELETE /api/comments/:id`

`Authorization: Bearer [access token]`

-   **PROTECTED ROUTE**: Requires an access token in the authorization header.
-   Description: Deletes the comment content and user ID. Deleting a comment doesn't delete the comments under it. You can only delete your own comments. The ID must be added to the end of the URL, like such: `/api/comments/614af8a3a25a2b001f439c08`
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

### v1.5.1

Release date: 2023-08-05

-   Fixed a typo in the update user enpoint that caused only the usename and profile picture to be updated, even if the request body contained other fields
-   Updated README

### v1.5.0

Release date: 2023-08-04

-   In between versions, deployed the API on Render and noticed the problems that needed addressing in this version
-   Overhauled the file uploading system to save files to the database instead of the server's file system, to make it more deployment friendly
-   Updated all the update endpoints to delete the old files from the database when a new file is uploaded
-   Updated the user and post models and interfaces to include file IDs instead of file paths
-   Added an interface and model for files
-   Updated the file fetching endpoint to require an ID instead of a path
-   Updated the delete user endpoint to delete their profile picture, likes, and remove them from the followers and following arrays of other users
-   Updated the delete post endpoint to delete all the attached media files from the database
-   Updated README

### v1.4.0

Release date: 2023-08-01

-   Implemented file upload functionality
-   Added picture fields in the user and post interfaces
-   Updated the create and update endpoints to include the new fields
-   Added endpoint for fetching user uploaded files
-   Implemented nested comments. Now comments behave like a tree structure, where each comment can have multiple child comments.
-   Updated the comment interface to include the new fields
-   Changed the delete routes for posts and comments to only delete their content and user IDs, instead of deleting the entire document. This is to prevent orphaned comments from being left partly inaccessible when a parent is deleted
-   Updated README

### v1.3.0

Release date: 2023-07-30

-   Implemented search functionality for users, posts and comments
-   Added an interface for the search results
-   Added checking for duplicate usernames and emails when updating user information, something that I forgot in the previous versions
-   Added more profile-oriented fields to the user interface: `displayName`, `bio`, `website`, `location`
-   Updated user read and update endpoints to include the new fields
-   Narrowed down types for constants
-   Renamed some files and directories to improve consistency
-   Updated README

### v1.2.1

Release date: 2023-07-27

-   Implemented user follow/unfollow functionality
-   Updated the user interface to allow the follow/unfollow functionality
-   Removed unused interfaces
-   Removed redundant assignments in the `createPost` function
-   Updated README

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
