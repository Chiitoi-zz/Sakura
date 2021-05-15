import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from 'discord-akairo'
import { Intents, Message } from 'discord.js'
import PQueue from 'p-queue'
import { join } from 'path'
import { GuildProvider } from '.'
import { GUILD } from '../utility/constants'
import { connect } from '../utility/utils'

interface SakuraOptions {
    owner: string
    token: string
}

declare module 'discord-akairo' {
    interface AkairoClient {
        config: SakuraOptions
        portals: GuildProvider
        queue: PQueue
        readonly priorityCount: number
        currentPriority: number
    }
}

export default class SakuraClient extends AkairoClient {
    public config: SakuraOptions
    public portals = new GuildProvider(this)
    public queue = new PQueue({
        autoStart: true,
        concurrency: 1,
        interval: +(process.env.INTERVAL || 5000),
        intervalCap: 1
    })
    public readonly priorityCount = 1000
    public currentPriority = this.priorityCount
    public commandHandler = new CommandHandler(this, {
        directory: join(__dirname, '..', 'commands'),
        prefix: (message: Message) => this.portals.get(message.guild, GUILD.PREFIX, '!!') as string,
        aliasReplacement: /-/g,
        allowMention: true,
        commandUtil: true,
        commandUtilLifetime: 30000,
        commandUtilSweepInterval: 90000,
        handleEdits: false
    })
    public inhibitorHandler: InhibitorHandler = new InhibitorHandler(this, { directory: join(__dirname, '..', 'inhibitors') })
    public listenerHandler: ListenerHandler = new ListenerHandler(this, { directory: join(__dirname, '..', 'listeners') })

    public constructor(config: SakuraOptions) {
        super(
            { ownerID: config.owner },
            {
                disableMentions: 'everyone',
                messageCacheLifetime: 3600,
                messageCacheMaxSize: 10,
                messageSweepInterval: 2700,
                messageEditHistoryMaxSize: 0,
                ws: {
                    intents: [
                        Intents.FLAGS.GUILDS,
                        Intents.FLAGS.GUILD_MESSAGES
                    ]
                }
            }
        )

        this.config = config
    }

    private async init() {
        this.commandHandler.useInhibitorHandler(this.inhibitorHandler)
        this.commandHandler.useListenerHandler(this.listenerHandler)
        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            inhibitorHandler: this.inhibitorHandler,
            listenerHandler: this.listenerHandler
        })

        this.commandHandler.loadAll()
        this.inhibitorHandler.loadAll()
        this.listenerHandler.loadAll()

        await connect()
        await this.portals.init()
    }

    public async start() {
        await this.init()
        await this.login(this.config.token)
    }
}