import { GetServerSideProps } from 'next'
import { getUserFromRequest } from '@/lib/auth'

export default function Home() {
  return null
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const user = getUserFromRequest(ctx)
  if (user) {
    if (user.role === 'admin') return { redirect: { destination: '/admin', permanent: false } }
    if (user.status === 'active') return { redirect: { destination: '/dashboard', permanent: false } }
    return { redirect: { destination: '/pending', permanent: false } }
  }
  return { redirect: { destination: '/login', permanent: false } }
}
