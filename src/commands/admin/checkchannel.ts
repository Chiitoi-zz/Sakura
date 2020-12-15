import { Command, Flag } from 'discord-akairo'
import { Message, TextChannel } from 'discord.js'
import { GUILD, MESSAGES } from '../../utility/constants'

export default class CheckChannelCommand extends Command {
    public constructor() {
        super('checkchannel', {
            aliases: ['checkchannel'],
            args: [
                {
                    id: 'channel',
                    type: (message: Message, phrase: string) => {
                        if (!message.guild || !phrase)
                            return Flag.fail(null)

                        const channel = this.client.util.resolveChannel(phrase, message.guild.channels.cache)

                        if (channel.type == 'text')
                            return channel as TextChannel
                        else
                            return Flag.fail(phrase)
                    }
                }
            ],
            category: 'Admin',
            channel: 'guild',
            description: {
                text: MESSAGES.COMMANDS.CHECK_CHANNEL.DESCRIPTION,
                usage: MESSAGES.COMMANDS.CHECK_CHANNEL.USAGE
            },     
            userPermissions: ['ADMINISTRATOR']
        })
    }

    public async exec(message: Message, { channel }: { channel: Flag | TextChannel }) {
        const guild = message.guild!

        if (channel instanceof Flag) {
            const { value } = channel as any

            if (!value) {
                const checkChannelId = this.client.portals.get(guild, GUILD.CHECK_CHANNEL, null) as string

                if (!checkChannelId)
                    return message.util.send(MESSAGES.STATES.NO_CHECK_CHANNEL)
                else
                    return message.util.send(MESSAGES.STATES.CURRENT_CHECK_CHANNEL(checkChannelId))
            } else
                return message.util.send(MESSAGES.ERRORS.INVALID_CHANNEL('text'))
        }

        const channelId = channel.id
        await this.client.portals.set(guild, GUILD.CHECK_CHANNEL, channelId)
        return message.util.send(MESSAGES.STATES.CHECK_CHANNEL_CHANGED(channel))        
    }
}