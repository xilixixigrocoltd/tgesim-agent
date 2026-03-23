import Head from 'next/head'
import Navbar from './Navbar'
import { JWTPayload } from '@/lib/auth'

type LayoutProps = {
  children: React.ReactNode
  title?: string
  user?: JWTPayload
}

export default function Layout({ children, title = 'tgesim Agent Portal', user }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="tgesim Agent Portal" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar user={user} />}
        <main className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </>
  )
}
