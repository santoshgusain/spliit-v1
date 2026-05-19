import { mongoUpdateGroup } from '@/lib/mongo-api'
import { groupFormSchema } from '@/lib/schemas'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const updateGroupProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string(),
      groupFormValues: groupFormSchema,
    }),
  )
  .mutation(async ({ input: { groupId, groupFormValues } }) => {
    const group = await mongoUpdateGroup(groupId, groupFormValues)
    return { group }
  })