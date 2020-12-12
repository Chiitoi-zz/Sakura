import { Collection, Guild } from 'discord.js'
import { Guild as GuildEntity } from '../entities'
import { SakuraClient } from '.'

interface SakuraGuild {
    guildId: string
    prefix: string
    checkChannelId: string
    categoryIds: string[]
    ignoreIds: string[]
    botChannelIds: string[]
    lastCheckedAt: Date 
}

export default class GuildProvider {
    public items: Collection<string, SakuraGuild>

    public constructor(client: SakuraClient) {
        this.items = new Collection()
    }

    public async init() {
        const guilds = await GuildEntity.find() as SakuraGuild[]

        for (const guild of guilds)
            this.items.set(guild.guildId, guild)
    }

    private getGuildId(guild: string | Guild) {
        if (typeof guild === 'string' && /^\d{17,19}$/.test(guild))
            return guild        
        if (guild instanceof Guild)
            return guild.id
        return null
    }

    public get<K extends keyof SakuraGuild>(guild: string | Guild, key?: K, defaultValue?: SakuraGuild[K]): SakuraGuild | SakuraGuild[K] {
        const guildId = this.getGuildId(guild)
        const guildSettings = this.items.get(guildId)

        if (!guildSettings) 
            return null
        if (!key)
            return guildSettings
        return guildSettings[key] ?? defaultValue
    }

    public async set<K extends keyof SakuraGuild>(guild: string | Guild, key?: K, value?: SakuraGuild[K]) {
        const guildId = this.getGuildId(guild)
        const guildSettings = this.items.get(guildId)

        if (!guildSettings) {
            const newGuild = await GuildEntity.create({ guildId }).save() as SakuraGuild
            this.items.set(guildId, guildSettings)
        }

        if (key && value) {
            guildSettings[key] = value
            this.items.set(guildId, guildSettings)
            await GuildEntity.update(guildId, { [key]: value })
        }
    }
}