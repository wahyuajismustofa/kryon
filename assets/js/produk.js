const PRODUK_PER_HALAMAN = 20;

// State aplikasi
let allData = {};
let produkList = [];
let kategoriSet = new Set();
let currentList = [];
let currentIndex = 0;

// Elemen DOM 
let produkSelect, kategoriSelect, produkListSection, loadMoreBtn;

// Fungsi utama setelah DOM siap
document.addEventListener('DOMContentLoaded', function () {
    initDOMReferences();
    fetchDataProduk();
    setupEventListeners();
});

// Inisialisasi elemen DOM yang dibutuhkan
function initDOMReferences() {
    produkSelect = document.getElementById('filter-produk');
    kategoriSelect = document.getElementById('filter-kategori');
    produkListSection = document.getElementById('daftar-produk');
    loadMoreBtn = document.getElementById('load-more');
}

// Ambil data produk dari file JSON
function fetchDataProduk() {
    fetch('/assets/data/produk.json')
        .then(response => response.json())
        .then(data => {
            if (data.updated) window.updated = data.updated;

            allData = data;
            produkList = Object.keys(data);

            renderProdukSelect();
            handleURLParameters();
            renderProduk(true);
            // cekDanSync();
        });
}

// Render dropdown produk
function renderProdukSelect() {
    if (!produkSelect) return;
    produkSelect.innerHTML = produkList.map(p =>
        `<option value="${p}"${p === 'Undangan_Web' ? ' selected' : ''}>${p.replace(/_/g, ' ')}</option>`
    ).join('');
}

// Cek parameter di URL: ?produk=...&kategori=...
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramProduk = urlParams.get('produk')?.toLowerCase();
    const paramKategori = urlParams.get('kategori')?.toLowerCase();

    // Cek & atur produk berdasarkan URL
    if (paramProduk && produkSelect) {
        const foundProduk = produkList.find(p => 
            p.toLowerCase().replace(/_/g, '-') === paramProduk
        );
        if (foundProduk) {
            produkSelect.value = foundProduk;
        }
    }

    // Perbarui kategori setelah produk dipilih
    updateKategori();

    // Cek & atur kategori berdasarkan URL
    if (paramKategori && kategoriSelect) {
        const foundKategori = Array.from(kategoriSelect.options).find(opt => 
            opt.value.toLowerCase() === paramKategori
        );
        if (foundKategori) {
            kategoriSelect.value = foundKategori.value;
        }
    }
}


// Event listener untuk select produk dan kategori
function setupEventListeners() {
    if (produkSelect) {
        produkSelect.addEventListener('change', () => {
            currentIndex = 0;
            updateKategori();
            renderProduk(true);
            updateURLParams();
        });
    }

    if (kategoriSelect) {
        kategoriSelect.addEventListener('change', () => {
            currentIndex = 0;
            renderProduk(true);
            updateURLParams();
        });
    }
}

function updateURLParams() {
    const params = new URLSearchParams(window.location.search);

    const produkValue = produkSelect?.value || '';
    const kategoriValue = kategoriSelect?.value || '';

    // Update parameter produk dan kategori dalam huruf kecil
    if (produkValue) {
        params.set('produk', produkValue.replace(/_/g, '-').toLowerCase());
    }

    if (kategoriValue) {
        params.set('kategori', kategoriValue.toLowerCase());
    } else {
        params.delete('kategori');
    }

    // Ganti URL tanpa reload halaman
    const newURL = `${window.location.pathname}?${params.toString()}`;
    history.replaceState({}, '', newURL);
}



// Update isi dropdown kategori berdasarkan produk terpilih
function updateKategori() {
    const selectedProduk = produkSelect.value || 'Undangan_Web';
    kategoriSet = new Set();

    if (allData[selectedProduk]) {
        allData[selectedProduk].forEach(produk => {
            if (produk.kategori) kategoriSet.add(produk.kategori);
        });
    }

    if (kategoriSelect) {
        kategoriSelect.innerHTML = '<option value="">Semua Kategori</option>' +
            Array.from(kategoriSet).map(k => `<option value="${k}">${k}</option>`).join('');
    }
}

// Render produk ke halaman
function renderProduk(reset = false) {
    if (reset && produkListSection) produkListSection.innerHTML = '';
    if (loadMoreBtn) loadMoreBtn.classList.add('hidden');

    const selectedProduk = produkSelect.value || 'Undangan_Web';
    const selectedKategori = kategoriSelect.value;
    let list = allData[selectedProduk] || [];

    if (selectedKategori) {
        list = list.filter(p => p.kategori === selectedKategori);
    }

    if (reset) {
        currentIndex = 0;
        currentList = list;
    }

    const nextBatch = currentList.slice(currentIndex, currentIndex + PRODUK_PER_HALAMAN);
    nextBatch.forEach(produk => {
        const div = document.createElement('div');
        div.className = 'w-full md:w-1/3 xl:w-1/4 p-6 flex flex-col produk-item-dinamis';
        div.innerHTML = `
            <a href="${produk.link_produk || '#'}">
                <img class="hover:grow hover:shadow-lg" src="${produk.img}" alt="${produk.nama}">
                <div class="pt-3 flex items-center justify-between">
                    <p class="nama-produk">${produk.nama}</p>
                </div>
                <p class="keterangan-produk pt-1 text-gray-900">${produk.keterangan || 'Ready'}</p>
            </a>
        `;
        produkListSection.appendChild(div);
    });

    currentIndex += PRODUK_PER_HALAMAN;

    if (loadMoreBtn) {
        if (currentIndex < currentList.length) {
            loadMoreBtn.classList.remove('hidden');
            loadMoreBtn.onclick = () => renderProduk(false);
        } else {
            loadMoreBtn.classList.add('hidden');
        }
    }
}

function cekDanSync() {
  try {
    if (!window.updated) {
      console.log("Belum ada data update, memulai sinkronisasi...");
      syncData();
      return;
    }

    // Misal: '11/6/2025, 19.07.54'
    const [tanggal, waktu] = window.updated.split(', ');

    // Pecah tanggal
    const [hari, bulan, tahun] = tanggal.split('/').map(Number);

    // Pecah waktu
    const [jam, menit, detik] = waktu.split('.').map(Number);

    // Buat objek Date
    const lastUpdate = new Date(tahun, bulan - 1, hari, jam, menit, detik);
    const now = new Date();

    const satuHari = 24 * 60 * 60 * 1000;

    if (now - lastUpdate > satuHari) {
      console.log("Data lebih dari 1 hari, melakukan sinkronisasi ulang...");
      syncData();
    } else {
      console.log("Data masih uptodate, tidak perlu sync.");
    }
  } catch (error) {
    console.error("Format window.updated tidak valid:", error);
    syncData();
  }
}

async function syncData() {
  try {
    const GAS_BASE_URL = "https://script.google.com/macros/s/AKfycbwYIx89d6ij_YaGIp6b51shXvidJ4lADni5syseXZWM6SRlWAxAOa4i2UlSD03AxXzKpQ/exec";

    // Bangun URL lengkap dengan parameter untuk masing-masing permintaan
    const url1 = `${GAS_BASE_URL}?conn=DATABASE=kryon_produk`;

    // Kirim permintaan GET ke Google Apps Script Web App
    const res1 = await fetch(url1);

    const data1 = await res1.json();

    if (data1.status === true) {
      console.log("Data Produk berhasil diperbarui.");
    }
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
}

