'use client'

import { useState } from 'react'
import { SubmitButton } from '@/components/submit-button'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const dateSchema = z.object({
  startDate: z.date({
    required_error: 'Start date is required',
    invalid_type_error: 'Please select a valid date',
  }),

  endDate: z.date({
    required_error: 'End date is required',
    invalid_type_error: 'Please select a valid date',
  }),
})

type DateFormValues = z.infer<typeof dateSchema>

interface DateDifferenceResult {
  years: number
  months: number
  days: number
  totalDays: number
  totalWeeks: number
  totalHours: number
  totalMinutes: number
  totalSeconds: number
  milliseconds: number
  isNegative: boolean
  startDate: Date
  endDate: Date
}

function formatDate(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)

  return new Date(year, month - 1, day)
}

function dateDifference(
  startDate: Date,
  endDate: Date,
): DateDifferenceResult {
  if (Number.isNaN(startDate.getTime())) {
    throw new TypeError('startDate must be a valid Date')
  }

  if (Number.isNaN(endDate.getTime())) {
    throw new TypeError('endDate must be a valid Date')
  }

  const isNegative = endDate < startDate

  const start = isNegative ? endDate : startDate
  const end = isNegative ? startDate : endDate

  const milliseconds = end.getTime() - start.getTime()

  const totalSeconds = Math.floor(milliseconds / 1000)
  const totalMinutes = Math.floor(milliseconds / (1000 * 60))
  const totalHours = Math.floor(milliseconds / (1000 * 60 * 60))
  const totalDays = Math.floor(milliseconds / (1000 * 60 * 60 * 24))
  const totalWeeks = Math.floor(totalDays / 7)

  let years = end.getFullYear() - start.getFullYear()
  let months = end.getMonth() - start.getMonth()
  let days = end.getDate() - start.getDate()

  if (days < 0) {
    months--

    const daysInPreviousMonth = new Date(
      end.getFullYear(),
      end.getMonth(),
      0,
    ).getDate()

    days += daysInPreviousMonth
  }

  if (months < 0) {
    years--
    months += 12
  }

  return {
    years: isNegative ? -years : years,
    months: isNegative ? -months : months,
    days: isNegative ? -days : days,
    totalDays: isNegative ? -totalDays : totalDays,
    totalWeeks: isNegative ? -totalWeeks : totalWeeks,
    totalHours: isNegative ? -totalHours : totalHours,
    totalMinutes: isNegative ? -totalMinutes : totalMinutes,
    totalSeconds: isNegative ? -totalSeconds : totalSeconds,
    milliseconds: isNegative ? -milliseconds : milliseconds,
    isNegative,
    startDate: start,
    endDate: end,
  }
}

const defaultValues: DateFormValues = {
  startDate: new Date(),
  endDate: new Date(),
}

export default function DateDifferencePage() {
  const [result, setResult] = useState<DateDifferenceResult | null>(null)

  const form = useForm<DateFormValues>({
    resolver: zodResolver(dateSchema),
    defaultValues,
  })

  const handleSubmit = (values: DateFormValues) => {
    const difference = dateDifference(
      values.startDate,
      values.endDate,
    )

    setResult(difference)
  }

  const handleReset = () => {
    form.reset(defaultValues)
    setResult(null)
  }

  return (
    <main className="flex-1 w-full max-w-screen-md mx-auto px-4 py-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-semibold">
            Check Date Difference
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            Calculate the difference between two dates.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>

                  <FormControl>
                    <Input
                      type="date"
                      className="date-base"
                      value={formatDate(field.value)}
                      onChange={(event) => {
                        field.onChange(
                          parseDate(event.target.value),
                        )
                      }}
                    />
                  </FormControl>

                  <FormDescription>
                    Joining date of the employee
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>

                  <FormControl>
                    <Input
                      type="date"
                      className="date-base"
                      value={formatDate(field.value)}
                      onChange={(event) => {
                        field.onChange(
                          parseDate(event.target.value),
                        )
                      }}
                    />
                  </FormControl>

                  <FormDescription>
                    Relieving date of the employee
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <SubmitButton loadingContent="Checking..">
                Check
              </SubmitButton>

              <Button
                type="button"
                variant="secondary"
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>
          </form>
        </Form>

        {result && (
          <section className="rounded-xl border bg-card p-6 space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Date Difference
              </p>

              <div className="text-3xl font-bold tracking-tight">
                {Math.abs(result.years)}{' '}
                {Math.abs(result.years) === 1 ? 'Year' : 'Years'}{' '}
                {Math.abs(result.months)}{' '}
                {Math.abs(result.months) === 1 ? 'Month' : 'Months'}{' '}
                {Math.abs(result.days)}{' '}
                {Math.abs(result.days) === 1 ? 'Day' : 'Days'}
              </div>

              {result.isNegative && (
                <p className="text-sm text-destructive">
                  End date is earlier than start date
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm text-muted-foreground">
              <div className="text-center">
                <p className="font-medium text-foreground">
                  {formatDisplayDate(result.startDate)}
                </p>
                <p>Start Date</p>
              </div>

              <div className="hidden sm:flex items-center">
                →
              </div>

              <div className="text-center">
                <p className="font-medium text-foreground">
                  {formatDisplayDate(result.endDate)}
                </p>
                <p>End Date</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <ResultItem
                label="Total Days"
                value={result.totalDays}
              />

              <ResultItem
                label="Total Weeks"
                value={result.totalWeeks}
              />

              <ResultItem
                label="Total Hours"
                value={result.totalHours}
              />

              <ResultItem
                label="Total Minutes"
                value={result.totalMinutes}
              />

              <ResultItem
                label="Total Seconds"
                value={result.totalSeconds}
              />

              <ResultItem
                label="Milliseconds"
                value={result.milliseconds}
              />
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function ResultItem({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4 text-center">
      <p className="text-lg font-semibold">
        {value.toLocaleString('en-IN')}
      </p>

      <p className="text-xs text-muted-foreground mt-1">
        {label}
      </p>
    </div>
  )
}