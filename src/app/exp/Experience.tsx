'use client'

import { SubmitButton } from '@/components/submit-button'
import { Button } from '@/components/ui/button'
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
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { DeletePopupCustom } from '../../components/delete-popup'

function getExp(experience: any) {
  if (!experience?.length)
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

const defaultValuesForm = {
  company: '',
  startDate: new Date(),
  endDate: new Date(),
  isCurrent: true,
}

export const experienceSchema = z
  .object({
    company: z.string().min(1, 'Company name is required'),
    startDate: z.date({
      required_error: 'Start date is required',
      invalid_type_error: 'Please select a valid date',
    }),
    // If isCurrent is true, endDate might be null or undefined
    endDate: z.date().optional().nullable(),
    isCurrent: z.boolean().default(true),
  })
  .passthrough()
  .refine(
    (data) => {
      // If not currently working there, an end date is usually required and must be after start
      if (!data.isCurrent) {
        if (!data.endDate) return false
        return data.endDate >= data.startDate
      }
      return true
    },
    {
      message: 'End date must be after the start date',
      path: ['endDate'],
    },
  )

// Extract the TypeScript type from the schema
// export type ExperienceFormValues = z.infer<typeof experienceSchema>;

export default function Experience() {
  const toast = useToast()
  const utils = trpc.useUtils()

  const form = useForm({
    resolver: zodResolver(experienceSchema),
    defaultValues: defaultValuesForm,
  })

  // This forces the list to refetch the next time it's needed
  const mutationOption = {
    onSuccess: () => {
      utils.experience.list.invalidate()
    },
  }
  // mutateAsync
  // for add operation
  const addExp = trpc.experience.create.useMutation(mutationOption)
  // for delete operation
  const deleteExp = trpc.experience.delete.useMutation(mutationOption)
  // for update operation
  const updateExp = trpc.experience.update.useMutation(mutationOption)

  // const { data: experienceData, isLoading } = trpc.experience.list.useQuery()
  const { data: userData } = trpc.user.fetch.useQuery({
    userId: 'santoshgusain',
  })

  const [experienceData, setExperienceData] = useState([])
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    getExperienceData()
    form.reset(defaultValuesForm)
  }, [])

  const getExperienceData = async () => {
    setLoading(true)
    // utils.experience.create.mutate
    // const result: any = await utils.experience.list.invalidate()
    const result: any = await utils.experience.list.fetch()
    console.log({ result }, '---------------------99999')
    setExperienceData(result.experiences || [])
    setLoading(false)
    // experiences
  }

  const handleReset = (e: any) => {
    e.preventDefault()
    form.reset(defaultValuesForm)
  }

  console.log({ experienceData, userData, isLoading }, '------>>>>')

  const { months, years, experiences } = getExp(experienceData)
  // const { months, years, experiences } = getExp(isLoading ? [] : experienceData)
  console.log({ months, years, experiences }, '--------------------123')
  // const { months, years, experiences } = getExp(
  //   isLoading ? [] : experienceData?.experiences,
  // )
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
              <TableHead className="text-right">#</TableHead>
              <TableHead className="w-[100px]">Company Name</TableHead>
              <TableHead>Joining Date</TableHead>
              <TableHead>Leaving Date</TableHead>
              <TableHead className="text-right">Total Working Days</TableHead>
              <TableHead className="text-right">Working</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(experienceData as Record<string, any>[]).map(
              (
                { company, joining, leaving, isWorking, totalWorkingDays, id },
                index,
              ) => {
                return (
                  <>
                    <TableRow>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{company}</TableCell>
                      <TableCell>{joining}</TableCell>
                      <TableCell>{leaving || '-'}</TableCell>
                      <TableCell className="text-right">
                        {totalWorkingDays || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {isWorking ? 'Yes' : 'No'}
                      </TableCell>
                      <TableCell className="text-right flex gap-1">
                        <DeletePopupCustom
                          onDelete={async () => {
                            console.log('deleting the record')
                            await deleteExp.mutateAsync({
                              expId: id,
                            })
                            await getExperienceData()
                            // utils.groups.expenses.invalidate()
                            // router.push(`/groups/${group.id}`)
                          }}
                        ></DeletePopupCustom>
                        <Button
                          onClick={() => {
                            console.log('edit  button clicked')
                            const row = {
                              id,
                              editing: true,
                              company,
                              startDate: new Date(joining),
                              endDate: new Date(leaving),
                              isCurrent: isWorking,
                            }
                            form.reset(row)
                          }}
                        >
                          Edit
                        </Button>
                        {/* <ConfirmationPopup
                          onDelete={async () => {
                            console.log('updating the record')
                          }}
                        ></ConfirmationPopup> */}
                      </TableCell>
                    </TableRow>
                  </>
                )
              },
            )}
          </TableBody>
        </Table>

        <div>
          <h3>
            {form.getValues('editing') ? 'Update Experience' : 'Add Experience'}
          </h3>
          <br />
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values: any) => {
                const { editing, id } = values
                console.log(editing, '=======================')
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

                console.log('values------------=====', { values, payload })

                let response

                if (editing) {
                  response = await updateExp.mutateAsync({
                    expFormValues: { ...payload, id },
                  })

                  toast.toast({
                    title: 'Success',
                    description: 'Experience updated successfully!',
                  })
                } else {
                  response = await addExp.mutateAsync({
                    expFormValues: payload,
                  })

                  toast.toast({
                    title: 'Success',
                    description: 'Experience added successfully!',
                  })
                }

                console.log(response, 'result=====================')
                getExperienceData()
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
                <Button variant={'outline'} onClick={handleReset}>
                  {'Reset'}
                </Button>
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
