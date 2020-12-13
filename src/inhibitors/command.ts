import { Inhibitor } from 'discord-akairo'
import { Message } from 'discord.js'
import { GUILD } from '../utility/constants'

export default class CommandInhibitor extends Inhibitor {
    constructor() {
        super('command', {
            reason: 'Command used in non-whitelisted channel'
        })
    }

    public exec(message: Message) {
        const { channel: { id: channelId }, member: { permissions } } = message
        const isAdmin = permissions.has('ADMINISTRATOR')
        const list = this.client.portals.get(message.guild, GUILD.BOT_CHANNELS, []) as string[]
        const inList = list.includes(channelId)

        if (message.mentions.everyone)
            return true
        if (!isAdmin && !inList)
            return true
        return false
    }
}