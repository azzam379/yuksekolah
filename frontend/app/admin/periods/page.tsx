'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, X, CalendarDays, Users, Link2, Copy, Check, ToggleLeft, ToggleRight, Trash2, Edit, RefreshCw, AlertTriangle } from 'lucide-react'
import { API_URL } from '@/lib/api'

interface Period {
    id: number
    name: string
    academic_year: string
    is_open: boolean
    quota: number | null
    registered_count: number
    registration_link: string
    programs: string[]
    created_at: string
    ended_at: string | null
}

export default function PeriodsPage() {
    const { token } = useAuth()
    const [periods, setPeriods] = useState<Period[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<number | null>(null)
    const [copiedId, setCopiedId] = useState<number | null>(null)

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showEndModal, setShowEndModal] = useState(false)
    const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        academic_year: '',
        quota: '',
        programs: [''],
        is_open: true
    })

    // API_URL imported from lib

    const fetchPeriods = async () => {
        try {
            setIsLoading(true)
            const response = await fetch(`${API_URL}/periods`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setPeriods(data.data || [])
            }
        } catch (error) {
            console.error('Error fetching periods:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (token) fetchPeriods()
    }, [token])

    // Create Period
    const handleCreate = async () => {
        try {
            setActionLoading(-1)
            const response = await fetch(`${API_URL}/periods`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    quota: formData.quota ? parseInt(formData.quota) : null,
                    programs: formData.programs.filter(p => p.trim() !== '')
                })
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message)
            setShowCreateModal(false)
            resetForm()
            fetchPeriods()
        } catch (error: any) {
            alert(error.message || 'Gagal membuat periode')
        } finally {
            setActionLoading(null)
        }
    }

    // Update Period
    const handleUpdate = async () => {
        if (!selectedPeriod) return
        try {
            setActionLoading(selectedPeriod.id)
            const response = await fetch(`${API_URL}/periods/${selectedPeriod.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    quota: formData.quota ? parseInt(formData.quota) : null,
                    programs: formData.programs.filter(p => p.trim() !== '')
                })
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message)
            setShowEditModal(false)
            fetchPeriods()
        } catch (error: any) {
            alert(error.message || 'Gagal update periode')
        } finally {
            setActionLoading(null)
        }
    }

    // Toggle Status
    const handleToggle = async (period: Period) => {
        if (period.ended_at) return // Cannot toggle ended periods
        try {
            setActionLoading(period.id)
            const response = await fetch(`${API_URL}/periods/${period.id}/toggle-status`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) fetchPeriods()
            else {
                const data = await response.json()
                alert(data.message || 'Gagal mengubah status')
            }
        } catch (error) {
            console.error('Error toggling:', error)
        } finally {
            setActionLoading(null)
        }
    }

    // End Period
    const handleEndPeriod = async () => {
        if (!selectedPeriod) return
        try {
            setActionLoading(selectedPeriod.id)
            const response = await fetch(`${API_URL}/periods/${selectedPeriod.id}/end`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                setShowEndModal(false)
                fetchPeriods()
            } else {
                const data = await response.json()
                alert(data.message || 'Gagal mengakhiri periode')
            }
        } catch (error) {
            console.error('Error ending period:', error)
        } finally {
            setActionLoading(null)
        }
    }

    // Delete Period
    const handleDelete = async () => {
        if (!selectedPeriod) return
        try {
            setActionLoading(selectedPeriod.id)
            const response = await fetch(`${API_URL}/periods/${selectedPeriod.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message)
            setShowDeleteModal(false)
            fetchPeriods()
        } catch (error: any) {
            alert(error.message || 'Gagal menghapus periode')
        } finally {
            setActionLoading(null)
        }
    }

    // Regenerate Link
    const handleRegenerateLink = async (period: Period) => {
        try {
            setActionLoading(period.id)
            const response = await fetch(`${API_URL}/periods/${period.id}/regenerate-link`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) fetchPeriods()
        } catch (error) {
            console.error('Error regenerating:', error)
        } finally {
            setActionLoading(null)
        }
    }

    // Copy Link
    const copyLink = (period: Period) => {
        const fullUrl = `${window.location.origin}/register/${period.registration_link}`
        navigator.clipboard.writeText(fullUrl)
        setCopiedId(period.id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    // Form helpers
    const resetForm = () => {
        setFormData({ name: '', academic_year: '', quota: '', programs: [''], is_open: true })
    }

    const openEditModal = (period: Period) => {
        setSelectedPeriod(period)
        setFormData({
            name: period.name,
            academic_year: period.academic_year,
            quota: period.quota?.toString() || '',
            programs: period.programs.length > 0 ? period.programs : [''],
            is_open: period.is_open
        })
        setShowEditModal(true)
    }

    const addProgram = () => {
        setFormData({ ...formData, programs: [...formData.programs, ''] })
    }

    const removeProgram = (index: number) => {
        setFormData({ ...formData, programs: formData.programs.filter((_, i) => i !== index) })
    }

    const updateProgram = (index: number, value: string) => {
        const newPrograms = [...formData.programs]
        newPrograms[index] = value
        setFormData({ ...formData, programs: newPrograms })
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Periode Pendaftaran</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola periode PPDB dan link pendaftaran.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowCreateModal(true) }}
                    className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Periode Baru
                </button>
            </div>

            {/* Periods Grid */}
            {isLoading ? (
                <div className="text-center py-10 text-gray-500">Memuat data...</div>
            ) : periods.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                    <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Belum ada periode pendaftaran.</p>
                    <button
                        onClick={() => { resetForm(); setShowCreateModal(true) }}
                        className="mt-4 text-indigo-600 font-medium hover:underline"
                    >
                        + Buat Periode Pertama
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {periods.map((period) => (
                        <div key={period.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Header */}
                            <div className={`p-4 border-b border-gray-100 ${period.ended_at ? 'bg-gray-50' : ''}`}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className={`font-bold ${period.ended_at ? 'text-gray-500' : 'text-gray-900'}`}>{period.name}</h3>
                                        <p className="text-sm text-gray-500">{period.academic_year}</p>
                                    </div>
                                    {period.ended_at ? (
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-600 border border-gray-300">
                                            Selesai
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleToggle(period)}
                                            disabled={actionLoading === period.id}
                                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition ${period.is_open
                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                }`}
                                        >
                                            {period.is_open ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                            {period.is_open ? 'Buka' : 'Tutup'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="p-4 bg-gray-50/50">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-gray-500 flex items-center"><Users className="w-4 h-4 mr-1" />Pendaftar</span>
                                    <span className="font-bold text-gray-900">
                                        {period.registered_count}{period.quota && ` / ${period.quota}`}
                                    </span>
                                </div>
                                {period.quota && (
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${period.registered_count >= period.quota ? 'bg-red-500' : 'bg-indigo-500'}`}
                                            style={{ width: `${Math.min(100, (period.registered_count / period.quota) * 100)}%` }}
                                        />
                                    </div>
                                )}
                                <div className="mt-3 flex flex-wrap gap-1">
                                    {period.programs.map((prog, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-100">
                                            {prog}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Link Section */}
                            <div className="p-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <Link2 className="w-4 h-4 text-gray-400" />
                                    <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                                        /register/{period.registration_link.substring(0, 12)}...
                                    </code>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => copyLink(period)}
                                        className="flex-1 flex items-center justify-center px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition"
                                    >
                                        {copiedId === period.id ? <Check className="w-3 h-3 mr-1 text-green-600" /> : <Copy className="w-3 h-3 mr-1" />}
                                        {copiedId === period.id ? 'Tersalin!' : 'Salin Link'}
                                    </button>
                                    <button
                                        onClick={() => handleRegenerateLink(period)}
                                        disabled={actionLoading === period.id}
                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                        title="Generate Link Baru"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-3 border-t border-gray-100 bg-gray-50/30 flex justify-end gap-1">
                                {!period.ended_at && (
                                    <>
                                        <button
                                            onClick={() => openEditModal(period)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => { setSelectedPeriod(period); setShowEndModal(true) }}
                                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                                            title="Akhiri Periode"
                                        >
                                            <CalendarDays className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => { setSelectedPeriod(period); setShowDeleteModal(true) }}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                    title="Hapus"
                                    disabled={period.registered_count > 0}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {(showCreateModal || showEditModal) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                {showCreateModal ? 'Buat Periode Baru' : 'Edit Periode'}
                            </h3>
                            <button onClick={() => { setShowCreateModal(false); setShowEditModal(false) }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Periode</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: PPDB 2024/2025"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: 2024/2025"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.academic_year}
                                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kuota (opsional)</label>
                                <input
                                    type="number"
                                    placeholder="Kosongkan jika tidak terbatas"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.quota}
                                    onChange={(e) => setFormData({ ...formData, quota: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jurusan/Program</label>
                                {formData.programs.map((prog, i) => (
                                    <div key={i} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            placeholder={`Jurusan ${i + 1}`}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                            value={prog}
                                            onChange={(e) => updateProgram(i, e.target.value)}
                                        />
                                        {formData.programs.length > 1 && (
                                            <button onClick={() => removeProgram(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button onClick={addProgram} className="text-sm text-indigo-600 font-medium hover:underline">
                                    + Tambah Jurusan
                                </button>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => { setShowCreateModal(false); setShowEditModal(false) }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={showCreateModal ? handleCreate : handleUpdate}
                                disabled={actionLoading !== null}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {actionLoading !== null ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedPeriod && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Hapus Periode?</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">
                            Apakah Anda yakin ingin menghapus periode <span className="font-semibold">{selectedPeriod.name}</span>?
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={actionLoading === selectedPeriod.id}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {actionLoading === selectedPeriod.id ? 'Menghapus...' : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* End Period Modal */}
            {showEndModal && selectedPeriod && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Akhiri Periode?</h3>
                                <p className="text-sm text-gray-500">{selectedPeriod.name}</p>
                            </div>
                        </div>
                        <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-6">
                            <p className="text-sm text-orange-700">
                                <strong>⚠️ Perhatian:</strong> Periode yang sudah diakhiri <strong>tidak dapat dibuka kembali</strong>. Anda hanya bisa melihat data dan laporan yang sudah ada.
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Total Pendaftar</p>
                                    <p className="font-bold text-gray-900">{selectedPeriod.registered_count}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Kuota</p>
                                    <p className="font-bold text-gray-900">{selectedPeriod.quota || 'Tidak terbatas'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowEndModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleEndPeriod}
                                disabled={actionLoading === selectedPeriod.id}
                                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                            >
                                {actionLoading === selectedPeriod.id ? 'Mengakhiri...' : 'Ya, Akhiri Periode'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Popup - Bottom Right */}
            {copiedId && (
                <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
                    <div className="flex items-center gap-3 px-5 py-3 bg-green-600 text-white rounded-xl shadow-2xl">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Link Berhasil Disalin!</p>
                            <p className="text-xs text-green-100">Bagikan link ini kepada calon siswa</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
