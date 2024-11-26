import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recently visited groups',
}

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

export default async function GroupsPage() {
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

  return (
    <>
      <main className="flex-1 max-w-screen-md w-full mx-auto px-4 py-6 flex flex-col gap-6">
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
      </main>
    </>
  )
}
