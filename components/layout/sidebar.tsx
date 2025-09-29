'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building2,
  FileText,
  Shield,
  Mail,
  CheckSquare,
  BarChart3,
  Settings
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Accounts', href: '/accounts', icon: Building2 },
  { name: 'Opportunities', href: '/opportunities', icon: FileText },
  { name: 'Quotes', href: '/quotes', icon: FileText },
  { name: 'Policies', href: '/policies', icon: Shield },
  { name: 'Renewals', href: '/renewals', icon: CheckSquare },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Emails', href: '/emails', icon: Mail },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Shield className="h-6 w-6" />
          <span>ContractorNerd</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </div>
  )
}