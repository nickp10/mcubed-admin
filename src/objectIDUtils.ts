import { ObjectId } from "bson";

export function idToString(id: string | ObjectId): string {
    if (!id) {
        return "";
    } else if (typeof id === "string") {
        return id;
    } else {
        return id.toHexString();
    }
};

export function idToObjectID(id: string | ObjectId): ObjectId {
    if (!id) {
        return undefined;
    } else if (id instanceof ObjectId) {
        return id;
    } else {
        return new ObjectId(id);
    }
};

export function idEquals(id1: string | ObjectId, id2: string | ObjectId): boolean {
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
