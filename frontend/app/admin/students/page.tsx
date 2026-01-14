'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Search, Filter, CheckCircle, XCircle, Eye, Mail, Phone, Calendar, X, Check } from 'lucide-react'

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
        address?: string
        previous_school?: string
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

export default function StudentsManagementPage() {
    const { token } = useAuth()
    const [registrations, setRegistrations] = useState<Registration[]>([])
    const [periods, setPeriods] = useState<Period[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('all')
    const [periodFilter, setPeriodFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

    // Modal states
    const [selectedReg, setSelectedReg] = useState<Registration | null>(null)
    const [actionModal, setActionModal] = useState<{ type: 'verify' | 'reject', reg: Registration } | null>(null)
    const [notes, setNotes] = useState('')
    const [actionLoading, setActionLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Fetch periods for filter dropdown
    const fetchPeriods = async () => {
        try {
            const response = await fetch(`${API_URL}/periods`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                // Sort: active first, then by created_at
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

    const fetchRegistrations = async () => {
        try {
            setIsLoading(true)
            let url = `${API_URL}/registrations`
            if (periodFilter !== 'all') {
                url += `?period_id=${periodFilter}`
            }
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!response.ok) throw new Error('Gagal mengambil data')
            const data = await response.json()
            setRegistrations(data.data || [])
        } catch (error) {
            console.error('Error:', error)
            setRegistrations([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (token) {
            fetchPeriods()
        }
    }, [token])

    useEffect(() => {
        if (token) fetchRegistrations()
    }, [token, periodFilter])

    // Update status (verify/reject)
    const handleUpdateStatus = async () => {
        if (!actionModal) return
        setActionLoading(true)
        try {
            const response = await fetch(`http://localhost:8000/api/registrations/${actionModal.reg.id}/status`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: actionModal.type === 'verify' ? 'verified' : 'rejected',
                    notes: notes
                })
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Gagal update status')
            setMessage({ type: 'success', text: actionModal.type === 'verify' ? 'Siswa berhasil diverifikasi!' : 'Pendaftaran ditolak.' })
            setActionModal(null)
            setNotes('')
            fetchRegistrations()
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setActionLoading(false)
        }
    }

    const filteredRegs = registrations.filter(reg => {
        const name = reg.form_data?.name || reg.student?.name || ''
        const email = reg.form_data?.email || reg.student?.email || ''
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || reg.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified': return 'bg-green-100 text-green-700'
            case 'rejected': return 'bg-red-100 text-red-700'
            default: return 'bg-yellow-100 text-yellow-700'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'verified': return 'Terverifikasi'
            case 'rejected': return 'Ditolak'
            default: return 'Menunggu'
        }
    }

    return (
        <div className="min-h-screen">
            {/* Toast */}
            {message && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white flex items-center gap-2`}>
                    {message.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    <span>{message.text}</span>
                    <button onClick={() => setMessage(null)} className="ml-2"><X className="w-4 h-4" /></button>
                </div>
            )}

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Daftar Pendaftar</h1>
                <p className="text-sm text-gray-500 mt-1">Kelola dan verifikasi pendaftaran siswa baru.</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border shadow-sm mb-6">
                <div className="p-4 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau email..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <select
                            className="p-2 border rounded-lg text-sm min-w-[180px]"
                            value={periodFilter}
                            onChange={(e) => setPeriodFilter(e.target.value)}
                        >
                            <option value="all">Semua Periode</option>
                            {periods.map((period) => (
                                <option key={period.id} value={period.id}>
                                    {period.is_open ? '★ ' : ''}{period.name} {period.ended_at ? '(Selesai)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            className="p-2 border rounded-lg text-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Semua Status</option>
                            <option value="submitted">Menunggu Verifikasi</option>
                            <option value="verified">Terverifikasi</option>
                            <option value="rejected">Ditolak</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Siswa</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Program</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tanggal Daftar</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Memuat data...</td></tr>
                            ) : filteredRegs.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Tidak ada data pendaftaran.</td></tr>
                            ) : (
                                filteredRegs.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
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
                                            {new Date(reg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(reg.status)}`}>
                                                {getStatusText(reg.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-1">
                                                <button onClick={() => setSelectedReg(reg)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Detail">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {reg.status === 'submitted' && (
                                                    <>
                                                        <button onClick={() => setActionModal({ type: 'verify', reg })} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Verifikasi">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setActionModal({ type: 'reject', reg })} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Tolak">
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
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
            {selectedReg && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Detail Pendaftar</h3>
                            <button onClick={() => setSelectedReg(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-xs text-gray-500 uppercase">Nama</p><p className="font-medium">{selectedReg.form_data?.name}</p></div>
                                <div><p className="text-xs text-gray-500 uppercase">Email</p><p className="font-medium">{selectedReg.form_data?.email}</p></div>
                                <div><p className="text-xs text-gray-500 uppercase">Telepon</p><p className="font-medium">{selectedReg.form_data?.phone || '-'}</p></div>
                                <div><p className="text-xs text-gray-500 uppercase">Program</p><p className="font-medium">{selectedReg.program}</p></div>
                                {selectedReg.form_data?.birth_place && (
                                    <div><p className="text-xs text-gray-500 uppercase">TTL</p><p className="font-medium">{selectedReg.form_data.birth_place}, {selectedReg.form_data.birth_date}</p></div>
                                )}
                                {selectedReg.form_data?.address && (
                                    <div className="col-span-2"><p className="text-xs text-gray-500 uppercase">Alamat</p><p className="font-medium">{selectedReg.form_data.address}</p></div>
                                )}
                                {selectedReg.form_data?.previous_school && (
                                    <div className="col-span-2"><p className="text-xs text-gray-500 uppercase">Sekolah Sebelumnya</p><p className="font-medium">{selectedReg.form_data.previous_school}</p></div>
                                )}
                            </div>
                            <div className="pt-4 border-t">
                                <p className="text-xs text-gray-500 uppercase mb-2">Status</p>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(selectedReg.status)}`}>
                                    {getStatusText(selectedReg.status)}
                                </span>
                            </div>
                        </div>
                        {selectedReg.status === 'submitted' && (
                            <div className="p-6 border-t bg-gray-50 flex gap-2">
                                <button onClick={() => { setSelectedReg(null); setActionModal({ type: 'verify', reg: selectedReg }) }} className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">Verifikasi</button>
                                <button onClick={() => { setSelectedReg(null); setActionModal({ type: 'reject', reg: selectedReg }) }} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Tolak</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Action Modal */}
            {actionModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {actionModal.type === 'verify' ? '✅ Verifikasi Pendaftaran?' : '❌ Tolak Pendaftaran?'}
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {actionModal.type === 'verify'
                                    ? `Apakah Anda yakin ingin memverifikasi pendaftaran ${actionModal.reg.form_data?.name}?`
                                    : `Apakah Anda yakin ingin menolak pendaftaran ${actionModal.reg.form_data?.name}?`}
                            </p>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
                                <textarea
                                    className="w-full p-2 border rounded-lg text-sm"
                                    rows={3}
                                    placeholder="Tambahkan catatan..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setActionModal(null); setNotes('') }} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
                                <button
                                    onClick={handleUpdateStatus}
                                    disabled={actionLoading}
                                    className={`flex-1 py-2 text-white rounded-lg font-medium disabled:opacity-50 ${actionModal.type === 'verify' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                >
                                    {actionLoading ? 'Memproses...' : actionModal.type === 'verify' ? 'Ya, Verifikasi' : 'Ya, Tolak'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
