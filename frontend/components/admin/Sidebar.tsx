'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, School, Users, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Sidebar() {
    const pathname = usePathname()
    const { logout } = useAuth()

    const navigation = [
        { name: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
        { name: 'Sekolah', href: '/super-admin/schools', icon: School },
        { name: 'Users', href: '/super-admin/users', icon: Users },
        { name: 'Settings', href: '/super-admin/settings', icon: Settings },
    ]

    const isActive = (href: string) => pathname.startsWith(href)

    return (
        <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 bottom-0 z-50">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 border-b border-gray-200">
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg mr-2"></div>
                    <span className="text-xl font-bold text-gray-900">YukAdmin</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
                <nav className="mt-5 flex-1 px-2 space-y-1">
                    {navigation.map((item) => {
                        const active = isActive(item.href)
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                  group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors
                  ${active
                                        ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 flex-shrink-0 ${active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'}`}
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* User & Logout */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <button
                    onClick={logout}
                    className="flex-shrink-0 w-full group block"
                >
                    <div className="flex items-center">
                        <div className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-red-100 text-red-700">
                            <LogOut className="h-5 w-5" />
                        </div>
                        <div className="ml-3 text-left">
                            <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Logout</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    )
}