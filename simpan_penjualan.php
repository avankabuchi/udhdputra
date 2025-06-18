<?php
include 'db_config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->items) && isset($data->pembeli)) {
    try {
        // 1. Simpan transaksi utama
        // Menambahkan 'catatan' ke daftar kolom dan nilai yang di-bind
        $stmt_transaksi = $conn->prepare("INSERT INTO penjualan_transaksi (nama_pembeli, total_keseluruhan, total_bayar, status_pembayaran, catatan) VALUES (?, ?, ?, ?, ?)");
        $stmt_transaksi->execute([
            $data->pembeli->nama,
            $data->pembeli->totalKeseluruhan,
            $data->pembeli->totalBayar,
            $data->pembeli->status,
            $data->pembeli->catatan // Menyimpan nilai catatan dari payload
        ]);
        $transaksi_id = $conn->lastInsertId();

        // 2. Simpan item-item terkait
        $stmt_items = $conn->prepare("INSERT INTO penjualan_items (transaksi_id, nama_barang, jumlah, harga_satuan, harga_total) VALUES (?, ?, ?, ?, ?)");
        foreach ($data->items as $item) {
            $stmt_items->execute([
                $transaksi_id,
                $item->nama,
                $item->jumlah,
                $item->hargaSatuan,
                $item->hargaTotal
            ]);
        }
        echo json_encode(['status' => 'success', 'message' => 'Data penjualan berhasil disimpan!']);

    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap.']);
}
?>