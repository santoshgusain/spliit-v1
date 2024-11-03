import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

// FIX for https://github.com/vercel/next.js/issues/58615
// export const dynamic = 'force-dynamic'

export default function HomePage() {
  const t = useTranslations()
  return (
    <main>
      <section className="py-16 md:py-24 lg:py-32">
        This is the customised Spliit.
      </section>
    </main>
  )
}
