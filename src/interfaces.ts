import { ObjectID } from "bson";

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
    _id?: ObjectID;
    contestName?: string;
    externalName?: string;
    lastUsedDate?: Date;
}

export interface IMissingName {
    _id?: ObjectID;
    count?: number;
    name?: string;
    sport?: Sport;
    team?: string;
}

export interface IUser {
    _id?: ObjectID;
    username?: string;
    password?: string;
}

export interface IWheelCategory {
    _id?: ObjectID;
    name?: string;
}

export interface IWheelWord {
    approved?: boolean;
    _id?: ObjectID;
    categoryID?: ObjectID;
    word?: string;
}
