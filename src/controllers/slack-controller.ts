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
        const slackObject = {
            text: title,
            channel: this.channel,
            attachments: [
                {
                    text: message,
                    color
                }
            ]
        };
        if (configurations.slack.on) {
            await this.webClient.chat.postMessage(slackObject);
        } else {
            console.log(`${JSON.stringify(slackObject, null, 2)}`);
        }
    }
}

const slackController = new SlackController();
export default slackController;