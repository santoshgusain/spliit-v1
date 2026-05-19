import { mongoGetGroup } from '@/lib/mongo-api'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const getGroupProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string(),
    }),
  )
  .query(async ({ input: { groupId } }) => {
    const group = await mongoGetGroup(groupId)
    return { group }
  })