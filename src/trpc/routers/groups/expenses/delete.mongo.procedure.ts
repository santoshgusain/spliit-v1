import { mongoDeleteExpense } from '@/lib/mongo-api'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const deleteExpenseProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string(),
      expenseId: z.string(),
    }),
  )
  .mutation(async ({ input: { groupId, expenseId } }) => {
    await mongoDeleteExpense(groupId, expenseId)
    return { success: true }
  })