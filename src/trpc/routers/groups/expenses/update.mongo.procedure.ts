import { mongoUpdateExpense } from '@/lib/mongo-api'
import { expenseFormSchema } from '@/lib/schemas'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const updateExpenseProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string(),
      expenseId: z.string(),
      expenseFormValues: expenseFormSchema,
      participantId: z.string().optional(),
    }),
  )
  .mutation(async ({ input: { groupId, expenseId, expenseFormValues, participantId } }) => {
    const expense = await mongoUpdateExpense(
      groupId,
      expenseId,
      expenseFormValues,
      participantId,
    )
    return { expense }
  })