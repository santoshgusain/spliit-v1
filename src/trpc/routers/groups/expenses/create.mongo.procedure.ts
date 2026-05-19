import { mongoCreateExpense } from '@/lib/mongo-api'
import { expenseFormSchema } from '@/lib/schemas'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const createExpenseProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string(),
      expenseFormValues: expenseFormSchema,
      participantId: z.string().optional(),
    }),
  )
  .mutation(async ({ input: { groupId, expenseFormValues, participantId } }) => {
    const expense = await mongoCreateExpense(
      expenseFormValues,
      groupId,
      participantId,
    )
    return { expense }
  })