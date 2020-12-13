import { Listener } from 'discord-akairo'
import { Constants, Guild, TextChannel } from 'discord.js'
import { EMBEDS, GUILD, SakuraGuild } from '../utility/constants'

export default class GuildCreateListener extends Listener {
    public constructor() {
        super(Constants.Events.GUILD_DELETE, {
            emitter: 'client',
            event: Constants.Events.GUILD_DELETE
        })
    }

    public async exec(guild: Guild) {
        const sakuraGuild = this.client.portals.get(guild) as SakuraGuild

        if (!sakuraGuild)
            return

        await this.client.portals.set(guild, GUILD.IN_GUILD, false)

        const logChannel = await this.client.channels.fetch(process.env.LOG_CHANNEL_ID) as TextChannel
        const { ownerID } = guild
        const owner = await this.client.users.fetch(ownerID)

        if (!logChannel)
            logChannel.send(EMBEDS.GUILD(Constants.Events.GUILD_DELETE, guild, owner))
    }
}