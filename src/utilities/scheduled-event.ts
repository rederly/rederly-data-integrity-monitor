import * as moment from 'moment';
import * as _ from 'lodash';

interface ScheduledEventOptions {
    frequencyInMillis: number;
    offsetInMillis?: number;
    absolute?: boolean;
    callback: () => unknown;
    runImmediately?: boolean;
}

export default class ScheduledEvent {
    readonly options: ScheduledEventOptions;
    timeoutHandle: number | null = null;
    started: boolean = false;
    
    constructor(options: ScheduledEventOptions) {
        this.options = options;
    }

    private event = async (runCallback: boolean = true) => {
        if (!this.started) {
            console.warn('Started false, exiting out of event loop');
            return;
        }
        
        const {
            frequencyInMillis,
            offsetInMillis,
            absolute = false,
            callback
        } = this.options;

        console.debug(`ScheduledEvent: Running at ${moment()}`)
        if (runCallback) {
            console.debug(`ScheduledEvent: callback Running at ${moment()}`)
            await callback();
        }

        const currentMoment = moment();
        
        let timeoutTime = frequencyInMillis;
        
        if (absolute) {
            timeoutTime = (frequencyInMillis - (currentMoment.toDate().getTime() % frequencyInMillis) + (offsetInMillis ?? 0)) % frequencyInMillis;
        }

        console.debug(`ScheduledEvent: Next run at ${moment().add(timeoutTime, 'milliseconds')}`)
        this.timeoutHandle = setTimeout(this.event, timeoutTime);
    }

    start = () => {
        if (this.started) {
            console.warn('Already started, preventing additional run');
            return;
        }
        this.started = true;
        this.event(this.options.runImmediately);
    }

    stop = () => {
        if (!this.started) {
            console.warn('Already stopped, preventing additional run');
            return;
        }
        this.started = false;
        if (!_.isNil(this.timeoutHandle)) {
            clearTimeout(this.timeoutHandle);
            this.timeoutHandle = null;
        }
    }
}