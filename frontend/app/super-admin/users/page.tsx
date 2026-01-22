'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Search, Filter, Shield, Mail, UserCheck, Trash2, Key, Ban, X, Check, School, Users, Calendar, Building2 } from 'lucide-react'
import { API_URL } from '@/lib/api'

interface UserSchool {
    id: number
    name: string
}

interface User {
    id: number
    name: string
    email: string
    role: string
    is_active: boolean
    created_at: string
    school_id: number | null
    school: UserSchool | null
}

interface SchoolOption {
    id: number
    name: string
}

export default function UserManagementPage() {
    const { token } = useAuth()
    const [users, setUsers] = useState<User[]>([])
    const [schools, setSchools] = useState<SchoolOption[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [schoolFilter, setSchoolFilter] = useState('all')

    // Modal states
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [deletingUser, setDeletingUser] = useState<User | null>(null)
    const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null)
    const [newPassword, setNewPassword] = useState('')
    const [actionLoading, setActionLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // API_URL imported from lib

    const fetchSchools = async () => {
        try {
            const response = await fetch(`${API_URL}/schools`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setSchools((data.data || []).map((s: any) => ({ id: s.id, name: s.name })))
            }
        } catch (error) {
            console.error('Error fetching schools:', error)
        }
    }

    const fetchUsers = async () => {
        try {
            setIsLoading(true)
            let url = `${API_URL}/users`
            const params = new URLSearchParams()
            if (schoolFilter !== 'all') params.append('school_id', schoolFilter)
            if (params.toString()) url += `?${params.toString()}`

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!response.ok) throw new Error('Gagal mengambil data user')
            const data = await response.json()
            setUsers(data.data || [])
        } catch (error) {
            console.error('Error fetching users:', error)
            setUsers([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (token) {
            fetchSchools()
        }
    }, [token])

    useEffect(() => {
        if (token) fetchUsers()
    }, [token, schoolFilter])

    // Block/Unblock User
    const handleToggleBlock = async (user: User) => {
        setActionLoading(true)
        try {
            const response = await fetch(`${API_URL}/users/${user.id}/block`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Gagal mengubah status user')
            setMessage({ type: 'success', text: data.message })
            fetchUsers()
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setActionLoading(false)
        }
    }

    // Reset Password
    const handleResetPassword = async () => {
        if (!resetPasswordUser) return
        setActionLoading(true)
        try {
            const response = await fetch(`${API_URL}/users/${resetPasswordUser.id}/reset-password`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Gagal reset password')
            setNewPassword(data.new_password)
            setMessage({ type: 'success', text: `Password baru: ${data.new_password}` })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setActionLoading(false)
        }
    }

    // Delete User
    const handleDeleteUser = async () => {
        if (!deletingUser) return
        setActionLoading(true)
        try {
            const response = await fetch(`${API_URL}/users/${deletingUser.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Gagal menghapus user')
            setMessage({ type: 'success', text: data.message })
            setDeletingUser(null)
            fetchUsers()
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setActionLoading(false)
        }
    }

    // Edit User
    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingUser) return
        setActionLoading(true)
        try {
            const response = await fetch(`${API_URL}/users/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: editingUser.name,
                    email: editingUser.email,
                    role: editingUser.role
                })
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Gagal update user')
            setMessage({ type: 'success', text: 'User berhasil diupdate' })
            setEditingUser(null)
            fetchUsers()
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setActionLoading(false)
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = roleFilter === 'all' || user.role === roleFilter
        return matchesSearch && matchesRole
    })

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'super_admin': return 'bg-purple-100 text-purple-700'
            case 'school_admin': return 'bg-blue-100 text-blue-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'super_admin': return 'Super Admin'
            case 'school_admin': return 'School Admin'
            default: return 'Student'
        }
    }

    return (
        <div className="min-h-screen">
            {/* Message Toast */}
            {message && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white flex items-center gap-2`}>
                    {message.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    <span>{message.text}</span>
                    <button onClick={() => setMessage(null)} className="ml-2"><X className="w-4 h-4" /></button>
                </div>
            )}

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen User</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola akses dan role pengguna sistem.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            placeholder="Cari nama atau email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <select
                                className="block p-2 border border-gray-200 rounded-lg text-sm bg-white min-w-[160px]"
                                value={schoolFilter}
                                onChange={(e) => setSchoolFilter(e.target.value)}
                            >
                                <option value="all">Semua Sekolah</option>
                                {schools.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                className="block p-2 border border-gray-200 rounded-lg text-sm bg-white"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="all">Semua Role</option>
                                <option value="super_admin">Super Admin</option>
                                <option value="school_admin">School Admin</option>
                                <option value="student">Student</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">User Info</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Role</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Sekolah</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tanggal</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">Memuat data...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">Tidak ada user ditemukan.</td></tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        {/* User Info */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-xs text-gray-500 flex items-center">
                                                        <Mail className="w-3 h-3 mr-1" />{user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                                                {getRoleLabel(user.role)}
                                            </span>
                                        </td>

                                        {/* Sekolah */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {user.school ? (
                                                <div className="flex items-center">
                                                    <School className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                                                    <span className="text-sm text-gray-700">{user.school.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {user.is_active !== false ? 'Aktif' : 'Blocked'}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            <div className="flex justify-center gap-1">
                                                <button onClick={() => setSelectedUser(user)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Detail">
                                                    <Users className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setEditingUser(user)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                                                    <UserCheck className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setResetPasswordUser(user)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded" title="Reset Password">
                                                    <Key className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleToggleBlock(user)} className={`p-1.5 rounded ${user.is_active !== false ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`} title={user.is_active !== false ? 'Block' : 'Unblock'}>
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setDeletingUser(user)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Hapus">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick View Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Detail User</h3>
                            <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                                    {selectedUser.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900">{selectedUser.name}</h4>
                                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">Role</p>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(selectedUser.role)}`}>
                                        {getRoleLabel(selectedUser.role)}
                                    </span>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">Status</p>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedUser.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {selectedUser.is_active !== false ? 'Aktif' : 'Blocked'}
                                    </span>
                                </div>
                            </div>

                            {selectedUser.school && (
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <School className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-semibold text-blue-700">Sekolah</span>
                                    </div>
                                    <p className="font-medium text-gray-900">{selectedUser.school.name}</p>
                                </div>
                            )}

                            <div className="text-xs text-gray-500">
                                <Calendar className="w-3 h-3 inline mr-1" />
                                Bergabung: {new Date(selectedUser.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <button onClick={() => setSelectedUser(null)} className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Edit User</h3>
                        <form onSubmit={handleEditUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                                <input type="text" className="w-full p-2 border rounded-lg" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" className="w-full p-2 border rounded-lg" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select className="w-full p-2 border rounded-lg" value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}>
                                    <option value="super_admin">Super Admin</option>
                                    <option value="school_admin">School Admin</option>
                                    <option value="student">Student</option>
                                </select>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
                                <button type="submit" disabled={actionLoading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {actionLoading ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus User?</h3>
                        <p className="text-gray-600 mb-4">Apakah Anda yakin ingin menghapus <strong>{deletingUser.name}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
                        <div className="flex gap-2">
                            <button onClick={() => setDeletingUser(null)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
                            <button onClick={handleDeleteUser} disabled={actionLoading} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                                {actionLoading ? 'Menghapus...' : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {resetPasswordUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Reset Password</h3>
                        {newPassword ? (
                            <div className="text-center py-4">
                                <p className="text-gray-600 mb-2">Password baru untuk <strong>{resetPasswordUser.name}</strong>:</p>
                                <div className="bg-gray-100 p-3 rounded-lg font-mono text-lg select-all">{newPassword}</div>
                                <p className="text-xs text-gray-500 mt-2">Salin dan berikan kepada user. Password ini tidak akan ditampilkan lagi.</p>
                                <button onClick={() => { setResetPasswordUser(null); setNewPassword('') }} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Tutup</button>
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-600 mb-4">Reset password untuk <strong>{resetPasswordUser.name}</strong>? Password baru akan digenerate otomatis.</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setResetPasswordUser(null)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
                                    <button onClick={handleResetPassword} disabled={actionLoading} className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50">
                                        {actionLoading ? 'Mereset...' : 'Reset Password'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
