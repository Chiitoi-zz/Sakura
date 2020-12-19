import { Argument, Category, Command } from 'discord-akairo'
import { Collection, Message } from 'discord.js'
import { GUILD, MESSAGES } from '../../utility/constants'

export default class HelpCommand extends Command {
    public constructor() {
        super('help', {
            aliases: ['help'],
            args: [
                {
                    id: 'query',
                    type: Argument.union(
                        'command',
                        (_, phrase: string) => this.handler.findCategory(phrase),
                        (_, phrase: string) => phrase ? null : this.handler.categories
                    )
                }
            ],
            category: 'Utility',
            channel: 'guild',
            description: {
                examples: MESSAGES.COMMANDS.HELP.EXAMPLES,
                text: MESSAGES.COMMANDS.HELP.DESCRIPTION,
                usage: MESSAGES.COMMANDS.HELP.USAGE
            }
        })
    }

    public async exec(message: Message, { query }: { query: Command | Category<string, Command> | Collection<string, Category<string, Command>> | null }) {
        const prefix = this.client.portals.get(message.guild, GUILD.PREFIX, process.env.DEFAULT_PREFIX) as string

        if (!query)
            return message.util.send(MESSAGES.STATES.NO_MATCH)

        let embed

        if (query instanceof Command) {
            const { id, categoryID, description: { examples, text, usage }, aliases } = query
            
            embed = {
                title: `The "${ prefix }${ id }" command`,
                color: 'F8F8FF',
                fields: [
                    { name: 'Category', value: categoryID },
                    { name: 'Description', value: text },
                    { name: 'Usage', value: `\`${ prefix }${ usage }\``}
                ],
                footer: {
                    text: 'Optional - [] | Required - <>'
                }
            }

            if (examples)
                embed.fields.push({ name: 'Examples', value: examples.map(example => `\`${ prefix }${ example }\``) })
            if (aliases?.length)
                embed.fields.push({ name: 'Aliases', value: aliases.map(alias => `\`${ prefix }${ alias }\``) })
        } else if (query instanceof Category) {
            embed = {
                title: `The "${ query.id }" category`,
                color: 'F8F8FF',
                description: query.map(command => `\u2022 \`${ prefix }${ command.id }\` - ${ command?.description?.text }`).join('\n')
            }
        } else {
            embed = {
                title: `${ this.client.user.username}'s commands`,
                color: 'F8F8FF',
                fields: query.map(category => ({
                    name: category.id,
                    value: category.map(command => `\u2022 \`${ prefix }${ command.id }\` - ${ command?.description?.text }`)
                }))
            }
        }

        message.util.send({ embed })
    }
}