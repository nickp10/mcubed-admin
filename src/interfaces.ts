export enum Sport {
    MLB = 1,
    NBA,
    NFL,
    NHL
}

export interface IClientAppState {
    hasAdminAccount: boolean;
    isLoggedIn: boolean;
    serverError: string;
}

export interface IAlternateName {
    id?: string;
    contestName?: string;
    externalName?: string;
    lastUsedDate?: Date;
}

export interface IMissingName {
    id?: string;
    count?: number;
    name?: string;
    sport?: Sport;
    team?: string;
}

export interface IUser {
    id?: string;
    username?: string;
    password?: string;
}

export interface IWheelCategory {
    id?: string;
    name?: string;
}

export interface IWheelWord {
    approved?: boolean;
    id?: string;
    categoryID?: string;
    word?: string;
}
