import { Command } from 'discord-akairo'
import { Message, TextChannel } from 'discord.js'
import { GUILD, LISTS, MESSAGES } from '../../utility/constants'

export default class IgnoreCommand extends Command {
    public constructor() {
        super('ignore', {
            aliases: ['ignore'],
            args: [
                { id: 'action', type: ['add', 'remove', 'replace'] },
                { id: 'channel', type: 'textChannel' }
            ],
            category: 'Admin',
            channel: 'guild',
            description: {
                examples: MESSAGES.COMMANDS.IGNORE.EXAMPLES,
                text: MESSAGES.COMMANDS.IGNORE.DESCRIPTION,
                usage: MESSAGES.COMMANDS.IGNORE.USAGE                
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
        const list = this.client.portals.get(message.guild, GUILD.IGNORE, []) as string[]
        const inList = list.includes(channelId)

        if (action == 'add' && !inList) {
            const newList = [...list, channelId]
            await this.client.portals.set(message.guild, GUILD.IGNORE, newList)
            return message.util.send(MESSAGES.STATES.CHANNEL_ADDED(channel, LISTS.IGNORE))
        } else if (action == 'remove' && inList) {
            const newList = list.filter(c => c != channelId)
            await this.client.portals.set(message.guild, GUILD.IGNORE, newList)
            return message.util.send(MESSAGES.STATES.CHANNEL_REMOVED(channel, LISTS.IGNORE))
        } else if (action == 'replace') {
            if (channelId) {
                await this.client.portals.set(message.guild, GUILD.IGNORE, [channelId])
                return message.util.send(MESSAGES.STATES.CHANNEL_REPLACED(channel, LISTS.IGNORE))
            } else {
                await this.client.portals.set(message.guild, GUILD.IGNORE, [])
                return message.util.send(MESSAGES.STATES.CHANNEL_PURGE(LISTS.IGNORE))
            }
        } else {
            const verbText = (action == 'add') ? 'is already' : 'is not'
            return message.util.send(MESSAGES.STATES.NO_CHANGE(channel, verbText))
        }        
    }
}