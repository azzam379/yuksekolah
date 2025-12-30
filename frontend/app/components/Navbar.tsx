import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-brand rounded-lg"></div>
            <span className="text-xl font-bold text-primary-600">Yuksekolah</span>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600">Beranda</Link>
            <Link href="#sekolah" className="text-gray-700 hover:text-primary-600">Untuk Sekolah</Link>
            <Link href="#siswa" className="text-gray-700 hover:text-primary-600">Untuk Siswa</Link>
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-primary-600 hover:text-primary-700"
            >
              Login
            </Link>
            <Link
              href="/daftar-sekolah"
              className="bg-blue-600 text-white font-bold px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              Daftar Sekolah
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}