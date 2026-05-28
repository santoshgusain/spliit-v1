import { PrismaClient } from '@prisma/client'
// import { PrismaClient as MongoClient } from '../../prisma/mongodb/client'
import { PrismaClient as MongoClient } from '.prisma/mongodb-client'

declare const global: Global & {
  prisma?: PrismaClient
  mongoPrisma?: MongoClient
}

export let p: PrismaClient = undefined as any as PrismaClient

if (typeof window === 'undefined') {
  // await delay(1000)
  if (process.env['NODE_ENV'] === 'production') {
    p = new PrismaClient()
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient({
        // log: [{ emit: 'stdout', level: 'query' }],
      })
    }
    p = global.prisma
  }
}

export const prisma = p

export const mongoPrisma =
  global.mongoPrisma ||
  new MongoClient({
    log:
      process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn'] : [],
  })

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
  global.mongoPrisma = mongoPrisma
}
