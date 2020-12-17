import { Connection, createConnection, getConnectionOptions } from 'typeorm'
import { Collection, Message, Snowflake } from 'discord.js'
import { Client } from 'pg'
import { PostgresConnectionCredentialsOptions } from 'typeorm/driver/postgres/PostgresConnectionCredentialsOptions'

const reInvite = /(?:https?:\/\/)?(?:\w+\.)?discord(?:(?:app)?\.com\/invite|\.gg)\/(?<code>[a-z0-9-]+)/gi
let connection: Connection

function resolve<T>(data: T) {
    return [data, undefined]
}

function reject(error) {
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

export const processResults = (results: Collection<Snowflake, { code: string, valid: boolean }[]>) => {
    let bad = 0, description = '', total = 0

    for (const [channelId, channelResult] of results) {
        const resultCount = channelResult.length

        if (!channelResult.length) {
            description += `🔴<#${ channelId }> - 0 found\n`
            continue
        }

        const badCount = channelResult.filter(({ valid }) => !valid).length
        total += resultCount
        bad += badCount


        if (badCount)
            description += `🔴<#${ channelId }> - ${ badCount }/${ resultCount } bad\n`
        else
            description += `🟢<#${ channelId }> - ${ resultCount }/${ resultCount } good\n`
    }

    return { bad, channels: results.size, description, good: total - bad, total }
}