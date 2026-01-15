'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { User, Lock, Settings, Save, AlertTriangle } from 'lucide-react'

export default function SettingsPage() {
    const { user, token } = useAuth()
    const [activeTab, setActiveTab] = useState('profile')

    // Form states
    const [profileData, setProfileData] = useState({
        school_name: '',
        phone: '',
        address: ''
    })

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    })

    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [isMaintenance, setIsMaintenance] = useState(false)

    // Fetch Settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/settings`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (response.ok) {
                    const data = await response.json()
                    setProfileData({
                        school_name: data.school?.name || '',
                        phone: data.school?.phone || '',
                        address: data.school?.address || ''
                    })
                    setIsMaintenance(data.is_maintenance)
                }
            } catch (error) {
                console.error('Error fetching settings:', error)
            }
        }
        if (token) fetchSettings()
    }, [token])

    // Handlers
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        // Feature not requested yet in backend, omitting implementation or adding TODO
        setMessage({ type: 'error', text: 'Fitur update profil belum tersedia.' })
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordData.new_password !== passwordData.confirm_password) {
            setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok.' })
            return
        }

        setIsLoading(true)
        setMessage(null)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/settings/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    current_password: passwordData.current_password,
                    new_password: passwordData.new_password,
                    new_password_confirmation: passwordData.confirm_password
                })
            })

            const data = await response.json()

            if (response.ok) {
                setMessage({ type: 'success', text: 'Password berhasil diperbarui.' })
                setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
            } else {
                setMessage({ type: 'error', text: data.message || 'Gagal memperbarui password.' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Terjadi kesalahan koneksi.' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleMaintenanceToggle = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/settings/maintenance`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            if (response.ok) {
                setIsMaintenance(data.is_maintenance)
                setMessage({ type: 'success', text: data.message })
            } else {
                setMessage({ type: 'error', text: data.message || 'Gagal mengubah mode maintenance.' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Terjadi kesalahan koneksi.' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen animate-fade-in-up">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
                <p className="text-gray-600">Kelola profil sekolah, keamanan akun, dan preferensi sistem.</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'profile' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        <User className="w-4 h-4" /> Profil Sekolah
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'security' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        <Lock className="w-4 h-4" /> Keamanan Akun
                    </button>
                    <button
                        onClick={() => setActiveTab('system')}
                        className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'system' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        <Settings className="w-4 h-4" /> Sistem
                    </button>
                </div>

                <div className="p-6">
                    {/* Message Alert */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            {message.type === 'error' && <AlertTriangle className="w-5 h-5" />}
                            <p>{message.text}</p>
                        </div>
                    )}

                    {/* Tab Content: Profile */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleUpdateProfile} className="max-w-2xl">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Sekolah</label>
                                    <input
                                        type="text"
                                        value={profileData.school_name}
                                        onChange={(e) => setProfileData({ ...profileData, school_name: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                                        readOnly // Currently school name likely managed by superadmin
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Hubungi Super Admin untuk mengubah nama sekolah.</p>
                                </div>
                                <div className="pt-4">
                                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2" disabled={isLoading}>
                                        <Save className="w-4 h-4" /> Simpan Perubahan
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Tab Content: Security */}
                    {activeTab === 'security' && (
                        <form onSubmit={handleUpdatePassword} className="max-w-2xl">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
                                    <input
                                        type="password"
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                                    <input
                                        type="password"
                                        value={passwordData.new_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirm_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div className="pt-4">
                                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2" disabled={isLoading}>
                                        <Lock className="w-4 h-4" /> Ganti Password
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Tab Content: System */}
                    {activeTab === 'system' && (
                        <div className="max-w-2xl">
                            <div className={`border rounded-xl p-6 ${isMaintenance ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'}`}>
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-full ${isMaintenance ? 'bg-red-100' : 'bg-yellow-100'}`}>
                                        <AlertTriangle className={`w-6 h-6 ${isMaintenance ? 'text-red-600' : 'text-yellow-600'}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            {isMaintenance ? 'Mode Maintenance AKTIF' : 'Mode Maintenance (Jeda Pendaftaran)'}
                                        </h3>
                                        <p className="text-gray-600 mb-4 text-sm">
                                            {isMaintenance
                                                ? 'Semua pendaftaran sedang DITUTUP sementara. Calon siswa tidak dapat mendaftar. Nonaktifkan fitur ini untuk membuka kembali pendaftaran sesuai periode yang berlaku.'
                                                : 'Aktifkan mode ini untuk menutup sementara semua periode pendaftaran yang sedang aktif. Calon siswa tidak akan bisa mendaftar selama mode ini aktif.'}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={handleMaintenanceToggle}
                                                className={`px-4 py-2 rounded-lg text-white font-medium text-sm disabled:opacity-50 ${isMaintenance ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
                                                disabled={isLoading}
                                            >
                                                {isMaintenance ? 'Matikan Mode Maintenance' : 'Aktifkan Jeda Pendaftaran'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
