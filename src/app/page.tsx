import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  FolderKanban,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

const tools = [
  {
    href: '/groups',
    title: 'Groups',
    description:
      'Organize your expenses, groups, and shared financial activities in one place.',
    icon: FolderKanban,
  },
  {
    href: '/exp',
    title: 'Experience',
    description:
      'Track your professional experience and calculate your total years, months, and days.',
    icon: Briefcase,
  },
  {
    href: '/datediff',
    title: 'Date Difference',
    description:
      'Calculate the exact difference between two dates in years, months, days, and more.',
    icon: CalendarDays,
  },
]

export default function HomePage() {
  const t = useTranslations()

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="px-4 pt-16 pb-12 sm:pt-20 sm:pb-16 md:pt-28 md:pb-20">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-sm text-muted-foreground">
            Simple tools for everyday use
          </div>

          <h1 className="landing-header text-balance py-2 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {t.rich('Homepage.title', {
              strong: (chunks) => (
                <strong className="font-bold">
                  {chunks}
                </strong>
              ),
            })}
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-balance text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {t.rich('Homepage.description', {
              strong: (chunks) => (
                <strong className="font-medium text-foreground">
                  {chunks}
                </strong>
              ),
            })}
          </p>
        </div>
      </section>

      {/* Tools */}
      <section className="px-4 pb-16 sm:pb-20 md:pb-28">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Explore the tools
            </h2>

            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Choose a tool to get started.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {tools.map((tool) => {
              const Icon = tool.icon

              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group"
                >
                  <div className="flex h-full flex-col rounded-2xl border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-lg">
                    {/* Icon */}
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        {tool.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {tool.description}
                      </p>
                    </div>

                    {/* Action */}
                    <div className="mt-6 flex items-center text-sm font-medium">
                      Open tool

                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}