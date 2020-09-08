import { Client } from 'pg';

class DatabaseController {
    readonly client: Client;
    readonly connectionPromise: Promise<void>;
    private connected: boolean = false;

    constructor() {
        this.client = new Client();
        this.connectionPromise = this.client.connect();
    }

    async query(queryString: string) {
        await this.connectionPromise;
        return this.client.query(queryString);
    }
}
const databaseController = new DatabaseController();
export default databaseController;