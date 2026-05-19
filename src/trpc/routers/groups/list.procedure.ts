import { mongoGetGroups } from '@/lib/mongo-api'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const listGroupsProcedure = baseProcedure
  .input(
    z.object({
      groupIds: z.array(z.string().min(1)),
    }),
  )
  .query(async ({ input: { groupIds } }) => {
    const groups = await mongoGetGroups(groupIds)
    return { groups }
  })
