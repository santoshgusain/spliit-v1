import { mongoGetGroupExpenses } from '@/lib/mongo-api'
import {
  getBalances,
  getPublicBalances,
  getSuggestedReimbursements,
} from '@/lib/balances'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const listGroupBalancesProcedure = baseProcedure
  .input(z.object({ groupId: z.string() }))
  .query(async ({ input: { groupId } }) => {
    const expenses = await mongoGetGroupExpenses(groupId)
    const balances = getBalances(expenses)
    const reimbursements = getSuggestedReimbursements(balances)
    const publicBalances = getPublicBalances(reimbursements)

    return { balances: publicBalances, reimbursements }
  })