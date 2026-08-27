'use client'

import { SubmitButton } from '@/components/submit-button'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Pencil, Plus, Save, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { DeletePopupCustom } from '../../components/delete-popup'

const USER_ID = 'santoshgusain'

const experienceSchema = z
  .object({
    id: z.string().optional(),
    company: z.string().trim().min(1, 'Company name is required'),
    startDate: z.date({
      required_error: 'Start date is required',
      invalid_type_error: 'Please select a valid date',
    }),
    endDate: z.date().nullable().optional(),
    isCurrent: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.isCurrent) {
        return true
      }

      return !!data.endDate && data.endDate >= data.startDate
    },
    {
      message: 'End date must be after the start date',
      path: ['endDate'],
    },
  )

type ExperienceFormValues = z.infer<typeof experienceSchema>

interface ExperienceRecord {
  id: string
  company: string
  joining: string
  leaving?: string | null
  isWorking: boolean
  totalWorkingDays?: number
}

interface DateDifference {
  years: number
  months: number
  days: number
}

function formatInputDate(date?: Date | null): string {
  if (!date || Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function parseInputDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)

  return new Date(year, month - 1, day)
}

function formatDisplayDate(value?: string | Date | null): string {
  if (!value) {
    return '-'
  }

  const date = value instanceof Date ? value : parseInputDate(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function daysBetween(startDate: Date, endDate: Date): number {
  const startUTC = Date.UTC(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
  )

  const endUTC = Date.UTC(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
  )

  return Math.round((endUTC - startUTC) / (1000 * 60 * 60 * 24))
}

function getCalendarDifference(startDate: Date, endDate: Date): DateDifference {
  if (endDate < startDate) {
    return {
      years: 0,
      months: 0,
      days: 0,
    }
  }

  let years = endDate.getFullYear() - startDate.getFullYear()

  let months = endDate.getMonth() - startDate.getMonth()

  let days = endDate.getDate() - startDate.getDate()

  if (days < 0) {
    months--

    const previousMonthDays = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      0,
    ).getDate()

    days += previousMonthDays
  }

  if (months < 0) {
    years--
    months += 12
  }

  return {
    years,
    months,
    days,
  }
}

function getAge(inputDob?: string | null): DateDifference {
  if (!inputDob) {
    return {
      years: 0,
      months: 0,
      days: 0,
    }
  }

  return getCalendarDifference(parseInputDate(inputDob), new Date())
}

function calculateExperience(experiences: ExperienceRecord[]) {
  const today = new Date()

  const totalDays = experiences.reduce((total, experience) => {
    const startDate = parseInputDate(experience.joining)

    const endDate = experience.isWorking
      ? today
      : experience.leaving
      ? parseInputDate(experience.leaving)
      : startDate

    return total + Math.max(0, daysBetween(startDate, endDate))
  }, 0)

  const totalEndDate = new Date(today)
  const totalStartDate = new Date(totalEndDate)

  totalStartDate.setDate(totalStartDate.getDate() - totalDays)

  const difference = getCalendarDifference(totalStartDate, totalEndDate)

  return {
    totalDays,
    years: difference.years,
    months: difference.months,
    days: difference.days,
  }
}

const defaultValues: ExperienceFormValues = {
  company: '',
  startDate: new Date(),
  endDate: new Date(),
  isCurrent: true,
}

export default function Experience() {
  const toast = useToast()
  const utils = trpc.useUtils()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues,
  })

  const { data: experienceResult, isLoading } = trpc.experience.list.useQuery()

  const { data: userData } = trpc.user.fetch.useQuery({
    userId: USER_ID,
  })

  const invalidateOptions = {
    onSuccess: async () => {
      await utils.experience.list.invalidate()
    },
  }

  const addExperience = trpc.experience.create.useMutation(invalidateOptions)

  const updateExperience = trpc.experience.update.useMutation(invalidateOptions)

  const deleteExperience = trpc.experience.delete.useMutation(invalidateOptions)

  const experienceData: ExperienceRecord[] = useMemo(
    () => experienceResult?.experiences ?? [],
    [experienceResult],
  )

  const experienceSummary = useMemo(
    () => calculateExperience(experienceData),
    [experienceData],
  )

  const dob = (userData as any)?.user?.[0]?.dob

  const age = useMemo(() => getAge(dob), [dob])

  const isCurrent = form.watch('isCurrent')

  const isSaving = addExperience.isPending || updateExperience.isPending

  const openAddDialog = () => {
    setEditingId(null)
    form.reset({
      ...defaultValues,
      startDate: new Date(),
      endDate: new Date(),
    })
    setDialogOpen(true)
  }

  const openEditDialog = (experience: ExperienceRecord) => {
    setEditingId(experience.id)

    form.reset({
      id: experience.id,
      company: experience.company,
      startDate: parseInputDate(experience.joining),
      endDate: experience.leaving
        ? parseInputDate(experience.leaving)
        : new Date(),
      isCurrent: experience.isWorking,
    })

    setDialogOpen(true)
  }

  const closeDialog = () => {
    if (isSaving) {
      return
    }

    setDialogOpen(false)
    setEditingId(null)
    form.reset(defaultValues)
  }

  const handleSubmit = async (values: ExperienceFormValues) => {
    const endDate = values.isCurrent ? new Date() : values.endDate

    if (!endDate) {
      return
    }

    const payload = {
      userId: USER_ID,
      company: values.company,
      joining: formatInputDate(values.startDate),
      leaving: values.isCurrent ? null : formatInputDate(endDate),
      totalWorkingDays: Math.max(0, daysBetween(values.startDate, endDate)),
      isWorking: values.isCurrent,
    }

    try {
      if (editingId) {
        await updateExperience.mutateAsync({
          expFormValues: {
            ...payload,
            id: editingId,
          },
        })

        toast.toast({
          title: 'Experience updated',
          description: 'Experience has been updated successfully.',
        })
      } else {
        await addExperience.mutateAsync({
          expFormValues: payload,
        })

        toast.toast({
          title: 'Experience added',
          description: 'Experience has been added successfully.',
        })
      }

      closeDialog()
    } catch {
      toast.toast({
        title: 'Something went wrong',
        description: editingId
          ? 'Failed to update experience.'
          : 'Failed to add experience.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteExperience.mutateAsync({
        expId: id,
      })

      toast.toast({
        title: 'Experience deleted',
        description: 'Experience has been deleted successfully.',
      })
    } catch {
      toast.toast({
        title: 'Something went wrong',
        description: 'Failed to delete experience.',
        variant: 'destructive',
      })
    }
  }

  return (
    <main className="flex-1 w-full max-w-screen-lg mx-auto px-4 py-6">
      <div className="space-y-8">
        {/* Header */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Experience</h1>

            <p className="text-sm text-muted-foreground mt-1">
              Manage your professional experience.
            </p>
          </div>

          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                closeDialog()
              } else {
                setDialogOpen(true)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Experience
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Update Experience' : 'Add Experience'}
                </DialogTitle>

                <DialogDescription>
                  {editingId
                    ? 'Update your work experience details.'
                    : 'Add a new work experience to your profile.'}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>

                        <FormControl>
                          <Input
                            placeholder="Enter company name"
                            autoFocus
                            {...field}
                          />
                        </FormControl>

                        <FormDescription>
                          Company or organisation name
                        </FormDescription>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Joining Date</FormLabel>

                          <FormControl>
                            <Input
                              type="date"
                              className="date-base"
                              value={formatInputDate(field.value)}
                              onChange={(event) =>
                                field.onChange(
                                  parseInputDate(event.target.value),
                                )
                              }
                            />
                          </FormControl>

                          <FormDescription>Date you joined</FormDescription>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Leaving Date</FormLabel>

                          <FormControl>
                            <Input
                              type="date"
                              className="date-base"
                              disabled={isCurrent}
                              value={formatInputDate(field.value)}
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value
                                    ? parseInputDate(event.target.value)
                                    : null,
                                )
                              }
                            />
                          </FormControl>

                          <FormDescription>
                            {isCurrent
                              ? 'Calculated up to today'
                              : 'Date you left'}
                          </FormDescription>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isCurrent"
                    render={({ field }) => (
                      <FormItem className="flex items-start gap-3 rounded-lg border p-4 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked === true)

                              if (checked) {
                                form.setValue('endDate', new Date())
                              }
                            }}
                          />
                        </FormControl>

                        <div className="space-y-1">
                          <FormLabel className="cursor-pointer">
                            I currently work here
                          </FormLabel>

                          <FormDescription>
                            Experience will be calculated up to today.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeDialog}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>

                    <SubmitButton
                      loadingContent={editingId ? 'Updating...' : 'Saving...'}
                      disabled={isSaving}
                    >
                      <Save className="mr-2 h-4 w-4" />

                      {editingId ? 'Update' : 'Save'}
                    </SubmitButton>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </section>

        {/* Summary */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Age</p>

            <p className="mt-2 text-2xl font-bold">
              {age.years} <span className="text-base font-normal">years</span>{' '}
              {age.months} <span className="text-base font-normal">months</span>{' '}
              {age.days} <span className="text-base font-normal">days</span>
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Total Experience</p>

            <p className="mt-2 text-2xl font-bold">
              {experienceSummary.years}{' '}
              <span className="text-base font-normal">years</span>{' '}
              {experienceSummary.months}{' '}
              <span className="text-base font-normal">months</span>{' '}
              {experienceSummary.days}{' '}
              <span className="text-base font-normal">days</span>
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {experienceSummary.totalDays.toLocaleString('en-IN')} total days
            </p>
          </div>
        </section>

        {/* Experience Table */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Work Experience</h2>

            <p className="text-sm text-muted-foreground">
              Your professional experience history.
            </p>
          </div>

          {isLoading ? (
            <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
              Loading experience...
            </div>
          ) : experienceData.length === 0 ? (
            <div className="rounded-xl border p-8 text-center">
              <p className="font-medium">No experience added yet</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Click "Add Experience" to add your first work experience.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Joining</TableHead>
                    <TableHead>Leaving</TableHead>
                    <TableHead className="text-right">Days</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {experienceData.map((experience, index) => (
                    <TableRow key={experience.id}>
                      <TableCell>{index + 1}</TableCell>

                      <TableCell className="font-medium">
                        {experience.company}
                      </TableCell>

                      <TableCell>
                        {formatDisplayDate(experience.joining)}
                      </TableCell>

                      <TableCell>
                        {experience.isWorking
                          ? 'Present'
                          : formatDisplayDate(experience.leaving)}
                      </TableCell>

                      <TableCell className="text-right">
                        {experience.totalWorkingDays?.toLocaleString('en-IN') ??
                          '-'}
                      </TableCell>

                      <TableCell className="text-center">
                        {experience.isWorking ? (
                          <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Current
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-muted px-2 py-1 text-xs font-medium">
                            Previous
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(experience)}
                            aria-label="Edit experience"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <DeletePopupCustom
                            onDelete={() => handleDelete(experience.id)}
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Delete experience"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DeletePopupCustom>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
