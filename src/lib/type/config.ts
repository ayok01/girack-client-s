export default interface IConfig {
  notification: {
    notifyAllMessages: boolean;
    notifyMention: boolean;
  };
  theme: "dark" | "light";
  channel: {
    displayRole: boolean;
    displayAttatchmentSizeLimit: number;
  };
  sidebar: {
    ReadAllButtonEnabled: boolean;
    ReadAllButtonByShiftKey: boolean;
  };
}
