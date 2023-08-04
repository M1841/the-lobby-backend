interface IUser {
    username: string;
    email: string;
    password: string;
    refreshToken: string[];
    displayName: string;
    bio: string;
    location: string;
    pictureID: mongoose.Types.ObjectId;
    followerIDs: mongoose.Types.ObjectId[];
    followingIDs: mongoose.Types.ObjectId[];
}

interface IPublicUser {
    _id: mongoose.Types.ObjectId;
    username: string;
    displayName: string;
    bio: string;
    location: string;
    pictureID: mongoose.Types.ObjectId;
    followerIDs: mongoose.Types.ObjectId[];
    followingIDs: mongoose.Types.ObjectId[];
}

interface IPost {
    content: string;
    userID: mongoose.Types.ObjectId;
    date: Date;
    mediaIDs: mongoose.Types.ObjectId[];
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

interface IFile {
    name: string;
    data: Buffer;
    mimetype: string;
    size: number;
}
