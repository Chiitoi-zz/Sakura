import { Command } from 'discord-akairo'
import { Message } from 'discord.js'
import pms from 'pretty-ms'
import { MESSAGES, SakuraGuild } from '../../utility/constants'

export default class StateCommand extends Command {
    public constructor() {
        super('state', {
            aliases: ['state'],
            category: 'Admin',
            channel: 'guild',
            description: {
                text: MESSAGES.COMMANDS.STATE.DESCRIPTION,
                usage: MESSAGES.COMMANDS.STATE.USAGE
            },
            userPermissions: ['ADMINISTRATOR']
        })
    }
    
    public async exec(message: Message) {
        const guild = message.guild!
        const { priority, inCheck } = this.client.portals.get(guild) as SakuraGuild

        if (!inCheck)
            return message.util.send(MESSAGES.STATES.NO_CHECK)
        
        let otherCount = 0
        const myCount = this.client.queue.sizeBy({ priority })

        for (let i = this.client.priorityCount; i > priority; i--)
            otherCount += this.client.queue.sizeBy({ priority: i })

        const otherTime = pms(otherCount * 5000, { secondsDecimalDigits: 0 })
        const myTime = pms(myCount * 5000, { secondsDecimalDigits: 0 })

        if (otherCount)
            return message.util.send(MESSAGES.STATES.CHECK_STATUS_1(otherTime, myTime))
        else
            return message.util.send(MESSAGES.STATES.CHECK_STATUS_2(myTime))
    }
}