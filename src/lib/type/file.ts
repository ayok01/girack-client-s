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

export interface IFolder {
  id: string;
  userId: string;
  name: string;
  positionedDirectoryId: string;
}
