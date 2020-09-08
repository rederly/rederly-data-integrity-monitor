require('dotenv').config();
import configurations from './configurations';
const sleep = (millis: number): Promise<void> => (new Promise((resolve) => setTimeout(resolve, millis)));
(async () => {
    console.log(configurations.slack.accessToken)
    console.log(new Date());
    await sleep(5000);
    console.log('HELLO WORLD');
    console.log(new Date());
})();
