'use client'

import { Smartphone, Bell, Lock, Zap, Cloud, Users } from 'lucide-react'

const features = [
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: "Responsif Total",
    desc: "Akses dari smartphone, tablet, atau laptop dengan tampilan optimal.",
    stat: "100% Mobile-Friendly"
  },
  {
    icon: <Bell className="w-8 h-8" />,
    title: "Notifikasi Real-time",
    desc: "Email & WhatsApp notification untuk setiap update status pendaftaran.",
    stat: "Instant Alert"
  },
  {
    icon: <Lock className="w-8 h-8" />,
    title: "Keamanan Data",
    desc: "Enkripsi end-to-end, backup harian, dan akses role-based.",
    stat: "ISO 27001 Standard"
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Proses Cepat",
    desc: "Formulir otomatis, validasi real-time, dan submit instan.",
    stat: "5x Lebih Cepat"
  },
  {
    icon: <Cloud className="w-8 h-8" />,
    title: "Cloud-Based",
    desc: "Tidak perlu install software. Buka browser dan mulai pakai.",
    stat: "Always Online"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Multi-user Support",
    desc: "Sekolah bisa punya banyak admin dengan permission berbeda.",
    stat: "Team Collaboration"
  }
]

export default function Features() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mengapa Memilih
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
              Yuksekolah?
            </span>
          </h2>
          <p className="text-gray-600 text-lg">
            Platform lengkap dengan segala fitur yang sekolah dan siswa butuhkan 
            untuk proses pendaftaran yang smooth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-100 hover:-translate-y-2"
            >
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 text-primary-600 mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.desc}</p>
              <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {feature.stat}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16 p-8 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-3xl border border-primary-200">
          <div className="text-5xl mb-4">🚀</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Siap Transformasi Digital?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Bergabung dengan ratusan sekolah yang sudah merasakan kemudahan 
            pendaftaran digital dengan Yuksekolah.
          </p>
          <button className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition">
            Jadwalkan Demo Gratis
          </button>
        </div>
      </div>
    </section>
  )
}