import configurations from '../configurations';
import { WebClient } from '@slack/web-api';

export interface SendMessageOptions {
    color?: string;
    message?: string;
    title: string;
}

class SlackController {
    readonly webClient: WebClient;
    readonly channel = configurations.slack.channel;
    
    constructor () {
        this.webClient = new WebClient(configurations.slack.accessToken);
    }

    async sendMessage ({
        color,
        message,
        title
    }: SendMessageOptions) {
        await this.webClient.chat.postMessage({
            text: title,
            channel: this.channel,
            attachments: [
                {
                    text: message,
                    color
                }
            ]
        });
    }
}

const slackController = new SlackController();
export default slackController;