require('dotenv').config();
import configurations from './configurations';
import { WebClient, WebAPICallResult } from '@slack/web-api';
import { Client } from 'pg';
import queryTests, { QueryTest } from './query-tests';
import * as _ from 'lodash';

(async () => {
    const client = new Client();
    
    await client.connect();
    for(let test of queryTests) {
        const queryResult = await client.query(test.query);
        const testResult = _.isEqual(test.expectedResults, queryResult.rows);
        console.log(testResult);
    }
    // const web = new WebClient(configurations.slack.accessToken);
    // const result: WebAPICallResult = await web.chat.postMessage({
    //     text: 'Hello World',
    //     channel: 'data-integrity-monitor'
    // });
    // console.log(JSON.stringify(result));
})();
