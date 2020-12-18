import { Command } from 'discord-akairo'
import { Message, TextChannel } from 'discord.js'
import { GUILD, LISTS, MESSAGES } from '../../utility/constants'
import { updateList } from '../../utility/utils'

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
        return updateList(this.client, message, GUILD.IGNORE, LISTS.IGNORE, action, channel)           
    }
}