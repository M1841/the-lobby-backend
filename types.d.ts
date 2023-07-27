interface IUser {
    username: string;
    email: string;
    password: string;
    refreshToken: string[];
    followerIDs: mongoose.Types.ObjectId[];
    followingIDs: mongoose.Types.ObjectId[];
}

interface IPublicUser {
    _id: mongoose.Types.ObjectId;
    username: string;
    followerIDs: mongoose.Types.ObjectId[];
    followingIDs: mongoose.Types.ObjectId[];
}

interface IPost {
    content: string;
    userID: mongoose.Types.ObjectId;
    date: Date;
    likeIDs: mongoose.Types.ObjectId[];
    commentIDs: mongoose.Types.ObjectId[];
}

interface IComment {
    content: string;
    userID: mongoose.Types.ObjectId;
    postID: mongoose.Types.ObjectId;
    date: Date;
    likeIDs: mongoose.Types.ObjectId[];
}
