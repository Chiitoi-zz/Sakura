import { Command } from 'discord-akairo'
import { Message } from 'discord.js'
import { MESSAGES } from '../../utility/constants'

export default class IdsCommand extends Command {
    public constructor() {
        super('ids', {
            aliases: ['ids'],
            category: 'Admin',
            channel: 'guild',
            description: {
                text: MESSAGES.COMMANDS.IDS.DESCRIPTION,
                usage: MESSAGES.COMMANDS.IDS.USAGE
            },
            userPermissions: ['ADMINISTRATOR']
        })
    }

    public async exec(message: Message) {
        const guild = message.guild!
        const guildCategoryChannels = guild.channels.cache
            .filter(({ type }) => type == 'category')
            .sort((c1, c2) => c1.position - c2.position)
        const count = guildCategoryChannels?.size ?? 0
        const guildName = message.guild.name
        const embed = {
            title: `${ guildName }${ guildName.toLowerCase().endsWith('s') ? '\'' : '\'s' } categories`,
            color: 'F8F8FF',
            description: '',
            fields: []
        }

        if (count) {
            embed.fields = [...guildCategoryChannels.values()].reduce((acc, channel, index) => {
                const quotient = Math.floor(index / 5)
                const remainder = index % 5
                let name 

                if (remainder == 0 && index + 1 == count)
                    name = `Category ${ count }`
                else
                    name = `Categories ${ index + 1 } - ${ Math.min(count, index + 5) }`
    
                acc[quotient] = acc[quotient] || { name, value: [] }
                acc[quotient]['value'][remainder] = `**${ channel.name }** - \`${ channel.id }\``
    
                return acc
            }, [])
        } else
            embed.description = 'No categories in server.'

        message.util.send({ embed })
    }
}