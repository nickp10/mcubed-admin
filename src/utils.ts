import * as crypto from "crypto-js";

class Utils {
    coerceFloat(value: string): number {
        const parsed = parseFloat(value);
        if (isNaN(parsed) || typeof parsed !== "number") {
            return undefined;
        }
        return parsed;
    }

    coerceInt(value: string): number {
        const parsed = parseInt(value);
        if (isNaN(parsed) || typeof parsed !== "number") {
            return undefined;
        }
        return parsed;
    }

    hashPassword(password: string): string {
        return crypto.SHA256(password).toString();
    }
}

export default new Utils();
