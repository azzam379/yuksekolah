'use client'

import { ArrowRight, Shield, Users } from 'lucide-react'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Background elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="container relative mx-auto px-4 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="max-w-2xl">
            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border">
                <Shield className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm font-medium">Aman & Terenkripsi</span>
              </div>
              <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border">
                <Users className="w-4 h-4 text-primary-600 mr-2" />
                <span className="text-sm font-medium">100+ Sekolah Bergabung</span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Daftar Sekolah
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                Tanpa Antri & Ribet
              </span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 md:text-xl">
              Platform digital pertama yang menyederhanakan pendaftaran siswa baru.
              Sekolah dapatkan dashboard lengkap, siswa isi formulir online dalam 5 menit.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                href="/daftar-sekolah"
                className="group bg-gradient-to-r from-primary-600 to-secondary-600 text-black px-8 py-4 rounded-xl text-center font-semibold text-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                Mulai Gratis 30 Hari
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Partner logos placeholder */}
            <div className="border-t pt-6">
              <p className="text-gray-500 text-sm mb-4">Dipercaya oleh:</p>
              <div className="flex flex-wrap gap-6 opacity-60">
                {['SMA Negeri', 'SMP Islam', 'SD Unggulan', 'Yayasan Pendidikan'].map((name, i) => (
                  <div key={i} className="text-gray-400 font-semibold">{name}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative">
            <div className="relative bg-white rounded-3xl shadow-2xl p-2 transform hover:scale-[1.02] transition duration-500">
              <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-1">
                <div className="bg-white rounded-xl p-8">
                  <div className="text-center">
                    <div className="text-7xl mb-4 animate-float">📱</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Formulir Digital</h3>
                    <p className="text-gray-600">Isi di smartphone atau laptop</p>

                    {/* Mini form preview */}
                    <div className="mt-6 space-y-3 max-w-xs mx-auto">
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5"></div>
                      <div className="h-8 bg-primary-100 rounded-lg"></div>
                      <div className="h-8 bg-primary-50 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 bg-white p-4 rounded-2xl shadow-lg">
              <div className="text-2xl">✅</div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-2xl shadow-lg">
              <div className="text-2xl">🚀</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}