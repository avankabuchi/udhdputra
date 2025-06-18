<?php
include 'db_config.php';

$data = json_decode(file_get_contents("php://input"));

// Pastikan ada data item dan data transaksi
if (!empty($data->items) && isset($data->transaksi)) {
    try {
        $conn->beginTransaction();

        // 1. Simpan ringkasan transaksi utama ke tabel 'pembelian_transaksi'
        $stmt_transaksi = $conn->prepare(
            "INSERT INTO pembelian_transaksi (total_keseluruhan, total_bayar, status_pembayaran, catatan) VALUES (?, ?, ?, ?)"
        );
        $stmt_transaksi->execute([
            $data->transaksi->totalKeseluruhan,
            $data->transaksi->totalBayar,
            $data->transaksi->status,
            $data->transaksi->catatan
        ]);
        // Ambil ID dari transaksi yang baru saja disimpan
        $transaksi_id_fk = $conn->lastInsertId();

        // 2. Simpan setiap item ke tabel 'pembelian'
        $stmt_items = $conn->prepare(
            "INSERT INTO pembelian (transaksi_id, transaksi_id_fk, jenis_kayu, diameter, panjang, jumlah, harga_total) VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        
        // Buat ID grup yang sama untuk semua item dalam satu kali simpan
        $transaksi_id_group = "PEM-" . time(); 

        foreach ($data->items as $item) {
            $stmt_items->execute([
                $transaksi_id_group,
                $transaksi_id_fk, // ID dari tabel pembelian_transaksi
                $item->jenis,
                $item->diameter,
                $item->panjang,
                $item->jumlah,
                $item->hargaTotal
            ]);
        }
        
        $conn->commit();
        echo json_encode(['status' => 'success', 'message' => 'Data pembelian berhasil disimpan!']);

    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap atau tidak valid.']);
}
?>