'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface SchoolInfo {
  id: number
  name: string
  email: string
  programs: string[]
}

interface FormData {
  // Personal Information
  full_name: string
  email: string
  phone: string
  birth_place: string
  birth_date: string
  gender: 'male' | 'female'

  // School & Program
  program: string

  // Previous Education
  previous_school: string
  previous_school_year: string

  // Address
  address: string
  city: string
  province: string
  postal_code: string

  // Parent Information
  father_name: string
  father_phone: string
  father_job: string

  mother_name: string
  mother_phone: string
  mother_job: string

  // Documents (to be uploaded later)
  terms_accepted: boolean
}

// Loading component
function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Memuat formulir pendaftaran...</p>
      </div>
    </div>
  )
}

function StudentRegistrationContent() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const token = params.token as string

  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [registrationResult, setRegistrationResult] = useState<any>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [loginRequired, setLoginRequired] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    phone: '',
    birth_place: '',
    birth_date: '',
    gender: 'male',
    program: '',
    previous_school: '',
    previous_school_year: '2024',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    father_name: '',
    father_phone: '',
    father_job: '',
    mother_name: '',
    mother_phone: '',
    mother_job: '',
    terms_accepted: false
  })

  // Fetch school information based on token
  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`http://localhost:8000/api/school-by-link/${token}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Link pendaftaran tidak valid atau sudah kadaluarsa')
          }
          throw new Error('Gagal memuat informasi sekolah')
        }

        const data = await response.json()
        setSchoolInfo({
          id: data.school.id,
          name: data.school.name,
          email: data.school.email,
          programs: data.programs || ['IPA', 'IPS', 'Bahasa', 'Agama']
        })

        // Set default program if available
        if (data.programs && data.programs.length > 0) {
          setFormData(prev => ({ ...prev, program: data.programs[0] }))
        }

      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchSchoolInfo()
    }
  }, [token])

  // Prefill form if user is logged in
  // Prefill form ONLY if user is logged in as STUDENT
  useEffect(() => {
    if (user && user.role === 'student') {
      setFormData(prev => ({
        ...prev,
        full_name: user.name,
        email: user.email
      }))
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const validateStep = (step: number): string => {
    switch (step) {
      case 1:
        if (!formData.full_name.trim()) return 'Nama lengkap harus diisi'
        if (!formData.email.trim()) return 'Email harus diisi'
        if (!formData.email.includes('@')) return 'Format email tidak valid'
        if (!formData.phone.trim()) return 'Nomor telepon harus diisi'
        if (!formData.birth_place.trim()) return 'Tempat lahir harus diisi'
        if (!formData.birth_date) return 'Tanggal lahir harus diisi'
        return ''

      case 2:
        if (!formData.program) return 'Pilih program/jurusan'
        if (!formData.previous_school.trim()) return 'Sekolah asal harus diisi'
        if (!formData.previous_school_year) return 'Tahun lulus harus diisi'
        return ''

      case 3:
        if (!formData.address.trim()) return 'Alamat harus diisi'
        if (!formData.city.trim()) return 'Kota harus diisi'
        if (!formData.province.trim()) return 'Provinsi harus diisi'
        return ''

      case 4:
        if (!formData.father_name.trim()) return 'Nama ayah harus diisi'
        if (!formData.father_phone.trim()) return 'Nomor telepon ayah harus diisi'
        if (!formData.mother_name.trim()) return 'Nama ibu harus diisi'
        if (!formData.mother_phone.trim()) return 'Nomor telepon ibu harus diisi'
        return ''

      case 5:
        if (!formData.terms_accepted) return 'Anda harus menyetujui syarat dan ketentuan'
        return ''

      default:
        return ''
    }
  }

  const nextStep = () => {
    const error = validateStep(currentStep)
    if (error) {
      setError(error)
      return
    }
    setError('')
    setCurrentStep(prev => Math.min(prev + 1, 5))
  }

  const prevStep = () => {
    setError('')
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    const error = validateStep(5)
    if (error) {
      setError(error)
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8000/api/submit-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          school_link: token,
          form_data: {
            name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            program: formData.program,
            birth_place: formData.birth_place,
            birth_date: formData.birth_date,
            gender: formData.gender,
            previous_school: formData.previous_school,
            previous_school_year: formData.previous_school_year,
            address: `${formData.address}, ${formData.city}, ${formData.province} ${formData.postal_code}`,
            father_name: formData.father_name,
            father_phone: formData.father_phone,
            father_job: formData.father_job,
            mother_name: formData.mother_name,
            mother_phone: formData.mother_phone,
            mother_job: formData.mother_job
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setLoginRequired(true)
        }
        throw new Error(data.message || 'Pendaftaran gagal. Silakan coba lagi.')
      }

      setSuccess(true)
      setRegistrationResult(data)

      // Auto login to get token for upload
      try {
        const loginResponse = await fetch('http://localhost:8000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.student_account.email,
            password: data.student_account.password
          })
        })

        if (loginResponse.ok) {
          const loginData = await loginResponse.json()
          // Handle nested data structure { data: { token: ... } }
          const token = loginData.data?.token || loginData.token
          if (token) {
            setAuthToken(token)
          }
        }
      } catch (e) {
        console.error('Auto login failed:', e)
      }

      setCurrentStep(6)

    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.')
      console.error('Registration error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (error && !schoolInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl text-red-600">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Link Tidak Valid</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">
                  YS
                </div>
                <span className="font-bold text-gray-900">Yuksekolah</span>
              </Link>
            </div>
            <div className="text-sm text-gray-600">
              Formulir Pendaftaran • {schoolInfo?.name}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${currentStep === step ? 'bg-primary-600 text-white' :
                    currentStep > step ? 'bg-green-500 text-white' :
                      'bg-gray-200 text-gray-500'}
                  ${step === 6 ? 'hidden sm:flex' : ''}
                `}>
                  {currentStep > step ? '✓' : step}
                </div>
                <div className="text-xs text-gray-600 mt-2 hidden sm:block">
                  {step === 1 && 'Data Diri'}
                  {step === 2 && 'Pendidikan'}
                  {step === 3 && 'Alamat'}
                  {step === 4 && 'Orang Tua'}
                  {step === 5 && 'Konfirmasi'}
                  {step === 6 && 'Selesai'}
                </div>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="text-lg mr-2">⚠️</span>
              <span>{error}</span>
            </div>
            {loginRequired && (
              <div className="ml-7">
                <Link
                  href="/login"
                  className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 inline-block"
                >
                  Login Sekarang
                </Link>
                <p className="text-xs mt-2 text-red-600">
                  Silakan login dengan email tersebut untuk melanjutkan pendaftaran.
                </p>
              </div>
            )}
          </div>
        )}

        {/* School Info Card */}
        <div className="mb-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Formulir Pendaftaran Siswa Baru</h1>
          <p className="opacity-90">
            {schoolInfo?.name} • Tahun Ajaran 2024/2025
          </p>
          <div className="mt-4 text-sm bg-white/20 rounded-lg p-3">
            ⏱️ Perkiraan waktu pengisian: 10-15 menit
          </div>
        </div>

        {/* Form Steps */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="animate-fadeIn">
              <h2 className="text-xl font-bold text-gray-900 mb-6">1. Data Pribadi Calon Siswa</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      readOnly={!!user}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${user ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                      placeholder="Nama sesuai akta kelahiran"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      readOnly={!!user}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${user ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                      placeholder="email@contoh.com"
                      required
                    />
                    {user ? (
                      <p className="mt-1 text-xs text-blue-600 flex items-center">
                        ✅ Anda login sebagai {user.name} ({user.email})
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-500">
                        Untuk login dan notifikasi
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon/WA <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="081234567890"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tempat Lahir <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="birth_place"
                      value={formData.birth_place}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Kota kelahiran"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Lahir <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={formData.gender === 'male'}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2">Laki-laki</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={formData.gender === 'female'}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2">Perempuan</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Education Information */}
          {currentStep === 2 && (
            <div className="animate-fadeIn">
              <h2 className="text-xl font-bold text-gray-900 mb-6">2. Data Pendidikan</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program/Jurusan yang Dipilih <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {schoolInfo?.programs.map((program) => (
                      <label key={program} className="relative">
                        <input
                          type="radio"
                          name="program"
                          value={program}
                          checked={formData.program === program}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="p-4 border-2 border-gray-200 rounded-lg text-center cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 transition">
                          <div className="font-medium">{program}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sekolah Asal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="previous_school"
                      value={formData.previous_school}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Nama sekolah sebelumnya"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tahun Lulus <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="previous_school_year"
                      value={formData.previous_school_year}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - i
                        return (
                          <option key={year} value={year.toString()}>
                            {year}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Address Information */}
          {currentStep === 3 && (
            <div className="animate-fadeIn">
              <h2 className="text-xl font-bold text-gray-900 mb-6">3. Alamat Tempat Tinggal</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Lengkap <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kota/Kabupaten <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Nama kota"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provinsi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Nama provinsi"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="12345"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Parent Information */}
          {currentStep === 4 && (
            <div className="animate-fadeIn">
              <h2 className="text-xl font-bold text-gray-900 mb-6">4. Data Orang Tua/Wali</h2>
              <div className="space-y-8">
                <div className="border-l-4 border-primary-500 pl-4 py-2 bg-primary-50">
                  <h3 className="font-medium text-gray-900">Ayah Kandung</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap Ayah <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="father_name"
                      value={formData.father_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Nama ayah"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="father_phone"
                      value={formData.father_phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="081234567890"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pekerjaan
                    </label>
                    <input
                      type="text"
                      name="father_job"
                      value={formData.father_job}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Pekerjaan ayah"
                    />
                  </div>
                </div>

                <div className="border-l-4 border-secondary-500 pl-4 py-2 bg-secondary-50">
                  <h3 className="font-medium text-gray-900">Ibu Kandung</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap Ibu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="mother_name"
                      value={formData.mother_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Nama ibu"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="mother_phone"
                      value={formData.mother_phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="081234567890"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pekerjaan
                    </label>
                    <input
                      type="text"
                      name="mother_job"
                      value={formData.mother_job}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Pekerjaan ibu"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === 5 && (
            <div className="animate-fadeIn">
              <h2 className="text-xl font-bold text-gray-900 mb-6">5. Konfirmasi Data</h2>

              <div className="space-y-6">
                {/* Data Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Ringkasan Data Anda</h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Nama Lengkap</div>
                        <div className="font-medium">{formData.full_name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="font-medium">{formData.email}</div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="text-sm text-gray-500 mb-2">Sekolah & Program</div>
                      <div className="font-medium">{schoolInfo?.name} - {formData.program}</div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="text-sm text-gray-500 mb-2">Orang Tua</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="font-medium">{formData.father_name}</div>
                          <div className="text-sm text-gray-600">{formData.father_phone}</div>
                        </div>
                        <div>
                          <div className="font-medium">{formData.mother_name}</div>
                          <div className="text-sm text-gray-600">{formData.mother_phone}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="terms_accepted"
                      name="terms_accepted"
                      checked={formData.terms_accepted}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="terms_accepted" className="ml-3 text-sm text-gray-700">
                      Saya menyatakan bahwa data yang saya berikan adalah benar dan sah.
                      Saya bersedia menerima konsekuensi hukum jika data yang diberikan ternyata tidak benar.
                      Saya juga menyetujui bahwa data ini akan digunakan untuk keperluan proses pendaftaran siswa baru.
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-start">
                    <div className="text-blue-600 mr-3">ℹ️</div>
                    <div className="text-sm text-blue-800">
                      <span className="font-semibold">Catatan:</span> Setelah submit, Anda akan mendapatkan akun siswa
                      untuk memantau status pendaftaran. Password akan dikirim ke email Anda.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Success */}
          {currentStep === 6 && registrationResult && (
            <div className="animate-fadeIn text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-green-600">✅</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Pendaftaran Berhasil Dikirim!
              </h2>

              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                Formulir pendaftaran Anda telah diterima oleh {schoolInfo?.name}.
              </p>

              <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
                <h3 className="font-bold text-gray-900 mb-4">Informasi Akun Siswa</h3>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email Login:</span>
                    <span className="font-medium">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Password:</span>
                    <span className="font-medium">password123</span>
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
                    <span className="font-semibold">Simpan informasi login ini!</span> Gunakan untuk login ke
                    dashboard siswa dan pantau status pendaftaran Anda.
                  </p>
                </div>
              </div>

              {/* Document Upload Section */}
              {authToken && registrationResult?.registration_id && (
                <div className="bg-white border rounded-xl p-6 mb-8 max-w-2xl mx-auto text-left shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Dokumen Kelengkapan</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Mohon lengkapi dokumen berikut. Dokumen bertanda <span className="text-red-500 font-bold">*</span> wajib diupload.
                  </p>

                  <div className="space-y-4">
                    {[
                      { id: 'photo', label: 'Pas Foto Terbaru', required: true },
                      { id: 'akta_lahir', label: 'Akta Kelahiran', required: true },
                      { id: 'kartu_keluarga', label: 'Kartu Keluarga', required: true },
                      { id: 'transkrip_nilai', label: 'Transkrip Nilai / Rapor', required: true },
                      { id: 'sertifikat_prestasi', label: 'Sertifikat Prestasi', required: false },
                      { id: 'other', label: 'Dokumen Lainnya', required: false }
                    ].map((doc) => {
                      const isUploaded = uploadedFiles.includes(doc.id)
                      return (
                        <div key={doc.id} className={`border rounded-lg p-3 ${isUploaded ? 'bg-green-50 border-green-200' : ''}`}>
                          <div className="flex justify-between items-center mb-2">
                            <label className="font-medium text-sm text-gray-700">
                              {doc.label} {doc.required && <span className="text-red-500">*</span>}
                            </label>
                            {isUploaded ? (
                              <span className="text-xs font-bold text-green-600 flex items-center">
                                ✓ Terupload
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">
                                {doc.required ? 'Wajib' : 'Opsional'}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              disabled={isUploaded}
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-primary-50 file:text-primary-700
                                hover:file:bg-primary-100
                                disabled:opacity-50 disabled:cursor-not-allowed"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return

                                try {
                                  const formData = new FormData()
                                  formData.append('file', file)
                                  formData.append('type', doc.id)

                                  // Show uploading state
                                  const btn = e.target as HTMLInputElement
                                  btn.disabled = true
                                  const originalText = btn.style.opacity
                                  btn.style.opacity = '0.5'

                                  const response = await fetch(`http://localhost:8000/api/registrations/${registrationResult.registration_id}/upload`, {
                                    method: 'POST',
                                    headers: {
                                      'Authorization': `Bearer ${authToken}`
                                    },
                                    body: formData
                                  })

                                  if (!response.ok) throw new Error('Upload gagal')

                                  // Update state
                                  setUploadedFiles(prev => [...prev, doc.id])
                                  alert(`Dokumen ${doc.label} berhasil diupload!`)

                                } catch (err) {
                                  alert('Gagal mengupload dokumen. Silakan coba lagi.')
                                  console.error(err)
                                  // Reset input on error
                                  const btn = e.target as HTMLInputElement
                                  btn.disabled = false
                                  btn.style.opacity = '1'
                                  btn.value = ''
                                }
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    const mandatoryDocs = ['photo', 'akta_lahir', 'kartu_keluarga', 'transkrip_nilai']
                    const missingDocs = mandatoryDocs.filter(doc => !uploadedFiles.includes(doc))

                    if (missingDocs.length > 0) {
                      alert('Mohon lengkapi semua dokumen wajib sebelum melanjutkan.')
                      return
                    }

                    router.push('/login')
                  }}
                  className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
                >
                  Selesai & Masuk Dashboard
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                  >
                    ← Kembali
                  </button>
                )}
              </div>

              <div className="flex gap-4">
                {currentStep < 5 && (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
                  >
                    {currentStep === 4 ? 'Tinjau Data' : 'Lanjut →'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Submit Button for Step 5 */}
          {currentStep === 5 && (
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                ← Kembali
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mengirim Data...
                  </span>
                ) : (
                  'Kirim Pendaftaran'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="text-center text-sm text-gray-500">
          Langkah {currentStep} dari 5 • Semua data bersifat rahasia dan aman
        </div>
      </main>
    </div>
  )
}

// Main component with Suspense for dynamic params
export default function StudentRegistrationPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <StudentRegistrationContent />
    </Suspense>
  )
}