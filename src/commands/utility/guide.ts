import { Command } from 'discord-akairo'
import { Message } from 'discord.js'
import { GUILD, MESSAGES } from '../../utility/constants'

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
        const guild = message.guild!
        const prefix = this.client.portals.get(guild, GUILD.PREFIX, process.env.DEFAULT_PREFIX) as string
        const botName = this.client.user.username
        const embed = {
            title: `A guide to ${ botName }`,
            color: 'F8F8FF',
            fields: [
                {
                    name: 'IMPORTANT',
                    value: [
                        `\u2022 ${ botName } has administrator permissions on its "${ botName }" role. **KEEP IT!**`,
                        `\u2022 If you have bot channels, add them using \`${ prefix }bots add [textChannel]\`. Non-admins can **only run** utility commands in these channels.`,
                        `\u2022 The bot prefix is found with the command:  \`@${ botName } prefix\`.`,
                        `\u2022 To view your server's settings, type \`${ prefix }settings\`.`,
                        `\u2022 The help command is \`${ prefix }help\`.`
                    ]
                },
                {
                    name: 'Invite checks',
                    value: [
                        `1. Set an invite check channel with \`${ prefix }checkchannel [textChannel]\`.`,
                        `2. Add the category IDs **(one at a time)** using \`${ prefix }category add [categoryChannelId]\`.`,
                        `3. If you have channels that you want to ignore during the invite checks, you can ignore them using \`${ prefix }ignore add [channelId]\`.`,
                        `4. Run \`${ prefix }check\` **(in the invite check channel)** and wait a few hours.`,
                        '5. Invite check complete!'
                    ]
                }
            ]
        }

        message.util.send({ embed })
    }
}