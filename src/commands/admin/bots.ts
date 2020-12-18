import { Command } from 'discord-akairo'
import { Message, TextChannel } from 'discord.js'
import { GUILD, LISTS, MESSAGES } from '../../utility/constants'
import { updateList } from '../../utility/utils'

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
        return updateList(this.client, message, GUILD.BOT_CHANNELS, LISTS.BOT_CHANNELS, action, channel)      
    }
}