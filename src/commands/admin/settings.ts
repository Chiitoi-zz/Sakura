import { Command } from 'discord-akairo'
import { Message } from 'discord.js'
import dayjs from 'dayjs'
import pms from 'pretty-ms'
import { MESSAGES, SakuraGuild } from '../../utility/constants'

export default class SettingsCommand extends Command {
    public constructor() {
        super('settings', {
            aliases: ['settings'],
            category: 'Admin',
            channel: 'guild',
            description: {
                text: MESSAGES.COMMANDS.SETTINGS.DESCRIPTION,
                usage: MESSAGES.COMMANDS.SETTINGS.USAGE
            },
            userPermissions: ['ADMINISTRATOR']
        })
    }

    public async exec(message: Message) {
        const guild = message.guild!
        const guildChannels = guild.channels.cache
            .sort((c1, c2) => c1.position - c2.position)
        const { prefix, checkChannelId, categoryIds, ignoreIds, botChannelIds, lastCheckedAt, inCheck } = this.client.portals.get(guild) as SakuraGuild
        const { checkChannel, categories, ignore, bots } = guildChannels.reduce((acc, channel, channelId) => {
            if (checkChannelId == channelId)
                acc.checkChannel = channel
            if (categoryIds.includes(channelId))
                acc.categories.push(channel)
            if (ignoreIds.includes(channelId))
                acc.ignore.push(channel)
            if (botChannelIds.includes(channelId))
                acc.bots.push(channel)
            return acc
        }, { checkChannel: null, categories: [],  ignore: [], bots: [] })
        const availableIn = lastCheckedAt ? dayjs(lastCheckedAt).add(1, 'day').diff(Date.now()) : null
        const embed = {
            title: `Portal settings for "${ guild.name }"`,
            color: 'F8F8FF',
            fields: [
                { name: 'Bot prefix', value: `\`${ prefix }\`` },
                { name: 'Invite check channel', value: checkChannel ?? 'No channel set.' },
                { name: 'Category list', value: categories.length ? categories.map(({ name }) => `The "${ name }" category`) : 'No added categories.' },
                { name: 'Ignore list', value: ignore.length ? ignore : 'No ignored channels.' },
                { name: 'Bot channel list', value: bots.length ? bots : 'No added bot channels.' },
                { name: 'Time until next invite check', value: (availableIn > 0) ? pms(availableIn, { secondsDecimalDigits: 0 }) : `**${ inCheck ? 'CURRENTLY CHECKING' : 'READY TO CHECK!' }**` }
            ]
        }

        message.util.send({ embed })
    }
}