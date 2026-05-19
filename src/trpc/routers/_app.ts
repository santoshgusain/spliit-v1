import { categoriesRouter } from '@/trpc/routers/categories/mongo.index'
import { experienceRouter } from '@/trpc/routers/experience'
import { groupsRouter } from '@/trpc/routers/groups/mongo.index'
import { userRouter } from '@/trpc/routers/user/mongo.index'
import { inferRouterOutputs } from '@trpc/server'
import { createTRPCRouter } from '../init'

export const appRouter = createTRPCRouter({
  groups: groupsRouter,
  categories: categoriesRouter,
  experience: experienceRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter
export type AppRouterOutput = inferRouterOutputs<AppRouter>
