import { Listener } from 'discord-akairo'
import { Constants, RateLimitData, TextChannel } from 'discord.js'
import pms from 'pretty-ms'

export default class RateLimitListener extends Listener {
    public constructor() {
        super(Constants.Events.RATE_LIMIT, {
            emitter: 'client',
            event: Constants.Events.RATE_LIMIT
        })
    }

    async exec({ timeout, limit, timeDifference, method, path, route }: RateLimitData) {
        const logChannel = await this.client.channels.fetch(process.env.LOG_CHANNEL_ID) as TextChannel
        const embed = {
            title: 'Rate limit hit!',
            color: 'FFA500',
            fields: [
                { name: 'Timeout', value: pms(timeout ?? 0, { secondsDecimalDigits: 0 }) },
                { name: 'Request limit', value: limit },
                { name: 'Time Difference', value: pms(timeDifference ?? 0, { secondsDecimalDigits: 0 }) },
                { name: 'HTTP method', value: method },
                { name: 'Path', value: path },
                { name: 'Route', value: route }
            ],
            timestamp: Date.now()
        }

        logChannel.send({ embed })
    }
}