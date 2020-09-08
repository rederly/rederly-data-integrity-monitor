import * as _ from 'lodash';
export default {
    slack: {
        accessToken: _.defaultTo(process.env.SLACK_TOKEN, ''),
        channel: _.defaultTo(process.env.SLACK_CHANNEL, 'data-integrity-monitor')
    }
}
