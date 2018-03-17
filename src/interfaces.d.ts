export enum Sport {
    MLB = 1,
    NBA,
    NFL,
    NHL
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
