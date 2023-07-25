interface IPost {
    content: string;
    userID: string;
    date: Date;
    likeIDs: string[];
    commentIDs: string[];
}

interface IUser {
    username: string;
    email: string;
    password: string;
    refreshToken: string[];
}

interface IPublicUser {
    id: string;
    username: string;
}
