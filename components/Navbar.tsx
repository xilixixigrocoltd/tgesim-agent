import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { JWTPayload } from '@/lib/auth'

type NavbarProps = {
  user: JWTPayload
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const agentLinks = [
    { href: '/dashboard', label: '首页' },
    { href: '/products', label: '产品' },
    { href: '/orders', label: '订单' },
    { href: '/recharge', label: '充值' },
    { href: '/balance', label: '余额' },
    { href: '/profile', label: '我的' },
  ]

  const adminLinks = [
    { href: '/admin', label: '总览' },
    { href: '/admin/agents', label: '代理商' },
    { href: '/admin/recharges', label: '充值审核' },
    { href: '/admin/invites', label: '邀请码' },
  ]

  const links = user.role === 'admin' ? adminLinks : agentLinks

  return (
    <nav className="bg-orange-500 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} className="font-bold text-lg">
            tgesim Agent
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  router.pathname === link.href
                    ? 'bg-orange-700 text-white'
                    : 'hover:bg-orange-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="ml-4 flex items-center space-x-2">
              <span className="text-sm opacity-80">{user.email}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-orange-700 hover:bg-orange-800 rounded text-sm font-medium transition-colors"
              >
                退出
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-3 space-y-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded text-sm font-medium ${
                  router.pathname === link.href
                    ? 'bg-orange-700'
                    : 'hover:bg-orange-600'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-orange-400">
              <p className="px-3 py-1 text-sm opacity-80">{user.email}</p>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-orange-600 rounded"
              >
                退出登录
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
