import { Command } from 'discord-akairo'
import { Message } from 'discord.js'
import { MESSAGES } from '../../utility/constants'

export default class PingCommand extends Command {
    public constructor() {
        super('ping', {
            aliases: ['ping'],
            category: 'Utility',
            channel: 'guild',
            description: {
                text: MESSAGES.COMMANDS.PING.DESCRIPTION,
                usage: MESSAGES.COMMANDS.PING.USAGE
            }
        })
    }

    public async exec(message: Message) {
        const ping = Math.round(this.client.ws.ping)
        const sent = await message.util.send('Pong!')
        const timeDiff = (sent.editedAt || sent.createdAt).valueOf() - (message.editedAt || message.createdAt).valueOf()
        const embed = {
            color: '4095',
            description: `🔂 **RTT**: ${ timeDiff } ms\n💟 **Heartbeat**: ${ ping } ms`
        }
        
        await message.util.send({ embed })
    }
}