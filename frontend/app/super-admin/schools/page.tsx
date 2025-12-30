'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Search, Building2, CheckCircle, XCircle, Clock } from 'lucide-react'

// Reuse types if possible, or define here
interface School {
    id: number
    name: string
    email: string
    status: 'pending' | 'active' | 'inactive' | 'rejected'
    created_at: string
    phone?: string
    address?: string
}

export default function SchoolsPage() {
    const { token } = useAuth()
    const [schools, setSchools] = useState<School[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const fetchSchools = async () => {
        try {
            setIsLoading(true)
            // We reusing the existing endpoint, but we might need to adjust it to support "all" statuses properly via query params
            // Previously: Route::get('/schools', [SchoolController::class, 'index']) -> usually returns all for superadmin

            const response = await fetch('http://localhost:8000/api/schools', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            // Ideally API should handle filtering, but for MVP client-side is fine if dataset < 1000
            setSchools(data.data || data)
        } catch (error) {
            console.error('Error fetching schools:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (token) fetchSchools()
    }, [token])

    // Client-side filtering
    const filteredSchools = schools.filter(school => {
        const matchesSearch = school.name.toLowerCase().includes(search.toLowerCase()) ||
            school.email.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'all' || school.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'rejected': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Manajemen Sekolah</h1>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari nama sekolah atau email..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    {['all', 'active', 'pending', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors
                        ${statusFilter === status
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }
                    `}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    <div className="col-span-full text-center py-12">Memuat data sekolah...</div>
                ) : filteredSchools.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">Tidak ada sekolah ditemukan matching filter.</div>
                ) : (
                    filteredSchools.map((school) => (
                        <div key={school.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(school.status)}`}>
                                        {school.status}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{school.name}</h3>
                                <p className="text-sm text-gray-500 mb-4">{school.email}</p>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                        <span>Daftar: {new Date(school.created_at).toLocaleDateString('id-ID')}</span>
                                    </div>
                                    {school.address && (
                                        <p className="line-clamp-2">{school.address}</p>
                                    )}
                                </div>
                            </div>
                            {/* Action Footer (Optional, can just list/read-only or link to detail) */}
                            {/* <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                        <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">Lihat Detail</button>
                    </div> */}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}