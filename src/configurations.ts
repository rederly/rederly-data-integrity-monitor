import * as _ from 'lodash';

const envToBoolean = (value?: string): boolean => {
    return value === 'true';
}
export default {
    slack: {
        accessToken: _.defaultTo(process.env.SLACK_TOKEN, ''),
        channel: _.defaultTo(process.env.SLACK_CHANNEL, 'data-integrity-monitor'),
        on: _.defaultTo(envToBoolean(process.env.SLACK_ON), true),
    },
    application: {
        runImmediately: _.defaultTo(envToBoolean(process.env.RUN_IMMEDIATELY), false),
    }
}
