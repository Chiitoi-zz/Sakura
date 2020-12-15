import { Command } from 'discord-akairo'
import { Message } from 'discord.js'
import { MESSAGES } from '../../utility/constants'

export default class GuideCommand extends Command {
    public constructor() {
        super('guide', {
            aliases: ['guide'],
            category: 'Utility',
            channel: 'guild',
            description: {
                text: MESSAGES.COMMANDS.GUIDE.DESCRIPTION,
                usage: MESSAGES.COMMANDS.GUIDE.USAGE
            }
        })
    }

    public exec(message: Message) {
        message.util.send('A guide will be released at a later point in time.')
    }
}