import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'

@Entity('guild')
export default class Guild extends BaseEntity {
    @PrimaryColumn({ type: 'bigint', comment: 'Guild ID' })
    guildId!: string

    @Column({ type: 'varchar', length: 3, default: '!!', comment: 'Guild prefix' })
    prefix!: string

    @Column({ type: 'bigint', default: null, nullable: true, comment: 'Invite check channel ID' })
    checkChannelId!: string

    @Column({ type: 'bigint', default: '{}', comment: 'Category ID list', array: true })
    categoryIds!: string[]

    @Column({ type: 'bigint', default: '{}', comment: 'Ignore ID list', array: true })
    ignoreIds!: string[]

    @Column({ type: 'bigint', default: '{}', comment: 'Bot channel ID list', array: true })
    botChannelIds!: string[]

    @Column({ type: 'timestamptz', default: null, nullable: true, comment: 'Timestamp of last invite check' })
    lastCheckedAt!: Date

    @Column({ type: 'integer', default: null, nullable: true, comment: 'Current invite check priority'})
    priority!: number

    @Column({ type: 'boolean', default: true, comment: 'Flag to see if Sakura is in guild'})
    inGuild!: boolean

    @Column({ type: 'boolean', default: false, comment: 'Flag to see if an invite check is in progress'})
    inCheck!: boolean

    @CreateDateColumn({ type: 'timestamptz', comment: 'Timestamp when bot was added' })
    createdAt!: Date

    @UpdateDateColumn({ type: 'timestamptz', comment: 'Timestamp when guild settings was last updated' })
    updatedAt!: Date
}