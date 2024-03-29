import { format } from "date-and-time";

export class Log {
    formatMessage(message: string): string {
        return `${format(new Date(), "MM/DD/YYYY HH:mm:ss.SSS")} - ${message}`;
    }

    error(message: string): void {
        console.error(this.formatMessage(message));
    }

    info(message: string): void {
        console.log(this.formatMessage(message));
    }
}

export default new Log();
