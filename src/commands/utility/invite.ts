import { Command } from 'discord-akairo'
import { Message } from 'discord.js'
import { MESSAGES } from '../../utility/constants'

export default class InviteCommand extends Command {
    public constructor() {
        super('invite', {
            aliases: ['invite'],
            category: 'Utility',
            channel: 'guild',
            description: {
                text: MESSAGES.COMMANDS.INVITE.DESCRIPTION,
                usage: MESSAGES.COMMANDS.INVITE.USAGE
            }
        })
    }

    public async exec(message: Message) {
        const portalCount = this.client.guilds.cache.size ?? 0
        const maxPortals = +process.env.MAX_PORTALS
        const privateInvites = (portalCount >= +maxPortals - 1)

        if (privateInvites)
            return message.util.send(MESSAGES.STATES.MAX_PORTALS)

        const invite = await this.client.generateInvite({ permissions: ['ADMINISTRATOR'] })
        const embed = {
            color: 'F8F8FF',
            description: `[Add ${ this.client.user.username } to your server!](${ invite })`
        }
        
        message.util.send({ embed })
    }
}