import { ObjectId } from "bson";

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
    _id?: ObjectId;
    contestName?: string;
    externalName?: string;
    lastUsedDate?: Date;
}

export interface IMissingName {
    _id?: ObjectId;
    count?: number;
    name?: string;
    sport?: Sport;
    team?: string;
}

export interface IUser {
    _id?: ObjectId;
    username?: string;
    password?: string;
}

export interface IWheelCategory {
    _id?: ObjectId;
    name?: string;
}

export interface IWheelWord {
    approved?: boolean;
    _id?: ObjectId;
    categoryID?: ObjectId;
    word?: string;
}
