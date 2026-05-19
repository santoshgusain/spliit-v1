'use client'

import { SubmitButton } from '@/components/submit-button'
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
import { Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// export const metadata: Metadata = {
//   title: 'Recently visited groups',
// }

function getExp(experience: any) {
  let totalDays = 0

  experience.map((row: any) => {
    const fromDate: any = new Date(row.joining)
    const toDate: any = row.isWorking ? new Date() : new Date(row.leaving)

    const days = Math.ceil((toDate - fromDate) / 1000 / 60 / 60 / 24)

    totalDays += days

    row.totalWorkingDays = days
    return row
  })

  // 1000: ms to s;
  // 1st 60: s to min;
  // 2rd 60: min to hours;
  // 24: hours to days;
  const years = Math.floor(totalDays / 365)

  // 2y - 2.7y = 0.7;
  // 0.7 * 12(month)
  let months = Math.floor(Math.abs(years - totalDays / 365) * 12)

  return {
    days: totalDays,
    years,
    months,
    experiences: experience,
  }
}

function daysBetween(startDate: any, endDate: any) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24

  const startDateUTC = Date.UTC(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
  )
  const endDateUTC = Date.UTC(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
  )

  return Math.floor((endDateUTC - startDateUTC) / millisecondsPerDay)
}

function formatDate(date?: Date) {
  if (!date || isNaN(date as any)) date = new Date()
  return date.toISOString().substring(0, 10)
}

const defaultValuesForm = {
  startDate: new Date(),
  endDate: new Date(),
}

export const experienceSchema = z
  .object({
    startDate: z.date({
      required_error: 'Start date is required',
      invalid_type_error: 'Please select a valid date',
    }),
    endDate: z.date().optional().nullable(),
  })
  .passthrough()

export default function GroupsPage() {
  const experience = [
    {
      company: 'gspann',
      totalWorkingDays: 100,
      joining: '2023-11-14',
      leaving: '',
      isWorking: true,
    },
    {
      company: 'mobcoder',
      totalWorkingDays: 100,
      joining: '2023-01-19',
      leaving: '2023-10-20',
      isWorking: false,
    },
    {
      company: 'mansa infotech',
      totalWorkingDays: 100,
      joining: '2021-08-02',
      leaving: '2023-01-05',
      isWorking: false,
    },
    {
      company: 'Prolofic Technologies',
      totalWorkingDays: 100,
      joining: '2020-02-03',
      leaving: '2021-06-29',
      isWorking: false,
    },
  ]
  const { days, months, years, experiences } = getExp(experience)

  const form = useForm({
    resolver: zodResolver(experienceSchema),
    defaultValues: defaultValuesForm,
  })

  return (
    <>
      <main className="flex-1 max-w-screen-md w-full mx-auto px-4 py-6 flex flex-col gap-6">
        <div>
          <h3>{'Add Experience'}</h3>
          <br />
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values: any) => {
                const { editing, id } = values
                console.log(editing, '=======================')
              })}
            >
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="sm:order-1">
                    <FormLabel>{'Start Date'}</FormLabel>
                    <FormControl>
                      <Input
                        className="date-base"
                        type="date"
                        defaultValue={formatDate(field.value)}
                        onChange={(event) => {
                          return field.onChange(new Date(event.target.value))
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      {'Joining date of the employ'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="sm:order-1">
                    <FormLabel>{'End Date'}</FormLabel>
                    <FormControl>
                      <Input
                        className="date-base"
                        type="date"
                        defaultValue={formatDate(field.value)}
                        onChange={(event) => {
                          return field.onChange(new Date(event.target.value))
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      {'Releaving date of the employ'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex mt-4 gap-2">
                <SubmitButton loadingContent={'saving'}>
                  <Save className="w-4 h-4 mr-2" />
                  {'Save'}
                </SubmitButton>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </>
  )
}
