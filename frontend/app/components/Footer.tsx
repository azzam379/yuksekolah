'use client'

import { 
  Facebook, Twitter, Instagram, Youtube, 
  Mail, Phone, MapPin, Heart 
} from 'lucide-react'
import Link from 'next/link'

const footerLinks = {
  Produk: [
    { label: 'Untuk Sekolah', href: '#sekolah' },
    { label: 'Untuk Siswa', href: '#siswa' },
    { label: 'Fitur', href: '#fitur' },
    { label: 'Biaya', href: '/harga' },
    { label: 'Demo', href: '/demo' }
  ],
  Perusahaan: [
    { label: 'Tentang Kami', href: '/tentang' },
    { label: 'Blog', href: '/blog' },
    { label: 'Karir', href: '/karir' },
    { label: 'Partner', href: '/partner' },
    { label: 'Press Kit', href: '/press' }
  ],
  Dukungan: [
    { label: 'Pusat Bantuan', href: '/bantuan' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Kontak', href: '/kontak' },
    { label: 'Status Sistem', href: '/status' },
    { label: 'API Docs', href: '/api-docs' }
  ],
  Legal: [
    { label: 'Kebijakan Privasi', href: '/privacy' },
    { label: 'Syarat Layanan', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'GDPR', href: '/gdpr' },
    { label: 'SLA', href: '/sla' }
  ]
}

const socialLinks = [
  { icon: <Facebook className="w-5 h-5" />, href: '#', label: 'Facebook' },
  { icon: <Twitter className="w-5 h-5" />, href: '#', label: 'Twitter' },
  { icon: <Instagram className="w-5 h-5" />, href: '#', label: 'Instagram' },
  { icon: <Youtube className="w-5 h-5" />, href: '#', label: 'YouTube' }
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3">
                YS
              </div>
              <div>
                <h3 className="text-2xl font-bold">Yuksekolah</h3>
                <p className="text-gray-400 text-sm">Platform Pendaftaran Digital</p>
              </div>
            </div>
            
            <p className="text-gray-400 mb-6 max-w-md">
              Membantu sekolah Indonesia bertransformasi digital dengan solusi 
              pendaftaran siswa baru yang cepat, aman, dan efisien.
            </p>
            
            {/* Newsletter */}
            <div className="mb-8">
              <h4 className="font-semibold mb-3">Berlangganan Newsletter</h4>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Email Anda" 
                  className="bg-gray-800 text-white px-4 py-3 rounded-l-lg flex-grow focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button className="bg-gradient-to-r from-primary-600 to-secondary-600 px-5 py-3 rounded-r-lg font-semibold hover:opacity-90 transition">
                  Subscribe
                </button>
              </div>
            </div>
            
            {/* Social Media */}
            <div>
              <h4 className="font-semibold mb-3">Ikuti Kami</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social, i) => (
                  <a 
                    key={i}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-bold text-lg mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link, i) => (
                  <li key={i}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition hover:pl-2 block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Contact Info */}
        <div className="border-t border-gray-800 pt-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-primary-400 mr-3" />
              <div>
                <div className="text-sm text-gray-400">Telepon</div>
                <div className="font-semibold">021-1234-5678</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-primary-400 mr-3" />
              <div>
                <div className="text-sm text-gray-400">Email</div>
                <div className="font-semibold">hello@yuksekolah.id</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-primary-400 mr-3" />
              <div>
                <div className="text-sm text-gray-400">Kantor</div>
                <div className="font-semibold">Jakarta, Indonesia</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Footer */}
      <div className="bg-gray-950 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Yuksekolah. All rights reserved.
            </div>
            
            <div className="flex items-center text-gray-500 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 mx-1 text-red-500 fill-red-500" />
              <span>in Indonesia</span>
            </div>
            
            <div className="flex space-x-6 mt-4 md:mt-0">
              <img src="https://img.shields.io/badge/PCI-DSS-blue" alt="PCI DSS" className="h-6" />
              <img src="https://img.shields.io/badge/GDPR-Compliant-green" alt="GDPR" className="h-6" />
              <img src="https://img.shields.io/badge/SSL-Secure-yellow" alt="SSL" className="h-6" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}