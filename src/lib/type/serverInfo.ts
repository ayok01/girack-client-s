export interface IServerinfo {
  servername: string;
  registration: {
    available: boolean;
    invite: {
      inviteOnly: boolean;
      inviteCode?: string;
    };
  };
  config: {
    PROFILE: {
      iconMaxSize: number;
      usernameMaxLength: number;
    };
    CHANNEL: {
      channelIdAnnounceRegistration: string;
      defaultJoinOnRegister: string[];
    };
    MESSAGE: {
      TxtMaxLength: number;
    };
    STORAGE: {
      StorageSizeLimit: number;
    };
  };
}
