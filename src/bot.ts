import 'reflect-metadata'
import { SakuraClient } from './structures/.'

const client = new SakuraClient({ owner: process.env.OWNER_ID, token: process.env.TOKEN })

client.start()