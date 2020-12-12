import { createConnection } from 'typeorm'
import { Collection, Message, Snowflake } from 'discord.js'
import { SakuraClient } from '../structures'

const reInvite = /(?:https?:\/\/)?(?:\w+\.)?discord(?:(?:app)?\.com\/invite|\.gg)\/(?<code>[a-z0-9-]+)/gi
const reject = (error): [undefined, any] => [undefined, error]

function resolve<T>(data: T): [T, undefined] {
    return [data, undefined]
}

export const connect = async (client: SakuraClient) => {
    try {
        const now = Date.now()
        await createConnection()
        console.log(`[POSTGRES] Connected to PostrgreSQL database in ${ Date.now() - now } ms.`)
    } catch (error) {
        console.log(`[POSTGRES] Unable to connect to PostgreSQL database:\n${ error.stack }`)
        process.exit(1)
    }
}

export async function handle<T>(promise: Promise<T>) {
    return promise
        .then(resolve)
        .catch(reject)
}

export const extractCodes = (messages: Collection<string, Message>) => {
    const matches = messages.reduce((acc, message) => {
        const { content } = message
        const results = JSON.stringify(content).matchAll(reInvite)     

        return [...acc, ...results]
    }, [])
    const codes = matches.map(match => match[1])
    
    return codes
}

export const formatResults = (results: Collection<Snowflake, { code: string, valid: boolean }[]>) => {
    let description = ''

    for (const { 0: channelId, 1: result } of results) {
        const total = result.length

        if (!total) {
            description += `🔴<#${ channelId }> - 0 found\n`
            continue
        }

        const bad = result.filter(r => !r.valid).length

        if (bad)
            description += `🔴<#${ channelId }> - ${ bad }/${ total } bad\n`
        else
            description += `🟢<#${ channelId }> - ${ total }/${ total } good\n`
    }

    return description
}