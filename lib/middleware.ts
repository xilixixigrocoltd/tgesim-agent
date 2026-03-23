import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { getUserFromRequest, JWTPayload } from './auth'

export function withAuth(
  handler: (ctx: GetServerSidePropsContext, user: JWTPayload) => Promise<GetServerSidePropsResult<any>>,
  options?: { requireAdmin?: boolean; requireActive?: boolean }
) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<any>> => {
    const user = getUserFromRequest(ctx)

    if (!user) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      }
    }

    if (options?.requireAdmin && user.role !== 'admin') {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        },
      }
    }

    if (options?.requireActive !== false && user.status !== 'active') {
      if (user.role !== 'admin') {
        return {
          redirect: {
            destination: '/pending',
            permanent: false,
          },
        }
      }
    }

    return handler(ctx, user)
  }
}

export function withGuest(
  handler: (ctx: GetServerSidePropsContext) => Promise<GetServerSidePropsResult<any>>
) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<any>> => {
    const user = getUserFromRequest(ctx)

    if (user) {
      if (user.role === 'admin') {
        return { redirect: { destination: '/admin', permanent: false } }
      }
      if (user.status === 'active') {
        return { redirect: { destination: '/dashboard', permanent: false } }
      }
      return { redirect: { destination: '/pending', permanent: false } }
    }

    return handler(ctx)
  }
}
