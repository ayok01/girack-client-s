export interface IUserinfo {
  userName: string; //名前
  role: string[]; //ロール
  userId: string; //ユーザーID
  banned: boolean; //BANされたかどうか
  channelJoined: string[]; //参加しているチャンネル
}
