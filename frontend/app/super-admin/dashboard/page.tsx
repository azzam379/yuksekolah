'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface School {
  id: number
  name: string
  email: string
  status: 'pending' | 'active' | 'inactive'
  created_at: string
}

interface DashboardStats {
  total_schools: number
  pending_schools: number
  active_schools: number
  total_registrations: number
}

export default function SuperAdminDashboard() {
  const { user, token, logout } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pendingSchools, setPendingSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [modalType, setModalType] = useState<'approve' | 'reject' | 'success_approve' | null>(null)
  const [generatedLink, setGeneratedLink] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')



  // Fetch dashboard data
  useEffect(() => {
    if (!token) return

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)

        // Fetch stats
        const statsResponse = await fetch('http://localhost:8000/api/dashboard/super-admin', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!statsResponse.ok) throw new Error('Failed to fetch stats')
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
        setPendingSchools(statsData.pending_schools || [])

      } catch (err: any) {
        setError(err.message || 'Gagal memuat data dashboard')
        console.error('Dashboard error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [token])

  const openActionModal = (school: School, type: 'approve' | 'reject') => {
    setSelectedSchool(school)
    setModalType(type)
  }

  const closeModal = () => {
    setModalType(null)
    setSelectedSchool(null)
    setGeneratedLink('')
    // If we closed a success modal, reload data
    if (modalType === 'success_approve') {
      window.location.reload()
    }
  }

  const executeAction = async () => {
    if (!token || !selectedSchool || !modalType) return

    try {
      setActionLoading(true)
      const endpoint = modalType === 'approve' ? 'verify' : 'reject'
      const body = modalType === 'approve'
        ? { notes: 'Verified by super admin' }
        : { reason: 'Rejected by super admin' } // Simplified for now

      const response = await fetch(`http://localhost:8000/api/schools/${selectedSchool.id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const result = await response.json()

        if (modalType === 'approve') {
          // Show success modal with link
          setGeneratedLink(result.registration_link)
          setModalType('success_approve')
        } else {
          // Reject success
          alert('Sekolah berhasil ditolak.')
          window.location.reload()
        }
      } else {
        throw new Error('Gagal memproses aksi')
      }
    } catch (error) {
      console.error('Action error:', error)
      alert('Terjadi kesalahan sistem.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Memuat dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Greeting Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">Overview</span>
        </h1>
        <p className="mt-2 text-gray-600">Selamat datang kembali, Super Admin. Berikut ringkasan sistem hari ini.</p>
      </div>

      <main className="max-w-7xl mx-auto py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all transform hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-500 text-sm font-medium">Total Sekolah</div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{stats?.total_schools || 0}</div>
            <div className="text-xs text-gray-400 mt-1">Terdaftar sistem</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all transform hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-500 text-sm font-medium">Menunggu Verifikasi</div>
              <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-600">{stats?.pending_schools || 0}</div>
            <div className="text-xs text-gray-400 mt-1">Perlu tindakan</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all transform hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-500 text-sm font-medium">Sekolah Aktif</div>
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600">{stats?.active_schools || 0}</div>
            <div className="text-xs text-gray-400 mt-1">Beroperasi normal</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all transform hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-500 text-sm font-medium">Total Pendaftar</div>
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-600">{stats?.total_registrations || 0}</div>
            <div className="text-xs text-gray-400 mt-1">Siswa terdaftar</div>
          </div>
        </div>

        {/* Pending Schools Section */}
        <div className="bg-white rounded-xl shadow overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Sekolah Menunggu Verifikasi</h2>
            <p className="text-sm text-gray-600 mt-1">Approve atau reject pendaftaran sekolah baru</p>
          </div>

          {pendingSchools.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Tidak ada sekolah yang menunggu verifikasi
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Sekolah</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Daftar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingSchools.map((school) => (
                    <tr key={school.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{school.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{school.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {new Date(school.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openActionModal(school, 'approve')}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition mr-2"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openActionModal(school, 'reject')}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/super-admin/schools"
              className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition"
            >
              Lihat Semua Sekolah
            </Link>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
              Export Data
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
              System Settings
            </button>
          </div>
        </div>
        {/* Modal Overlay */}
        {modalType && selectedSchool && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-fadeIn">

              {/* Approve Confirmation */}
              {modalType === 'approve' && (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">✅</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Setujui Pendaftaran?</h3>
                    <p className="text-gray-600 mt-2">
                      Anda akan mengaktifkan akun sekolah <span className="font-semibold">{selectedSchool.name}</span>.
                      Admin sekolah akan dapat login setelah ini.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      onClick={executeAction}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex justify-center items-center"
                    >
                      {actionLoading ? 'Memproses...' : 'Ya, Setujui'}
                    </button>
                  </div>
                </>
              )}

              {/* Reject Confirmation */}
              {modalType === 'reject' && (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">❌</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Tolak Pendaftaran?</h3>
                    <p className="text-gray-600 mt-2">
                      Sekolah <span className="font-semibold">{selectedSchool.name}</span> akan dinonaktifkan permanen.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      onClick={executeAction}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex justify-center items-center"
                    >
                      {actionLoading ? 'Memproses...' : 'Ya, Tolak'}
                    </button>
                  </div>
                </>
              )}

              {/* Success Result */}
              {modalType === 'success_approve' && (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🎉</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Sekolah Aktif!</h3>
                    <p className="text-gray-600 mt-2 mb-4">
                      Pendaftaran diverifikasi. Berikut adalah link registrasi siswa untuk sekolah ini:
                    </p>

                    <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 break-all font-mono text-sm text-center mb-4">
                      {typeof window !== 'undefined' ? `${window.location.origin}/register/${generatedLink.split('/').pop()}` : generatedLink}
                    </div>

                    <p className="text-xs text-gray-500 mb-6">
                      *Admin sekolah juga dapat melihat link ini di dashboard mereka.
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                  >
                    Selesai & Tutup
                  </button>
                </>
              )}

            </div>
          </div>
        )}

      </main>
    </div>
  )
}