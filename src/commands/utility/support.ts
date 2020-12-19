import { Command } from 'discord-akairo'
import { Message } from 'discord.js'
import { MESSAGES } from '../../utility/constants'

export default class SupportCommand extends Command {
    public constructor() {
        super('support', {
            aliases: ['support'],
            channel: 'guild',
            category: 'Utility',
            description: {
                text: MESSAGES.COMMANDS.SUPPORT.DESCRIPTION,
                usage: MESSAGES.COMMANDS.SUPPORT.USAGE
            }
        })
    }

    public exec(message: Message) {
        message.util.send('Join the support server for Sakura! - https://discord.gg/wtZurTFJdH')
    }
}