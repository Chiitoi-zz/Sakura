import { CategoryChannel, Snowflake, TextChannel } from 'discord.js'

export enum GUILD {
    PREFIX = 'prefix',
    CHECK_CHANNEL = 'checkChannelId',
    CATEGORIES = 'categoryIds',
    IGNORE = 'ignoreIds',
    BOT_CHANNELS = 'botChannelIds',
    LAST_INVITE_CHECK = 'lastCheckedAt'
}

export enum LISTS {
    CATEGORIES = 'category',
    BOT_CHANNELS = 'bot channel',
    IGNORE = 'ignore'
}

export interface Portals {
    guildId: string
    prefix: string
    checkChannelId: string
    categoryIds: string[]
    ignoreIds: string[]
    botChannelIds: string[]
    lastCheckedAt: Date
}

const EMBEDS = {
    INFO: description => ({ embed: { description, color: 'F8F8FF' } }),
    ERROR: description => ({ embed: { description, color: 'B00020' } }),
    SUCCESS: description => ({ embed: { description, color: '00B020' } })
}

// [] = Optional
// <> = Required
export const MESSAGES = {
    COMMANDS: {
        BOTS: {
            DESCRIPTION: 'Modifies the bot channel list.',
            USAGE: 'bots <add|remove|replace> [textChannel]',
            EXAMPLES: ['bots add #bot-commands', 'bots remove #test']
        },
        CATEGORY: {
            DESCRIPTION: 'Modifies the category list.',
            USAGE: 'category <add|remove|replace> [categoryChannel]',
            EXAMPLES: ['category add #bot-commands', 'category remove #test']
        },
        CHECK: {
            DESCRIPTION: 'Runs an invite check on provided categories.',
            USAGE: 'check'
        },
        CHECKCHANNEL: {
            DESCRIPTION: 'Modifies the invite check channel.',
            USAGE: 'checkchannel [textChannel]'
        },
        IDS: {
            DESCRIPTION: 'Displays a list of all category IDs in a server.',
            USAGE: 'ids'
        },
        IGNORE: {
            DESCRIPTION: 'Modifies the ignored channel list.',
            USAGE: 'ignore <add|remove|replace> [textChannel]',
            EXAMPLES: ['ignore add #idk', 'ignore remove #news']
        },
        GUIDE: {
            DESCRIPTION: 'A guide to Sakura.',
            USAGE: 'guide'
        },
        HELP: {
            DESCRIPTION: 'Displays all available commands, including information about a specific command or category.',
            USAGE: 'help [query]',
            EXAMPLES: ['help ping', 'help category']
        },
        INVITE: {
            DESCRIPTION: 'Gets the invite link for Sakura.',
            USAGE: 'invite'
        },
        PING: {
            DESCRIPTION: 'Checks server latency.',
            USAGE: 'ping'
        },
        PREFIX: {
            DESCRIPTION: 'Modifies bot prefix.',
            USAGE: 'prefix [prefix]',
            EXAMPLES: ['prefix &&', 'prefix %']
        },
        SETTINGS: {
            DESCRIPTION: 'Displays a guild\'s current settings.',
            USAGE: 'settings'
        },
        STATS: {
            DESCRIPTION: 'Displays bot information.',
            USAGE: 'stats'
        },
        SUPPORT: {
            DESCRIPTION: 'Gets the invite link for Sakura\'s support server.',
            USAGE: 'support'
        }
    },
    ERRORS: {
        INVALID_ACTION: EMBEDS.ERROR('Valid actions are **add**, **remove**, or **replace**.'),
        INVALID_CHANNEL: (type: 'text' | 'category') => EMBEDS.ERROR(`No ${ type } channel found.`),
        INVALID_PREFIX: prefix => EMBEDS.ERROR(`\`${ prefix }\` is not a valid prefix.`)
    },
    STATES: {
        CHANNEL_ADDED: (channel: TextChannel | CategoryChannel, list: LISTS) =>  EMBEDS.SUCCESS(`${ channel } was added to the ${ list } list.`),
        CHANNEL_PURGE: (list: LISTS) => EMBEDS.SUCCESS(`All channels have been removed from the ${ list } list.`),
        CHANNEL_REMOVED: (channel: TextChannel | CategoryChannel, list: LISTS) =>  EMBEDS.SUCCESS(`${ channel } was removed from the ${ list } list.`),
        CHANNEL_REPLACED: (channel: TextChannel | CategoryChannel, list: LISTS) =>  EMBEDS.SUCCESS(`${ channel } is now the only ${ (channel.type === 'text') ? 'channel' : 'category' } in the ${ list } list.`),
        CHECKCHANNEL_CHANGED: (channel: TextChannel) => EMBEDS.SUCCESS(`Check channel set to ${ channel }.`),
        CURRENT_CHECKCHANNEL: (checkChannelId: Snowflake) => EMBEDS.INFO(`Current check channel is <#${ checkChannelId }>.`),
        CURRENT_PREFIX: (prefix: string) => EMBEDS.INFO(`Current prefix is \`${ prefix }\`.`),
        MAX_PORTALS: EMBEDS.INFO('Invites for this bot are currently closed. Please join the support server to see if other invite check bots are available!'),
        NO_CHANGE: (channel: TextChannel | CategoryChannel, verbText: 'is already' | 'is not') => EMBEDS.INFO(`${ (channel.type === 'text') ?  channel : `The "${ channel.name }" category` } ${ verbText } in the whitelist.`),
        NO_CATEGORIES: EMBEDS.INFO('No categories have been added. Please add some.'),
        NO_CHECKCHANNEL: EMBEDS.INFO('No check channel has been set. Please set one.'),
        NO_MATCH: EMBEDS.INFO('No match found.'),
        PREFIX_CHANGED: (prefix: string) => EMBEDS.SUCCESS(`Prefix changed to \`${ prefix }\`.`),
        TOO_EARLY: (remainingTime: string) => EMBEDS.INFO(`Please wait ${ remainingTime } before running another invite check.`),
        WRONG_CHANNEL: (channel: TextChannel) => EMBEDS.INFO(`This command can only be run in ${ channel }.`)
    }
}