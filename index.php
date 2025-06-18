<?php
session_start(); // Mulai sesi

// Cek apakah pengguna sudah login
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    header('Location: login.html'); // Arahkan ke halaman login jika belum login
    exit();
}
?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UD. HD Putra</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>

<body>

    <header>
        <div class="header-content">
            <h1 class="header-title">🪵 UD. HD PUTRA</h1>
            <p class="header-subtitle">Sistem Manajemen Pembelian & Penjualan Kayu</p>
        </div>
    </header>

    <div class="tab-navigation">
        <button class="tab-btn active" onclick="openTab(event, 'Pembelian')">📝 Pembelian</button>
        <button class="tab-btn" onclick="openTab(event, 'Penjualan')">🛒 Penjualan</button>
        <button class="tab-btn" onclick="openTab(event, 'Rekap')">📊 Rekap</button>
        <button class="tab-btn" onclick="window.location.href='logout.php'">🚪 Logout</button>
    </div>

    <div class="container">

        <div id="Pembelian" class="tab-content active">
            <h2>📝 Formulir Pembelian Kayu</h2>
            <div class="form-section">
                <div class="form-grid">
                    <div class="input-group">
                        <label><i class="fas fa-user"></i> Nama Penjual</label>
                        <input type="text" id="namaPenjual" placeholder="Masukkan nama penjual">
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-tree"></i> Jenis Kayu</label>
                        <select id="jenisKayu">
                            <option value="Jati">🌳 Jati</option>
                            <option value="Mahoni">🌲 Mahoni</option>
                            <option value="Alba">🌿 Alba</option>
                            <option value="Bayur">🍃 Bayur</option>
                            <option value="Pete">🌱 Pete</option>
                            <option value="Duren">🎋 Duren</option>
                            <option value="Keras">🪨 Keras</option>
                            <option value="Lain-lain">📦 Lain-lain</option>
                        </select>
                    </div>
                    <div class="input-group"><label><i class="fas fa-ruler-horizontal"></i> Diameter (cm)</label><input type="number" id="diameter" placeholder="Contoh: 20"></div>
                    <div class="input-group"><label><i class="fas fa-ruler-vertical"></i> Panjang (cm)</label><input type="number" id="panjang" placeholder="Contoh: 400"></div>
                    <div class="input-group"><label><i class="fas fa-sort-numeric-up"></i> Jumlah Batang</label><input type="number" id="jumlah" placeholder="Contoh: 5" value="1"></div>
                    <div class="input-group"><label><i class="fas fa-dollar-sign"></i> Harga Satuan (m³)</label><input type="number" id="hargaSatuan" placeholder="Contoh: 1500"></div>
                </div>
                <div class="btn-group">
                    <button class="btn-add" onclick="tambahKayu()"><i class="fas fa-plus"></i> Tambah</button>
                    </div>
            </div>
            <div class="table-section">
                <div class="table-wrapper"><table id="tabelKayu"><thead><tr><th>No</th><th>Jenis</th><th>Diameter</th><th>Panjang</th><th>Jumlah</th><th>Harga Total</th><th>Aksi</th></tr></thead><tbody></tbody></table></div>
            </div>
            <div id="totalHarga">💰 Total Harga Keseluruhan: Rp 0</div>
            <div id="formPembayaran" class="payment-section" style="display:none">
                 <div class="payment-title">💳 Form Pembayaran</div>
                 <div class="payment-input-group"><label>Total Bayar</label><input type="number" id="totalBayar" oninput="hitungPembayaran()" placeholder="Masukkan jumlah pembayaran"></div>
                 <div class="payment-input-group"><label>Catatan</label><textarea id="catatan" rows="3" placeholder="Catatan tambahan..."></textarea></div>
                 <div id="hasilPembayaran" class="empty-payment"></div>
            </div>
            <div class="btn-group" style="margin-top: 20px;">
                <button onclick="simpanTransaksi('pembelian')"><i class="fas fa-save"></i> Simpan Transaksi</button>
                <button class="btn-print" onclick="cetakStruk()"><i class="fas fa-print"></i> Cetak</button>
                <button class="btn-download" onclick="downloadPDF()"><i class="fas fa-download"></i> Unduh PDF</button>
                <button class="btn-clear" onclick="selesaiTransaksiPembelian()"><i class="fas fa-check-circle"></i> Transaksi Selesai</button>
            </div>
        </div>

        <div id="Penjualan" class="tab-content">
            <h2>🛒 Formulir Penjualan Barang</h2>
            <div class="form-section">
                <div class="form-grid">
                     <div class="input-group">
                        <label><i class="fas fa-user"></i> Nama Pembeli</label>
                        <input type="text" id="namaPembeli" placeholder="Masukkan nama pembeli">
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-box"></i> Nama Barang</label>
                        <input type="text" id="namaBarang" placeholder="Contoh: Kayu Jati 5x10">
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-sort-numeric-up"></i> Jumlah</label>
                        <input type="number" id="jumlahPenjualan" value="1">
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-dollar-sign"></i> Harga Satuan</label>
                        <input type="number" id="hargaSatuanPenjualan" placeholder="Contoh: 50000">
                    </div>
                </div>
                <div class="btn-group">
                    <button class="btn-add" onclick="tambahBarangPenjualan()"><i class="fas fa-plus"></i> Tambah Barang</button>
                    </div>
            </div>

            <div class="table-section">
                <h3><i class="fas fa-shopping-cart"></i> Daftar Belanja</h3>
                <div class="table-wrapper">
                    <table id="tabelPenjualan">
                        <thead>
                            <tr>
                                <th><i class="fas fa-hashtag"></i> No</th>
                                <th><i class="fas fa-box"></i> Nama Barang</th>
                                <th><i class="fas fa-sort-numeric-up"></i> Jumlah</th>
                                <th><i class="fas fa-dollar-sign"></i> Harga Satuan</th>
                                <th><i class="fas fa-money-bill-wave"></i> Total Harga</th>
                                <th><i class="fas fa-cog"></i> Aksi</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>

            <div id="totalHargaPenjualan">💰 Total Harga Keseluruhan: Rp 0</div>

            <div id="formPembayaranPenjualan" class="payment-section" style="display:none;">
                <div class="payment-title">💳 Form Pembayaran Penjualan</div>
                <div class="payment-input-group">
                    <label><i class="fas fa-credit-card"></i> Total Bayar</label>
                    <input type="number" id="totalBayarPenjualan" placeholder="Masukkan jumlah bayar" oninput="hitungPembayaranPenjualan()">
                </div>
                <div class="payment-input-group">
                    <label><i class="fas fa-sticky-note"></i> Catatan</label>
                    <textarea id="catatanPenjualan" rows="3" placeholder="Catatan tambahan..."></textarea>
                </div>
                <div id="hasilPembayaranPenjualan" class="empty-payment">💡 Masukkan jumlah pembayaran untuk melihat status</div>
            </div>
            <div class="btn-group" style="margin-top: 20px;">
                <button onclick="simpanTransaksi('penjualan')"><i class="fas fa-save"></i> Simpan Transaksi</button>
                <button class="btn-print" onclick="cetakStrukPenjualan()"><i class="fas fa-print"></i> Cetak Struk</button>
                <button class="btn-download" onclick="downloadPDFPenjualan()"><i class="fas fa-download"></i> Unduh PDF</button>
                <button class="btn-clear" onclick="selesaiTransaksiPenjualan()"><i class="fas fa-check-circle"></i> Transaksi Selesai</button>
            </div>
        </div>

        <div id="Rekap" class="tab-content">
            <h2>📊 Rekapitulasi Data</h2>
            <div class="rekap-nav">
                <button class="rekap-btn" onclick="tampilkanRekap('pembelian', 'harian', null, null)">Pembelian Harian</button>
                <button class="rekap-btn" onclick="tampilkanRekap('pembelian', 'bulanan', null, null)">Pembelian Bulanan</button>
                <button class="rekap-btn" onclick="tampilkanRekap('penjualan', 'harian', null, null)">Penjualan Harian</button>
                <button class="rekap-btn" onclick="tampilkanRekap('penjualan', 'bulanan', null, null)">Penjualan Bulanan</button>
            </div>

            <div class="form-section" style="margin-top: 20px;">
                <h4>Filter Tanggal Kustom</h4>
                <div class="form-grid">
                    <div class="input-group">
                        <label for="startDateRekap"><i class="fas fa-calendar-alt"></i> Tanggal Mulai</label>
                        <input type="date" id="startDateRekap">
                    </div>
                    <div class="input-group">
                        <label for="endDateRekap"><i class="fas fa-calendar-alt"></i> Tanggal Akhir</label>
                        <input type="date" id="endDateRekap">
                    </div>
                </div>
                <div class="btn-group">
                    <button class="rekap-btn" onclick="tampilkanRekapByDateRange()">Tampilkan Filter Tanggal</button>
                </div>
            </div>

            <div id="rekapTitle" style="text-align:center; font-size: 1.5rem; margin-bottom: 20px;"></div>

            <div class="stats-grid" id="rekapSummaryStats">
                <div class="stat-card">
                    <h4>Total Pendapatan (Penjualan)</h4>
                    <p class="stat-number" id="totalPendapatanRekap">Rp 0</p>
                    <p class="stat-desc">Jumlah total dari transaksi penjualan.</p>
                </div>
                <div class="stat-card">
                    <h4>Total Pengeluaran (Pembelian)</h4>
                    <p class="stat-number" id="totalPengeluaranRekap">Rp 0</p>
                    <p class="stat-desc">Jumlah total dari transaksi pembelian.</p>
                </div>
                <div class="stat-card">
                    <h4>Estimasi Keuntungan</h4>
                    <p class="stat-number" id="estimasiKeuntunganRekap">Rp 0</p>
                    <p class="stat-desc">Pendapatan dikurangi pengeluaran (estimasi).</p>
                </div>
                <div class="stat-card">
                    <h4>Total Kasbon Penjualan</h4>
                    <p class="stat-number" id="totalKasbonPenjualanRekap">Rp 0</p>
                    <p class="stat-desc">Total nominal penjualan yang masih berstatus kasbon.</p>
                </div>
                <div class="stat-card">
                    <h4>Total Kasbon Pembelian</h4>
                    <p class="stat-number" id="totalKasbonPembelianRekap">Rp 0</p>
                    <p class="stat-desc">Total nominal pembelian yang masih berstatus kasbon.</p>
                </div>
            </div>

             <div class="table-section">
                <div class="table-wrapper">
                    <table id="tabelRekap">
                        <thead></thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>

    </div>

    <footer>
        <div class="footer-content">
            <p>&copy; 2025 UD. HD Putra | Pesanggrahan, Kroya | Develop By Anvikha</p>
            </div>
    </footer>

    <script src="script.js"></script>

</body>
</html>