import { Command } from 'discord-akairo'
import { Message, CategoryChannel } from 'discord.js'
import { GUILD, LISTS, MESSAGES } from '../../utility/constants'

export default class CategoryCommand extends Command {
    public constructor() {
        super('category', {
            aliases: ['category'],
            args: [
                { id: 'action', type: ['add', 'remove', 'replace'] },
                { id: 'channel', type: 'categoryChannel' }
            ],
            category: 'Admin',
            channel: 'guild',
            description: {
                examples: MESSAGES.COMMANDS.CATEGORY.EXAMPLES,
                text: MESSAGES.COMMANDS.CATEGORY.DESCRIPTION,
                usage: MESSAGES.COMMANDS.CATEGORY.USAGE
            },
            userPermissions: ['ADMINISTRATOR']
        })
    }

    public async exec(message: Message, { action, channel }: { action: 'add' | 'remove' | 'replace', channel: CategoryChannel }) {
        if (!action)
            return message.util.send(MESSAGES.ERRORS.INVALID_ACTION)
        if (!channel && ['add', 'remove'].includes(action))
            return message.util.send(MESSAGES.ERRORS.INVALID_CHANNEL('category'))

        const channelId = channel?.id
        const list = this.client.portals.get(message.guild, GUILD.CATEGORIES, []) as string[]
        const inList = list.includes(channelId)

        if (action == 'add' && !inList) {
            const newList = [...list, channelId]
            await this.client.portals.set(message.guild, GUILD.CATEGORIES, newList)
            return message.util.send(MESSAGES.STATES.CHANNEL_ADDED(channel, LISTS.CATEGORIES))
        } else if (action == 'remove' && inList) {
            const newList = list.filter(c => c != channelId)
            await this.client.portals.set(message.guild, GUILD.CATEGORIES, newList)
            return message.util.send(MESSAGES.STATES.CHANNEL_REMOVED(channel, LISTS.CATEGORIES))
        } else if (action == 'replace') {
            if (channelId) {
                await this.client.portals.set(message.guild, GUILD.CATEGORIES, [channelId])
                return message.util.send(MESSAGES.STATES.CHANNEL_REPLACED(channel, LISTS.CATEGORIES))
            } else {
                await this.client.portals.set(message.guild, GUILD.CATEGORIES, [])
                return message.util.send(MESSAGES.STATES.CHANNEL_PURGE(LISTS.CATEGORIES))
            }
        } else {
            const verbText = (action == 'add') ? 'is already' : 'is not'
            return message.util.send(MESSAGES.STATES.NO_CHANGE(channel, verbText))
        }        
    }
}