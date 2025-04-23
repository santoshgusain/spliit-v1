import { Metadata } from 'next'
import Experience from './Experience'

export const metadata: Metadata = {
  title: 'Recently visited groups',
}

export default async function GroupsPage() {
  return (
    <>
      <Experience />
    </>
  )
}
