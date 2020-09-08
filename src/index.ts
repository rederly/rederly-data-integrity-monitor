require('dotenv').config();
import queryTests from './query-tests';
import * as _ from 'lodash';
import slackController from './controllers/slack-controller';
import databaseController from './controllers/database-controller';
import { QueryResult } from 'pg';

const SUCCESS_COLOR = '#00FF00';
const FAILURE_COLOR = '#FF0000';

(async () => {
    try {
        await slackController.sendMessage({
            title: '*@@@@@@@@@@@@@@@@@@@@@@@@@ Starting run now @@@@@@@@@@@@@@@@@@@@@@@@@*',
        });
    
        for(let test of queryTests) {
            let queryResult: QueryResult | null = null;
            try {
                queryResult = await databaseController.query(test.query);
            } catch (e) {
                console.error(`Error running test ${test.name}`, e)
                await slackController.sendMessage({
                    title: `UNABLE TO RUN TEST ${test.name}`,
                    message: e.message,
                    color: FAILURE_COLOR
                });
            }
            if(_.isNil(queryResult)) {
                continue;
            }
            const testResult = _.isEqual(test.expectedResults, queryResult.rows);
            await slackController.sendMessage({
                title: test.name,
                message: `${testResult ? 'Passed' : 'Failed'}: ${test.message(test, queryResult.rows)}`,
                color: testResult ? SUCCESS_COLOR : FAILURE_COLOR
            });
        }
        await slackController.sendMessage({
            title: '*######################### Ending run now #########################*',
        });
    } catch (e) {
        console.error('Unexpected error', e);
    }
})();
