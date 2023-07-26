interface IUser {
    username: string;
    email: string;
    password: string;
    refreshToken: string[];
}

interface IPublicUser {
    _id: mongoose.Types.ObjectId;
    username: string;
}

interface IPost {
    content: string;
    userID: mongoose.Types.ObjectId;
    date: Date;
    likeIDs: mongoose.Types.ObjectId[];
    commentIDs: mongoose.Types.ObjectId[];
}

interface IPublicPost {
    _id: mongoose.Types.ObjectId;
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

interface IPublicComment {
    _id: mongoose.Types.ObjectId;
    content: string;
    userID: mongoose.Types.ObjectId;
    postID: mongoose.Types.ObjectId;
    date: Date;
    likeIDs: mongoose.Types.ObjectId[];
}
