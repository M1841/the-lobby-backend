interface IUser {
    username: string;
    email: string;
    password: string;
    refreshToken: string[];
    displayName: string;
    bio: string;
    location: string;
    picturePath: string;
    followerIDs: mongoose.Types.ObjectId[];
    followingIDs: mongoose.Types.ObjectId[];
}

interface IPublicUser {
    _id: mongoose.Types.ObjectId;
    username: string;
    displayName: string;
    bio: string;
    location: string;
    picturePath: string;
    followerIDs: mongoose.Types.ObjectId[];
    followingIDs: mongoose.Types.ObjectId[];
}

interface IPost {
    content: string;
    userID: mongoose.Types.ObjectId;
    date: Date;
    mediaPaths: string[];
    likeIDs: mongoose.Types.ObjectId[];
    commentIDs: mongoose.Types.ObjectId[];
}

interface IComment {
    content: string;
    userID: mongoose.Types.ObjectId;
    parentID: mongoose.Types.ObjectId;
    commentIDs: mongoose.Types.ObjectId;
    date: Date;
    likeIDs: mongoose.Types.ObjectId[];
}

interface ISearchResult {
    users?: IPublicUser[];
    posts?: IPost[];
    comments?: IComment[];
}
