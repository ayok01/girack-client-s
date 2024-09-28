export interface IMyUserinfo {
  userName: string; //名前
  role: string[]; //ロール
  userId: string; //ユーザーID
  banned: boolean; //BANされたかどうか
  channelJoined: string[]; //参加しているチャンネル
}

export interface IGirakAuthInfo {
  result: boolean;
  userid: string;
  username: string;
  sessionid: string;
  role: string;
  channelJoined: [string];
}
