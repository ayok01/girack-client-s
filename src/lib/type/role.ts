export default interface IRole {
  roleId: string;
  name: string;
  color: string;
  ServerManage: boolean;
  RoleManage: boolean;
  ChannelManage: boolean;
  UserManage: boolean;
  MessageDelete: boolean;
  MessageAttatchFile: boolean;
}
