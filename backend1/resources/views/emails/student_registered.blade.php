<!DOCTYPE html>
<html>

<head>
    <title>Pendaftaran Berhasil</title>
</head>

<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #2563eb;">Halo, {{ $student->name }}</h2>
        <p>Selamat! Pendaftaran Anda di <strong>{{ $school->name }}</strong> telah kami terima.</p>

        <p>Untuk memantau status pendaftaran dan melengkapi dokumen, silakan login ke dashboard siswa menggunakan akun
            berikut:</p>

        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> {{ $student->email }}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> {{ $password }}</p>
        </div>

        <p style="color: #ef4444; font-size: 0.9em;">
            *Demi keamanan, harap segera ganti password Anda setelah login pertama kali.
        </p>

        <p style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/login"
                style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login
                ke Dashboard</a>
        </p>

        <p>Jika tombol di atas tidak berfungsi, silakan kunjungi: http://localhost:3000/login</p>

        <br>
        <p>Sukses selalu,<br>Tim YukSekolah</p>
    </div>
</body>

</html>