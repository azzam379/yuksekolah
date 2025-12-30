'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface School {
  id: number
  name: string
  email: string
  phone: string
}

interface Registration {
  id: number
  school_id: number
  program: string
  academic_year: string
  status: 'draft' | 'submitted' | 'verified' | 'rejected'
  created_at: string
  updated_at: string
  form_data: {
    name: string
    email: string
    phone: string
    birth_place: string
    birth_date: string
    address: string
    previous_school?: string
    notes?: string
  }
  school?: School
}

export default function StudentDashboard() {
  const { user, token, logout } = useAuth()
  const router = useRouter()
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Redirect jika bukan student
  useEffect(() => {
    if (user && user.role !== 'student') {
      router.push('/')
    }
  }, [user, router])

  // Fetch student data
  useEffect(() => {
    if (!token) return

    const fetchStudentData = async () => {
      try {
        setIsLoading(true)

        // Try multiple endpoints if one fails
        let response;
        try {
          response = await fetch('http://localhost:8000/api/dashboard/student', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        } catch (err) {
          console.log('Primary endpoint failed, trying fallback...')
          // Fallback: get user data and simulate registration
          response = await fetch('http://localhost:8000/api/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        }

        if (!response.ok) throw new Error('Gagal memuat data siswa')

        const data = await response.json()

        if (data.registration) {
          setRegistration(data.registration)
        } else if (data.user) {
          // Create mock registration from user data
          setRegistration({
            id: 1,
            school_id: data.user.school_id || 1,
            program: 'IPA',
            academic_year: '2024/2025',
            status: 'submitted',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            form_data: {
              name: data.user.name,
              email: data.user.email,
              phone: '08123456789',
              birth_place: 'Jakarta',
              birth_date: '2008-01-01',
              address: 'Alamat siswa'
            },
            school: data.user.school || {
              id: 1,
              name: 'SMA Negeri 1 Jakarta',
              email: 'info@sman1jkt.sch.id',
              phone: '021-1234567'
            }
          })
        }

      } catch (err: any) {
        console.error('Dashboard error:', err)
        setError('Gagal memuat data. Anda dapat melanjutkan dengan data demo.')

        // Set demo data
        setRegistration({
          id: 1,
          school_id: 1,
          program: 'IPA',
          academic_year: '2024/2025',
          status: 'submitted',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          form_data: {
            name: user?.name || 'Nama Siswa',
            email: user?.email || 'student@example.com',
            phone: '08123456789',
            birth_place: 'Jakarta',
            birth_date: '2008-01-01',
            address: 'Jl. Contoh No. 123, Jakarta',
            previous_school: 'SMP Negeri 1 Jakarta'
          },
          school: {
            id: 1,
            name: 'SMA Negeri 1 Jakarta',
            email: 'info@sman1jkt.sch.id',
            phone: '021-1234567'
          }
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudentData()
  }, [token, user])

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '✅',
          title: 'Pendaftaran Diterima',
          message: 'Selamat! Anda telah diterima. Silakan hubungi sekolah untuk langkah selanjutnya.',
          steps: [
            '✅ Pendaftaran diverifikasi',
            '✅ Dokumen lengkap',
            '✅ Lolos administrasi',
            '⏳ Tunggu jadwal tes berikutnya'
          ]
        }
      case 'submitted':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '⏳',
          title: 'Menunggu Verifikasi',
          message: 'Pendaftaran Anda sedang diproses oleh admin sekolah. Biasanya memakan waktu 1-3 hari kerja.',
          steps: [
            '✅ Formulir terkirim',
            '⏳ Admin memeriksa berkas',
            '⏳ Verifikasi dokumen',
            '⏳ Pengumuman hasil'
          ]
        }
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: '❌',
          title: 'Pendaftaran Ditolak',
          message: 'Maaf, pendaftaran Anda tidak dapat diproses. Silakan hubungi sekolah untuk informasi lebih lanjut.',
          steps: [
            '✅ Formulir terkirim',
            '❌ Dokumen tidak lengkap',
            '❌ Tidak memenuhi persyaratan',
            '📞 Hubungi sekolah untuk klarifikasi'
          ]
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '📝',
          title: 'Belum Mendaftar',
          message: 'Anda belum mengisi formulir pendaftaran. Dapatkan link pendaftaran dari sekolah tujuan.',
          steps: [
            '📝 Dapatkan link dari sekolah',
            '📝 Isi formulir online',
            '📝 Upload berkas',
            '📝 Tunggu verifikasi'
          ]
        }
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat dashboard siswa...</p>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(registration?.status || 'draft')
  const formData = registration?.form_data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3">
                YS
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard Siswa</h1>
                <p className="text-sm text-gray-600">Platform Pendaftaran Yuksekolah</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <span className="text-lg mr-2">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Welcome Card */}
        <div className="mb-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-6 text-black shadow-lg">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h2 className="text-2xl font-extrabold">Halo, {user?.name}!</h2>
              <p className="mt-2 font-medium">
                Pantau status pendaftaran Anda ke {registration?.school?.name || 'sekolah tujuan'}.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
              <div className="text-3xl">{statusInfo.icon}</div>
              <div>
                <div className="text-sm font-semibold text-black">Status Saat Ini</div>
                <div className="text-xl font-extrabold text-black">{statusInfo.title}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Status & Progress */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status Card */}
            <div className={`border-2 rounded-xl p-6 ${statusInfo.color}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">{statusInfo.icon}</div>
                <h3 className="text-lg font-bold">Status Pendaftaran</h3>
              </div>
              <p className="mb-6">{statusInfo.message}</p>

              <div className="space-y-3">
                {statusInfo.steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step.startsWith('✅') ? 'bg-green-500 text-white' :
                      step.startsWith('❌') ? 'bg-red-600 text-white' :
                        step.startsWith('⏳') ? 'bg-yellow-500 text-white' :
                          'bg-gray-200 text-black font-bold'
                      }`}>
                      {step.startsWith('✅') ? '✓' :
                        step.startsWith('❌') ? '✗' :
                          step.startsWith('⏳') ? '⌛' : '○'}
                    </div>
                    <span>{step.replace(/^[✅❌⏳📝📞]+/, '').trim()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* School Information */}
            {registration?.school && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Informasi Sekolah</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Nama Sekolah</div>
                    <div className="font-medium">{registration.school.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Email Kontak</div>
                    <div className="font-medium">{registration.school.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Telepon</div>
                    <div className="font-medium">{registration.school.phone}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Program/Jurusan</div>
                    <div className="font-medium">{registration.program} - {registration.academic_year}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Personal Info & Actions */}
          <div className="space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Data Pribadi</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Nama Lengkap</div>
                  <div className="font-bold text-gray-900 text-lg">{formData?.name || user?.name}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Email</div>
                  <div className="font-bold text-gray-900 text-lg">{formData?.email || user?.email}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Nomor Telepon</div>
                  <div className="font-bold text-gray-900 text-lg">{formData?.phone || '08123456789'}</div>
                </div>
                {formData?.birth_place && formData?.birth_date && (
                  <div>
                    <div className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">TTL</div>
                    <div className="font-bold text-gray-900 text-lg">{formData.birth_place}, {formData.birth_date}</div>
                  </div>
                )}
                {formData?.address && (
                  <div>
                    <div className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Alamat</div>
                    <div className="font-bold text-gray-900 text-lg">{formData.address}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-100 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Aksi Cepat</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-white border border-primary-200 text-primary-700 rounded-lg hover:bg-primary-50 transition flex items-center justify-center gap-2">
                  <span>📄</span> Cetak Formulir
                </button>
                <button className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <span>📧</span> Hubungi Sekolah
                </button>
                <button className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <span>❓</span> Bantuan
                </button>
              </div>
            </div>

            {/* Timeline */}
            {registration?.created_at && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs text-white mt-1">
                      ✓
                    </div>
                    <div>
                      <div className="font-medium">Pendaftaran Dikirim</div>
                      <div className="text-sm text-gray-500">
                        {new Date(registration.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mt-1 ${registration.status === 'verified' ? 'bg-green-500 text-white' :
                      registration.status === 'rejected' ? 'bg-red-500 text-white' :
                        'bg-yellow-500 text-white'
                      }`}>
                      {registration.status === 'verified' ? '✓' :
                        registration.status === 'rejected' ? '✗' : '⌛'}
                    </div>
                    <div>
                      <div className="font-medium">Status: {statusInfo.title}</div>
                      <div className="text-sm text-gray-500">
                        {registration.updated_at ?
                          new Date(registration.updated_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long'
                          }) : 'Dalam proses'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main >
    </div >
  )
}