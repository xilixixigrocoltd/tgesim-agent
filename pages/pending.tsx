import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { getUserFromRequest } from '@/lib/auth'

export default function Pending() {
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <>
      <Head>
        <title>等待审核 - tgesim Agent Portal</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">申请已提交</h1>
            <p className="text-gray-500 mb-2">您的代理商申请正在等待管理员审核。</p>
            <p className="text-gray-500 mb-6">审核通过后您将可以正常使用系统。如有疑问请联系管理员。</p>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const user = getUserFromRequest(ctx)
  if (!user) return { redirect: { destination: '/login', permanent: false } }
  if (user.role === 'admin') return { redirect: { destination: '/admin', permanent: false } }
  if (user.status === 'active') return { redirect: { destination: '/dashboard', permanent: false } }
  return { props: {} }
}
