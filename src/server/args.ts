import * as argv from "argv";
import * as path from "path";
import * as process from "process";
import utils from "../utils";

export class Args {
    port: number;
    persistenceServer: string;
    persistencePort: number;
    persistenceAppName: string;
    persistenceAppKey: string;

    constructor() {
        const args = argv
            .option({ name: "port", short: "p", type: "number" })
            .option({ name: "persistenceServer", type: "string" })
            .option({ name: "persistencePort", type: "number" })
            .option({ name: "persistenceAppName", type: "string" })
            .option({ name: "persistenceAppKey", type: "string" })
            .run();
        const argPort = utils.coerceInt(args.options["port"]);
        const argPersistenceServer = args.options["persistenceServer"];
        const argPersistencePort = utils.coerceInt(args.options["persistencePort"]);
        const argPersistenceAppName = args.options["persistenceAppName"];
        const argPersistenceAppKey = args.options["persistenceAppKey"];
        this.validate(argPort, argPersistenceServer, argPersistencePort, argPersistenceAppName, argPersistenceAppKey);
    }

    validate(argPort: number, argPersistenceServer: string, argPersistencePort: number, argPersistenceAppName: string, argPersistenceAppKey: string): void {
        // Validate port
        this.port = argPort || 8000;
        if (!this.port) {
            console.error("The -p or --port argument must be supplied.");
            process.exit();
        }

        // Validate persistenceServer
        this.persistenceServer = argPersistenceServer;
        if (!this.persistenceServer) {
            console.error("The --persistenceServer argument must be supplied.");
            process.exit();
        }

        // Validate persistencePort
        this.persistencePort = argPersistencePort;
        if (!this.persistencePort) {
            console.error("The --persistencePort argument must be supplied.");
            process.exit();
        }

        // Validate persistenceAppName
        this.persistenceAppName = argPersistenceAppName;
        if (!this.persistenceAppName) {
            console.error("The --persistenceAppName argument must be supplied.");
            process.exit();
        }

        // Validate persistenceAppKey
        this.persistenceAppKey = argPersistenceAppKey;
        if (!this.persistenceAppKey) {
            console.error("The --persistenceAppKey argument must be supplied.");
            process.exit();
        }
    }
}

export default new Args();
