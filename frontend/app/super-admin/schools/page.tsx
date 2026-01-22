'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Search, Filter, School, CheckCircle2, XCircle, Clock, ExternalLink, Users, Calendar, X, User } from 'lucide-react'
import { API_URL } from '@/lib/api'

interface Admin {
    id: number
    name: string
    email: string
}

interface ActivePeriod {
    id: number
    name: string
    academic_year: string
}

interface School {
    id: number
    name: string
    email: string
    status: 'pending' | 'active' | 'inactive'
    created_at: string
    registrations_count: number
    verified_count: number
    pending_count: number
    admin: Admin | null
    active_period: ActivePeriod | null
    program_breakdown: Record<string, number>
}

export default function SchoolManagementPage() {
    const { token } = useAuth()
    const [schools, setSchools] = useState<School[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedSchool, setSelectedSchool] = useState<School | null>(null)

    useEffect(() => {
        const fetchSchools = async () => {
            setIsLoading(true)
            try {
                const response = await fetch(`${API_URL}/schools`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (response.ok) {
                    const data = await response.json()
                    setSchools(data.data || [])
                } else {
                    throw new Error('Gagal mengambil data sekolah')
                }
            } catch (e) {
                console.error(e)
                setSchools([])
            } finally {
                setIsLoading(false)
            }
        }

        if (token) fetchSchools()
    }, [token])

    const filtered = schools.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || s.status === statusFilter
        return matchesSearch && matchesStatus
    })

    return (
        <div className="min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen Sekolah</h1>
                <p className="text-sm text-gray-500 mt-1">Daftar semua sekolah yang terdaftar dalam sistem.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
                    <div className="relative w-full sm:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                            placeholder="Cari nama sekolah..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            className="block w-full sm:w-auto p-2 border border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Semua Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sekolah</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Admin</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pendaftar</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Periode Aktif</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="relative px-4 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                                        Memuat data sekolah...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                                        Tidak ada data sekolah.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((school) => (
                                    <tr key={school.id} className="hover:bg-gray-50/50 transition-colors group">
                                        {/* Sekolah */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mr-3">
                                                    <School className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">{school.name}</div>
                                                    <div className="text-xs text-gray-500">{school.email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Admin */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {school.admin ? (
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{school.admin.name}</div>
                                                    <div className="text-xs text-gray-500">{school.admin.email}</div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                                    ⚠️ Tidak Ada
                                                </span>
                                            )}
                                        </td>

                                        {/* Pendaftar */}
                                        <td className="px-4 py-3">
                                            <div className="min-w-[100px]">
                                                <div className="flex items-baseline gap-1 mb-1">
                                                    <span className="text-sm font-bold text-gray-900">{school.verified_count || 0}</span>
                                                    <span className="text-xs text-gray-500">/ {school.registrations_count || 0}</span>
                                                </div>
                                                {school.registrations_count > 0 && (
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                        <div
                                                            className="h-1.5 rounded-full bg-green-500 transition-all"
                                                            style={{ width: `${Math.min(100, (school.verified_count / school.registrations_count) * 100)}%` }}
                                                        />
                                                    </div>
                                                )}
                                                {/* Program breakdown */}
                                                {school.program_breakdown && Object.keys(school.program_breakdown).length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {Object.entries(school.program_breakdown).slice(0, 3).map(([prog, count]) => (
                                                            <span key={prog} className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded">
                                                                {prog}: {count}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Periode Aktif */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {school.active_period ? (
                                                <div>
                                                    <div className="text-sm font-medium text-green-700">{school.active_period.name}</div>
                                                    <div className="text-xs text-gray-500">{school.active_period.academic_year}</div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                                    ⚠️ Tidak Ada
                                                </span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 inline-flex items-center text-xs font-medium rounded-full 
                                                ${school.status === 'active' ? 'bg-green-50 text-green-700 border border-green-100' :
                                                    school.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                                                        'bg-red-50 text-red-700 border border-red-100'}`}>
                                                {school.status === 'active' ? <CheckCircle2 className="w-3 h-3 mr-1" /> :
                                                    school.status === 'pending' ? <Clock className="w-3 h-3 mr-1" /> :
                                                        <XCircle className="w-3 h-3 mr-1" />}
                                                {school.status.charAt(0).toUpperCase() + school.status.slice(1)}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => setSelectedSchool(school)}
                                                className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded-lg"
                                                title="Detail"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick View Modal */}
            {selectedSchool && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Detail Sekolah</h3>
                            <button onClick={() => setSelectedSchool(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* School Info */}
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                    <School className="w-7 h-7" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900">{selectedSchool.name}</h4>
                                    <p className="text-sm text-gray-500">{selectedSchool.email}</p>
                                    <span className={`mt-2 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${selectedSchool.status === 'active' ? 'bg-green-100 text-green-700' :
                                        selectedSchool.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {selectedSchool.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Admin */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-semibold text-gray-700">Admin Sekolah</span>
                                </div>
                                {selectedSchool.admin ? (
                                    <div>
                                        <p className="font-medium text-gray-900">{selectedSchool.admin.name}</p>
                                        <p className="text-sm text-gray-500">{selectedSchool.admin.email}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-orange-600">⚠️ Belum ada admin terdaftar</p>
                                )}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-blue-50 rounded-lg p-3 text-center">
                                    <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                    <p className="text-xl font-bold text-blue-700">{selectedSchool.registrations_count || 0}</p>
                                    <p className="text-xs text-blue-600">Total Pendaftar</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3 text-center">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
                                    <p className="text-xl font-bold text-green-700">{selectedSchool.verified_count || 0}</p>
                                    <p className="text-xs text-green-600">Terverifikasi</p>
                                </div>
                                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                                    <Clock className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                                    <p className="text-xl font-bold text-yellow-700">{selectedSchool.pending_count || 0}</p>
                                    <p className="text-xs text-yellow-600">Pending</p>
                                </div>
                            </div>

                            {/* Periode Aktif */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-semibold text-gray-700">Periode Aktif</span>
                                </div>
                                {selectedSchool.active_period ? (
                                    <div>
                                        <p className="font-medium text-green-700">{selectedSchool.active_period.name}</p>
                                        <p className="text-sm text-gray-500">TA {selectedSchool.active_period.academic_year}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-orange-600">⚠️ Tidak ada periode aktif</p>
                                )}
                            </div>

                            {/* Program Breakdown */}
                            {selectedSchool.program_breakdown && Object.keys(selectedSchool.program_breakdown).length > 0 && (
                                <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Breakdown per Program</p>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(selectedSchool.program_breakdown).map(([prog, count]) => (
                                            <span key={prog} className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium">
                                                {prog}: {count}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => setSelectedSchool(null)}
                                className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}