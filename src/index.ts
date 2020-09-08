require('dotenv').config();
import queryTests from './query-tests';
import * as _ from 'lodash';
import slackController from './controllers/slack-controller';
import databaseController from './controllers/database-controller';

(async () => {
    await slackController.sendMessage({
        title: '*Starting run now*',
    });

    for(let test of queryTests) {
        const queryResult = await databaseController.query(test.query);
        const testResult = _.isEqual(test.expectedResults, queryResult.rows);
        await slackController.sendMessage({
            title: test.name,
            message: `${testResult ? 'Passed' : 'Failed'}: ${test.message(test, queryResult.rows)}`,
            color: testResult ? '#00FF00' : '#FF0000'
        });
    }
})();
