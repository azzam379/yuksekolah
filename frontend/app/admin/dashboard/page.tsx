'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Users, UserPlus, Calendar, ArrowRight, TrendingUp, Link2, Copy, Check, AlertTriangle, CalendarX, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface ActivePeriod {
  id: number
  name: string
  academic_year: string
  is_open: boolean
  quota: number | null
  registered_count: number
  remaining_quota: number | null
  programs: string[]
  registration_link: string
}

interface DashboardData {
  stats: {
    total_registrations: number
    pending_verification: number
    verified: number
    today_registrations: number
  }
  recent_registrations: any[]
}

export default function SchoolAdminDashboard() {
  const { user, token } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [activePeriod, setActivePeriod] = useState<ActivePeriod | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showEndModal, setShowEndModal] = useState(false)
  const [endingPeriod, setEndingPeriod] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

  useEffect(() => {
    if (!token) return

    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch active period
        const periodRes = await fetch(`${API_URL}/periods/active`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (periodRes.ok) {
          const periodData = await periodRes.json()
          setActivePeriod(periodData.data)
        }

        // Fetch dashboard stats
        const statsRes = await fetch(`${API_URL}/dashboard/school-stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setData(statsData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token])

  const getRegistrationLink = () => {
    if (!activePeriod?.registration_link) return ''
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/register/${activePeriod.registration_link}`
    }
    return ''
  }

  const copyLink = () => {
    const link = getRegistrationLink()
    if (link) {
      navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleEndPeriod = async () => {
    if (!activePeriod) return
    try {
      setEndingPeriod(true)
      const response = await fetch(`${API_URL}/periods/${activePeriod.id}/end`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        setActivePeriod(null)
        setShowEndModal(false)
      }
    } catch (error) {
      console.error('Error ending period:', error)
    } finally {
      setEndingPeriod(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 text-sm font-medium">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Selamat datang, <span className="font-semibold text-indigo-600">{user?.name}</span>!
        </p>
      </div>

      {/* Active Period Card */}
      {activePeriod ? (
        <div className="mb-8 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-green-400/20 text-green-100 text-xs font-bold rounded-full border border-green-300/30">
                    ● AKTIF
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold">{activePeriod.name}</h2>
                <p className="text-indigo-100">Tahun Ajaran {activePeriod.academic_year}</p>
              </div>

              {/* Quota Progress */}
              {activePeriod.quota && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[200px]">
                  <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold mb-1">Kuota Terisi</p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-extrabold">{activePeriod.registered_count}</span>
                    <span className="text-indigo-200 pb-1">/ {activePeriod.quota}</span>
                  </div>
                  <div className="mt-2 w-full bg-white/20 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-white transition-all"
                      style={{ width: `${Math.min(100, (activePeriod.registered_count / activePeriod.quota) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Registration Link */}
            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold mb-2">Link Pendaftaran</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <code className="flex-1 text-sm font-mono text-white bg-black/20 px-3 py-2 rounded-lg truncate">
                  {getRegistrationLink()}
                </code>
                <div className="flex gap-2">
                  <button
                    onClick={copyLink}
                    className="flex items-center px-4 py-2 bg-white text-indigo-600 rounded-lg font-bold text-sm hover:bg-indigo-50 transition"
                  >
                    {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                    {copied ? 'Tersalin!' : 'Salin'}
                  </button>
                  <button
                    onClick={() => window.open(getRegistrationLink(), '_blank')}
                    className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
                    title="Buka Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/admin/periods" className="text-sm text-indigo-200 hover:text-white transition flex items-center">
                <Calendar className="w-4 h-4 mr-1" /> Kelola Periode
              </Link>
              <button
                onClick={() => setShowEndModal(true)}
                className="text-sm text-red-200 hover:text-red-100 transition flex items-center"
              >
                <CalendarX className="w-4 h-4 mr-1" /> Akhiri Periode
              </button>
            </div>
          </div>
        </div>
      ) : (
        // No Active Period
        <div className="mb-8 bg-yellow-50 border-2 border-dashed border-yellow-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Tidak Ada Periode Aktif</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Buat atau aktifkan periode pendaftaran untuk mulai menerima siswa baru.
          </p>
          <Link
            href="/admin/periods"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Kelola Periode PPDB
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUp className="w-3 h-3 mr-1" />Live
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900 mb-1">{data?.stats?.total_registrations || 0}</h3>
          <p className="text-sm font-medium text-gray-500">Total Pendaftar</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
              <UserPlus className="w-6 h-6" />
            </div>
            {(data?.stats?.pending_verification || 0) > 0 && (
              <span className="flex items-center text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-lg animate-pulse">
                Perlu Aksi
              </span>
            )}
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900 mb-1">{data?.stats?.pending_verification || 0}</h3>
          <p className="text-sm font-medium text-gray-500">Menunggu Verifikasi</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
              <Check className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900 mb-1">{data?.stats?.verified || 0}</h3>
          <p className="text-sm font-medium text-gray-500">Siswa Terverifikasi</p>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/40">
          <h3 className="font-bold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
            Pendaftaran Terbaru
          </h3>
          <Link href="/admin/students" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center">
            Lihat Semua <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
        <div>
          {data?.recent_registrations && data.recent_registrations.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {data.recent_registrations.slice(0, 5).map((reg: any) => (
                <div key={reg.id} className="p-4 flex items-center hover:bg-white/60 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center font-bold text-sm mr-4 border-2 border-white shadow-sm">
                    {reg.student?.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{reg.student?.name || 'Nama Tidak Tersedia'}</p>
                    <p className="text-xs text-gray-500 truncate">{reg.student?.email || '-'}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wide rounded-full ${reg.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' :
                    reg.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {reg.status === 'submitted' ? 'PENDING' : reg.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 text-sm">
              Belum ada pendaftaran siswa baru.
            </div>
          )}
        </div>
      </div>

      {/* End Period Modal */}
      {showEndModal && activePeriod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Akhiri Periode?</h3>
                <p className="text-sm text-gray-500">{activePeriod.name}</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">
                <strong>⚠️ Perhatian:</strong> Periode yang sudah diakhiri <strong>tidak dapat dibuka kembali</strong>. Anda hanya bisa melihat laporan dan data yang sudah ada.
              </p>
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
                disabled={endingPeriod}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {endingPeriod ? 'Mengakhiri...' : 'Ya, Akhiri Periode'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}