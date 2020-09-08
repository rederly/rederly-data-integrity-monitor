require('dotenv').config();
import configurations from './configurations';
import { WebClient, WebAPICallResult } from '@slack/web-api';

const sleep = (millis: number): Promise<void> => (new Promise((resolve) => setTimeout(resolve, millis)));
const web = new WebClient(configurations.slack.accessToken);
(async () => {
    await web.chat.postMessage({
        text: 'Hello World',
        channel: 'data-integrity-monitor'
    });    
})();
