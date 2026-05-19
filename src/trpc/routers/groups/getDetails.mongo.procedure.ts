import { mongoGetGroup } from '@/lib/mongo-api'
import { baseProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const getGroupDetailsProcedure = baseProcedure
  .input(z.object({ groupId: z.string().min(1) }))
  .query(async ({ input: { groupId } }) => {
    const group = await mongoGetGroup(groupId)
    if (!group) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Group not found.',
      })
    }

    // In MongoDB, we have participants embedded in the group document already
    // so we don't need a separate query to get participants with expenses
    const participantsWithExpenses = (group.participants as any[]).map(participant => ({
      id: participant.id,
      name: participant.name,
      expenses: (group.expenses as any[]).filter(expense => 
        expense.paidBy.id === participant.id || 
        expense.paidFor.some((pf: any) => pf.participant.id === participant.id)
      )
    }))

    return { group, participantsWithExpenses }
  })