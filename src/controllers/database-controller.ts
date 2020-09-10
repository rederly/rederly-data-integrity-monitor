import { Client } from 'pg';

export default class DatabaseController {
    readonly client: Client;
    readonly connectionPromise: Promise<void>;

    constructor() {
        this.client = new Client();
        this.connectionPromise = this.client.connect();
    }
    

    async query(queryString: string) {
        await this.connectionPromise;
        return this.client.query(queryString);
    }

    close() {
        return this.client.end();
    }

    async awaitConnection() {
        await this.connectionPromise;
    }
}