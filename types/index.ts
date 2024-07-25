export type CreatorType = {
  username: string;
  avatar: string;
};

export type VideoType = {
  title: string;
  thumbnail: string;
  video: string;
  creator: CreatorType;
};

export type PostType = {
  $id: string;
  video: string;
  thumbnail: string;
};

export type FileType = {
  fileName: string;
  mimeType: string;
  fileSize: number;
  uri: string;
};

export enum SavedEnum {
  ADD = "add",
  REMOVE = "remove",
}
