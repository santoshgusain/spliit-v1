import { mongoPrisma } from '@/lib/prisma'
import { ExpenseFormValues, GroupFormValues } from '@/lib/schemas'
import { ActivityType, SplitMode } from '@prisma/client'
import { nanoid } from 'nanoid'

type MongoExpense = {
  id: string
  amount: number
  category: { id: string; grouping: string; name: string }
  createdAt: Date
  expenseDate: Date
  isReimbursement: boolean
  paidBy: { id: string; name: string }
  paidFor: Array<{
    participant: { id: string; name: string }
    shares: number
  }>
  splitMode: SplitMode
  title: string
  groupId: string
  notes?: string
  documents: Array<{
    id: string
    url: string
    width?: number
    height?: number
  }>
}

// mongodb code start
// Create a new user
export async function mongoCreateExperience(data: any) {
  console.log({ data }, 'mongodb create called------')
  const user = await mongoPrisma.experience.create({ data })
  return user
}

export async function mongoUpdateExperience(data: any) {
  const { id, ...payload } = data

  const experience = await mongoPrisma.experience.update({
    where: { id },
    data: { ...payload },
  })
  return experience
}

export async function mongoListExperience() {
  const user = await mongoPrisma.experience.findMany()
  return user
}

export async function mongoDeleteExperience(expId: string) {
  const experience = await mongoPrisma.experience.delete({
    where: {
      id: expId,
    },
  })
  return experience
}

// Get a user by ID
export async function mongoGetUserById(userId: string) {
  const user = await mongoPrisma.user.findMany({
    where: {
      userId: userId,
    },
  })
  return user
}

// Get all users
export async function mongoGetAll() {
  const users = await mongoPrisma.experience.findMany()
  return users
}

// Get a user by ID
export async function mongoGetById(userId: string) {
  const user = await mongoPrisma.experience.findMany({
    where: {
      userId: userId,
    },
  })
  return user
}

export function randomId() {
  return nanoid()
}

// MongoDB versions of expense-splitting functions
export async function mongoCreateGroup(groupFormValues: GroupFormValues) {
  const participants = groupFormValues.participants.map(({ name }) => ({
    id: randomId(),
    name,
  }))

  return mongoPrisma.group.create({
    data: {
      name: groupFormValues.name,
      information: groupFormValues.information,
      currency: groupFormValues.currency,
      participants: participants,
      expenses: [],
      activities: [],
    },
  })
}

// Convert category number to string for MongoDB
export async function createExpense(
  expenseFormValues: ExpenseFormValues,
  groupId: string,
  participantId?: string,
): Promise<MongoExpense> {
  const group = await mongoPrisma.group.findUnique({ where: { id: groupId } })
  if (!group) throw new Error(`Invalid group ID: ${groupId}`)

  const participants = group.participants as Array<{ id: string; name: string }>
  for (const participant of [
    expenseFormValues.paidBy,
    ...expenseFormValues.paidFor.map((p) => p.participant),
  ]) {
    if (!participants.some((p) => p.id === participant))
      throw new Error(`Invalid participant ID: ${participant}`)
  }

  const expenseId = randomId()
  const newExpense: MongoExpense = {
    id: expenseId,
    groupId,
    expenseDate: expenseFormValues.expenseDate,
    category: {
      id: expenseFormValues.category.toString(),
      grouping: '',
      name: '',
    },
    amount: expenseFormValues.amount,
    title: expenseFormValues.title,
    paidBy: { id: expenseFormValues.paidBy, name: '' },
    splitMode: expenseFormValues.splitMode,
    paidFor: expenseFormValues.paidFor.map((paidFor) => ({
      participant: { id: paidFor.participant, name: '' },
      shares: paidFor.shares,
    })),
    isReimbursement: expenseFormValues.isReimbursement,
    documents: expenseFormValues.documents.map((doc) => ({
      id: randomId(),
      url: doc.url,
      width: doc.width,
      height: doc.height,
    })),
    notes: expenseFormValues.notes,
    createdAt: new Date(),
  }

  await mongoPrisma.group.update({
    where: { id: groupId },
    data: {
      expenses: { push: newExpense },
    },
  })

  await mongoLogActivity(groupId, ActivityType.CREATE_EXPENSE, {
    participantId,
    expenseId,
    data: expenseFormValues.title,
  })

  return newExpense
}

// Helper for safely casting MongoDB Json arrays
function safeJsonArrayCast<T>(jsonArray: any[] | undefined | null): T[] {
  if (!jsonArray) return []
  return jsonArray as unknown as T[]
}

export async function deleteExpense(
  groupId: string,
  expenseId: string,
  participantId?: string,
): Promise<void> {
  const group = await mongoPrisma.group.findUnique({
    where: { id: groupId },
  })

  if (!group) {
    throw new Error(`Group not found: ${groupId}`)
  }

  const expenses = safeJsonArrayCast<MongoExpense>(group.expenses as any)
  const existingExpense = expenses.find((e) => e.id === expenseId)

  if (!existingExpense) {
    throw new Error(`Expense not found: ${expenseId}`)
  }

  await mongoLogActivity(groupId, ActivityType.DELETE_EXPENSE, {
    participantId,
    expenseId,
    data: existingExpense?.title,
  })

  await mongoPrisma.group.update({
    where: { id: groupId },
    data: {
      expenses: expenses.filter((e) => e.id !== expenseId),
    },
  })
}

export async function getGroupExpensesParticipants(groupId: string) {
  const group = await mongoPrisma.group.findUnique({
    where: { id: groupId },
  })

  if (!group) {
    return []
  }

  const expenses = safeJsonArrayCast<MongoExpense>(group.expenses as any)
  return Array.from(
    new Set(
      expenses.flatMap((e) => [
        e.paidBy.id,
        ...e.paidFor.map((pf: any) => pf.participant.id),
      ]),
    ),
  )
}

export async function getGroups(groupIds: string[]) {
  const groups = await mongoPrisma.group.findMany({
    where: { id: { in: groupIds } },
  })

  return groups.map((group) => ({
    ...group,
    _count: { participants: group.participants?.length || 0 },
    createdAt: group.createdAt.toISOString(),
  }))
}

export async function updateExpense(
  groupId: string,
  expenseId: string,
  expenseFormValues: ExpenseFormValues,
  participantId?: string,
): Promise<MongoExpense> {
  const group = await mongoPrisma.group.findUnique({ where: { id: groupId } })
  if (!group) throw new Error(`Invalid group ID: ${groupId}`)

  const expenses = safeJsonArrayCast<MongoExpense>(group.expenses as any)
  const existingExpense = expenses.find((e) => e.id === expenseId)
  if (!existingExpense) throw new Error(`Invalid expense ID: ${expenseId}`)

  const participants = safeJsonArrayCast<{ id: string; name: string }>(
    group.participants as any,
  )
  for (const participant of [
    expenseFormValues.paidBy,
    ...expenseFormValues.paidFor.map((p) => p.participant),
  ]) {
    if (!participants.some((p) => p.id === participant))
      throw new Error(`Invalid participant ID: ${participant}`)
  }

  await mongoLogActivity(groupId, ActivityType.UPDATE_EXPENSE, {
    participantId,
    expenseId,
    data: expenseFormValues.title,
  })

  const updatedExpense: MongoExpense = {
    ...existingExpense,
    expenseDate: expenseFormValues.expenseDate,
    amount: expenseFormValues.amount,
    title: expenseFormValues.title,
    category: {
      id: expenseFormValues.category.toString(),
      grouping: '',
      name: '',
    },
    paidBy: { id: expenseFormValues.paidBy, name: existingExpense.paidBy.name },
    splitMode: expenseFormValues.splitMode,
    paidFor: expenseFormValues.paidFor.map((pf) => ({
      participant: {
        id: pf.participant,
        name:
          existingExpense.paidFor.find(
            (ep) => ep.participant.id === pf.participant,
          )?.participant.name || '',
      },
      shares: pf.shares,
    })),
    isReimbursement: expenseFormValues.isReimbursement,
    documents: expenseFormValues.documents.map((doc) => ({
      id: doc.id || randomId(),
      url: doc.url,
      width: doc.width,
      height: doc.height,
    })),
    notes: expenseFormValues.notes,
  }

  await mongoPrisma.group.update({
    where: { id: groupId },
    data: {
      expenses: expenses.map((e) => (e.id === expenseId ? updatedExpense : e)),
    },
  })

  return updatedExpense
}

export async function updateGroup(
  groupId: string,
  groupFormValues: GroupFormValues,
  participantId?: string,
): Promise<any> {
  const group = await mongoPrisma.group.findUnique({ where: { id: groupId } })
  if (!group) throw new Error(`Invalid group ID: ${groupId}`)

  const existingParticipants = group.participants as Array<{
    id: string
    name: string
  }>
  const participantsToKeep = existingParticipants.filter((p) =>
    groupFormValues.participants.some((p2) => p2.id === p.id),
  )
  const participantsToAdd = groupFormValues.participants
    .filter((p) => !p.id)
    .map((p) => ({ id: randomId(), name: p.name }))

  const updatedGroup = await mongoPrisma.group.update({
    where: { id: groupId },
    data: {
      name: groupFormValues.name,
      currency: groupFormValues.currency,
      participants: [...participantsToKeep, ...participantsToAdd],
    },
  })

  return {
    ...updatedGroup,
    _count: {
      participants: updatedGroup.participants.length,
    },
  }
}

export async function getGroup(groupId: string) {
  const group = await mongoPrisma.group.findUnique({
    where: { id: groupId },
  })

  if (!group) return null

  return {
    ...group,
    participants: group.participants,
  }
}

export async function getCategories() {
  return mongoPrisma.category.findMany()
}

export async function getGroupExpenses(
  groupId: string,
  options?: { offset?: number; length?: number; filter?: string },
): Promise<MongoExpense[]> {
  const group = await mongoPrisma.group.findUnique({
    where: { id: groupId },
  })

  if (!group) {
    return []
  }

  let expenses = safeJsonArrayCast<MongoExpense>(group.expenses as any)

  if (options?.filter) {
    const filter = options.filter.toLowerCase()
    expenses = expenses.filter((e) => e.title.toLowerCase().includes(filter))
  }

  // Sort by expenseDate and createdAt
  expenses.sort((a, b) => {
    const dateCompare =
      new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()
    if (dateCompare === 0) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    return dateCompare
  })

  // Handle pagination
  if (options?.offset !== undefined || options?.length !== undefined) {
    const start = options?.offset || 0
    const end = options?.length ? start + options.length : undefined
    expenses = expenses.slice(start, end)
  }

  return expenses
}

export async function getGroupExpenseCount(groupId: string) {
  const group = await mongoPrisma.group.findUnique({
    where: { id: groupId },
  })

  return group?.expenses?.length || 0
}

export async function getExpense(
  groupId: string,
  expenseId: string,
): Promise<MongoExpense | null> {
  const group = await mongoPrisma.group.findUnique({
    where: { id: groupId },
  })

  if (!group) return null

  const expenses = safeJsonArrayCast<MongoExpense>(group.expenses as any)
  return expenses.find((e) => e.id === expenseId) || null
}

export async function getActivities(
  groupId: string,
  options?: { offset?: number; length?: number },
) {
  const group = await mongoPrisma.group.findUnique({
    where: { id: groupId },
  })

  if (!group) return []

  let activities = group.activities as any[]
  activities = activities.sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
  )

  if (options?.offset !== undefined || options?.length !== undefined) {
    const start = options?.offset || 0
    const end = options?.length ? start + options.length : undefined
    activities = activities.slice(start, end)
  }

  const expenses = safeJsonArrayCast<MongoExpense>(group.expenses as any)
  return activities.map((activity) => ({
    ...activity,
    expense: activity.expenseId
      ? expenses.find((e) => e.id === activity.expenseId)
      : undefined,
  }))
}

// We already have MongoDB versions of these functions above, so removing the duplicates

export async function mongoLogActivity(
  groupId: string,
  type: ActivityType,
  {
    participantId,
    expenseId,
    data,
  }: {
    participantId?: string
    expenseId?: string
    data?: string
  },
) {
  const activity = {
    id: randomId(),
    time: new Date(),
    type,
    participantId,
    expenseId,
    data,
  }

  await mongoPrisma.group.update({
    where: { id: groupId },
    data: {
      activities: {
        push: activity,
      },
    },
  })

  return activity
}
