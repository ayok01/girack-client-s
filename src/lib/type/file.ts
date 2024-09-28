export interface IFile {
  id: string;
  userId: string;
  name: string;
  isPublic: boolean;
  size: number;
  type: File["type"];
  directory: string;
  uploadedDate: string;
  isDelete: boolean;
}

export interface folder {
  id: string;
  userId: string;
  name: string;
  positionedDirectoryId: string;
}
