'use client'

import { CheckCircle, MessageCircle, Phone, Mail } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  {
    q: "Apakah benar-benar gratis?",
    a: "Ya! 30 hari pertama gratis tanpa biaya apapun. Setelah itu, pakai plan sesuai kebutuhan sekolah."
  },
  {
    q: "Berapa lama verifikasi sekolah?",
    a: "Maksimal 1x24 jam pada hari kerja. Tim kami akan mengecek data sekolah Anda."
  },
  {
    q: "Bisa untuk semua jenjang sekolah?",
    a: "Bisa! SD, SMP, SMA, SMK, bahkan Madrasah. Sistem fleksibel untuk berbagai kebutuhan."
  }
]

export default function CTA() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-20 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-800 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - CTA Content */}
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Siap Transformasi
                <span className="block text-secondary-300">Proses Pendaftaran Sekolah?</span>
              </h2>

              <p className="text-lg text-primary-100 mb-8">
                Bergabung dengan sekolah-sekolah visioner yang sudah memulai digitalisasi.
                Hemat waktu, kurangi biaya administrasi, berikan pengalaman terbaik.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  "Dashboard admin real-time",
                  "Formulir responsive mobile-first",
                  "Notifikasi email & WhatsApp",
                  "Ekspor data ke Excel",
                  "Multi-user admin sekolah",
                  "Support 24/7"
                ].map((item, i) => (
                  <div key={i} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-secondary-300 mr-3" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-white text-black px-8 py-4 rounded-xl font-extrabold text-lg hover:bg-gray-100 transition flex items-center justify-center shadow-lg">
                  <MessageCircle className="mr-2 w-5 h-5" />
                  Chat Admin via WhatsApp
                </button>
                <button className="bg-secondary-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-secondary-700 transition flex items-center justify-center">
                  <Mail className="mr-2 w-5 h-5" />
                  Request Demo Gratis
                </button>
              </div>
            </div>

            {/* Right - FAQ & Contact */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6">Pertanyaan Umum</h3>

              <div className="space-y-4 mb-8">
                {faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="bg-white/5 rounded-xl p-4 cursor-pointer hover:bg-white/10 transition"
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">{faq.q}</h4>
                      <div className={`transform transition-transform ${openIndex === i ? 'rotate-180' : ''}`}>
                        ▼
                      </div>
                    </div>
                    {openIndex === i && (
                      <p className="mt-3 text-primary-100">{faq.a}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-white/20 pt-6">
                <h4 className="font-bold mb-4">Butuh bantuan cepat?</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-3 text-secondary-300" />
                    <div>
                      <div className="text-sm text-primary-200">Telepon</div>
                      <div className="font-semibold">021-1234-5678</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 mr-3 text-secondary-300" />
                    <div>
                      <div className="text-sm text-primary-200">Email</div>
                      <div className="font-semibold">hello@yuksekolah.id</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white/5 rounded-xl text-center">
                <div className="text-sm text-primary-200 mb-1">*Promo Terbatas</div>
                <div className="text-xl font-bold">Gratis 30 Hari Pertama</div>
                <div className="text-sm text-primary-200">Untuk 50 sekolah pendaftar pertama</div>
              </div>
            </div>
          </div>

          {/* Trust badges bottom */}
          <div className="mt-16 pt-8 border-t border-white/20">
            <div className="text-center text-primary-200 mb-6">
              Platform ini menggunakan teknologi terenkripsi sesuai standar keamanan tinggi
            </div>
            <div className="flex flex-wrap justify-center gap-8 opacity-70">
              {['SSL Secure', 'GDPR Compliant', 'ISO 27001', 'Cloudflare'].map((badge, i) => (
                <div key={i} className="text-sm">{badge}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}