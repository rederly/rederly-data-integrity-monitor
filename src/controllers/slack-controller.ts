import configurations from '../configurations';
import { WebClient, WebAPICallResult } from '@slack/web-api';

export interface SendMessageOptions {
    color?: string;
    message?: string;
    title: string;
}

class SlackController {
    readonly webClient: WebClient;
    readonly channel = 'data-integrity-monitor';
    
    constructor () {
        this.webClient = new WebClient(configurations.slack.accessToken);
    }

    async sendMessage ({
        color,
        message,
        title
    }: SendMessageOptions) {
        const result: WebAPICallResult = await this.webClient.chat.postMessage({
            text: title,
            channel: this.channel,
            attachments: [
                {
                    text: message,
                    color
                }
            ]
        });
        console.log(JSON.stringify(result));
    }
}

const slackController = new SlackController();
export default slackController;