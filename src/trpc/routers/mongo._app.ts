import { createTRPCRouter } from '@/trpc/init'
import { categoriesRouter } from './categories/mongo.index'
import { experienceRouter } from './experience'
import { groupsRouter } from './groups/mongo.index'
import { userRouter } from './user/mongo.index'

export const appRouter = createTRPCRouter({
  groups: groupsRouter,
  categories: categoriesRouter,
  experience: experienceRouter,
  user: userRouter,
})