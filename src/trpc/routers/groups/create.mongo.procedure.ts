import { mongoCreateGroup } from '@/lib/mongo-api'
import { groupFormSchema } from '@/lib/schemas'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const createGroupProcedure = baseProcedure
  .input(
    z.object({
      groupFormValues: groupFormSchema,
    }),
  )
  .mutation(async ({ input: { groupFormValues } }) => {
    const group = await mongoCreateGroup(groupFormValues)
    return { groupId: group.id }
  })