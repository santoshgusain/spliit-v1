import { mongoGetActivities } from '@/lib/mongo-api'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const listActivitiesProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string(),
      skip: z.number().optional(),
      take: z.number().optional(),
    }),
  )
  .query(async ({ input: { groupId, skip, take } }) => {
    const activities = await mongoGetActivities(groupId, skip, take)
    return { activities }
  })