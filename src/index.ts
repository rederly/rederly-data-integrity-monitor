require('dotenv').config();
import queryTests from './query-tests';
import * as _ from 'lodash';
import slackController from './controllers/slack-controller';
import DatabaseController from './controllers/database-controller';
import { QueryResult } from 'pg';
import ScheduledEvent from './utilities/scheduled-event';
import configurations from './configurations';
import logger from './utilities/logger';
import * as express from 'express';

const SUCCESS_COLOR = '#00FF00';
const FAILURE_COLOR = '#FF0000';

const run = async () => {
    let databaseController = new DatabaseController();
    try {
        await slackController.sendMessage({
            title: '*$$$$$$$$$$$$$$$$$$$$$$$$$ Starting run now $$$$$$$$$$$$$$$$$$$$$$$$$*',
        });
        
        await databaseController.awaitConnection();
        
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
            const testResult = _.isNull(test.expectedResults) || _.isEqual(test.expectedResults, queryResult.rows);
            // if we output passes or if the test failed output
            if (_.isNull(test.expectedResults) || configurations.application.outputPasses || !testResult) {
                await slackController.sendMessage({
                    title: test.name,
                    message: `${testResult ? 'Passed' : 'Failed'}: ${test.message(test, queryResult.rows)}`,
                    color: testResult ? SUCCESS_COLOR : FAILURE_COLOR
                });    
            }
        }
        await slackController.sendMessage({
            title: '*######################### Ending run now #########################*',
        });
    } catch (e) {
        console.error('Unexpected error', e);
    }

    try {
        await databaseController?.close();
    } catch (e) {
        console.error('Unexpected error closing db connection', e);
    }
}

(async () => {
    if (configurations.application.runOnScheduler) {
        await slackController.sendMessage({
            title: '*$$$$$$$$$$$$$$$$$$$$$$$$$ Running on scheduler $$$$$$$$$$$$$$$$$$$$$$$$$*',
        });
        new ScheduledEvent({
            frequencyInMillis: configurations.application.runInterval,
            absolute: configurations.application.runWithAbsoluteTime,
            offsetInMillis: configurations.application.runWithOffset,
            runImmediately: configurations.application.runImmediately,
            callback: run
        }).start();
    } else {
        await slackController.sendMessage({
            title: '*$$$$$$$$$$$$$$$$$$$$$$$$$ Running once $$$$$$$$$$$$$$$$$$$$$$$$$*',
        });
        try {
            await run();
        } catch (e) {
            console.error('Unhandled promise during single run', e)
        }
        await slackController.sendMessage({
            title: '*$$$$$$$$$$$$$$$$$$$$$$$$$ Running once done $$$$$$$$$$$$$$$$$$$$$$$$$*',
        });
    }
})();
if (configurations.server.enabled) {
    const { port } = configurations.server;
    const app = express();
    app.all('/data-integrity-monitor/run', (_req, res) => {
        run()
        .then(() => res.status(200).send('ok'))
        .catch((e) => {
            logger.error('Server request to run failed', e);
            res.status(500).send(e.message);
        });
    });
    app.listen(port, () => {
        slackController.sendMessage({
            title: `Server listening on port: ${port}`,
        })
        .catch(logger.error);
    });
}
process.on('exit', async () => {
    try {
        await slackController.sendMessage({
            title: '*$$$$$$$$$$$$$$$$$$$$$$$$$ Exiting the application $$$$$$$$$$$$$$$$$$$$$$$$$*',
        });    
    } catch (e) {
        logger.error('Error with shutdown event', e);
    }
});
