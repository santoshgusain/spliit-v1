import { ExpenseFormValues, GroupFormValues } from '@/lib/schemas'
// import { PrismaClient, Prisma } from '../../prisma/mongodb/client'
import { PrismaClient } from '.prisma/mongodb-client'
import { ActivityType } from '@prisma/client'

const mongoPrisma = new PrismaClient()

type MongoExpense = {
  id: string;
  amount: number;
  category: { id: string; grouping: string; name: string };
  createdAt: Date;
  expenseDate: Date;
  isReimbursement: boolean;
  paidBy: { id: string; name: string };
  paidFor: Array<{
    participant: { id: string; name: string };
    shares: number;
  }>;
  splitMode: string;
  title: string;
  groupId: string;
  notes?: string;
  documents: Array<{
    id: string;
    url: string;
    width?: number;
    height?: number;
  }>;
}

import { nanoid } from 'nanoid'

export function randomId() {
  return nanoid()
}

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// MongoDB Group Functions
export async function mongoCreateGroup(groupFormValues: GroupFormValues) {
  return mongoPrisma.group.create({
    data: {
      name: groupFormValues.name,
      information: groupFormValues.information,
      currency: groupFormValues.currency,
      participants: groupFormValues.participants.map(({ name }) => ({
        id: randomId(),
        name,
      })),
      expenses: [],
      activities: []
    }
  })
}

export async function mongoGetGroup(groupId: string) {
  console.log('mongoGetGroup called with:', groupId);
  
  // MongoDB ObjectId must be a 24-character hex string
  if (!/^[0-9a-fA-F]{24}$/.test(groupId)) {
    console.log('Invalid MongoDB ObjectId:', groupId);
    return null;
  }
  
  try {
    const group = await mongoPrisma.group.findUnique({
      where: { id: groupId }
    });
    
    console.log('Group found:', group?.id);
    return group;
  } catch (error) {
    console.error('Error in mongoGetGroup:', error);
    return null;
  }
}

export async function mongoGetGroups(groupIds: string[]) {
  console.log('mongoGetGroups called with:', groupIds);
  
  // For MongoDB, we need to filter out any invalid IDs
  const validGroupIds = groupIds.filter(id => {
    // MongoDB ObjectId must be a 24-character hex string
    return /^[0-9a-fA-F]{24}$/.test(id);
  });
  
  console.log('Valid group IDs:', validGroupIds);
  
  if (validGroupIds.length === 0) {
    console.log('No valid group IDs provided');
    return [];
  }
  
  try {
    const groups = await mongoPrisma.group.findMany({
      where: { 
        id: { 
          in: validGroupIds 
        } 
      }
    });
    
    console.log('Groups found:', groups);
    
    return groups.map(group => ({
      ...group,
      _count: { participants: (group.participants as any[])?.length || 0 },
      createdAt: group.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error in mongoGetGroups:', error);
    return []; // Return empty array instead of throwing to avoid 500 errors
  }
}

export async function mongoUpdateGroup(
  groupId: string,
  groupFormValues: GroupFormValues,
) {
  const group = await mongoGetGroup(groupId)
  if (!group) throw new Error(`Invalid group ID: ${groupId}`)

  return mongoPrisma.group.update({
    where: { id: groupId },
    data: {
      name: groupFormValues.name,
      information: groupFormValues.information,
      currency: groupFormValues.currency,
      participants: groupFormValues.participants.map(({ name }) => ({
        id: randomId(),
        name,
      }))
    }
  })
}

// MongoDB Expense Functions
export async function mongoCreateExpense(
  expenseFormValues: ExpenseFormValues,
  groupId: string,
  participantId?: string,
): Promise<any> {
  const group = await mongoGetGroup(groupId)
  if (!group) throw new Error(`Invalid group ID: ${groupId}`)

  // Cast participants to the expected type
  const participants = (group.participants as any[]) || [];
  
  for (const participant of [
    expenseFormValues.paidBy,
    ...expenseFormValues.paidFor.map((p) => p.participant),
  ]) {
    if (!participants.some((p: any) => p.id === participant))
      throw new Error(`Invalid participant ID: ${participant}`)
  }

  // Create a new expense as an embedded document
  const expenseId = randomId();
  const newExpense = {
    id: expenseId,
    amount: Number(expenseFormValues.amount), // Amount already converted to cents by schema
    title: expenseFormValues.title,
    category: { 
      id: expenseFormValues.category.toString(), 
      grouping: "", 
      name: "" 
    },
    createdAt: new Date(),
    expenseDate: expenseFormValues.expenseDate,
    isReimbursement: expenseFormValues.isReimbursement,
    splitMode: expenseFormValues.splitMode,
    paidBy: { 
      id: expenseFormValues.paidBy, 
      name: participants.find((p: any) => p.id === expenseFormValues.paidBy)?.name || "" 
    },
    paidFor: expenseFormValues.paidFor.map(pf => ({
      participant: { 
        id: pf.participant, 
        name: participants.find((p: any) => p.id === pf.participant)?.name || "" 
      },
      shares: Number(pf.shares) // Shares already converted to cents by schema
    })),
    documents: expenseFormValues.documents.map(doc => ({
      id: doc.id || randomId(),
      url: doc.url,
      width: doc.width,
      height: doc.height
    })),
    notes: expenseFormValues.notes
  };

  // Add the expense to the group's expenses array
  await mongoPrisma.group.update({
    where: { id: groupId },
    data: {
      expenses: {
        push: newExpense
      }
    }
  });

  await mongoLogActivity(groupId, ActivityType.CREATE_EXPENSE, {
    participantId,
    expenseId,
    data: expenseFormValues.title,
  });

  return newExpense;
}

export async function mongoUpdateExpense(
  groupId: string,
  expenseId: string,
  expenseFormValues: ExpenseFormValues,
  participantId?: string,
) {
  if (!/^[0-9a-fA-F]{24}$/.test(groupId)) {
    console.log('Invalid MongoDB ObjectId:', groupId);
    return null;
  }

  const group = await mongoGetGroup(groupId)
  if (!group) throw new Error(`Invalid group ID: ${groupId}`)

  // Cast participants to the expected type
  const participants = (group.participants as any[]) || [];
  const expenses = (group.expenses as any[]) || [];
  
  // Find the expense to update
  const expenseIndex = expenses.findIndex((e: any) => e.id === expenseId);
  if (expenseIndex === -1) throw new Error(`Invalid expense ID: ${expenseId}`);
  
  // Validate participants
  for (const participant of [
    expenseFormValues.paidBy,
    ...expenseFormValues.paidFor.map((p) => p.participant),
  ]) {
    if (!participants.some((p: any) => p.id === participant))
      throw new Error(`Invalid participant ID: ${participant}`)
  }

  // Preserve existing values that aren't being updated
  const existingExpense = expenses[expenseIndex];
  
  // Create updated expense object
  const updatedExpense = {
    ...existingExpense,
    amount: Number(expenseFormValues.amount), // Amount already converted to cents by schema
    title: expenseFormValues.title,
    category: { 
      id: expenseFormValues.category.toString(), 
      grouping: "", 
      name: "" 
    },
    updatedAt: new Date(),
    expenseDate: expenseFormValues.expenseDate,
    isReimbursement: expenseFormValues.isReimbursement,
    splitMode: expenseFormValues.splitMode,
    paidBy: { 
      id: expenseFormValues.paidBy, 
      name: participants.find((p: any) => p.id === expenseFormValues.paidBy)?.name || "" 
    },
    paidFor: expenseFormValues.paidFor.map(pf => ({
      participant: { 
        id: pf.participant, 
        name: participants.find((p: any) => p.id === pf.participant)?.name || "" 
      },
      shares: Number(pf.shares) // Shares already converted to cents by schema
    })),
    documents: expenseFormValues.documents.map(doc => ({
      id: doc.id || randomId(),
      url: doc.url,
      width: doc.width,
      height: doc.height
    })),
    notes: expenseFormValues.notes
  };

  // Replace the expense in the expenses array
  expenses[expenseIndex] = updatedExpense;

  // Update the group with the modified expenses array
  await mongoPrisma.group.update({
    where: { id: groupId },
    data: {
      expenses: expenses
    }
  });

  await mongoLogActivity(groupId, ActivityType.UPDATE_EXPENSE, {
    participantId,
    expenseId,
    data: expenseFormValues.title,
  });

  return updatedExpense;
}

export async function mongoDeleteExpense(groupId: string, expenseId: string) {
  if (!/^[0-9a-fA-F]{24}$/.test(groupId)) {
    console.log('Invalid MongoDB ObjectId:', groupId);
    return null;
  }

  const group = await mongoGetGroup(groupId);
  if (!group) throw new Error(`Group not found: ${groupId}`);

  const expenses = (group.expenses as any[]) || [];
  const expenseIndex = expenses.findIndex(e => e.id === expenseId);
  
  if (expenseIndex === -1) throw new Error(`Expense not found: ${expenseId}`);

  // Remove the expense from the expenses array
  expenses.splice(expenseIndex, 1);

  // Update the group with the modified expenses array
  await mongoPrisma.group.update({
    where: { id: groupId },
    data: {
      expenses: expenses
    }
  });

  await mongoLogActivity(groupId, ActivityType.DELETE_EXPENSE, {
    expenseId,
    data: "Expense deleted"
  });

  return { id: expenseId };
}

export async function mongoGetExpense(groupId: string, expenseId: string) {
  if (!/^[0-9a-fA-F]{24}$/.test(groupId)) {
    console.log('Invalid MongoDB ObjectId:', groupId);
    return null;
  }

  const group = await mongoGetGroup(groupId);
  if (!group) return null;

  const expenses = (group.expenses as any[]) || [];
  const expense = expenses.find(e => e.id === expenseId);
  
  if (!expense) return null;

  return expense;
}

export async function mongoGetGroupExpenses(
  groupId: string,
  skip?: number,
  take?: number,
) {
  const group = await mongoPrisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) return [];

  let expenses = (group.expenses as any[] || []) as MongoExpense[];
  expenses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (skip !== undefined && take !== undefined) {
    expenses = expenses.slice(skip, skip + take);
  }

  return expenses;
}

// Activity Functions
export async function mongoLogActivity(
  groupId: string,
  activityType: ActivityType,
  data?: {
    participantId?: string
    expenseId?: string
    data?: string
  },
) {
  const activity = {
    id: randomId(),
    time: new Date(),
    type: activityType,
    participantId: data?.participantId,
    expenseId: data?.expenseId,
    data: data?.data,
  };

  await mongoPrisma.group.update({
    where: { id: groupId },
    data: {
      activities: {
        push: activity,
      }
    }
  });

  return activity;
}

export async function mongoGetActivities(
  groupId: string,
  skip?: number,
  take?: number,
) {
  const group = await mongoPrisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) return [];

  let activities = (group.activities as any[] || []);
  activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  if (skip !== undefined && take !== undefined) {
    activities = activities.slice(skip, skip + take);
  }

  return activities;
}

// Category Functions
export async function mongoGetCategories() {
  return mongoPrisma.category.findMany()
}

// Document Functions
export async function mongoAddExpenseDocument(
  groupId: string,
  expenseId: string,
  url: string,
  width: number,
  height: number,
) {
  const group = await mongoPrisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) throw new Error(`Group not found: ${groupId}`);

  const expenses = (group.expenses as any[]) || [];
  const expenseIndex = expenses.findIndex(e => e.id === expenseId);
  
  if (expenseIndex === -1) throw new Error(`Expense not found: ${expenseId}`);

  const document = {
    id: randomId(),
    url,
    width,
    height,
  };

  expenses[expenseIndex].documents.push(document);

  await mongoPrisma.group.update({
    where: { id: groupId },
    data: {
      expenses: expenses,
    }
  });

  return document;
}