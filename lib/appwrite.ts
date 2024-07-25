import { FileType, SavedEnum, VideoType } from "@/types";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  ImageGravity,
  Query,
  Storage,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_ENDPOINT || "EXPO_PUBLIC_ENDPOINT",
  platform: process.env.EXPO_PUBLIC_PLATFORM || "EXPO_PUBLIC_PLATFORM",
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID || "EXPO_PUBLIC_PROJECT_ID",
  databaseId: process.env.EXPO_PUBLIC_DATABASE_ID || "EXPO_PUBLIC_DATABASE_ID",
  usersCollectionId:
    process.env.EXPO_PUBLIC_USERS_COLLECTION_ID ||
    "EXPO_PUBLIC_USERS_COLLECTION_ID",
  videosCollectionId:
    process.env.EXPO_PUBLIC_VIDEOS_COLLECTION_ID ||
    "EXPO_PUBLIC_VIDEOS_COLLECTION_ID",
  storageId: process.env.EXPO_PUBLIC_STORAGE_ID || "EXPO_PUBLIC_STORAGE_ID",
};

// Init your React Native SDK
const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint) // Your Appwrite Endpoint
  .setProject(appwriteConfig.projectId) // Your project ID
  .setPlatform(appwriteConfig.platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUser = async (
  email: string,
  password: string,
  username: string
) => {
  console.log(`[API]: createUser`, { email, username });
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error();

    const avatarUrl = avatars.getInitials(username);
    const result = await signIn(email, password);
    console.log("signIn result:", result);
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );
    return newUser;
  } catch (error: any) {
    throw new Error(error);
  }
};

export async function signIn(email: string, password: string) {
  console.log(`[API]: signIn`, { email });
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error: any) {
    throw new Error(error);
  }
}
export async function signOut(sessionId: string = "current") {
  console.log(`[API]: signOut`);
  try {
    const session = await account.deleteSession(sessionId);
    return session;
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function getCurrentUser() {
  console.log(`[API]: getCurrentUser`);
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );
    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error: any) {
    throw new Error(error);
  }
}

export const getAllPosts = async () => {
  console.log(`[API]: getAllPosts`);
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videosCollectionId,
      [Query.orderDesc("$createdAt")]
    );

    return posts.documents;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const getLatestPosts = async () => {
  console.log(`[API]: getLatestPosts`);
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videosCollectionId,
      [Query.orderDesc("$createdAt")]
    );

    return posts.documents;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const searchPosts = async (query: string) => {
  console.log(`[API]: searchPosts ${query}`);
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videosCollectionId,
      [Query.search("title", query)]
    );

    return posts.documents;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const getUserPosts = async (userId: string) => {
  console.log(`[API]: getUserPosts ${userId}`);
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videosCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    return posts.documents;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const getUserSavedPosts = async (query: string) => {
  console.log(`[API]: getUserSavedPosts ${query}`);
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0].videos.filter(
      (video: VideoType) => video.title.indexOf(query) >= 0
    );
  } catch (error: any) {
    throw new Error(error);
  }
};

export const userSavedPosts = async (
  userId: string,
  type: SavedEnum,
  videoId: string
) => {
  console.log(`[API]: userSavedPosts:`, { userId, type, videoId });
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    let videos = currentUser.documents[0].videos.map((video: any) => video.$id);

    if (type === "remove") {
      videos = videos.filter((video: string) => video !== videoId);
    } else {
      videos = [...videos, videoId];
    }

    const result = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      userId,
      {
        videos,
      }
    );

    if (!result) throw Error;
    return result;
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
};

export const getFilePreview = async (
  fileId: string,
  type: "image" | "video"
) => {
  console.log(`[API]: getFilePreview`, { fileId, type });
  let fileUrl;

  try {
    if (type === "image") {
      fileUrl = storage.getFilePreview(
        appwriteConfig.storageId,
        fileId,
        600,
        600,
        ImageGravity.Top,
        70
      );
    } else if (type === "video") {
      fileUrl = storage.getFileView(appwriteConfig.storageId, fileId);
    } else {
      throw new Error("Invalid file type");
    }
    if (!fileUrl) throw new Error("No file url");

    return fileUrl;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const uploadFile = async (file: FileType, type: "image" | "video") => {
  console.log(`[API]: uploadFile`, { file, type });
  if (!file) return;
  const asset = {
    name: file.fileName,
    type: file.mimeType,
    size: file.fileSize,
    uri: file.uri,
  };

  try {
    const uploadFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      asset
    );
    const fileUrl = await getFilePreview(uploadFile.$id, type);
    return fileUrl;
  } catch (error: any) {
    throw new Error(error);
  }
};

type FormType = {
  thumbnail: FileType;
  video: FileType;
  title: string;
  prompt: string;
  userId: string;
};

export const createVideo = async (form: FormType) => {
  console.log(`[API]: searchPosts ${form}`);
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.videosCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        creator: form.userId,
      }
    );
    return newPost;
  } catch (error: any) {
    throw new Error(error);
  }
};
