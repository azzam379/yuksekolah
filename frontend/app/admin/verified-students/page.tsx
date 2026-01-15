'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Search, Filter, CheckCircle, XCircle, Eye, Mail, Phone, Calendar, X, Check, User, MapPin, GraduationCap } from 'lucide-react'

interface Registration {
    id: number
    student_id: number
    program: string
    academic_year: string
    status: 'submitted' | 'verified' | 'rejected'
    created_at: string
    period_id: number | null
    period?: {
        id: number
        name: string
        academic_year: string
    }
    form_data: {
        name: string
        email: string
        phone: string
        birth_place?: string
        birth_date?: string
        gender?: string
        address?: string
        province?: string
        city?: string
        postal_code?: string
        previous_school?: string
        previous_school_year?: string
        program?: string
        father_name?: string
        father_phone?: string
        father_job?: string
        mother_name?: string
        mother_phone?: string
        mother_job?: string
    }
    student?: {
        id: number
        name: string
        email: string
    }
}

interface Period {
    id: number
    name: string
    academic_year: string
    is_open: boolean
    ended_at: string | null
}

export default function VerifiedStudentsPage() {
    const { token } = useAuth()
    const [registrations, setRegistrations] = useState<Registration[]>([])
    const [periods, setPeriods] = useState<Period[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [periodFilter, setPeriodFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    // Modal states
    const [selectedReg, setSelectedReg] = useState<Registration | null>(null)
    const [showDetailModal, setShowDetailModal] = useState(false)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

    // Fetch periods for filter dropdown
    const fetchPeriods = async () => {
        try {
            const response = await fetch(`${API_URL}/periods`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                const sorted = (data.data || []).sort((a: Period, b: Period) => {
                    if (a.is_open && !b.is_open) return -1
                    if (!a.is_open && b.is_open) return 1
                    return 0
                })
                setPeriods(sorted)
            }
        } catch (error) {
            console.error('Error fetching periods:', error)
        }
    }

    const fetchVerifiedStudents = async () => {
        try {
            setIsLoading(true)
            let url = `${API_URL}/registrations?status=verified`
            if (periodFilter !== 'all') {
                url += `&period_id=${periodFilter}`
            }

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                // Filter only verified manually if API doesn't support status param yet
                // But assuming we will filter client side if needed or update API
                // Let's filter client side for safety first since we use same endpoint
                const allRegs = data.data || []
                const verifiedOnly = allRegs.filter((r: Registration) => r.status === 'verified')
                setRegistrations(verifiedOnly)
            }
        } catch (error) {
            console.error('Error fetching students:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (token) {
            fetchPeriods()
            fetchVerifiedStudents()
        }
    }, [token, periodFilter])

    // Open detail modal
    const openDetailModal = (reg: Registration) => {
        setSelectedReg(reg)
        setShowDetailModal(true)
    }

    const filteredRegs = registrations.filter(reg => {
        const name = reg.form_data?.name || reg.student?.name || ''
        const email = reg.form_data?.email || reg.student?.email || ''
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
    })

    return (
        <div className="min-h-screen animate-fade-in-up">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Siswa Aktif (Terverifikasi)</h1>
                <p className="text-gray-600">Daftar siswa yang telah resmi diterima.</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cari nama atau email..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-gray-400 w-5 h-5" />
                    <select
                        className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                        value={periodFilter}
                        onChange={(e) => setPeriodFilter(e.target.value)}
                    >
                        <option value="all">Semua Periode</option>
                        {periods.map((period) => (
                            <option key={period.id} value={period.id}>
                                {period.name} ({period.academic_year})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Siswa</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Program</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal Diterima</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Memuat data...</td></tr>
                            ) : filteredRegs.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Tidak ada siswa aktif ditemukan.</td></tr>
                            ) : (
                                filteredRegs.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                                                    {(reg.form_data?.name || reg.student?.name || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{reg.form_data?.name || reg.student?.name}</div>
                                                    <div className="text-xs text-gray-500 flex items-center">
                                                        <Mail className="w-3 h-3 mr-1" />{reg.form_data?.email || reg.student?.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-700">{reg.program}</span>
                                            <div className="text-xs text-gray-500">{reg.academic_year}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {/* Assuming verified_at is not available, using created_at for now, or update backend to send verified_at */}
                                            {new Date(reg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                                Aktif
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-1">
                                                <button onClick={() => openDetailModal(reg)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Detail">
                                                    <Eye className="w-4 h-4" />
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

            {/* Detail Modal */}
            {showDetailModal && selectedReg && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
                            <h3 className="text-lg font-bold text-gray-900">Detail Siswa</h3>
                            <button onClick={() => { setShowDetailModal(false); setSelectedReg(null) }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Data Diri */}
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <h4 className="font-bold text-blue-800 flex items-center gap-2 mb-3">
                                    <User className="w-4 h-4" /> Data Diri
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-500">Nama Lengkap</span><p className="font-medium text-gray-900">{selectedReg.form_data.name}</p></div>
                                    <div><span className="text-gray-500">Email</span><p className="font-medium text-gray-900">{selectedReg.form_data.email}</p></div>
                                    <div><span className="text-gray-500">No. HP</span><p className="font-medium text-gray-900">{selectedReg.form_data.phone}</p></div>
                                    <div><span className="text-gray-500">Jenis Kelamin</span><p className="font-medium text-gray-900">{selectedReg.form_data.gender === 'male' ? 'Laki-laki' : selectedReg.form_data.gender === 'female' ? 'Perempuan' : '-'}</p></div>
                                    <div><span className="text-gray-500">Tempat Lahir</span><p className="font-medium text-gray-900">{selectedReg.form_data.birth_place || '-'}</p></div>
                                    <div><span className="text-gray-500">Tanggal Lahir</span><p className="font-medium text-gray-900">{selectedReg.form_data.birth_date || '-'}</p></div>
                                </div>
                            </div>

                            {/* Data Pendidikan */}
                            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                                <h4 className="font-bold text-purple-800 flex items-center gap-2 mb-3">
                                    <GraduationCap className="w-4 h-4" /> Data Pendidikan
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-500">Program/Jurusan</span><p className="font-medium text-gray-900">{selectedReg.form_data.program || selectedReg.program}</p></div>
                                    <div><span className="text-gray-500">Tahun Ajaran</span><p className="font-medium text-gray-900">{selectedReg.academic_year}</p></div>
                                    <div><span className="text-gray-500">Sekolah Asal</span><p className="font-medium text-gray-900">{selectedReg.form_data.previous_school || '-'}</p></div>
                                    <div><span className="text-gray-500">Tahun Lulus</span><p className="font-medium text-gray-900">{selectedReg.form_data.previous_school_year || '-'}</p></div>
                                </div>
                            </div>

                            {/* Alamat */}
                            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                <h4 className="font-bold text-green-800 flex items-center gap-2 mb-3">
                                    <MapPin className="w-4 h-4" /> Alamat
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="col-span-2"><span className="text-gray-500">Alamat Lengkap</span><p className="font-medium text-gray-900">{selectedReg.form_data.address || '-'}</p></div>
                                    <div><span className="text-gray-500">Provinsi</span><p className="font-medium text-gray-900">{selectedReg.form_data.province || '-'}</p></div>
                                    <div><span className="text-gray-500">Kota/Kabupaten</span><p className="font-medium text-gray-900">{selectedReg.form_data.city || '-'}</p></div>
                                    <div><span className="text-gray-500">Kode Pos</span><p className="font-medium text-gray-900">{selectedReg.form_data.postal_code || '-'}</p></div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => { setShowDetailModal(false); setSelectedReg(null) }}
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
