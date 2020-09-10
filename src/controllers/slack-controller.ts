import configurations from '../configurations';
import { WebClient } from '@slack/web-api';
import logger from '../utilities/logger';

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
        }

        if (configurations.slack.log) {
            logger.info('');
            logger.info(`# ${title}`);
            logger.info(`${message}\n`);    
        }
    }
}

const slackController = new SlackController();
export default slackController;