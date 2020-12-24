import { Connection, createConnection, getConnectionOptions } from 'typeorm'
import { AkairoClient } from 'discord-akairo'
import { CategoryChannel, Collection, Message, NewsChannel, Snowflake, TextChannel } from 'discord.js'
import { Client } from 'pg'
import { PostgresConnectionCredentialsOptions } from 'typeorm/driver/postgres/PostgresConnectionCredentialsOptions'
import { GUILD, LISTS, MESSAGES } from './constants'

const reInvite = /(?:https?:\/\/)?(?:\w+\.)?discord(?:(?:app)?\.com\/invite|\.gg)\/(?<code>[a-z0-9-]+)/gi
let connection: Connection

function resolve<T>(data: T): [T, undefined] {
    return [data, undefined]
}

function reject(error): [undefined, any] {
    return [undefined, error]
}

export async function handle<T>(promise: Promise<T>) {
    return promise
        .then(resolve)
        .catch(reject)
}

const createDatabase = async ({ host, port, user, password, database }) => {
    const pgClient = new Client({ host, port, user, password, database: 'postgres' })

    try {
        await pgClient.connect()
    
        const databaseResults = await pgClient.query('SELECT datname FROM pg_catalog.pg_database;')
        const databaseNames = databaseResults.rows.map(row => row.datname)
        const databaseExists = databaseNames.includes(database)

        if (databaseExists)
            return

        await pgClient.query(`CREATE DATABASE "${ database }"`)
        console.log(`${ databaseExists ? 'Found' : 'Created' } database with name '${ database}'.`)        
    } catch (error) {
        console.log(`Unable to create database:\n${ error.stack }`)
    } finally {
        await pgClient.end()
    }
    
}

export const connect = async () => {
    if (connection)
        return connection

    const options = await getConnectionOptions() as PostgresConnectionCredentialsOptions
    const { host, port, username, password, database } = options

    if (!host || !port || !username || !password || !database) {
        console.log('Something\'s missing from your ormconfig.json file.')
        process.exit(1)  
    }

    try {
        const now = Date.now()
        
        connection = await createConnection()
        
        const table = await connection.query('SELECT * FROM information_schema.tables WHERE table_schema = \'public\' AND table_name = \'guild\'')

        if (!table.length)
            await connection.synchronize()

        console.log(`Connected to PostgreSQL database '${ database }' in ${ Date.now() - now } ms.`)
        return connection
    } catch (error) {
        const noDatabase = (error.code === '3D000')

        if (noDatabase)
            await createDatabase({ host, port, user: username, password, database })

        return connect()
    }
}

export const extractCodes = (messages: Collection<string, Message>) => {
    const matches = messages.reduce((acc, message) => {
        const { content } = message
        const results = JSON.stringify(content).matchAll(reInvite)     

        return [...acc, ...results]
    }, [])
    const codes: string[] = matches.map(match => match[1])
    
    return codes
}

export const processResults = (results: Collection<Snowflake, { code: string, valid: boolean }[]>, issues: { unknown: number, known: (NewsChannel | TextChannel)[] }) => {
    let bad = 0, issuesDescription: string[] = [], resultsDescription = '', total = 0

    for (const [channelId, channelResult] of results) {
        const resultCount = channelResult.length

        if (!channelResult.length) {
            resultsDescription += `🔴<#${ channelId }> - 0 found\n`
            continue
        }

        const badCount = channelResult.filter(({ valid }) => !valid).length
        total += resultCount
        bad += badCount

        if (badCount)
            resultsDescription += `🔴<#${ channelId }> - ${ badCount }/${ resultCount } bad\n`
        else
            resultsDescription += `🟢<#${ channelId }> - ${ resultCount }/${ resultCount } good\n`
    }

    if (issues.unknown)
        issuesDescription.push(`- ${ issues.unknown } channel(s) could not be checked.`)
    if (issues.known.length) {
        const channelDescription = issues.known.map(channel => `<#${ channel.id }>`).join(', ')
        issuesDescription.push(`- The following need manual checks: ${ channelDescription }`)
    }

    return { bad, channels: results.size, good: total - bad, issuesDescription, resultsDescription, total }
}

export const updateList = async (client: AkairoClient, message: Message, guildKey: 'categoryIds' | 'botChannelIds' | 'ignoreIds', guildList: LISTS, action: 'add' | 'remove' | 'replace', channel: TextChannel | CategoryChannel) => {
    if (!action)
        return message.util.send(MESSAGES.ERRORS.INVALID_ACTION)
    if (!channel && ['add', 'remove'].includes(action))
        return message.util.send(MESSAGES.ERRORS.INVALID_CHANNEL(channel.type))

    const channelId = channel?.id
    const list = client.portals.get(message.guild, guildKey, []) as string[]
    const inList = list.includes(channelId)

    if (action == 'add' && !inList) {
        const newList = [...list, channelId]
        await client.portals.set(message.guild, guildKey, newList)
        return message.util.send(MESSAGES.STATES.CHANNEL_ADDED(channel, guildList))
    } else if (action == 'remove' && inList) {
        const newList = list.filter(c => c != channelId)
        await client.portals.set(message.guild, guildKey, newList)
        return message.util.send(MESSAGES.STATES.CHANNEL_REMOVED(channel, guildList))
    } else if (action == 'replace') {
        if (channelId) {
            await client.portals.set(message.guild, guildKey, [channelId])
            return message.util.send(MESSAGES.STATES.CHANNEL_REPLACED(channel, guildList))
        } else {
            await client.portals.set(message.guild, guildKey, [])
            return message.util.send(MESSAGES.STATES.CHANNEL_PURGE(guildList))
        }
    } else {
        const verbText = (action == 'add') ? 'is already' : 'is not'
        return message.util.send(MESSAGES.STATES.NO_CHANGE(channel, verbText))
    }  
}