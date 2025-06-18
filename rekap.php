<?php
include 'db_config.php';

$tipe = isset($_GET['tipe']) ? $_GET['tipe'] : ''; // 'pembelian' atau 'penjualan'
$periode = isset($_GET['periode']) ? $_GET['periode'] : ''; // 'harian' atau 'bulanan' atau '' for custom range
$startDate = isset($_GET['startDate']) ? $_GET['startDate'] : '';
$endDate = isset($_GET['endDate']) ? $_GET['endDate'] : '';
$action = isset($_GET['action']) ? $_GET['action'] : ''; // New: for delete action
$id_to_delete = isset($_GET['id']) ? (int)$_GET['id'] : 0; // New: ID to delete

// Handle delete action first
if ($action == 'delete' && $id_to_delete > 0) {
    try {
        $conn->beginTransaction();
        if ($tipe == 'pembelian') {
            // Delete related items first due to foreign key constraints (if any)
            // Assuming 'pembelian' table has a foreign key to 'pembelian_transaksi'
            $stmt_delete_items = $conn->prepare("DELETE FROM pembelian WHERE transaksi_id_fk = ?");
            $stmt_delete_items->execute([$id_to_delete]);

            $stmt_delete_transaksi = $conn->prepare("DELETE FROM pembelian_transaksi WHERE id = ?");
            $stmt_delete_transaksi->execute([$id_to_delete]);
        } elseif ($tipe == 'penjualan') {
            // Delete related items first
            $stmt_delete_items = $conn->prepare("DELETE FROM penjualan_items WHERE transaksi_id = ?");
            $stmt_delete_items->execute([$id_to_delete]);

            $stmt_delete_transaksi = $conn->prepare("DELETE FROM penjualan_transaksi WHERE id = ?");
            $stmt_delete_transaksi->execute([$id_to_delete]);
        }
        $conn->commit();
        echo json_encode(['status' => 'success', 'message' => 'Data berhasil dihapus!']);
        exit(); // Exit after handling delete
    } catch (PDOException $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => 'Gagal menghapus data: ' . $e->getMessage()]);
        exit(); // Exit on error
    }
}


$sql = "";
$sumPenjualan = 0;
$sumPembelian = 0;
$sumKasbonPenjualan = 0; // New variable for Kasbon Penjualan
$sumKasbonPembelian = 0; // New variable for Kasbon Pembelian

$whereClause = "";
$params = [];

if (!empty($startDate) && !empty($endDate)) {
    // Custom date range filter
    // Note: The WHERE clause for sum queries will be built separately
} else {
    // Harian or Bulanan logic for main query
    if ($periode == 'harian') {
        $whereClause = " WHERE DATE(pt.tanggal_pembelian) = CURDATE()"; // Example for pembelian
    } elseif ($periode == 'bulanan') {
        $whereClause = " WHERE MONTH(pt.tanggal_pembelian) = MONTH(CURDATE()) AND YEAR(pt.tanggal_pembelian) = YEAR(CURDATE())"; // Example for pembelian
    }
}

// Build the main SQL query for detailed transactions based on $tipe
if ($tipe == 'pembelian') {
    // Added nama_penjual to SELECT
    $sql = "SELECT pt.id, pt.tanggal_pembelian, pt.nama_penjual, pt.total_keseluruhan, pt.total_bayar, pt.status_pembayaran, pt.catatan, GROUP_CONCAT(CONCAT(p.jenis_kayu, ' (D:', p.diameter, 'cm P:', p.panjang, 'cm, ', p.jumlah, 'x) @Rp', FORMAT(p.harga_total, 0, 'id_ID')) SEPARATOR '; ') AS items_detail FROM pembelian_transaksi pt JOIN pembelian p ON pt.id = p.transaksi_id_fk";
    if (!empty($startDate) && !empty($endDate)) {
        $sql .= " WHERE DATE(pt.tanggal_pembelian) BETWEEN ? AND ?";
        $params = [$startDate, $endDate];
    } else if ($periode == 'harian') {
        $sql .= " WHERE DATE(pt.tanggal_pembelian) = CURDATE()";
    } elseif ($periode == 'bulanan') {
        $sql .= " WHERE MONTH(pt.tanggal_pembelian) = MONTH(CURDATE()) AND YEAR(pt.tanggal_pembelian) = YEAR(CURDATE())";
    }
    $sql .= " GROUP BY pt.id ORDER BY pt.tanggal_pembelian DESC";
} elseif ($tipe == 'penjualan') {
    // Menambahkan kolom 'catatan' ke SELECT statement untuk penjualan
    $sql = "SELECT pt.id, pt.nama_pembeli, pt.total_keseluruhan, pt.total_bayar, pt.status_pembayaran, pt.tanggal_penjualan, pt.catatan, GROUP_CONCAT(CONCAT(pi.nama_barang, ' (', pi.jumlah, 'x)')) AS items FROM penjualan_transaksi pt JOIN penjualan_items pi ON pt.id = pi.transaksi_id";
    if (!empty($startDate) && !empty($endDate)) {
        $sql .= " WHERE DATE(pt.tanggal_penjualan) BETWEEN ? AND ?";
        $params = [$startDate, $endDate];
    } else if ($periode == 'harian') {
        $sql .= " WHERE DATE(pt.tanggal_penjualan) = CURDATE()";
    } elseif ($periode == 'bulanan') {
        $sql .= " WHERE MONTH(pt.tanggal_penjualan) = MONTH(CURDATE()) AND YEAR(pt.tanggal_penjualan) = YEAR(CURDATE())";
    }
    $sql .= " GROUP BY pt.id ORDER BY pt.tanggal_penjualan DESC";
}


$results = [];

if (!empty($sql)) {
    try {
        $stmt = $conn->prepare($sql);
        // Correctly bind parameters for the main query
        if (!empty($params)) {
            $stmt->execute($params);
        } else {
            $stmt->execute(); // No parameters needed for CURDATE() or MONTH(CURDATE())
        }
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch sum for total sales for the period
        $sumSqlPenjualan = "SELECT SUM(total_keseluruhan) AS total_sum FROM penjualan_transaksi pt";
        $sumSqlKasbonPenjualan = "SELECT SUM(total_keseluruhan - total_bayar) AS total_kasbon FROM penjualan_transaksi pt WHERE status_pembayaran = 'KASBON'"; // New Kasbon Query
        $paramsPenjualan = [];
        if (!empty($startDate) && !empty($endDate)) {
            $sumSqlPenjualan .= " WHERE DATE(pt.tanggal_penjualan) BETWEEN ? AND ?";
            $sumSqlKasbonPenjualan .= " AND DATE(pt.tanggal_penjualan) BETWEEN ? AND ?"; // Apply filter to Kasbon Query
            $paramsPenjualan = [$startDate, $endDate];
        } else if ($periode == 'harian') {
            $sumSqlPenjualan .= " WHERE DATE(pt.tanggal_penjualan) = CURDATE()";
            $sumSqlKasbonPenjualan .= " AND DATE(pt.tanggal_penjualan) = CURDATE()"; // Apply filter to Kasbon Query
        } elseif ($periode == 'bulanan') {
            $sumSqlPenjualan .= " WHERE MONTH(pt.tanggal_penjualan) = MONTH(CURDATE()) AND YEAR(pt.tanggal_penjualan) = YEAR(CURDATE())";
            $sumSqlKasbonPenjualan .= " AND MONTH(pt.tanggal_penjualan) = MONTH(CURDATE()) AND YEAR(pt.tanggal_penjualan) = YEAR(CURDATE())"; // Apply filter to Kasbon Query
        }
        $stmtPenjualanSum = $conn->prepare($sumSqlPenjualan);
        $stmtKasbonPenjualanSum = $conn->prepare($sumSqlKasbonPenjualan); // Prepare Kasbon Query
        if (!empty($paramsPenjualan)) {
            $stmtPenjualanSum->execute($paramsPenjualan);
            $stmtKasbonPenjualanSum->execute($paramsPenjualan); // Execute Kasbon Query
        } else {
            $stmtPenjualanSum->execute();
            $stmtKasbonPenjualanSum->execute(); // Execute Kasbon Query
        }
        $resPenjualanSum = $stmtPenjualanSum->fetch(PDO::FETCH_ASSOC);
        $resKasbonPenjualanSum = $stmtKasbonPenjualanSum->fetch(PDO::FETCH_ASSOC); // Fetch Kasbon Result
        $sumPenjualan = $resPenjualanSum['total_sum'] ?? 0;
        $sumKasbonPenjualan = $resKasbonPenjualanSum['total_kasbon'] ?? 0; // Get Kasbon Sum


        // Fetch sum for total purchases for the period
        $sumSqlPembelian = "SELECT SUM(total_keseluruhan) AS total_sum FROM pembelian_transaksi pt";
        $sumSqlKasbonPembelian = "SELECT SUM(total_keseluruhan - total_bayar) AS total_kasbon FROM pembelian_transaksi pt WHERE status_pembayaran = 'KASBON'"; // New Kasbon Query
        $paramsPembelian = [];
        if (!empty($startDate) && !empty($endDate)) {
            $sumSqlPembelian .= " WHERE DATE(pt.tanggal_pembelian) BETWEEN ? AND ?";
            $sumSqlKasbonPembelian .= " AND DATE(pt.tanggal_pembelian) BETWEEN ? AND ?"; // Apply filter to Kasbon Query
            $paramsPembelian = [$startDate, $endDate];
        } else if ($periode == 'harian') {
            $sumSqlPembelian .= " WHERE DATE(pt.tanggal_pembelian) = CURDATE()";
            $sumSqlKasbonPembelian .= " AND DATE(pt.tanggal_pembelian) = CURDATE()"; // Apply filter to Kasbon Query
        } elseif ($periode == 'bulanan') {
            $sumSqlPembelian .= " WHERE MONTH(pt.tanggal_pembelian) = MONTH(CURDATE()) AND YEAR(pt.tanggal_pembelian) = YEAR(CURDATE())";
            $sumSqlKasbonPembelian .= " AND MONTH(pt.tanggal_pembelian) = MONTH(CURDATE()) AND YEAR(pt.tanggal_pembelian) = YEAR(CURDATE())"; // Apply filter to Kasbon Query
        }
        $stmtPembelianSum = $conn->prepare($sumSqlPembelian);
        $stmtKasbonPembelianSum = $conn->prepare($sumSqlKasbonPembelian); // Prepare Kasbon Query
        if (!empty($paramsPembelian)) {
            $stmtPembelianSum->execute($paramsPembelian);
            $stmtKasbonPembelianSum->execute($paramsPembelian); // Execute Kasbon Query
        } else {
            $stmtPembelianSum->execute();
            $stmtKasbonPembelianSum->execute(); // Execute Kasbon Query
        }
        $resPembelianSum = $stmtPembelianSum->fetch(PDO::FETCH_ASSOC);
        $resKasbonPembelianSum = $stmtKasbonPembelianSum->fetch(PDO::FETCH_ASSOC); // Fetch Kasbon Result
        $sumPembelian = $resPembelianSum['total_sum'] ?? 0;
        $sumKasbonPembelian = $resKasbonPembelianSum['total_kasbon'] ?? 0; // Get Kasbon Sum


        echo json_encode([
            'status' => 'success',
            'data' => $results,
            'summary' => [
                'total_penjualan' => $sumPenjualan,
                'total_pembelian' => $sumPembelian,
                'total_kasbon_penjualan' => $sumKasbonPenjualan, // Include in response
                'total_kasbon_pembelian' => $sumKasbonPembelian // Include in response
            ]
        ]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Query failed: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Parameter tidak valid.']);
}
?>