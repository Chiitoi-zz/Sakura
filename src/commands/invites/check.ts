import { Command } from 'discord-akairo'
import { CategoryChannel, Collection, Message, NewsChannel, Snowflake, TextChannel } from 'discord.js'
import dayjs from 'dayjs'
import pms from 'pretty-ms'
import { GUILD, EMBEDS, MESSAGES, SakuraGuild } from '../../utility/constants'
import { extractCodes, handle, processResults } from '../../utility/utils'

export default class CheckCommand extends Command {
    public constructor() {
        super('check', {
            aliases: ['check'],
            category: 'Invites',
            channel: 'guild',
            description: {
                text: MESSAGES.COMMANDS.CHECK.DESCRIPTION,
                usage: MESSAGES.COMMANDS.CHECK.USAGE
            },
            userPermissions: ['ADMINISTRATOR']
        })
    }

    public async exec(message: Message) {
        const guild = message.guild!
        const commandChannelId = message.channel.id
        const { checkChannelId, categoryIds, ignoreIds, lastCheckedAt, inCheck } = this.client.portals.get(guild) as SakuraGuild
        const availableIn = lastCheckedAt ? dayjs(lastCheckedAt).add(1, 'day').diff(Date.now()) : null

        if (inCheck)
            return message.util.send(MESSAGES.STATES.IN_CHECK)
        if (availableIn > 0)
            return message.util.send(MESSAGES.STATES.TOO_EARLY(pms(availableIn, { secondsDecimalDigits: 0 })))

        const guildChannels = guild.channels.cache
        const checkChannel = guildChannels.get(checkChannelId) as TextChannel

        if (!checkChannel)
            return message.util.send(MESSAGES.STATES.NO_CHECK_CHANNEL)
        if (commandChannelId != checkChannelId)
            return message.util.send(MESSAGES.STATES.WRONG_CHANNEL(checkChannel))
        if (!categoryIds.length)
            return message.util.send(MESSAGES.STATES.NO_CATEGORIES)

        const categories = guildChannels
            .filter(channel => categoryIds.includes(channel.id)) as Collection<string, CategoryChannel>
        const categoriesSorted = categories.sort((c1, c2) => c1.position - c2.position)
        const delay = ms => new Promise(res => setTimeout(res, ms))
        const delayTask = () => delay(5000)
        const messagesTask = (channel: NewsChannel | TextChannel) => () => channel.messages.fetch({ limit: 8 }, true, false)
        const inviteTask = (code: string) => () => handle(this.client.fetchInvite(code))

        const priority = this.client.currentPriority
        this.client.currentPriority -= 1       

        const timeToCheck = (this.client.queue.size * 5000) + 900000
        const botName = this.client.user.username
        const queueSize = this.client.queue.size

        await this.client.portals.set(guild, GUILD.IN_CHECK, true)

        if (queueSize) {
            checkChannel.send(MESSAGES.STATES.CHECK_WAIT(pms(timeToCheck, { secondsDecimalDigits: 0 })))
        } else
            checkChannel.send(MESSAGES.STATES.CHECK_START(botName))

        let goodInvites = 0, badInvites = 0, totalChannels = 0, totalInvites = 0

        for (const [_, category] of categoriesSorted) {
            const categoryName = category.name
            const childChannels = category.children
                .filter(<(channel) => channel is NewsChannel | TextChannel>(channel => !ignoreIds.includes(channel.id))) as Collection<string, NewsChannel | TextChannel>

            if (!childChannels.size) {
                message.util.send(EMBEDS.CATEGORY(categoryName))
                continue
            }

            const categoryResults: Collection<Snowflake, { code: string, valid: boolean }[]> = new Collection()
            const childChannelsSorted = childChannels.sort((c1, c2) => c1.position - c2.position)

            for (const [channelId, channel] of childChannelsSorted) {
                const messages = await this.client.queue.add(messagesTask(channel), { priority })

                this.client.queue.add(delayTask, { priority })

                const codes = extractCodes(messages)

                if (!codes.length) {
                    categoryResults.set(channelId, [])
                    continue
                }

                const codePromises = codes.map(code => inviteTask(code))
                const invites = await Promise.allSettled(codePromises.map(codePromise => this.client.queue.add(codePromise, { priority }))) // invites = { status: 'fulfilled', value: [ [Invite], [DiscordAPIError] ] }[]
                const results = invites.map((invite, index) => {
                    const { value } = invite as any
                    
                    return { code: codes[index], valid: !!value[0] }
                })

                categoryResults.set(channelId, results)
            }

            const { bad, channels, description, good, total } = processResults(categoryResults)
            badInvites += bad
            totalChannels += channels
            goodInvites += good
            totalInvites += total
            checkChannel.send(EMBEDS.CATEGORY(categoryName, description))
        }

        checkChannel.send(MESSAGES.STATES.CHECK_COMPLETE)
        checkChannel.send(EMBEDS.RESULTS(badInvites, totalChannels, goodInvites, totalInvites))
        await this.client.portals.set(guild, GUILD.IN_CHECK, false)      
    }
}