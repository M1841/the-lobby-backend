// Third-Party Modules
import { Request, Response } from "express";

// Internal Modules
import User from "../models/User";
import Post from "../models/Post";
import Comment from "../models/Comment";

// ------------------------- READ ------------------------- //
const readSearchResults = async (req: Request, res: Response) => {
    const searchResults: ISearchResult = {};

    // check if the search query is missing
    if (!req?.params?.query) {
        // 400 Bad Request
        return res.status(400).send("No search query was provided");
    }

    try {
        if (!req?.body?.users && !req?.body?.posts && !req?.body?.comments) {
        }
        // search for users
        if (
            req?.body?.users ||
            (!req?.body?.users && !req?.body?.posts && !req?.body?.comments)
        ) {
            searchResults.users = [];
            const users = await User.find({
                $or: [
                    { username: { $regex: req.params.query, $options: "i" } },
                    {
                        displayName: {
                            $regex: req.params.query,
                            $options: "i",
                        },
                    },
                    { bio: { $regex: req.params.query, $options: "i" } },
                    { location: { $regex: req.params.query, $options: "i" } },
                ],
            });

            if (users && users.length > 0) {
                // send back public user information
                const publicUsers: IPublicUser[] = users.map((user) => {
                    return {
                        _id: user._id,
                        username: user.username,
                        displayName: user.displayName,
                        bio: user.bio,
                        location: user.location,
                        followerIDs: user.followerIDs,
                        followingIDs: user.followingIDs,
                    };
                });
                searchResults.users.push(...publicUsers);
            }
        }

        // search for posts
        if (
            req.body.posts ||
            (!req?.body?.users && !req?.body?.posts && !req?.body?.comments)
        ) {
            searchResults.posts = [];
            const posts = await Post.find({
                content: { $regex: req.params.query, $options: "i" },
            });
            if (posts && posts.length > 0) {
                searchResults.posts.push(...posts);
            }
        }

        // search for comments
        if (
            req.body.comments ||
            (!req?.body?.users && !req?.body?.posts && !req?.body?.comments)
        ) {
            searchResults.comments = [];
            const comments = await Comment.find({
                content: { $regex: req.params.query, $options: "i" },
            });
            if (comments && comments.length > 0) {
                searchResults.comments.push(...comments);
            }
        }

        if (
            !searchResults?.users &&
            !searchResults?.posts &&
            !searchResults?.comments
        ) {
            // 204 No Content
            return res.sendStatus(204);
        }
        // 200 OK
        return res.json(searchResults);
    } catch (err: unknown) {
        // 500 Internal Server Error
        return res.status(500).json(err);
    }
};

export { readSearchResults };
