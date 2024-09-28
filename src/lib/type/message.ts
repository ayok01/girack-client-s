export default interface IMessage {
  messageId: string;
  channelId: string;
  userId: string;
  isEdited: boolean;
  isSystemMessage: boolean;
  content: string;
  linkData: {
    [key: string]:
      | {
          contentType: "text/html" | "video";
          mediaType: string;
          url: string;
          siteName?: string;
          title?: string;
          description?: string;
          favicon: string;
          images?: { url: string; type: string }[];
        }
      | {
          contentType: "image";
          mediaType: "image";
          url: string;
        };
  };
  fileId: string[];
  time: string;
  reaction: {
    [key: string]: {
      [key: string]: number;
    };
  };
}

export interface IInbox {
  mention: {
    [key: string]: string[]; //ここでのkeyはチャンネルId
  };
  event: {
    [key: string]: string[]; //ここでのkeyはチャンネルId
  };
}

//システムメッセージの内容用フラッグ
export type ISystemMessageFlag =
  | "SERVER_JOINED"
  | "SERVER_UPDATED"
  | "CHANNEL_INVITED"
  | "CHANNEL_JOINED"
  | "CHANNEL_LEFT"
  | "CHANNEL_KICKED"
  | "CHANNEL_INFO_UPDATED";

//システムメッセージの内容用型
export interface ISystemMessageContent {
  flag: ISystemMessageFlag;
  targetUserId: string | null;
  senderUserId: string;
}
