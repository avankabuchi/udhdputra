// ===================================================================================
// JAVASCRIPT LENGKAP UNTUK APLIKASI UD. HD PUTRA
// ===================================================================================

// A. PENGATURAN GLOBAL & VARIABEL STATE
// -----------------------------------------------------------------------------------
const API_URL = 'http://localhost/hdputra/'; // Sesuaikan dengan folder Anda di htdocs XAMPP

// Variabel untuk halaman PEMBELIAN (menggunakan logika asli Anda)
let totalKeseluruhan = 0;

// Variabel untuk halaman PENJUALAN (menggunakan logika baru berbasis array)
let dataPenjualan = [];
let totalKeseluruhanPenjualan = 0;


// B. FUNGSI UTILITAS & NAVIGASI TAB
// -----------------------------------------------------------------------------------

/**
 * Membuka tab yang dipilih dan menyembunyikan yang lain.
 * @param {Event} evt - Event klik mouse.
 * @param {string} tabName - Nama tab yang akan dibuka ('Pembelian', 'Penjualan', 'Rekap').
 */
function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-btn");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    // Jika tab Rekap dibuka, otomatis jalankan rekap default
    if (tabName === 'Rekap') {
        // Automatically click the 'Pembelian Harian' button as default
        const defaultRekapButton = document.querySelector('.rekap-nav .rekap-btn');
        if (defaultRekapButton) {
            // Remove active class from all rekap buttons first
            const rekapBtns = document.querySelectorAll('.rekap-nav .rekap-btn');
            rekapBtns.forEach(btn => btn.classList.remove('active'));
            defaultRekapButton.classList.add('active'); // Set active for default
            // Manually call tampilkanRekap as it's not a direct click event
            tampilkanRekap('pembelian', 'harian', null, null);
        }
    }
}


// C. LOGIKA TAB PEMBELIAN (SESUAI KODE YANG ANDA BERIKAN)
// -----------------------------------------------------------------------------------

function formatRupiah(angka) {
    return parseInt(angka).toLocaleString("id-ID");
}

function updateTotalHarga() {
    // Cek apakah masih ada baris di tabel
    const tbody = document.querySelector("#tabelKayu tbody");
    const rows = tbody.querySelectorAll("tr");

    // Jika tidak ada baris, set total menjadi 0
    if (rows.length === 0) {
        totalKeseluruhan = 0;
    }

    document.getElementById("totalHarga").textContent =
        "💰 Total Harga Keseleluruhan: Rp " + formatRupiah(totalKeseluruhan);

    if (totalKeseluruhan > 0) {
        document.getElementById("formPembayaran").style.display = "block";
        hitungPembayaran(); // Update payment calculation when total changes
    } else {
        document.getElementById("formPembayaran").style.display = "none";
    }
    // Tidak lagi memanggil resetFormPembayaran() di sini agar data pembayaran tidak direset setiap update total harga
    // resetFormPembayaran(); // <--- BARIS INI DIHAPUS
}

function hitungPembayaran() {
    const bayar = parseFloat(document.getElementById("totalBayar").value);
    const hasilDiv = document.getElementById("hasilPembayaran");

    hasilDiv.className = ""; // Clear previous classes

    if (isNaN(bayar) || bayar === 0) {
        hasilDiv.textContent = "Masukkan jumlah pembayaran untuk melihat status";
        hasilDiv.classList.add("empty-payment");
    } else if (bayar === totalKeseluruhan) {
        hasilDiv.textContent = "✅ LUNAS";
        hasilDiv.classList.add("lunas");
    } else if (bayar > totalKeseluruhan) {
        const kembalian = bayar - totalKeseluruhan;
        hasilDiv.textContent = `💰 KEMBALIAN: Rp ${formatRupiah(kembalian)}`;
        hasilDiv.classList.add("kembalian");
    } else {
        const kasbon = totalKeseluruhan - bayar;
        hasilDiv.textContent = `📋 KASBON: Rp ${formatRupiah(kasbon)}`;
        hasilDiv.classList.add("kasbon");
    }
}

function resetFormPembelianLengkap() { // Fungsi baru untuk mereset seluruh form pembelian
    document.querySelector("#tabelKayu tbody").innerHTML = '';
    totalKeseluruhan = 0;
    document.getElementById("namaPenjual").value = ""; // Reset nama penjual
    document.getElementById("totalHarga").textContent = "💰 Total Harga Keseluruhan: Rp 0";
    document.getElementById("totalBayar").value = "";
    document.getElementById("catatan").value = "";
    const hasilDiv = document.getElementById("hasilPembayaran");
    hasilDiv.textContent = "💡 Masukkan jumlah pembayaran untuk melihat status";
    hasilDiv.className = "empty-payment";
    document.getElementById("formPembayaran").style.display = "none"; // Sembunyikan form pembayaran
}

function updateNomorUrut() {
    const tbody = document.querySelector("#tabelKayu tbody");
    const rows = tbody.querySelectorAll("tr");
    rows.forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });
}

function tambahKayu() {
    const jenis = document.getElementById("jenisKayu").value;
    const diameter = parseFloat(document.getElementById("diameter").value);
    const panjang = parseFloat(document.getElementById("panjang").value);
    const hargaSatuan = parseFloat(document.getElementById("hargaSatuan").value);
    const jumlahBaru = parseInt(document.getElementById("jumlah").value) || 1;

    if (!diameter || !panjang || isNaN(hargaSatuan) || !jumlahBaru) {
        alert("Isi semua data dengan benar!");
        return;
    }

    // Menggunakan logika perhitungan volume yang sudah ada
    const volumeM3 = (diameter ** 2 * 785 * panjang) / 1000000;
    const hargaTotalPerBatang = volumeM3 * hargaSatuan;
    const hargaTotalKeseluruhanBaru = hargaTotalPerBatang * jumlahBaru;

    const tbody = document.querySelector("#tabelKayu tbody");
    const rows = tbody.querySelectorAll("tr");
    let found = false;

    // Iterasi melalui baris yang sudah ada untuk mencari kecocokan
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const existingJenis = row.cells[1].textContent;
        const existingDiameter = parseFloat(row.cells[2].textContent);
        const existingPanjang = parseFloat(row.cells[3].textContent);

        // Cek apakah jenis, diameter, dan panjang sama
        if (existingJenis === jenis && existingDiameter === diameter && existingPanjang === panjang) {
            found = true;

            // Dapatkan jumlah batang lama
            let existingJumlah = parseInt(row.cells[4].textContent);

            // Dapatkan harga total lama (bersihkan dari "Rp " dan koma)
            let existingHargaTotalText = row.cells[5].textContent.replace('Rp ', '').replace(/\./g, '');
            let existingHargaTotal = parseFloat(existingHargaTotalText);

            // Kurangi totalKeseluruhan dengan harga lama dari baris ini
            totalKeseluruhan -= existingHargaTotal;

            // Tambah jumlah batang
            existingJumlah += jumlahBaru;
            row.cells[4].textContent = existingJumlah; // Update tampilan jumlah batang

            // Hitung harga total yang baru untuk baris ini
            const newHargaTotalForRow = hargaTotalPerBatang * existingJumlah;
            row.cells[5].textContent = `Rp ${formatRupiah(newHargaTotalForRow)}`; // Update tampilan harga total

            // Tambahkan harga total yang baru ke totalKeseluruhan
            totalKeseluruhan += newHargaTotalForRow;
            break; // Keluar dari loop setelah menemukan dan memperbarui
        }
    }

    // Jika tidak ditemukan baris yang cocok, tambahkan baris baru
    if (!found) {
        const row = tbody.insertRow();
        row.innerHTML = `
    <td></td>
    <td>${jenis}</td>
    <td>${diameter}</td>
    <td>${panjang}</td>
    <td>${jumlahBaru}</td>
    <td>Rp ${formatRupiah(hargaTotalKeseluruhanBaru)}</td>
    <td><button class="btn-delete" onclick="hapusBaris(this, ${hargaTotalKeseluruhanBaru})">❌ Hapus</button></td>
  `;
        totalKeseluruhan += hargaTotalKeseluruhanBaru; // Tambahkan ke total keseluruhan hanya jika baris baru ditambahkan
    }

    updateTotalHarga();
    updateNomorUrut();

    // Clear form inputs
    document.getElementById("diameter").value = "";
    document.getElementById("panjang").value = "";
    document.getElementById("hargaSatuan").value = "";
    document.getElementById("jumlah").value = "1";
}

function hapusBaris(btn, harga) {
    const row = btn.parentElement.parentElement;
    // Ambil harga total yang benar dari teks di sel tabel
    const hargaOnRowText = row.cells[5].textContent.replace('Rp ', '').replace(/\./g, '');
    const hargaOnRow = parseFloat(hargaOnRowText);

    document.getElementById("tabelKayu").deleteRow(row.rowIndex);
    totalKeseluruhan -= hargaOnRow; // Kurangi dengan harga yang sebenarnya ada di baris saat ini
    updateTotalHarga();
    updateNomorUrut();
}

function generateStrukPDF(action = 'download') {
    const namaPenjual = document.getElementById('namaPenjual').value.trim(); // Get nama penjual
    const bayar = parseFloat(document.getElementById("totalBayar").value) || 0;
    const catatan = document.getElementById("catatan").value;

    let statusPembayaran = "";
    if (bayar === 0) {
        statusPembayaran = "Belum ada pembayaran";
    } else if (bayar === totalKeseluruhan) {
        statusPembayaran = "LUNAS";
    } else if (bayar > totalKeseluruhan) {
        const kembalian = bayar - totalKeseluruhan;
        statusPembayaran = `KEMBALIAN: Rp ${formatRupiah(kembalian)}`;
    } else {
        const kasbon = totalKeseluruhan - bayar;
        statusPembayaran = `KASBON: Rp ${formatRupiah(kasbon)}`;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text("UD. HD PUTRA", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" }); // Changed to UD. HD PUTRA

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text("Supplier Kayu Berkualitas Terpercaya", doc.internal.pageSize.getWidth() / 2, 28, { align: "center" });
    doc.text("Pesanggrahan, Kroya", doc.internal.pageSize.getWidth() / 2, 35, { align: "center" });
    doc.text("Telp: 082133843394", doc.internal.pageSize.getWidth() / 2, 42, { align: "center" });

    // Garis pemisah
    doc.setLineWidth(0.5);
    doc.line(20, 42, doc.internal.pageSize.getWidth() - 20, 42);

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("STRUK PEMBELIAN KAYU", doc.internal.pageSize.getWidth() / 2, 52, { align: "center" });

    // Tanggal
    const tanggal = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const waktu = new Date().toLocaleTimeString('id-ID');

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Tanggal: ${tanggal}`, 20, 65);
    doc.text(`Waktu: ${waktu}`, 20, 72);
    doc.text(`Nama Penjual: ${namaPenjual || '-'}`, 20, 79); // Added Nama Penjual

    // Detail items
    let y = 90; // Adjusted starting Y for items
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text("DETAIL PEMBELIAN:", 20, y);
    y += 10;

    const rows = document.querySelectorAll("#tabelKayu tbody tr");

    if (rows.length === 0) {
        doc.setFont(undefined, 'normal');
        doc.text("Tidak ada item dalam keranjang", 20, y);
        y += 15;
    } else {
        doc.setFont(undefined, 'normal');
        rows.forEach((row, index) => {
            const kolom = row.querySelectorAll("td");

            // Baris item
            const itemText = `${index + 1}. ${kolom[1].textContent} (D: ${kolom[2].textContent}cm P: ${kolom[3].textContent}cm, ${kolom[4].textContent}x)`; // More detail
            doc.setFont(undefined, 'bold');
            doc.text(itemText, 25, y);
            y += 6;

            // Subtotal
            doc.setFont(undefined, 'normal');
            const subtotalText = `    Subtotal: ${kolom[5].textContent}`;
            doc.text(subtotalText, 25, y);
            y += 12;

            // Cek jika mendekati batas halaman
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
        });
    }

    // Garis pemisah sebelum total
    y += 5;
    doc.setLineWidth(0.3);
    doc.line(20, y, doc.internal.pageSize.getWidth() - 20, y);
    y += 10;

    // Total dan pembayaran
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL HARGA: Rp ${formatRupiah(totalKeseluruhan)}`, 20, y);
    y += 8;

    doc.setFont(undefined, 'normal');
    doc.text(`Total Bayar: Rp ${formatRupiah(bayar)}`, 20, y);
    y += 8;

    // Status pembayaran dengan highlight
    doc.setFont(undefined, 'bold');
    if (statusPembayaran.includes("LUNAS")) {
        doc.setTextColor(0, 128, 0); // Hijau untuk lunas
    } else if (statusPembayaran.includes("KEMBALIAN")) {
        doc.setTextColor(0, 0, 255); // Biru untuk kembalian
    } else if (statusPembayaran.includes("KASBON")) {
        doc.setTextColor(255, 0, 0); // Merah untuk kasbon
    }

    doc.text(`STATUS: ${statusPembayaran}`, 20, y);
    doc.setTextColor(0, 0, 0); // Reset ke hitam

    // Catatan jika ada
    if (catatan.trim()) {
        y += 15;
        doc.setFont(undefined, 'bold');
        doc.text("CATATAN:", 20, y);
        y += 7;

        doc.setFont(undefined, 'normal');
        // Split catatan jika terlalu panjang
        const catatanLines = doc.splitTextToSize(catatan, doc.internal.pageSize.getWidth() - 40);
        catatanLines.forEach(line => {
            doc.text(line, 20, y);
            y += 6;
        });
    }

    // Signature section
    y += 30; // Add more space before signatures

    // Check if enough space for signatures, if not, add new page
    if (y + 50 > doc.internal.pageSize.getHeight()) {
        doc.addPage();
        y = 20;
    }

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const gap = 60; // Increased gap between sections
    const boxWidth = (pageWidth - (margin * 2) - gap) / 2; // Two boxes with a gap


    // "Tanda Terima:"
    doc.text("Tanda Terima:", margin, y);
    doc.line(margin, y + 20, margin + boxWidth, y + 20); // Line for signature

    // "Hormat Kami,"
    doc.text("Hormat Kami,", margin + boxWidth + gap, y);
    doc.text("UD. HD Putra", margin + boxWidth + gap, y + 5);
    doc.line(margin + boxWidth + gap, y + 20, margin + boxWidth * 2 + gap, y + 20); // Line for signature


    // Footer
    y += 40; // Adjust y to be below signatures
    doc.setLineWidth(0.3);
    doc.line(20, y, doc.internal.pageSize.getWidth() - 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'italic');
    doc.text("Terima kasih atas kepercayaan Anda!", doc.internal.pageSize.getWidth() / 2, y, { align: "center" });
    y += 6;
    doc.text("UD. HD PUTRA - Supplier Kayu Terpercaya | Telp: 082133843394", doc.internal.pageSize.getWidth() / 2, y, { align: "center" });

    // Generate nama file dengan timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const namaFile = `HD_Putra_Pembelian_${timestamp}.pdf`; // Changed filename

    if (action === 'download') {
        doc.save(namaFile);
    } else if (action === 'print') {
        doc.output('dataurlnewwindow');
    }
}

// Helper function to save current form state
function saveFormState(formId) {
    const formElements = document.querySelectorAll(`#${formId} input, #${formId} select, #${formId} textarea`);
    const state = {};
    formElements.forEach(el => {
        if (el.type === 'checkbox' || el.type === 'radio') {
            state[el.id] = el.checked;
        } else {
            state[el.id] = el.value;
        }
    });
    return state;
}

// Helper function to restore form state
function restoreFormState(formId, state) {
    const formElements = document.querySelectorAll(`#${formId} input, #${formId} select, #${formId} textarea`);
    formElements.forEach(el => {
        if (state.hasOwnProperty(el.id)) {
            if (el.type === 'checkbox' || el.type === 'radio') {
                el.checked = state[el.id];
            } else {
                el.value = state[el.id];
            }
            // Manually trigger input events for elements that have them (e.g., totalBayar)
            if (el.oninput) {
                el.oninput();
            }
        }
    });
}

function cetakStruk() {
    hitungPembayaran();

    // Save the current state of the Pembelian form
    const pembelianFormState = saveFormState('Pembelian');
    const currentPembelianTableHTML = document.querySelector("#tabelKayu tbody").innerHTML; // Save table content
    const currentTotalKeseluruhan = totalKeseluruhan; // Save global variable

    // Buat konten struk dalam format yang sama dengan PDF
    const namaPenjual = document.getElementById('namaPenjual').value.trim(); // Get nama penjual
    const bayar = parseFloat(document.getElementById("totalBayar").value) || 0;
    const catatan = document.getElementById("catatan").value;

    let statusPembayaran = "";
    if (bayar === 0) {
        statusPembayaran = "Belum ada pembayaran";
    } else if (bayar === totalKeseluruhan) {
        statusPembayaran = "LUNAS";
    } else if (bayar > totalKeseluruhan) {
        const kembalian = bayar - totalKeseluruhan;
        statusPembayaran = `KEMBALIAN: Rp ${formatRupiah(kembalian)}`;
    } else {
        const kasbon = totalKeseluruhan - bayar;
        statusPembayaran = `KASBON: Rp ${formatRupiah(kasbon)}`;
    }

    const tanggal = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const waktu = new Date().toLocaleTimeString('id-ID');

    // Buat HTML untuk struk
    let strukHTML = `
<div id="strukPrint" style="display:none;">
  <div style="text-align: center; margin-bottom: 20px; font-family: 'Times New Roman', serif;">
    <h1 style="font-size: 20px; font-weight: bold; margin: 0;">UD. HD PUTRA</h1> <p style="margin: 3px 0; font-size: 12px;">Supplier Kayu Berkualitas Terpercaya</p>
    <p style="margin: 3px 0; font-size: 12px;">Pesanggrahan, Kroya</p>
    <p style="margin: 3px 0; font-size: 12px;">Telp: 082133843394</p>
    <hr style="border: 0.5px solid #000; margin: 10px 0;">
    <h2 style="font-size: 14px; font-weight: bold; margin: 8px 0;">STRUK PEMBELIAN KAYU</h2>
  </div>

  <div style="margin-bottom: 15px; font-family: 'Times New Roman', serif; font-size: 10px;">
    <p style="margin: 3px 0;"><strong>Tanggal:</strong> ${tanggal}</p>
    <p style="margin: 3px 0;"><strong>Waktu:</strong> ${waktu}</p>
    <p style="margin: 3px 0;"><strong>Nama Penjual:</strong> ${namaPenjual || '-'}</p> </div>

  <div style="margin-bottom: 15px; font-family: 'Times New Roman', serif;">
    <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 11px;">DETAIL PEMBELIAN:</h3>`;

    const rows = document.querySelectorAll("#tabelKayu tbody tr");
    if (rows.length === 0) {
        strukHTML += `<p style="font-size: 10px; margin-left: 10px;">Tidak ada item dalam keranjang</p>`;
    } else {
        rows.forEach((row, index) => {
            const kolom = row.querySelectorAll("td");
            strukHTML += `
    <div style="margin-bottom: 12px; margin-left: 10px; font-size: 10px;">
      <p style="font-weight: bold; margin: 0;">${index + 1}. ${kolom[1].textContent} (D: ${kolom[2].textContent}cm P: ${kolom[3].textContent}cm, ${kolom[4].textContent}x)</p>
      <p style="margin: 2px 0 0 15px;">Subtotal: ${kolom[5].textContent}</p>
    </div>`;
        });
    }

    strukHTML += `
  </div>

  <hr style="border: 0.3px solid #000; margin: 15px 0;">

  <div style="margin-bottom: 15px; font-family: 'Times New Roman', serif; font-size: 12px;">
    <p style="font-weight: bold; margin: 3px 0;">TOTAL HARGA: Rp ${formatRupiah(totalKeseluruhan)}</p>
    <p style="margin: 3px 0;">Total Bayar: Rp ${formatRupiah(bayar)}</p>
    <p style="font-weight: bold; margin: 3px 0; color: ${statusPembayaran.includes('LUNAS') ? 'green' : statusPembayaran.includes('KEMBALIAN') ? 'blue' : statusPembayaran.includes('KASBON') ? 'red' : 'black'};">
      STATUS: ${statusPembayaran}
    </p>
  </div>`;

    if (catatan.trim()) {
        strukHTML += `
  <div style="margin-bottom: 15px; font-family: 'Times New Roman', serif; font-size: 10px;">
    <p style="font-weight: bold; margin: 3px 0;">CATATAN:</p>
    <p style="margin: 3px 0; padding-left: 10px;">${catatan}</p>
  </div>`;
    }

    strukHTML += `
  <div class="signature-section" style="margin-top: 40px; font-family: 'Times New Roman', serif; font-size: 10px;">
    <div class="signature-row" style="display: flex; justify-content: space-around; margin-top: 60px;">
      <div class="signature-box" style="text-align: center; width: 45%;">
        <p style="margin: 0;">Tanda Terima:</p>
        <div style="margin-top: 40px; border-bottom: 1px solid #000; width: 80%; margin-left: auto; margin-right: auto;"></div>
      </div>
      <div class="signature-box" style="text-align: center; width: 45%;">
        <p style="margin: 0;">Hormat Kami,</p>
        <p style="margin: 0;">UD. HD Putra</p>
        <div style="margin-top: 25px; border-bottom: 1px solid #000; width: 80%; margin-left: auto; margin-right: auto;"></div>
      </div>
    </div>
  </div>

  <hr style="border: 0.3px solid #000; margin: 15px 0;">

  <div style="text-align: center; font-family: 'Times New Roman', serif; font-size: 10px;">
    <p style="font-style: italic; margin: 3px 0;">Terima kasih atas kepercayaan Anda!</p>
    <p style="font-style: italic; margin: 3px 0;">UD. HD PUTRA - Supplier Kayu Terpercaya | Telp: 082133843394</p>
  </div>
</div>`;

    // Tambahkan HTML struk ke body
    document.body.insertAdjacentHTML('beforeend', strukHTML);

    // Sembunyikan konten utama dan tampilkan struk
    const originalContent = document.body.innerHTML;
    const strukContent = document.getElementById('strukPrint').innerHTML;

    document.body.innerHTML = strukContent;

    // Cetak
    window.print();

    // Kembalikan konten asli setelah cetak
    setTimeout(() => {
        document.body.innerHTML = originalContent;
        // Restore form state after DOM reconstruction
        restoreFormState('Pembelian', pembelianFormState);
        document.querySelector("#tabelKayu tbody").innerHTML = currentPembelianTableHTML; // Restore table content
        totalKeseluruhan = currentTotalKeseluruhan; // Restore global variable
        updateTotalHarga(); // Recalculate and display totals
        updateNomorUrut(); // Re-index rows
    }, 100);
}

function downloadPDF() {
    hitungPembayaran();
    generateStrukPDF('download');
}

// Panggil resetFormPembelianLengkap() saat halaman pertama kali dimuat atau saat memulai transaksi pembelian baru
// document.addEventListener('DOMContentLoaded', resetFormPembelianLengkap); // Ini akan mereset form pembelian saat dimuat


// D. LOGIKA TAB PENJUALAN
// -----------------------------------------------------------------------------------

function tambahBarangPenjualan() {
    const nama = document.getElementById("namaBarang").value.trim();
    const jumlah = parseInt(document.getElementById("jumlahPenjualan").value) || 1;
    const hargaSatuan = parseFloat(document.getElementById("hargaSatuanPenjualan").value);

    if (!nama || isNaN(jumlah) || isNaN(hargaSatuan)) {
        alert("Isi semua data penjualan dengan benar!");
        return;
    }
    const hargaTotal = jumlah * hargaSatuan;
    dataPenjualan.push({ id: Date.now(), nama, jumlah, hargaSatuan, hargaTotal });
    updateTabelPenjualan();
    // Reset hanya input untuk item baru, bukan detail pembeli atau pembayaran
    document.getElementById("namaBarang").value = "";
    document.getElementById("hargaSatuanPenjualan").value = "";
    document.getElementById("jumlahPenjualan").value = "1";
    document.getElementById("namaBarang").focus(); // Fokuskan kembali ke input nama barang
}

function updateTabelPenjualan() {
    const tbody = document.querySelector("#tabelPenjualan tbody");
    tbody.innerHTML = "";
    totalKeseluruhanPenjualan = 0;
    dataPenjualan.forEach((item, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `<td>${index + 1}</td><td>${item.nama}</td><td>${item.jumlah}</td><td>Rp ${formatRupiah(item.hargaSatuan)}</td><td>Rp ${formatRupiah(item.hargaTotal)}</td><td><button class="btn-delete" onclick="hapusItemPenjualan(${item.id})">❌ Hapus</button></td>`;
        totalKeseluruhanPenjualan += item.hargaTotal;
    });
    document.getElementById("totalHargaPenjualan").textContent = `💰 Total Harga Keseluruhan: Rp ${formatRupiah(totalKeseluruhanPenjualan)}`;
    document.getElementById("formPembayaranPenjualan").style.display = totalKeseluruhanPenjualan > 0 ? 'block' : 'none';
    hitungPembayaranPenjualan();
}

function hitungPembayaranPenjualan() {
    const bayar = parseFloat(document.getElementById("totalBayarPenjualan").value) || 0;
    const hasilDiv = document.getElementById("hasilPembayaranPenjualan");
    hasilDiv.className = ""; // Bersihkan kelas sebelumnya

    if (totalKeseluruhanPenjualan === 0) {
        hasilDiv.textContent = "Tambahkan barang terlebih dahulu.";
        hasilDiv.classList.add("empty-payment");
    } else if (isNaN(bayar) || bayar === 0) {
        hasilDiv.textContent = "Masukkan jumlah pembayaran untuk melihat status";
        hasilDiv.classList.add("empty-payment");
    } else if (bayar >= totalKeseluruhanPenjualan) {
        const kembalian = bayar - totalKeseluruhanPenjualan;
        hasilDiv.textContent = `LUNAS - Kembalian: Rp ${formatRupiah(kembalian)}`;
        hasilDiv.classList.add("lunas");
    } else {
        const kasbon = totalKeseluruhanPenjualan - bayar;
        hasilDiv.textContent = `KASBON: Rp ${formatRupiah(kasbon)}`;
        hasilDiv.classList.add("kasbon");
    }
}

function hapusItemPenjualan(id) {
    dataPenjualan = dataPenjualan.filter(item => item.id !== id);
    updateTabelPenjualan();
}

function resetFormPenjualanLengkap() { // Fungsi baru untuk mereset seluruh form penjualan
    dataPenjualan = [];
    totalKeseluruhanPenjualan = 0;
    document.getElementById('namaPembeli').value = '';
    document.getElementById("namaBarang").value = "";
    document.getElementById("hargaSatuanPenjualan").value = "";
    document.getElementById("jumlahPenjualan").value = "1";
    document.getElementById('totalBayarPenjualan').value = '';
    document.getElementById('catatanPenjualan').value = '';
    document.getElementById("totalHargaPenjualan").textContent = `💰 Total Harga Keseluruhan: Rp 0`;
    document.getElementById("formPembayaranPenjualan").style.display = 'none';
    const tbody = document.querySelector("#tabelPenjualan tbody");
    tbody.innerHTML = ""; // Kosongkan tabel
    const hasilDiv = document.getElementById("hasilPembayaranPenjualan");
    hasilDiv.textContent = "💡 Masukkan jumlah pembayaran untuk melihat status";
    hasilDiv.className = "empty-payment";
}


// Fungsi baru untuk menghasilkan struk PDF penjualan
function generateStrukPDFPenjualan(action = 'download') {
    const namaPembeli = document.getElementById('namaPembeli').value.trim();
    const bayar = parseFloat(document.getElementById("totalBayarPenjualan").value) || 0;
    const catatan = document.getElementById("catatanPenjualan").value;

    let statusPembayaran = "";
    if (bayar === 0) {
        statusPembayaran = "Belum ada pembayaran";
    } else if (bayar === totalKeseluruhanPenjualan) {
        statusPembayaran = "LUNAS";
    } else if (bayar > totalKeseluruhanPenjualan) {
        const kembalian = bayar - totalKeseluruhanPenjualan;
        statusPembayaran = `KEMBALIAN: Rp ${formatRupiah(kembalian)}`;
    } else {
        const kasbon = totalKeseluruhanPenjualan - bayar;
        statusPembayaran = `KASBON: Rp ${formatRupiah(kasbon)}`;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text("UD. HD PUTRA", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" }); // Changed to UD. HD PUTRA

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text("Supplier Kayu Berkualitas Terpercaya", doc.internal.pageSize.getWidth() / 2, 28, { align: "center" });
    doc.text("Pesanggrahan, Kroya", doc.internal.pageSize.getWidth() / 2, 35, { align: "center" });
    doc.text("Telp: 082133843394", doc.internal.pageSize.getWidth() / 2, 42, { align: "center" });

    // Garis pemisah
    doc.setLineWidth(0.5);
    doc.line(20, 42, doc.internal.pageSize.getWidth() - 20, 42);

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("STRUK PENJUALAN BARANG", doc.internal.pageSize.getWidth() / 2, 52, { align: "center" });

    // Tanggal
    const tanggal = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const waktu = new Date().toLocaleTimeString('id-ID');

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Tanggal: ${tanggal}`, 20, 65);
    doc.text(`Waktu: ${waktu}`, 20, 72);
    doc.text(`Nama Pembeli: ${namaPembeli || '-'}`, 20, 79);


    // Detail items
    let y = 90;
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text("DETAIL PENJUALAN:", 20, y);
    y += 10;

    if (dataPenjualan.length === 0) {
        doc.setFont(undefined, 'normal');
        doc.text("Tidak ada item dalam keranjang", 20, y);
        y += 15;
    } else {
        dataPenjualan.forEach((item, index) => {
            const itemText = `${index + 1}. ${item.nama} (${item.jumlah}x)`;
            doc.setFont(undefined, 'bold');
            doc.text(itemText, 25, y);
            y += 6;

            doc.setFont(undefined, 'normal');
            const detailText = `    Harga Satuan: Rp ${formatRupiah(item.hargaSatuan)}`;
            doc.text(detailText, 25, y);
            y += 6;

            const subtotalText = `    Subtotal: Rp ${formatRupiah(item.hargaTotal)}`;
            doc.text(subtotalText, 25, y);
            y += 12;

            // Cek jika mendekati batas halaman
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
        });
    }

    // Garis pemisah sebelum total
    y += 5;
    doc.setLineWidth(0.3);
    doc.line(20, y, doc.internal.pageSize.getWidth() - 20, y);
    y += 10;

    // Total dan pembayaran
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL HARGA: Rp ${formatRupiah(totalKeseluruhanPenjualan)}`, 20, y);
    y += 8;

    doc.setFont(undefined, 'normal');
    doc.text(`Total Bayar: Rp ${formatRupiah(bayar)}`, 20, y);
    y += 8;

    // Status pembayaran dengan highlight
    doc.setFont(undefined, 'bold');
    if (statusPembayaran.includes("LUNAS")) {
        doc.setTextColor(0, 128, 0); // Hijau untuk lunas
    } else if (statusPembayaran.includes("KEMBALIAN")) {
        doc.setTextColor(0, 0, 255); // Biru untuk kembalian
    } else if (statusPembayaran.includes("KASBON")) {
        doc.setTextColor(255, 0, 0); // Merah untuk kasbon
    }

    doc.text(`STATUS: ${statusPembayaran}`, 20, y);
    doc.setTextColor(0, 0, 0); // Reset ke hitam

    // Catatan jika ada
    if (catatan.trim()) {
        y += 15;
        doc.setFont(undefined, 'bold');
        doc.text("CATATAN:", 20, y);
        y += 7;

        doc.setFont(undefined, 'normal');
        const catatanLines = doc.splitTextToSize(catatan, doc.internal.pageSize.getWidth() - 40);
        catatanLines.forEach(line => {
            doc.text(line, 20, y);
            y += 6;
        });
    }

    // Signature section
    y += 30; // Add more space before signatures

    // Check if enough space for signatures, if not, add new page
    if (y + 50 > doc.internal.pageSize.getHeight()) {
        doc.addPage();
        y = 20;
    }

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const gap = 60; // Increased gap between sections
    const boxWidth = (pageWidth - (margin * 2) - gap) / 2; // Two boxes with a gap

    // "Tanda Terima:"
    doc.text("Tanda Terima:", margin, y);
    doc.line(margin, y + 20, margin + boxWidth, y + 20); // Line for signature

    // "Hormat Kami,"
    doc.text("Hormat Kami,", margin + boxWidth + gap, y);
    doc.text("UD. HD Putra", margin + boxWidth + gap, y + 5);
    doc.line(margin + boxWidth + gap, y + 20, margin + boxWidth * 2 + gap, y + 20); // Line for signature


    // Footer
    y += 40; // Adjust y to be below signatures
    doc.setLineWidth(0.3);
    doc.line(20, y, doc.internal.pageSize.getWidth() - 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'italic');
    doc.text("Terima kasih atas kepercayaan Anda!", doc.internal.pageSize.getWidth() / 2, y, { align: "center" });
    y += 6;
    doc.text("UD. HD PUTRA - Supplier Kayu Terpercaya | Telp: 082133843394", doc.internal.pageSize.getWidth() / 2, y, { align: "center" });

    // Generate nama file dengan timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const namaFile = `HD_Putra_Penjualan_${timestamp}.pdf`;

    if (action === 'download') {
        doc.save(namaFile);
    } else if (action === 'print') {
        doc.output('dataurlnewwindow');
    }
}

// Fungsi untuk mencetak struk penjualan
function cetakStrukPenjualan() {
    hitungPembayaranPenjualan();

    // Save the current state of the Penjualan form
    const penjualanFormState = saveFormState('Penjualan');
    const currentDataPenjualan = JSON.parse(JSON.stringify(dataPenjualan)); // Deep copy the array
    const currentTotalKeseluruhanPenjualan = totalKeseluruhanPenjualan; // Save global variable

    const namaPembeli = document.getElementById('namaPembeli').value.trim();
    const bayar = parseFloat(document.getElementById("totalBayarPenjualan").value) || 0;
    const catatan = document.getElementById("catatanPenjualan").value;

    let statusPembayaran = "";
    if (bayar === 0) {
        statusPembayaran = "Belum ada pembayaran";
    } else if (bayar === totalKeseluruhanPenjualan) {
        statusPembayaran = "LUNAS";
    } else if (bayar > totalKeseluruhanPenjualan) {
        const kembalian = bayar - totalKeseluruhanPenjualan;
        statusPembayaran = `KEMBALIAN: Rp ${formatRupiah(kembalian)}`;
    } else {
        const kasbon = totalKeseluruhanPenjualan - bayar;
        statusPembayaran = `KASBON: Rp ${formatRupiah(kasbon)}`;
    }

    const tanggal = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const waktu = new Date().toLocaleTimeString('id-ID');

    let strukHTML = `
<div id="strukPrintPenjualan" style="display:none;">
  <div style="text-align: center; margin-bottom: 20px; font-family: 'Times New Roman', serif;">
    <h1 style="font-size: 20px; font-weight: bold; margin: 0;">UD. HD PUTRA</h1> <p style="margin: 3px 0; font-size: 12px;">Supplier Kayu Berkualitas Terpercaya</p>
    <p style="margin: 3px 0; font-size: 12px;">Pesanggrahan, Kroya</p>
    <p style="margin: 3px 0; font-size: 12px;">Telp: 082133843394</p>
    <hr style="border: 0.5px solid #000; margin: 10px 0;">
    <h2 style="font-size: 14px; font-weight: bold; margin: 8px 0;">STRUK PENJUALAN BARANG</h2>
  </div>

  <div style="margin-bottom: 15px; font-family: 'Times New Roman', serif; font-size: 10px;">
    <p style="margin: 3px 0;"><strong>Tanggal:</strong> ${tanggal}</p>
    <p style="margin: 3px 0;"><strong>Waktu:</strong> ${waktu}</p>
    <p style="margin: 3px 0;"><strong>Nama Pembeli:</strong> ${namaPembeli || '-'}</p>
  </div>

  <div style="margin-bottom: 15px; font-family: 'Times New Roman', serif;">
    <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 11px;">DETAIL PENJUALAN:</h3>`;

    if (dataPenjualan.length === 0) {
        strukHTML += `<p style="font-size: 10px; margin-left: 10px;">Tidak ada item dalam keranjang</p>`;
    } else {
        dataPenjualan.forEach((item, index) => {
            strukHTML += `
    <div style="margin-bottom: 12px; margin-left: 10px; font-size: 10px;">
      <p style="font-weight: bold; margin: 0;">${index + 1}. ${item.nama} (${item.jumlah}x)</p>
      <p style="margin: 2px 0 2px 15px;">Harga Satuan: Rp ${formatRupiah(item.hargaSatuan)}</p>
      <p style="margin: 2px 0 0 15px;">Subtotal: Rp ${formatRupiah(item.hargaTotal)}</p>
    </div>`;
        });
    }

    strukHTML += `
  </div>

  <hr style="border: 0.3px solid #000; margin: 15px 0;">

  <div style="margin-bottom: 15px; font-family: 'Times New Roman', serif; font-size: 12px;">
    <p style="font-weight: bold; margin: 3px 0;">TOTAL HARGA: Rp ${formatRupiah(totalKeseluruhanPenjualan)}</p>
    <p style="margin: 3px 0;">Total Bayar: Rp ${formatRupiah(bayar)}</p>
    <p style="font-weight: bold; margin: 3px 0; color: ${statusPembayaran.includes('LUNAS') ? 'green' : statusPembayaran.includes('KEMBALIAN') ? 'blue' : statusPembayaran.includes('KASBON') ? 'red' : 'black'};">
      STATUS: ${statusPembayaran}
    </p>
  </div>`;

    if (catatan.trim()) {
        strukHTML += `
  <div style="margin-bottom: 15px; font-family: 'Times New Roman', serif; font-size: 10px;">
    <p style="font-weight: bold; margin: 3px 0;">CATATAN:</p>
    <p style="margin: 3px 0; padding-left: 10px;">${catatan}</p>
  </div>`;
    }

    strukHTML += `
  <div class="signature-section" style="margin-top: 40px; font-family: 'Times New Roman', serif; font-size: 10px;">
    <div class="signature-row" style="display: flex; justify-content: space-around; margin-top: 60px;">
      <div class="signature-box" style="text-align: center; width: 45%;">
        <p style="margin: 0;">Tanda Terima:</p>
        <div style="margin-top: 40px; border-bottom: 1px solid #000; width: 80%; margin-left: auto; margin-right: auto;"></div>
      </div>
      <div class="signature-box" style="text-align: center; width: 45%;">
        <p style="margin: 0;">Hormat Kami,</p>
        <p style="margin: 0;">UD. HD Putra</p>
        <div style="margin-top: 25px; border-bottom: 1px solid #000; width: 80%; margin-left: auto; margin-right: auto;"></div>
      </div>
    </div>
  </div>

  <hr style="border: 0.3px solid #000; margin: 15px 0;">

  <div style="text-align: center; font-family: 'Times New Roman', serif; font-size: 10px;">
    <p style="font-style: italic; margin: 3px 0;">Terima kasih atas kepercayaan Anda!</p>
    <p style="font-style: italic; margin: 3px 0;">UD. HD PUTRA - Supplier Kayu Terpercaya | Telp: 082133843394</p>
  </div>
</div>`;

    document.body.insertAdjacentHTML('beforeend', strukHTML);

    const originalContent = document.body.innerHTML;
    const strukContent = document.getElementById('strukPrintPenjualan').innerHTML;

    document.body.innerHTML = strukContent;

    window.print();

    setTimeout(() => {
        document.body.innerHTML = originalContent;
        // Restore form state after DOM reconstruction
        restoreFormState('Penjualan', penjualanFormState);
        dataPenjualan = currentDataPenjualan; // Restore global array
        totalKeseluruhanPenjualan = currentTotalKeseluruhanPenjualan; // Restore global variable
        updateTabelPenjualan(); // Recalculate and display totals
    }, 100);
}

// Fungsi untuk mengunduh PDF penjualan
function downloadPDFPenjualan() {
    hitungPembayaranPenjualan();
    generateStrukPDFPenjualan('download');
}

// NEW: Functions to handle "Transaksi Selesai"
function selesaiTransaksiPembelian() {
    if (confirm("Apakah Anda yakin ingin menyelesaikan transaksi pembelian ini dan mereset form?")) {
        resetFormPembelianLengkap();
        alert("Transaksi pembelian selesai dan form direset.");
    }
}

function selesaiTransaksiPenjualan() {
    if (confirm("Apakah Anda yakin ingin menyelesaikan transaksi penjualan ini dan mereset form?")) {
        resetFormPenjualanLengkap();
        alert("Transaksi penjualan selesai dan form direset.");
    }
}


// F. FUNGSI SIMPAN KE DATABASE
// -----------------------------------------------------------------------------------

async function simpanTransaksi(tipe) {
    let url, payload;
    if (tipe === 'pembelian') {
        const rows = document.querySelectorAll("#tabelKayu tbody tr");
        if (rows.length === 0) {
            alert("Tidak ada data pembelian untuk disimpan.");
            return;
        }

        const namaPenjual = document.getElementById('namaPenjual').value.trim(); // Get nama penjual
        if (!namaPenjual) {
            alert("Nama penjual harus diisi!");
            return;
        }

        const totalBayar = parseFloat(document.getElementById('totalBayar').value) || 0;
        const catatan = document.getElementById('catatan').value;

        let statusPembayaran = '';
        if (totalBayar === totalKeseluruhan) {
            statusPembayaran = 'LUNAS';
        } else if (totalBayar > totalKeseluruhan) {
            statusPembayaran = 'LUNAS'; // Considered LUNAS if overpaid, with kembalian
        } else {
            statusPembayaran = 'KASBON';
        }

        const itemsToSave = Array.from(rows).map(row => ({
            jenis: row.cells[1].textContent,
            diameter: parseFloat(row.cells[2].textContent),
            panjang: parseFloat(row.cells[3].textContent),
            jumlah: parseInt(row.cells[4].textContent),
            hargaTotal: parseFloat(row.cells[5].textContent.replace('Rp ', '').replace(/\./g, ''))
        }));
        url = `${API_URL}simpan_pembelian.php`;
        payload = {
            transaksi: {
                namaPenjual: namaPenjual, // Include nama penjual
                totalKeseluruhan: totalKeseluruhan,
                totalBayar: totalBayar,
                status: statusPembayaran,
                catatan: catatan
            },
            items: itemsToSave
        };

    } else if (tipe === 'penjualan') {
        if (dataPenjualan.length === 0) {
            alert("Tidak ada data penjualan untuk disimpan.");
            return;
        }
        const namaPembeli = document.getElementById('namaPembeli').value.trim();
        if (!namaPembeli) {
            alert("Nama pembeli harus diisi!");
            return;
        }
        const totalBayar = parseFloat(document.getElementById('totalBayarPenjualan').value) || 0;
        let status = 'KASBON';
        if (totalBayar >= totalKeseluruhanPenjualan) status = 'LUNAS';
        url = `${API_URL}simpan_penjualan.php`;
        payload = {
            pembeli: {
                nama: namaPembeli,
                totalKeseluruhan: totalKeseluruhanPenjualan,
                totalBayar: totalBayar,
                status: status,
                catatan: document.getElementById('catatanPenjualan').value
            },
            items: dataPenjualan
        };
    }

    try {
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const result = await response.json();
        alert(result.message);
        if (result.status === 'success') {
            // REMOVED: resetFormPembelianLengkap() or resetFormPenjualanLengkap() calls
            // Data will remain visible after saving, only "Transaksi Selesai" button will clear it.
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal menyimpan data ke server. Pastikan XAMPP dan server PHP berjalan.');
    }
}


// G. LOGIKA TAB REKAP
// -----------------------------------------------------------------------------------

async function tampilkanRekap(tipe, periode, startDate = null, endDate = null) {
    const rekapBtns = document.querySelectorAll('.rekap-nav .rekap-btn');
    rekapBtns.forEach(btn => btn.classList.remove('active'));

    // Set active class for the clicked button if it's a daily/monthly filter
    if (periode !== '' || (startDate === null && endDate === null)) { // This means it's a daily/monthly click
        const clickedButton = document.querySelector(`.rekap-nav button[onclick*="tampilkanRekap('${tipe}', '${periode}'"]`);
        if (clickedButton) {
            clickedButton.classList.add('active');
        }
    }
    // For custom date range, no rekap-nav button gets active

    let url = `${API_URL}rekap.php?tipe=${tipe}`;
    let titleText = `Rekap ${tipe.charAt(0).toUpperCase() + tipe.slice(1)}`;

    if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
        titleText += ` - Periode Kustom: ${startDate} hingga ${endDate}`;
    } else {
        url += `&periode=${periode}`;
        if (periode === 'harian') {
            titleText += ' - Harian';
        } else if (periode === 'bulanan') {
            titleText += ' - Bulanan';
        }
    }

    document.getElementById('rekapTitle').textContent = titleText;

    try {
        const response = await fetch(url);
        const result = await response.json();
        if (result.status === 'success') {
            renderTabelRekap(tipe, result.data);
            // Pass the new kasbon totals to the summary function
            updateRekapSummary(result.summary.total_penjualan, result.summary.total_pembelian, result.summary.total_kasbon_penjualan, result.summary.total_kasbon_pembelian);
        } else {
            alert(result.message);
            renderTabelRekap(tipe, []); // Clear table on error
            updateRekapSummary(0, 0, 0, 0); // Clear summary on error
        }
    } catch (error) {
        console.error('Error fetching rekap:', error);
        alert('Gagal mengambil data rekap.');
        renderTabelRekap(tipe, []); // Clear table on fetch error
        updateRekapSummary(0, 0, 0, 0); // Clear summary on fetch error
    }
}

// New function to trigger rekap by custom date range
function tampilkanRekapByDateRange() {
    const startDate = document.getElementById('startDateRekap').value;
    const endDate = document.getElementById('endDateRekap').value;

    if (!startDate || !endDate) {
        alert("Pilih tanggal mulai dan tanggal akhir untuk filter kustom.");
        return;
    }

    // Determine current active rekap type (pembelian/penjualan) for the rekap details table
    // Find which of the 'Pembelian Harian/Bulanan' or 'Penjualan Harian/Bulanan' is currently active
    const currentActiveRekapBtn = document.querySelector('.rekap-nav .rekap-btn.active');
    let currentTipe = 'pembelian'; // Default type if no button is active (shouldn't happen on normal flow)
    if (currentActiveRekapBtn) {
        const btnText = currentActiveRekapBtn.textContent.toLowerCase();
        if (btnText.includes('penjualan')) {
            currentTipe = 'penjualan';
        } else if (btnText.includes('pembelian')) {
            currentTipe = 'pembelian';
        }
    }

    // Deactivate all rekap-nav buttons as this is a custom filter
    const rekapBtns = document.querySelectorAll('.rekap-nav .rekap-btn');
    rekapBtns.forEach(btn => btn.classList.remove('active'));

    tampilkanRekap(currentTipe, '', startDate, endDate); // Pass empty string for periode
}


function renderTabelRekap(tipe, data) {
    const thead = document.querySelector("#tabelRekap thead");
    const tbody = document.querySelector("#tabelRekap tbody");
    thead.innerHTML = "";
    tbody.innerHTML = "";

    // Determine colspan based on the number of columns in the header
    let colspan = 0;

    if (tipe === 'pembelian') {
        thead.innerHTML = `<tr><th>No</th><th>Tanggal</th><th>Nama Penjual</th><th>Total Keseluruhan</th><th>Total Bayar</th><th>Status Pembayaran</th><th>Catatan</th><th>Detail Barang</th><th>Aksi</th></tr>`;
        colspan = 9;
        data.forEach((item, index) => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${new Date(item.tanggal_pembelian).toLocaleString('id-ID')}</td>
                <td>${item.nama_penjual || '-'}</td>
                <td>Rp ${formatRupiah(item.total_keseluruhan)}</td>
                <td>Rp ${formatRupiah(item.total_bayar)}</td>
                <td class="${item.status_pembayaran.toLowerCase()}">${item.status_pembayaran}</td>
                <td>${item.catatan || '-'}</td>
                <td>${item.items_detail || '-'}</td>
                <td><button class="btn-delete" onclick="hapusRekapData('pembelian', ${item.id})">❌ Hapus</button></td>
            `;
        });
    } else if (tipe === 'penjualan') {
        // Menambahkan kolom 'Catatan' ke header tabel penjualan
        thead.innerHTML = `<tr><th>No</th><th>Tanggal</th><th>Nama Pembeli</th><th>Total Transaksi</th><th>Total Bayar</th><th>Status Pembayaran</th><th>Catatan</th><th>Detail Barang</th><th>Aksi</th></tr>`;
        colspan = 9; // Menambah colspan karena ada kolom 'Catatan' baru
        data.forEach((item, index) => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${new Date(item.tanggal_penjualan).toLocaleString('id-ID')}</td>
                <td>${item.nama_pembeli}</td>
                <td>Rp ${formatRupiah(item.total_keseluruhan)}</td>
                <td>Rp ${formatRupiah(item.total_bayar || 0)}</td>
                <td class="${item.status_pembayaran.toLowerCase()}">${item.status_pembayaran}</td>
                <td>${item.catatan || '-'}</td> <td>${item.items || '-'}</td>
                <td><button class="btn-delete" onclick="hapusRekapData('penjualan', ${item.id})">❌ Hapus</button></td>
            `;
        });
    }

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center;">Tidak ada data untuk periode ini.</td></tr>`;
    }
}

// Function to handle deleting recap data
async function hapusRekapData(tipe, id) {
    if (!confirm(`Apakah Anda yakin ingin menghapus transaksi ${tipe} ini (ID: ${id})?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}rekap.php?action=delete&tipe=${tipe}&id=${id}`, {
            method: 'GET' // Using GET for simplicity, consider POST for actual delete operations
        });
        const result = await response.json();
        alert(result.message);
        if (result.status === 'success') {
            // Re-fetch and display the recap data after deletion
            const currentActiveRekapBtn = document.querySelector('.rekap-nav .rekap-btn.active');
            let currentTipe = tipe; // Default to the type being deleted
            let currentPeriode = '';
            let currentStartDate = document.getElementById('startDateRekap').value;
            let currentEndDate = document.getElementById('endDateRekap').value;

            if (currentActiveRekapBtn) {
                const onclickAttr = currentActiveRekapBtn.getAttribute('onclick');
                const match = onclickAttr.match(/tampilkanRekap\('([^']*)', '([^']*)'/);
                if (match) {
                    currentTipe = match[1];
                    currentPeriode = match[2];
                }
            }

            if (!currentStartDate || !currentEndDate) { // If not custom range, use current period
                tampilkanRekap(currentTipe, currentPeriode, null, null);
            } else { // If it was a custom range, re-apply the custom range
                tampilkanRekap(currentTipe, '', currentStartDate, currentEndDate);
            }
        }
    } catch (error) {
        console.error('Error deleting rekap data:', error);
        alert('Gagal menghapus data rekap.');
    }
}


// Modified to accept new kasbon parameters
function updateRekapSummary(totalPenjualan, totalPembelian, totalKasbonPenjualan, totalKasbonPembelian) {
    document.getElementById('totalPendapatanRekap').textContent = `Rp ${formatRupiah(totalPenjualan)}`;
    document.getElementById('totalPengeluaranRekap').textContent = `Rp ${formatRupiah(totalPembelian)}`;
    const estimasiKeuntungan = totalPenjualan - totalPembelian;
    document.getElementById('estimasiKeuntunganRekap').textContent = `Rp ${formatRupiah(estimasiKeuntungan)}`;
    const estimasiKeuntunganElement = document.getElementById('estimasiKeuntunganRekap');
    if (estimasiKeuntungan >= 0) {
        estimasiKeuntunganElement.style.color = '#27ae60'; // Green for profit
    } else {
        estimasiKeuntunganElement.style.color = '#e74c3c'; // Red for loss
    }
    // Update the new kasbon elements
    document.getElementById('totalKasbonPenjualanRekap').textContent = `Rp ${formatRupiah(totalKasbonPenjualan)}`;
    document.getElementById('totalKasbonPembelianRekap').textContent = `Rp ${formatRupiah(totalKasbonPembelian)}`;
    // Optional: Add styling for kasbon if negative, though kasbon implies outstanding, so typically positive values
    document.getElementById('totalKasbonPenjualanRekap').style.color = '#e67e22'; // Orange for kasbon
    document.getElementById('totalKasbonPembelianRekap').style.color = '#e67e22'; // Orange for kasbon
}


// G. INISIALISASI HALAMAN
// -----------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Otomatis buka tab pertama saat halaman dimuat
    const defaultTabButton = document.querySelector('.tab-btn');
    if (defaultTabButton) {
        defaultTabButton.click();
    }
    // Panggil updateTabelPenjualan() untuk memastikan total penjualan dan tampilan form pembayaran terinisialisasi
    // dan form pembelian juga diinisialisasi tanpa mereset data input.
    updateTabelPenjualan(); // Untuk penjualan
    updateTotalHarga(); // Untuk pembelian, akan mengatur visibilitas form pembayaran
});