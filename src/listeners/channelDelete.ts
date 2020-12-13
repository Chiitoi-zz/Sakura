import { Listener } from 'discord-akairo'
import { Constants, GuildChannel } from 'discord.js'
import { GUILD, SakuraGuild } from '../utility/constants'

export default class ChannelDeleteListener extends Listener {
    public constructor() {
        super(Constants.Events.CHANNEL_DELETE, {
            emitter: 'client',
            event: Constants.Events.CHANNEL_DELETE
        })
    }

    public async exec(channel: GuildChannel) {
        const { id: channelId, guild } = channel
        const { checkChannelId = null, categoryIds = [], ignoreIds = [], botChannelIds = [] } = this.client.portals.get(guild) as SakuraGuild
        let newList

        if (channelId == checkChannelId)
            await this.client.portals.set(channel.guild, GUILD.CHECK_CHANNEL, null)
        if (categoryIds.includes(channelId)) {
            newList = categoryIds.filter(c => c != channelId)
            await this.client.portals.set(channel.guild, GUILD.CATEGORIES, newList)
        }
        if (ignoreIds.includes(channelId)) {
            newList = ignoreIds.filter(c => c != channelId)
            await this.client.portals.set(channel.guild, GUILD.IGNORE, newList)
        }
        if (botChannelIds.includes(channelId)) {
            newList = botChannelIds.filter(c => c != channelId)
            await this.client.portals.set(channel.guild, GUILD.BOT_CHANNELS, newList)
        }
    }
}