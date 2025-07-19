// assets/js/main.js
// Oleh             : Wahyu Ajis Mustofa
// Update Terakhir  : Jumat, 18 Juli 2025

// ===================================================================
// INISIALISASI
// ===================================================================
let devMode = false; // Set true untuk mode pengembangan


// ===================================================================
// PRODUK HANDLER
// ===================================================================

// ================== DATA PRODUK ==================
let dataProduk = [];
let dataProdukShow = {};
let dataProdukUpdate = {};
let filters = {};

const urlProduk = "/assets/data/produk.json";
const idProdukContainer = 'daftar-produk';
const idFilterContainer = 'filter-produk';
const keyFilterProduk = ['acara','tema']; // contoh : ['nama','kategori']
let PRODUK_PER_HALAMAN = 10;
let classNameSettings = {
  filtersItem: 'filter-item',
  filtersLabel: 'filter-label',
  filtersSelect: 'filter-select',
  produkWrapper: 'produk-wrapper',
  produkItem: 'produk-item',
  produkIMG: 'produk-img',
  produkDetail: 'produk-detail',
  produkName: 'produk-name',
  produkBTNWrapper: 'produk-btn-wrapper',
  loadMoreWrapper: 'loadmore-wrapper'
};

async function initProduk() {
  await getDataProduk();
  WAM.cekSync(dataProdukUpdate);
  filters = readURLParams();
  updateDataProdukShow();
  renderFilters(dataProduk, idFilterContainer, keyFilterProduk);
  renderProduk(dataProdukShow, idProdukContainer);
}

async function getDataProduk() {
  data = await fetchJsonData(urlProduk);
  dataProduk = data.produk || [];
  dataProdukUpdate.nama = "produk";
  dataProdukUpdate.updated = data.updated;
  delete data.updated;
}

function updateDataProdukShow() {
  dataProdukShow = filterData(dataProduk, filters);
}

async function fetchJsonData(url) {
  try {
    const timestamp = Date.now();
    const connector = url.includes('?') ? '&' : '?';
    const fullUrl = `${url}${connector}t=${timestamp}`;

    const response = await fetch(fullUrl);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Gagal membaca file JSON:", error);
    return null;
  }
}


function filterData(data, filters) {
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (typeof value === 'string') {
        return item[key]?.toLowerCase() === value.toLowerCase();
      }
      return item[key] === value;
    });
  });
}

function renderFilters(data, idFilterContainer, keys) {
  const container = document.getElementById(idFilterContainer);
  if (!container) return console.warn(`Element #${idFilterContainer} tidak ditemukan.`);

  container.innerHTML = "";

  let filteredData = data;

  keys.forEach((key, index) => {
    // Jika sebelumnya ada filter, gunakan untuk filter data
    if (index > 0) {
      const prevKey = keys[index - 1];
      const prevValue = filters[prevKey];
      if (prevValue) {
        filteredData = filteredData.filter(item => item[prevKey] === prevValue);
      }
    }

    // Lewati jika key tidak ada dalam data yang telah difilter
    if (!filteredData.some(item => key in item)) return;

    const id = `filter-${key}`;
    const label = key.charAt(0).toUpperCase() + key.slice(1).replaceAll('_', ' ');

    const uniqueValues = [...new Set(filteredData.map(item => item[key]).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'id', { sensitivity: 'base' }));

    const div = document.createElement('div');
    div.className = classNameSettings.filtersItem;

    const labelEl = document.createElement('label');
    labelEl.setAttribute('for', id);
    labelEl.className = classNameSettings.filtersLabel;
    labelEl.textContent = label;

    const selectEl = document.createElement('select');
    selectEl.id = id;
    selectEl.name = key;
    selectEl.setAttribute('aria-label', label);
    selectEl.className = classNameSettings.filtersSelect;

    const optAll = document.createElement('option');
    optAll.value = "";
    optAll.textContent = `-- Semua ${label} --`;
    selectEl.appendChild(optAll);

    uniqueValues.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      if (filters[key] === value) option.selected = true;
      selectEl.appendChild(option);
    });

    // Event listener untuk update filters dan render ulang
    selectEl.addEventListener('change', () => {
      filters[key] = selectEl.value;
      // Reset semua filter di bawahnya
      for (let i = index + 1; i < keys.length; i++) {
        delete filters[keys[i]];
      }
      renderFilters(data, idFilterContainer, keys);
    });

    div.appendChild(labelEl);
    div.appendChild(selectEl);
    container.appendChild(div);
  });
  setupFilterListeners(idFilterContainer);
}

function setupFilterListeners(idFilterContainer) {
  const wrapper = document.getElementById(idFilterContainer);
  if (!wrapper) return console.warn(`Elemen dengan id "${idFilterContainer}" tidak ditemukan.`);

  const selects = wrapper.querySelectorAll("select");

  selects.forEach(select => {
    select.addEventListener("change", function () {
      const key = select.name || select.id.replace(/^filter-/, '');
      const value = select.value;

      if (value === "") {
        delete filters[key];
      } else {
        filters[key] = value;
      }
      writeURLParams(filters);
      updateDataProdukShow();
      renderProduk(dataProdukShow, idProdukContainer);
    });
  });
}

function writeURLParams(obj) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(obj)) {
    if (value !== "") {
      params.set(key, value);
    }
  }

  const newURL = `${window.location.pathname}?${params.toString()}`;
  history.replaceState(null, "", newURL);
}

function readURLParams() {
  const params = new URLSearchParams(window.location.search);
  const obj = {};

  for (const [key, value] of params.entries()) {
    obj[key] = value;
  }

  return obj;
}


// ================== RENDER PRODUK ==================
function renderProduk(data, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Elemen dengan id "${containerId}" tidak ditemukan.`);
    return;
  }
  
  let currentIndex = 0;
  // Hapus konten sebelumnya
  container.innerHTML = "";
  const existingBtn = document.getElementById(`${containerId}-load-more`);
  if (existingBtn) existingBtn.remove();

  // Fungsi untuk render sebagian data
  function loadMore() {
    const slice = data.slice(currentIndex, currentIndex + PRODUK_PER_HALAMAN);

    slice.forEach((tema) => {
      const card = document.createElement("div");
      card.className = classNameSettings.produkWrapper;

      card.innerHTML = `
        <div class="${classNameSettings.produkItem}">
          <img src="${tema.img}" alt="${tema.nama}" loading="lazy" class="${classNameSettings.produkIMG}">
        </div>
        <div class="${classNameSettings.produkDetail}">
          <h4 class="${classNameSettings.produkName}">${tema.nama}</h4>
          <div class="${classNameSettings.produkBTNWrapper}">
            <button aria-label="Preview ${tema.nama}" onclick="window.open('${tema.link_produk}', '_blank')">Preview</button>
          </div>
        </div>
      `;

      container.appendChild(card);
    });

    currentIndex += PRODUK_PER_HALAMAN;

    // Tampilkan atau hapus tombol jika sudah habis
    if (currentIndex < data.length) {
      showLoadMoreButton();
    } else {
      const btnWrapper = document.getElementById(`${containerId}-load-more-wrapper`);
      const btn = document.getElementById(`${containerId}-load-more`);
      if (btnWrapper) btnWrapper.remove();
      if (btn) btn.disabled = true;
    }
  }

  // Fungsi buat tombol load more
function showLoadMoreButton() {
  let wrapperId = `${containerId}-load-more-wrapper`;
  let btnId = `${containerId}-load-more`;

  // Cek dan buat wrapper jika belum ada
  let btnWrapper = document.getElementById(wrapperId);
  if (!btnWrapper) {
    btnWrapper = document.createElement("div");
    btnWrapper.id = wrapperId;
    btnWrapper.className = classNameSettings.loadMoreWrapper;
    container.parentElement.appendChild(btnWrapper);
  }

  // Cek dan buat tombol jika belum ada
  let btn = document.getElementById(btnId);
  if (!btn) {
    btn = document.createElement("button");
    btn.id = btnId;
    btn.setAttribute('aria-label', 'Lihat Lebih Banyak');
    btn.textContent = "Lihat Lebih Banyak";
    btn.onclick = loadMore;

    btnWrapper.appendChild(btn);
  }
}


  // Pertama kali muat
  loadMore();
}

// ===================================================
// PENGATURAN HALAMAN
// ===================================================
function toggleMenu() {
  const menu = document.getElementById('mobile-menu');
  menu.classList.toggle('hidden');
}

// ===================================================
// EVENT HANDLER
// ===================================================
document.addEventListener("DOMContentLoaded", function () {
  initProduk();
});

// ===================================================
// Testing
// ===================================================
