import { mongoGetGroupExpenses } from '@/lib/mongo-api'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const listExpensesProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string(),
      skip: z.number().optional(),
      take: z.number().optional(),
    }),
  )
  .query(async ({ input: { groupId, skip, take } }) => {
    const mongoExpenses = await mongoGetGroupExpenses(groupId, skip, take)
    
    // Transform MongoDB expenses format to expected format
    const expenses = mongoExpenses.map((mongoExpense: any) => ({
      id: mongoExpense.id,
      title: mongoExpense.title,
      amount: mongoExpense.amount, // Already in cents from MongoDB
      expenseDate: mongoExpense.expenseDate,
      categoryId: parseInt(mongoExpense.category?.id || '0'),
      paidById: mongoExpense.paidBy?.id,
      paidBy: mongoExpense.paidBy,
      paidFor: mongoExpense.paidFor?.map((pf: any) => ({
        participantId: pf.participant?.id,
        participant: pf.participant,
        shares: pf.shares, // Already in cents from MongoDB
      })) || [],
      splitMode: mongoExpense.splitMode,
      isReimbursement: mongoExpense.isReimbursement,
      documents: mongoExpense.documents || [],
      notes: mongoExpense.notes,
      createdAt: mongoExpense.createdAt,
      updatedAt: mongoExpense.updatedAt,
    }))

    return { expenses }
  })