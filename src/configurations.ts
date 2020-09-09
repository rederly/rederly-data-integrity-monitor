import * as _ from 'lodash';

const envToBoolean = (value?: string): boolean | null => {
    if (_.isNil(value)) {
        return null;
    }
    return value === 'true';
}

const envToNumber = (value?: string): number | null => {
    if (_.isNil(value)) {
        return null;
    }

    const result = parseInt(value, 10);
    if (_.isNaN(result)) {
        return null;
    }
    return result;
}

export default {
    slack: {
        accessToken: _.defaultTo(process.env.SLACK_TOKEN, ''),
        channel: _.defaultTo(process.env.SLACK_CHANNEL, 'data-integrity-monitor'),
        on: _.defaultTo(envToBoolean(process.env.SLACK_ON), true),
    },
    application: {
        // We want to run this late at night so if the server reboots we don't want to run it in the middle of the day
        runImmediately: _.defaultTo(envToBoolean(process.env.RUN_IMMEDIATELY), false),
        // How often we run, defaults to once a day
        runInterval: _.defaultTo(envToNumber(process.env.RUN_INTERVAL), 86400000),
        // Whether we run from some absolute time or just at an interval
        runWithAbsoluteTime: _.defaultTo(envToBoolean(process.env.RUN_WITH_ABSOLUTE_TIME), true),
        // Only works with `runWithAbsoluteTime`, applies some constant to the time, we want to run at 8am utc
        runWithOffset: _.defaultTo(envToNumber(process.env.RUN_OFFSET), 28800000),
    }
}
