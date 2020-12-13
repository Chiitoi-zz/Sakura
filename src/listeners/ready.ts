import { Listener } from 'discord-akairo'
import { Constants } from 'discord.js'

export default class ReadyListener extends Listener {
    constructor() {
        super(Constants.Events.CLIENT_READY, {
            emitter: 'client',
            event: Constants.Events.CLIENT_READY
        })
    }

    public async exec() {
        const totalGuilds = this.client.guilds.cache.size
        await this.client.user.setActivity('@Sakura gen2', { type: 'LISTENING' })
        console.log(`${ this.client.user.tag } is online!`)
        console.log(`${ this.client.user.username } is in ${ totalGuilds } guilds(s)!`)
    }
}