import { ObjectID } from "bson";

export function idToString(id: string | ObjectID): string {
    if (!id) {
        return "";
    } else if (typeof id === "string") {
        return id;
    } else {
        return id.toHexString();
    }
};

export function idToObjectID(id: string | ObjectID): ObjectID {
    if (!id) {
        return undefined;
    } else if (id instanceof ObjectID) {
        return id;
    } else {
        return new ObjectID(id);
    }
};

export function idEquals(id1: string | ObjectID, id2: string | ObjectID): boolean {
    const objectID1 = idToObjectID(id1);
    const objectID2 = idToObjectID(id2);
    if (objectID1) {
        if (objectID2) {
            return objectID1.equals(objectID2);
        } else {
            return false;
        }
    } else {
        return !objectID2;
    }
};
