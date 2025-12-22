<!DOCTYPE html>
<html>

<head>
    <title>Sekolah Anda Telah Diverifikasi</title>
</head>

<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #16a34a; margin: 0;">🎉 Selamat! 🎉</h1>
        </div>

        <h2 style="color: #333;">Halo, {{ $school->name }}</h2>
        <p>Kabar gembira! Akun sekolah Anda telah <strong>DIVERIFIKASI</strong> dan sekarang sudah
            <strong>AKTIF</strong>.</p>

        <p>Anda sekarang dapat login ke Dashboard Admin Sekolah untuk mengelola data siswa.</p>

        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin-top: 0; font-weight: bold;">Link Pendaftaran Siswa Baru Anda:</p>
            <p style="word-break: break-all; color: #2563eb; font-family: monospace;">
                {{ $registrationLink }}
            </p>
            <small style="color: #666;">Bagikan link ini kepada calon siswa untuk mendaftar secara online.</small>
        </div>

        <p style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/login"
                style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login
                ke Dashboard</a>
        </p>

        <p>Jika tombol di atas tidak berfungsi, silakan kunjungi: http://localhost:3000/login</p>

        <br>
        <p>Salam sukses,<br>Tim YukSekolah</p>
    </div>
</body>

</html>