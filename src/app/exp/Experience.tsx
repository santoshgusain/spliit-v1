'use client'

import { SubmitButton } from '@/components/submit-button'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import { trpc } from '@/trpc/client'
import { Save } from 'lucide-react'
import { useForm } from 'react-hook-form'

function getExp(experience: any) {
  if (!experience.length)
    return {
      days: 0,
      years: 0,
      months: 0,
      experiences: [],
    }

  let totalDays = 0

  experience?.map((row: any) => {
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

function getAge(inputDob: string) {
  const dobString = inputDob ?? '1992-07-03'
  const [year, month, day] = dobString.split('-').map(Number)
  const dob = new Date(year, month - 1, day)
  const today = new Date()

  let years = today.getFullYear() - dob.getFullYear()
  let months = today.getMonth() - dob.getMonth()
  let days = today.getDate() - dob.getDate()

  // Adjust for negative months
  if (months < 0 || (months === 0 && days < 0)) {
    years--
    months += 12
  }

  // Adjust for negative days
  if (days < 0) {
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
    days += lastMonth.getDate()
    months--
  }

  return {
    years: years,
    months: months,
    days: days,
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

export default function Experience() {
  const toast = useToast()
  const { mutateAsync } = trpc.experience.create.useMutation()
  const { data: experienceData, isLoading } = trpc.experience.list.useQuery()
  const { data: userData } = trpc.user.fetch.useQuery({
    userId: 'santoshgusain',
  })

  console.log({ experienceData, userData, isLoading }, '------>>>>')

  const form = useForm({
    // resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      company: '',
      startDate: new Date(),
      endDate: new Date(),
      isCurrent: false,
    },
  })

  const { months, years, experiences } = getExp(
    isLoading ? [] : experienceData?.experiences,
  )
  const age = getAge((userData as any)?.user[0].dob)

  return (
    <>
      <main className="flex-1 max-w-screen-md w-full mx-auto px-4 py-6 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="font-bold text-2xl flex-1">
            <div>Age</div>
          </h1>
          <div className="flex gap-2">
            <div>
              {age?.years} years {age?.months} months {age?.days} days
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="font-bold text-2xl flex-1">
            <div>Experience</div>
          </h1>
          <div className="flex gap-2">
            <div>
              {years} years {months} months
            </div>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Company Name</TableHead>
              <TableHead>Joining Date</TableHead>
              <TableHead>Leaving Date</TableHead>
              <TableHead className="text-right">Total Working Days</TableHead>
              <TableHead className="text-right">Working</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(experiences as Record<string, any>[]).map(
              ({ company, joining, leaving, isWorking, totalWorkingDays }) => {
                return (
                  <>
                    <TableRow>
                      <TableCell className="font-medium">{company}</TableCell>
                      <TableCell>{joining}</TableCell>
                      <TableCell>{leaving || '-'}</TableCell>
                      <TableCell className="text-right">
                        {totalWorkingDays || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {isWorking ? 'Yes' : 'No'}
                      </TableCell>
                    </TableRow>
                  </>
                )
              },
            )}
          </TableBody>
        </Table>

        <div>
          <h3>Add Experience</h3>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values: any) => {
                // formatDate
                const joining = formatDate(values.startDate)?.toString()
                const leaving = formatDate(values.endDate)?.toString()

                const payload = {
                  userId: 'santoshgusain',
                  company: values.company,
                  totalWorkingDays: daysBetween(
                    values.startDate,
                    values.endDate,
                  ),
                  joining,
                  leaving,
                  isWorking: values.isCurrent,
                }

                console.log('values', { values, payload })

                mutateAsync({
                  expFormValues: payload,
                })

                toast.toast({
                  title: 'Success',
                  description: 'Experience saved successfully',
                })
              })}
            >
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>{'Company'}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={'Enter Company Name'}
                        className="text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {'Company/Organisation name'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <FormField
                control={form.control}
                name="isCurrent"
                render={({ field }) => (
                  <FormItem className="flex flex-row gap-2 items-center space-y-0 pt-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div>
                      <FormLabel>{'Is Current Company?'}</FormLabel>
                    </div>
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

function formatDate(date?: Date) {
  if (!date || isNaN(date as any)) date = new Date()
  return date.toISOString().substring(0, 10)
}
