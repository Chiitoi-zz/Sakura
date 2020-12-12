import 'reflect-metadata'
import { SakuraClient } from './structures/.'

const client = new SakuraClient({ owner: process.env.OWNER, token: process.env.TOKEN })

client.start()