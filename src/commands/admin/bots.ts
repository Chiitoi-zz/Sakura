import { Command } from 'discord-akairo'
import { Message, TextChannel } from 'discord.js'
import { GUILD, LISTS, MESSAGES } from '../../utility/constants'

export default class BotsCommand extends Command {
    public constructor() {
        super('bots', {
            aliases: ['bots'],
            args: [
                { id: 'action', type: ['add', 'remove', 'replace'] },
                { id: 'channel', type: 'textChannel' }
            ],
            category: 'Admin',
            channel: 'guild',
            description: {
                examples: MESSAGES.COMMANDS.BOTS.EXAMPLES,
                text: MESSAGES.COMMANDS.BOTS.DESCRIPTION,
                usage: MESSAGES.COMMANDS.BOTS.USAGE
            },
            userPermissions: ['ADMINISTRATOR']
        })
    }

    public async exec(message: Message, { action, channel }: { action: 'add' | 'remove' | 'replace', channel: TextChannel }) {
        if (!action)
            return message.util.send(MESSAGES.ERRORS.INVALID_ACTION)
        if (!channel && ['add', 'remove'].includes(action))
            return message.util.send(MESSAGES.ERRORS.INVALID_CHANNEL('text'))

        const channelId = channel?.id
        const list = this.client.portals.get(message.guild, GUILD.BOT_CHANNELS, []) as string[]
        const inList = list.includes(channelId)

        if (action == 'add' && !inList) {
            const newList = [...list, channelId]
            await this.client.portals.set(message.guild, GUILD.BOT_CHANNELS, newList)
            return message.util.send(MESSAGES.STATES.CHANNEL_ADDED(channel, LISTS.BOT_CHANNELS))
        } else if (action == 'remove' && inList) {
            const newList = list.filter(c => c != channelId)
            await this.client.portals.set(message.guild, GUILD.BOT_CHANNELS, newList)
            return message.util.send(MESSAGES.STATES.CHANNEL_REMOVED(channel, LISTS.BOT_CHANNELS))
        } else if (action == 'replace') {
            if (channelId) {
                await this.client.portals.set(message.guild, GUILD.BOT_CHANNELS, [channelId])
                return message.util.send(MESSAGES.STATES.CHANNEL_REPLACED(channel, LISTS.BOT_CHANNELS))
            } else {
                await this.client.portals.set(message.guild, GUILD.BOT_CHANNELS, [])
                return message.util.send(MESSAGES.STATES.CHANNEL_PURGE(LISTS.BOT_CHANNELS))
            }
        } else {
            const verbText = (action == 'add') ? 'is already' : 'is not'
            return message.util.send(MESSAGES.STATES.NO_CHANGE(channel, verbText))
        }        
    }
}