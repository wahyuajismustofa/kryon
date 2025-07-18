
async function fetchJsonData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[wam-sync]: Gagal membaca file JSON:", error);
    return null;
  }
}
const WAM = (() => {
let config = {};
let repoInfo = {};

async function init() {
    config = await fetchJsonData('/config.json');
    repoInfo = config.repository;
}
init();
function cekSync(data) {
  try {
    if (!data.updated) {
      console.log("[wam-sync]: Belum ada data update, memulai sinkronisasi...");
      sync(data);
      return;
    }
    
    const [tanggal, waktu] = data.updated.split(', ');
    const [hari, bulan, tahun] = tanggal.split('/').map(Number);
    const [jam, menit, detik] = waktu.split('.').map(Number);
    
    const lastUpdate = new Date(tahun, bulan - 1, hari, jam, menit, detik);
    const now = new Date();

    const satuHari = 24 * 60 * 60 * 1000;

    if (now - lastUpdate > satuHari) {
      console.log("[wam-sync]: Data lebih dari 1 hari, melakukan sinkronisasi ulang...");
      sync(data);
    } else {
      console.log("[wam-sync]: Data masih uptodate, tidak perlu sync.");
    }
  } catch (error) {
    console.error("[wam-sync]: Format data.updated tidak valid:", error);
    sync(data);
  }
}

async function sync(data) {
  try {
    const GAS_BASE_URL = "https://script.google.com/macros/s/AKfycbwYIx89d6ij_YaGIp6b51shXvidJ4lADni5syseXZWM6SRlWAxAOa4i2UlSD03AxXzKpQ/exec";

    const url1 = `${GAS_BASE_URL}?conn=DATABASE=${repoInfo.repo}_${data.nama}`;
    
    const res1 = await fetch(url1);

    const data1 = await res1.json();

    if (data1.status === true) {
      console.log(`[wam-sync]: Data ${data.nama} berhasil diperbarui.`);
    }
  } catch (error) {
    console.error("[wam-sync]: Terjadi kesalahan:", error);
  }
}

  return {
    cekSync,sync
  };

})();