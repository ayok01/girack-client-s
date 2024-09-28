export default interface IAppStatus {
  connected: boolean;
  fetchingHistory: boolean;
  hasMessageReadId: boolean;
  profile: {
    authDone: boolean;
    UserinfoLoaded: boolean;
  };
}
