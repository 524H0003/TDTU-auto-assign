export interface IAccount {
  password: string;
}

export interface IAppSetting {
  plan: string;
  active: boolean;
}

export interface LocalStorage extends IAccount, IAppSetting { }

declare global {
  interface Window {
    executeKit: (input: LocalStorage) => Promise<void>;
  }
}