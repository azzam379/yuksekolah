'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FormData {
  school_name: string
  school_email: string
  school_phone: string
  school_address: string
  admin_name: string
  admin_email: string
  admin_password: string
  confirm_password: string
  terms_accepted: boolean
}

export default function SchoolRegistrationPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    school_name: '',
    school_email: '',
    school_phone: '',
    school_address: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    confirm_password: '',
    terms_accepted: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [registrationResult, setRegistrationResult] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(1)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const validateStep1 = () => {
    if (!formData.school_name.trim()) return 'Nama sekolah harus diisi'
    if (!formData.school_email.trim()) return 'Email sekolah harus diisi'
    if (!formData.school_email.includes('@')) return 'Format email tidak valid'
    if (!formData.school_phone.trim()) return 'Nomor telepon harus diisi'
    if (!formData.school_address.trim()) return 'Alamat sekolah harus diisi'
    return ''
  }

  const validateStep2 = () => {
    if (!formData.admin_name.trim()) return 'Nama admin harus diisi'
    if (!formData.admin_email.trim()) return 'Email admin harus diisi'
    if (!formData.admin_email.includes('@')) return 'Format email admin tidak valid'
    if (formData.admin_password.length < 8) return 'Password minimal 8 karakter'
    if (formData.admin_password !== formData.confirm_password) return 'Password tidak cocok'
    if (!formData.terms_accepted) return 'Anda harus menyetujui syarat dan ketentuan'
    return ''
  }

  const handleNext = () => {
    if (currentStep === 1) {
      const error = validateStep1()
      if (error) {
        setError(error)
        return
      }
      setError('')
      setCurrentStep(2)
    }
  }

  const handleBack = () => {
    setCurrentStep(1)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const error = validateStep2()
    if (error) {
      setError(error)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8000/api/register-school', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          school_name: formData.school_name,
          school_email: formData.school_email,
          school_phone: formData.school_phone,
          school_address: formData.school_address,
          admin_name: formData.admin_name,
          admin_email: formData.admin_email,
          admin_password: formData.admin_password,
          admin_password_confirmation: formData.confirm_password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Pendaftaran gagal. Silakan coba lagi.')
      }

      setSuccess(true)
      setRegistrationResult(data.data)
      setCurrentStep(3)

    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.')
      console.error('Registration error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
            <span className="text-lg">←</span>
            <span className="ml-2">Kembali ke Beranda</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Daftarkan Sekolah Anda
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bergabung dengan ratusan sekolah yang sudah memanfaatkan platform digital
            untuk proses pendaftaran siswa yang lebih efisien.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold
                  ${currentStep === step ? 'bg-primary-600 text-white' :
                    currentStep > step ? 'bg-green-500 text-white' :
                      'bg-gray-200 text-gray-500'}
                `}>
                  {currentStep > step ? '✓' : step}
                </div>
                {step < 3 && (
                  <div className={`
                    w-24 h-1 mx-2
                    ${currentStep > step ? 'bg-green-500' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center text-sm text-gray-600">
            <div className="w-32 text-center">Data Sekolah</div>
            <div className="w-32 text-center mx-8">Data Admin</div>
            <div className="w-32 text-center">Selesai</div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mx-6 mt-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-green-400">✅</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Pendaftaran berhasil! Data sekolah Anda sedang diproses.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 md:p-10">
            {/* Step 1: School Information */}
            {currentStep === 1 && (
              <div className="animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Informasi Sekolah</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Sekolah <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="school_name"
                      value={formData.school_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Contoh: SMA Negeri 1 Jakarta"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Sekolah <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="school_email"
                        value={formData.school_email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="info@sekolah.sch.id"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Gunakan email resmi sekolah jika ada
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor Telepon <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="school_phone"
                        value={formData.school_phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="021-1234567"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat Lengkap Sekolah <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="school_address"
                      value={formData.school_address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Jl. Contoh No. 123, Kota, Provinsi"
                      required
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleNext}
                      className="w-full md:w-auto px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Lanjut ke Data Admin →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Admin Information */}
            {currentStep === 2 && (
              <div className="animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Admin Penanggung Jawab</h2>
                <p className="text-gray-600 mb-6">
                  Admin ini akan memiliki akses penuh ke dashboard sekolah.
                </p>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap Admin <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="admin_name"
                        value={formData.admin_name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Nama penanggung jawab"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Admin <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="admin_email"
                        value={formData.admin_email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="admin@sekolah.sch.id"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Untuk login ke dashboard
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="admin_password"
                        value={formData.admin_password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Minimal 8 karakter"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konfirmasi Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Ulangi password"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-start pt-4">
                    <input
                      type="checkbox"
                      id="terms_accepted"
                      name="terms_accepted"
                      checked={formData.terms_accepted}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="terms_accepted" className="ml-3 text-sm text-gray-700">
                      Saya menyetujui{' '}
                      <Link href="/syarat-ketentuan" className="text-primary-600 hover:text-primary-500">
                        Syarat & Ketentuan
                      </Link>{' '}
                      dan{' '}
                      <Link href="/kebijakan-privasi" className="text-primary-600 hover:text-primary-500">
                        Kebijakan Privasi
                      </Link>{' '}
                      Yuksekolah. Saya juga menyatakan bahwa data yang saya berikan adalah benar dan sah.
                    </label>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 pt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                    >
                      ← Kembali
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="flex-1 px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Memproses...
                        </span>
                      ) : (
                        'Daftarkan Sekolah'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {currentStep === 3 && registrationResult && (
              <div className="animate-fadeIn text-center py-10">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl text-green-600">✅</span>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Pendaftaran Berhasil!
                </h2>

                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Data sekolah <span className="font-semibold">{formData.school_name}</span> telah diterima.
                  Tim kami akan melakukan verifikasi dalam 1x24 jam.
                </p>

                <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
                  <h3 className="font-bold text-gray-900 mb-4">Informasi Akun Anda</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nama Sekolah:</span>
                      <span className="font-medium">{registrationResult.school?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email Admin:</span>
                      <span className="font-medium">{registrationResult.admin?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        Menunggu Verifikasi
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <p className="text-sm text-yellow-800">
                      <span className="font-semibold">Perhatian:</span> Anda akan menerima email konfirmasi
                      setelah akun diverifikasi oleh tim super admin. Proses verifikasi biasanya memakan waktu 1-2 hari kerja.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/login"
                    className="px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
                  >
                    Login ke Dashboard
                  </Link>
                  <Link
                    href="/"
                    className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                  >
                    Kembali ke Beranda
                  </Link>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Butuh bantuan? Hubungi kami di{' '}
                    <a href="mailto:support@yuksekolah.id" className="text-primary-600 hover:text-primary-500">
                      support@yuksekolah.id
                    </a>{' '}
                    atau telepon{' '}
                    <a href="tel:+622112345678" className="text-primary-600 hover:text-primary-500">
                      021-1234-5678
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 text-xl">⚡</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Proses Cepat</h4>
            <p className="text-sm text-gray-600">
              Verifikasi dalam 24 jam, langsung dapat dashboard
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-xl">🆓</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Gratis 30 Hari</h4>
            <p className="text-sm text-gray-600">
              Coba semua fitur tanpa biaya di bulan pertama
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 text-xl">🎯</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Dukungan Lengkap</h4>
            <p className="text-sm text-gray-600">
              Tim support siap membantu 24/7
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}