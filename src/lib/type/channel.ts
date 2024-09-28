/**
 * @description チャンネルの順序を取得するための型
 */
export interface IChannelOrder {
  channelId: string;
  isThread: boolean;
  isFolder: boolean;
  child?: IChannelOrder[];
}

/**
 * @description チャンネルの情報を取得するための型
 */
export interface IChannel {
  channelId: string;
  channelName: string;
  createdBy: string;
  description: string;
  isPrivate: boolean;
  speakableRole: string[];
}
