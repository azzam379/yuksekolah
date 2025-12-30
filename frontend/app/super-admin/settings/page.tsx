'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Save, AlertTriangle } from 'lucide-react'

export default function SettingsPage() {
    const { token } = useAuth()
    const [settings, setSettings] = useState({
        maintenance_mode: false,
        allow_registration: true
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (token) fetchSettings()
    }, [token])

    const fetchSettings = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            setSettings(data)
        } catch (error) {
            console.error('Failed to load settings:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setIsSaving(true)
            const response = await fetch('http://localhost:8000/api/settings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            })

            if (response.ok) {
                alert('Pengaturan berhasil disimpan!')
            } else {
                throw new Error('Gagal menyimpan')
            }
        } catch (error) {
            alert('Gagal menyimpan pengaturan.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">System Settings</h1>

            <div className="bg-white rounded-xl shadow overflow-hidden max-w-2xl">
                <div className="p-6 space-y-8">

                    {/* Maintenance Mode */}
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">Maintenance Mode</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Jika aktif, hanya Super Admin yang bisa login. User lain akan ditolak.
                            </p>
                        </div>
                        <div className="ml-4">
                            <button
                                onClick={() => setSettings(s => ({ ...s, maintenance_mode: !s.maintenance_mode }))}
                                className={`
                  relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                  ${settings.maintenance_mode ? 'bg-red-600' : 'bg-gray-200'}
                `}
                            >
                                <span className={`
                  pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
                  ${settings.maintenance_mode ? 'translate-x-5' : 'translate-x-0'}
                `} />
                            </button>
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Registration Lock */}
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">Izinkan Pendaftaran Sekolah Baru</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Matikan opsi ini jika Anda ingin menghentikan sementara pendaftaran sekolah baru.
                            </p>
                        </div>
                        <div className="ml-4">
                            <button
                                onClick={() => setSettings(s => ({ ...s, allow_registration: !s.allow_registration }))}
                                className={`
                  relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                  ${settings.allow_registration ? 'bg-green-600' : 'bg-gray-200'}
                `}
                            >
                                <span className={`
                  pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
                  ${settings.allow_registration ? 'translate-x-5' : 'translate-x-0'}
                `} />
                            </button>
                        </div>
                    </div>

                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </div>
        </div>
    )
}