import { Collection, Guild } from 'discord.js'
import { Guild as GuildEntity } from '../entities'
import { SakuraClient } from '.'
import { GUILD, SakuraGuild } from '../utility/constants'

export default class GuildProvider {
    public items: Collection<string, SakuraGuild>

    public constructor(client: SakuraClient) {
        this.items = new Collection()
    }

    public async init() {
        await GuildEntity.query('UPDATE guild SET "inCheck" = FALSE, priority = NULL;')
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
            this.items.set(guildId, newGuild)
        }

        if (key) {
            guildSettings[key] = value
            this.items.set(guildId, guildSettings)
            await GuildEntity.update(guildId, { [key]: value })
        }
    }

    public async startInviteCheck(guild: string | Guild, priority: number) {
        const guildId = this.getGuildId(guild)
        const guildSettings = this.items.get(guildId)

        guildSettings[GUILD.IN_CHECK] = true
        guildSettings[GUILD.PRIORITY] = priority

        this.items.set(guildId, guildSettings)
        await GuildEntity.update(guildId, { [GUILD.IN_CHECK]: true, [GUILD.PRIORITY]: priority })
    }

    public async endInviteCheck(guild: string | Guild) {
        const guildId = this.getGuildId(guild)
        const guildSettings = this.items.get(guildId)
        const now = new Date

        guildSettings[GUILD.LAST_INVITE_CHECK] = now
        guildSettings[GUILD.IN_CHECK] = false
        guildSettings[GUILD.PRIORITY] = null

        this.items.set(guildId, guildSettings)
        await GuildEntity.update(guildId, { [GUILD.LAST_INVITE_CHECK]: now, [GUILD.IN_CHECK]: false, [GUILD.PRIORITY]: null })
    }
}