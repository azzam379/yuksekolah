'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Search, ShieldAlert, KeyRound, UserX, UserCheck } from 'lucide-react'

interface User {
    id: number
    name: string
    email: string
    role: string
    school?: {
        name: string
    }
}

export default function UsersPage() {
    const { token } = useAuth()
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [processingId, setProcessingId] = useState<number | null>(null)

    const fetchUsers = async () => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams()
            if (search) params.append('search', search)
            if (roleFilter) params.append('role', roleFilter)

            const response = await fetch(`http://localhost:8000/api/users?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            setUsers(data.data) // Pagination handling simplified for MVP
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (token) fetchUsers()
    }, [token, search, roleFilter])

    const handleResetPassword = async (userId: number, userName: string) => {
        if (!confirm(`Reset password untuk ${userName}?\nPassword baru akan dibuat otomatis.`)) return

        try {
            setProcessingId(userId)
            const response = await fetch(`http://localhost:8000/api/users/${userId}/reset-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            const result = await response.json()
            alert(`Password baru untuk ${userName}: ${result.new_password}\n\nSimpan password ini karena tidak akan ditampilkan lagi!`)
        } catch (error) {
            alert('Gagal mereset password.')
        } finally {
            setProcessingId(null)
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari nama atau email..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="border rounded-lg px-4 py-2 outline-none"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="">Semua Role</option>
                    <option value="student">Siswa</option>
                    <option value="school_admin">Admin Sekolah</option>
                    <option value="super_admin">Super Admin</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sekolah</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan={4} className="text-center py-8">Memuat data...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={4} className="text-center py-8">Tidak ada user ditemukan</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{user.name}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'school_admin' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.school?.name || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleResetPassword(user.id, user.name)}
                                            disabled={processingId === user.id}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4 disabled:opacity-50"
                                            title="Reset Password"
                                        >
                                            <KeyRound className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}