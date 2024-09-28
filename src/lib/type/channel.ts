export interface IGetchannelList {
  name: string;
  id: string;
}

export interface channelOrder {
  channelId: string;
  isThread: boolean;
  isFolder: boolean;
  child?: channelOrder[];
}

export interface channel {
  channelId: string;
  channelName: string;
  createdBy: string;
  description: string;
  isPrivate: boolean;
  speakableRole: string[];
}
