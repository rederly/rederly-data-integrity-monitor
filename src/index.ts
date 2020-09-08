require('dotenv').config();
import { Client } from 'pg';
import queryTests, { QueryTest } from './query-tests';
import * as _ from 'lodash';
import slackController from './slack-controller';

(async () => {
    const client = new Client();
    
    slackController.sendMessage({
        title: '*Starting run now*',
    });

    await client.connect();
    for(let test of queryTests) {
        const queryResult = await client.query(test.query);
        const testResult = _.isEqual(test.expectedResults, queryResult.rows);
        slackController.sendMessage({
            title: test.name,
            message: `${testResult ? 'Passed' : 'Failed'}: ${test.message(test, queryResult.rows)}`,
            color: testResult ? '#00FF00' : '#FF0000'
        });
    }
})();
