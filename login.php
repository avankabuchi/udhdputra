<?php
session_start(); // Mulai sesi

// Cek jika form telah disubmit
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    // Data login hardcode (GANTI DENGAN DATABASE UNTUK PRODUKSI!)
    $valid_username = 'admin';
    $valid_password = 'admin';

    if ($username === $valid_username && $password === $valid_password) {
        // Login berhasil, setel variabel sesi
        $_SESSION['loggedin'] = true;
        $_SESSION['username'] = $username; // Opsional: simpan username di sesi

        // Arahkan ke halaman utama (index.php)
        header('Location: index.php');
        exit(); // Tetap butuh exit() untuk menghentikan eksekusi skrip
    } else {
        // Login gagal, arahkan kembali ke halaman login dengan pesan error
        header('Location: login.html?error=1');
        exit();
    }
} else {
    // Jika diakses tanpa POST request, arahkan ke halaman login
    header('Location: login.html');
    exit();
}
?>