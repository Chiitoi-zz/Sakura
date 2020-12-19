import { Command } from 'discord-akairo'
import { Message } from 'discord.js'
import pms from 'pretty-ms'
import { MESSAGES } from '../../utility/constants'

export default class StatsCommand extends Command {
    public constructor() {
        super('stats', {
            aliases: ['stats'],
            category: 'Utility',
            channel: 'guild',
            description: {
                text: MESSAGES.COMMANDS.STATS.DESCRIPTION,
                usage: MESSAGES.COMMANDS.STATS.USAGE
            }
        })
    }

    public exec(message: Message) {
        const formatNumber = (num: number | string) => num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
        const embed = {
            author: {
                name: `${ this.client.user.username} v${ process.env.npm_package_version ?? process.env.version }`,
                icon_url: this.client.user.displayAvatarURL()
            },
            color: 'F8F8FF',
            fields: [
                { name: 'Developer', value: 'Flare#2851' },
                { name: 'Bot owner', value: this.client.users.cache.get(process.env.OWNER_ID ?? '')?.tag },
                {
                    name: 'General stuff',
                    value: [
                        `**Portals:** ${ formatNumber(this.client.guilds.cache.size) }`,
                        `**Channels:** ${ formatNumber(this.client.channels.cache.size) }`
                    ]
                },
                {
                    name: 'Random stuff',
                    value: [
                        `**Uptime:** ${ pms(this.client.uptime ?? 0, { secondsDecimalDigits: 0 }) }`,
                        `**Memory Usage:** ${ formatNumber((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)) } MB`
                    ]
                }
            ]
        }

        message.util.send({ embed })
    }
}