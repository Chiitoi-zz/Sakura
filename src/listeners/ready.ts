import { Listener } from 'discord-akairo'
import { Constants, PresenceStatusData } from 'discord.js'

export default class ReadyListener extends Listener {
    constructor() {
        super(Constants.Events.CLIENT_READY, {
            emitter: 'client',
            event: Constants.Events.CLIENT_READY
        })
    }

    public async exec() {
        const totalGuilds = this.client.guilds.cache.size
        const status = (process.env.STATUS?.length && ['online', 'dnd', 'idle', 'invisible'].includes(process.env.STATUS) ? process.env.STATUS : 'online') as PresenceStatusData
        await this.client.user.setPresence({ activity: { name: '@Sakura guide', type: 'LISTENING' }, status })
        console.log(`${ this.client.user.tag } is online!`)
        console.log(`${ this.client.user.username } is in ${ totalGuilds } guilds(s)!`)
    }
}