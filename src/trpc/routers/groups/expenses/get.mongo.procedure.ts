import { mongoGetExpense } from '@/lib/mongo-api'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const getExpenseProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string(),
      expenseId: z.string(),
    }),
  )
  .query(async ({ input: { groupId, expenseId } }) => {
    const mongoExpense = await mongoGetExpense(groupId, expenseId)
    if (!mongoExpense) return { expense: null }

    // Transform MongoDB expense format to expected format
    const expense = {
      id: mongoExpense.id,
      title: mongoExpense.title,
      amount: mongoExpense.amount * 100, // Convert to cents
      expenseDate: mongoExpense.expenseDate,
      categoryId: parseInt(mongoExpense.category?.id || '0'),
      paidById: mongoExpense.paidBy?.id,
      paidFor: mongoExpense.paidFor?.map((pf: any) => ({
        participantId: pf.participant?.id,
        shares: pf.shares * 100, // Convert to cents
      })) || [],
      splitMode: mongoExpense.splitMode,
      isReimbursement: mongoExpense.isReimbursement,
      documents: mongoExpense.documents || [],
      notes: mongoExpense.notes,
      createdAt: mongoExpense.createdAt,
      updatedAt: mongoExpense.updatedAt,
    }

    return { expense }
  })