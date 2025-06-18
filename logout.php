<?php
session_start(); // Mulai sesi
session_unset(); // Hapus semua variabel sesi
session_destroy(); // Hancurkan sesi

header('Location: login.html'); // Arahkan ke halaman login
exit();
?>