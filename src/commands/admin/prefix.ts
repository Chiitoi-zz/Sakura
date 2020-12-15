import { Command, Flag } from 'discord-akairo'
import { Message } from 'discord.js'
import { GUILD, MESSAGES } from '../../utility/constants'

export default class PrefixCommand extends Command {
    public constructor() {
        super('prefix', {
            aliases: ['prefix'],
            args: [
                {
                    id: 'prefix',
                    type: (message: Message, phrase: string) => {
                        if (!message.guild || !phrase)
                            return Flag.fail(null)

                        const reDigit = /^[0-9]/
                        const reSpecial = /[~`!@#\$%\^&*()-_\+={}\[\]|\\\/:;"'<>,.?]/g
                        const reSpaces = /\s/
            
                        if (!reDigit.test(phrase) && reSpecial.test(phrase) && !reSpaces.test(phrase))
                            return phrase
                        else
                            return Flag.fail(phrase)                        
                    }
                }
            ],
            category: 'Admin',
            channel: 'guild',
            description: {
                examples: MESSAGES.COMMANDS.PREFIX.EXAMPLES,
                text: MESSAGES.COMMANDS.PREFIX.DESCRIPTION,
                usage: MESSAGES.COMMANDS.PREFIX.USAGE
                
            },
            userPermissions: ['ADMINISTRATOR']
        })
    }

    public async exec(message: Message, { prefix }: { prefix: Flag | string }) {
        const guild = message.guild!    

        if (prefix instanceof Flag) {
            const { value } = prefix as any

            if (!value) {
                const current = this.client.portals.get(guild, GUILD.PREFIX, process.env.DEFAULT_PREFIX) as string
                return message.util.send(MESSAGES.STATES.CURRENT_PREFIX(current))
            } else
                return message.util.send(MESSAGES.ERRORS.INVALID_PREFIX(value))
        }
        
        await this.client.portals.set(guild, GUILD.PREFIX, prefix)
        return message.util.send(MESSAGES.STATES.PREFIX_CHANGED(prefix))
    }
}