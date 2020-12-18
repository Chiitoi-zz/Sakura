import { Command } from 'discord-akairo'
import { Message, CategoryChannel } from 'discord.js'
import { GUILD, LISTS, MESSAGES } from '../../utility/constants'
import { updateList } from '../../utility/utils'

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
        return updateList(this.client, message, GUILD.CATEGORIES, LISTS.CATEGORIES, action, channel)      
    }
}