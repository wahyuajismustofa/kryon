//redirect www khusus github page

(function redirectToWWW() {
  const hostname = window.location.hostname;
  
  if (!hostname.startsWith('www.') && !/^localhost$|^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    const newHostname = 'www.' + hostname;
    const newUrl = window.location.protocol + '//' + newHostname + window.location.pathname + window.location.search + window.location.hash;
    window.location.replace(newUrl);
  }
})();
if (location.protocol === 'http:') {
  location.href = 'https://' + location.hostname + location.pathname + location.search + location.hash;
}

function insertGtagScript() {
  const head = document.head;
  if (!head) return;

  if (document.querySelector('script[src*="gtag/js?id=${varConfig.google_tag}"]')) return;

  const gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${varConfig.google_tag}`;

  const gtagConfigScript = document.createElement('script');
  gtagConfigScript.text = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${varConfig.google_tag}');
  `;
  head.appendChild(gtagScript);
  head.appendChild(gtagConfigScript);
}

/*Variabel*/
let dirImg = 'https://ik.imagekit.io/mustofa/web/img/';
let timerPopWa;
let popWa;
let root, dataProduk, pageConfig, varConfig;

const burger = document.getElementById('burger');
const dropdown = document.getElementById('dropdownMenu');
const loadingScreen = document.getElementById('loading-screen');
burger.addEventListener('click', () => {
  dropdown.classList.toggle('imp-hidden');
});

const fungsiMap = {
  productRendering,
  productRenderingWithFilters,
  insertGtagScript,
  addElementAfterBody,
  lazyLoadImg,
  addElement,
  scrollWa
};
async function init() {
	root = await getRoot();
	dataProduk = await getData('produk');
	setting = await getData('setting');
	const currentPath = window.location.pathname + window.location.search;
    pageConfig = setting.katalog.find(p => p.path === currentPath);
	varConfig = setting.variabel[0];

	if (!pageConfig) {
	  window.location.href = "/";
	  return;
	}

    if (dataProduk[pageConfig.data]) {
      fungsiMap[pageConfig.rendering]();
    } else {
      console.warn("Data untuk halaman ini tidak ditemukan.");
    }

	if (pageConfig.fungsi && pageConfig.fungsi.trim() !== "") {
	  pageConfig.fungsi.split(",").forEach(nama => {
		if (fungsiMap[nama]) {
		  fungsiMap[nama]();
		} else {
		  console.warn(`Fungsi "${nama}" tidak ditemukan di fungsiMap`);
		}
	  });
	}

	fungsiDefault();
}
async function fungsiDefault() {
	await insertGtagScript();
	await loadMenu();
	await addElementAfterBody();
	await addElement();
	await scrollWa();
	await lazyLoadImg();
	await loadingScreen.classList.add('imp-hidden');
	await cekDanSync();
}
async function getRoot() {
	try {
		const response = await fetch("/root.json");
		if (!response.ok) throw new Error("Gagal mengambil data");
		return await response.json();
	} catch (err) {
		console.error("Error:", err.message);
		return {};
	}
}
async function getData(data) {
	try {
		const response = await fetch(`/data/${data}.json`);
		if (!response.ok) throw new Error("Gagal mengambil data");
		return await response.json();
	} catch (err) {
		console.error("Error:", err.message);
		return {};
	}
}
function loadMenu() {
	setting["menu"].forEach(item => {
	  const link = document.createElement('a');
	  link.href = item.url;
	  link.textContent = item.label;
	  dropdown.appendChild(link);
	});
      
}
function addElementAfterBody (){
    const htmlString = `
      <!-- Modal Konfirmasi -->
      <div class="imp-hidden" id="confirmModal" >
        <div style="background: white; padding: 20px; border-radius: 8px; max-width: 300px; text-align: center;">
          <p id="confirmText" style="margin-bottom: 20px;">Apakah anda yakin?</p>
          <div style="display: flex; justify-content: space-around;">
            <button id="confirmYes" style="padding: 10px 20px;">Ya</button>
            <button id="confirmNo" style="padding: 10px 20px;">Tidak</button>
          </div>
        </div>
      </div>

      <!-- WhatsApp Pop Up -->
      <div class="imp-hidden" id="pop-wa">
        <div class="container-auto column">
          <img src="https://ik.imagekit.io/mustofa/web/img/icon-wa.png" class="icon-xlarge" onclick="chatAdmin('Hallo kak, saya ingin bertanya tentang produk Kryon')">
          <div class="container-auto flex flex-align-center flex-justify-center" style="background-color:white;border-radius:20px 20px 20px 0px ;padding:10px;height:20px;">
            <h6 onclick="chatAdmin('Hallo kak, saya ingin bertanya tentang produk Kryon')">Butuh Bantuan?</h6>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', htmlString);	
}

function lazyLoadImg() {
  const images = document.querySelectorAll("img");
  images.forEach(img => {
    if (!img.hasAttribute("loading")) {
      img.setAttribute("loading", "lazy");
    }
  });
}

function addElement(){
	document.getElementById('judul').innerHTML = pageConfig.judul;
	document.getElementById('deskripsi').innerHTML = pageConfig.deskripsi;
}

function share(title, text, customLink) {
  const combinedMessage = `${text}\n${customLink}`;
  const encodedMessage = encodeURIComponent(combinedMessage);
  if (navigator.share) {
    navigator.share({
      title: title,
      text: combinedMessage,
      url: customLink,
    }).then(() => {
      console.log('Berhasil dibagikan');
    }).catch((error) => {
      console.error('Gagal membagikan', error);
    });
  } else {
    alert(`Bagikan link ini ke temanmu:\n\n${customLink}`);
  }
}
function sharePage(title, text) {
  const currentUrl = window.location.href;
  const combinedMessage = `${text}\n${currentUrl}`;
  const encodedMessage = encodeURIComponent(combinedMessage);
  if (navigator.share) {
    navigator.share({
      title: title,
      text: text,
      url: currentUrl,
    }).then(() => {
      console.log('Berhasil dibagikan');
    }).catch((error) => {
      console.error('Gagal membagikan', error);
    });
  } else {
    alert(`Bagikan link ini ke temanmu:\n\n${currentUrl}`);
  }
}

function showConfirm(message, onYes, onNo) {
  const modal = document.getElementById('confirmModal');
  const text = document.getElementById('confirmText');
  const yesBtn = document.getElementById('confirmYes');
  const noBtn = document.getElementById('confirmNo');
  if (!modal || !text || !yesBtn || !noBtn) {
    console.error('Modal elements not found!');
    return;
  }
  text.innerText = message;
  modal.classList.remove('imp-hidden');
  yesBtn.onclick = function() {
    modal.classList.add('imp-hidden');
    if (onYes) onYes();
  };
  noBtn.onclick = function() {
    modal.modal.classList.add('imp-hidden');
    if (onNo) onNo();
  };
}

function chatWa(no,pesan) {
  const enPesan = encodeURIComponent(pesan);
  const url = `https://wa.me/${no}?text=${enPesan}`;
  window.open(url, "_blank");
}
function chatAdmin(pesan) {
  const enPesan = encodeURIComponent(pesan);
  const url = `https://wa.me/${varConfig.wa_admin}?text=${enPesan}`;
  window.open(url, "_blank");
}

function scrollWa(){
	window.addEventListener('scroll', resetTimerPopWa);
}
function showPopWa() {
if (popWa) popWa.classList.remove('imp-hidden');
}
function hidePopWa() {
popWa = document.getElementById('pop-wa');
if (popWa && !popWa.classList.contains('imp-hidden')) {
  popWa.classList.add('imp-hidden');
}
}
function resetTimerPopWa() {
clearTimeout(timerPopWa);
hidePopWa();
timerPopWa = setTimeout(showPopWa, 5000);
}

function productRenderingWithFilters() {
  const filterContainer = document.getElementById('produk-filter');
  const produkContainer = document.getElementById('produk-container');
  // Reset konten
  filterContainer.innerHTML = '';
  produkContainer.innerHTML = '';
  // Ambil semua kategori unik berdasarkan kategori1Key
  const kategoriSet = new Set();
  dataProduk[pageConfig.data].forEach(produk => {
    if (produk[pageConfig.rendering_filter1]) {
      kategoriSet.add(produk[pageConfig.rendering_filter1].trim());
    }
  });
  // Tambah tombol default
  const allButton = document.createElement('button');
  allButton.className = 'produk-filter-button' + ' active';
  allButton.textContent = pageConfig.rendering_def_filter;
  filterContainer.appendChild(allButton);
  // Tambah tombol kategori lainnya
  kategoriSet.forEach(kategori => {
    const button = document.createElement('button');
    button.className = 'produk-filter-button';
    button.textContent = kategori;
    filterContainer.appendChild(button);
  });
  // Fungsi render berdasarkan filter aktif
  function renderFilteredProducts() {
    produkContainer.innerHTML = '';
    const activeFilter = document.querySelector(`.produk-filter-button.active`);
    const filter = activeFilter ? activeFilter.textContent.trim() : '';
    const filteredData = filter
      ? dataProduk[pageConfig.data].filter(produk => 
          produk[pageConfig.rendering_filter1] === filter || produk[pageConfig.rendering_filter2] === filter)
      : dataProduk[pageConfig.data];
    filteredData.forEach(produk => {
      const produkItem = document.createElement('a');
      produkItem.classList.add('produk-item');
      produkItem.href = `/produk.html?p=${pageConfig.data}&id=${produk.id}`;
      produkItem.style.textDecoration = 'none';
      produkItem.style.color = 'inherit';
      produkItem.style.cursor = 'pointer';
      produkItem.innerHTML = `
        <div>
          <img src="${produk.img}" alt="${replaceChar(produk.nama,"-"," ")}" loading="lazy">
          <div class="produk-detail">
            <div class="produk-nama"><p>${replaceChar(produk.nama,"-"," ")} ${produk.kategori1} ${produk.kategori2}</p></div>
            <div class="produk-keterangan"><p>${produk.keterangan}</p></div>
          </div>
        </div>
      `;
      produkContainer.appendChild(produkItem);
    });
  }
  // Event listener
  filterContainer.addEventListener('click', function (event) {
    if (event.target.classList.contains('produk-filter-button')) {
      const buttons = filterContainer.querySelectorAll(`.produk-filter-button`);
      buttons.forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      renderFilteredProducts();
    }
  });
  // Render awal
  renderFilteredProducts();
}

function productRendering() {

  const produkContainer = document.getElementById('produk-container');
  if (!produkContainer || !dataProduk[pageConfig.data]) return;
	produkContainer.innerHTML = '';
	dataProduk[pageConfig.data].forEach(produk => {
    const produkItem = document.createElement('a');
    produkItem.classList.add('produk-item');
    produkItem.href = `/produk.html?p=${pageConfig.data}&id=${produk.id}`;
    produkItem.style.textDecoration = 'none';
    produkItem.style.color = 'inherit';
    produkItem.style.cursor = 'pointer';
    produkItem.innerHTML = `
      <div>
        <img src="${produk.img}" alt="${replaceChar(produk.nama,"-"," ")}" loading="lazy">
        <div class="produk-detail">
          <div class="produk-nama"><p>${replaceChar(produk.nama,"-"," ")}</p></div>
          <div class="produk-keterangan"><p>${produk.keterangan}</p></div>
        </div>
      </div>
    `;
    produkContainer.appendChild(produkItem);
  });
}

function renderAntrian(data_antrian) {
  const container = document.getElementById('antrian-list');
  container.innerHTML = '';

  data_antrian.forEach(item => {
    const antrianItem = document.createElement('div');
    antrianItem.className = 'antrian-list container flex row';

    antrianItem.innerHTML = `
      <div class="antrian-detail container-60p">
        <div class="antrian-name container"><p>${item.nama}</p></div>
        <div class="antrian-order container"><p>${item.jenis_pesanan}</p></div>
      </div>
      <div class="antrian-status container-40p flex flex-align-center">
        <p>${item.status}</p>
      </div>
    `;

    container.appendChild(antrianItem);
  });
}

function renderSingleProduk(produk){
	const {
	id = '',
	nama = '',
	img = '',
	kategori1 = '',
	kategori2 = '',
	keterangan = '',
	description = ''
	} = produk;

  const cleanNama = replaceChar(nama,"-"," ");
  const produkContainer = document.getElementById("produkContainer");

  produkContainer.innerHTML = `
    <div class="single_produk_img container flex column flex-align-center flex-justify-center">
      <img src="${img}" alt="${cleanNama} - Kryon" style="padding:30px;">
      <div class="single_produk_fitur container flex row flex-align-center flex-justify-center" style="padding-bottom:20px;">
        <div class="container-30p flex column flex-align-center flex-justify-center">
          <img src="${dirImg}Badge.svg" class="icon-medium">
          <p class="teks-deskripsi-kecil">Kualitas hasil cetak berkualitas</p>
        </div>
        <div class="container-30p flex column flex-align-center flex-justify-center">
          <img src="${dirImg}thunder.svg" class="icon-medium">
          <p class="teks-deskripsi-kecil">Proses cepat 1-2 hari bergantung antrian</p>
        </div>
        <div class="container-30p flex column flex-align-center flex-justify-center">
          <img src="${dirImg}Shipping.svg" class="icon-medium">
          <p class="teks-deskripsi-kecil">Siap antar seluruh Indonesia</p>
        </div>
      </div>
    </div>

    <div class="single_produk_detail container flex column">
      <h1> ${cleanNama} ${kategori1} ${kategori2}</h1>
      <p>${keterangan}</p>
    </div>

    <div class="single_produk_deskripsi container flex column">
      <p>Deskripsi: </p>
      <p>${description}</p>
    </div>

    <div class="single_produk_cta container flex row flex-align-center flex-justify-space-evenly" style="background-color: var(--warna-bg-sekunder); padding: 20px;">
      <button onclick="sharePage('${cleanNama} ${kategori1} ${kategori2}', 'Lihat produk ini')">Bagikan</button>
      <button onclick="chatAdmin('Hallo saya ingin memesan ${cleanNama} ${kategori1} ${kategori2}')">Order</button>
    </div>
  `;
}

function cekDanSync() {
  if (!setting.update){
	syncData();
	return
  };
  
  const [tanggal, waktu] = setting.update.split(', ');
  const [hari, bulan, tahun] = tanggal.split('/').map(Number);
  const [jam, menit, detik] = waktu.split('.').map(Number);

  const lastUpdate = new Date(tahun, bulan - 1, hari, jam, menit, detik);
  const now = new Date();

  const satuHari = 24 * 60 * 60 * 1000;

  if (now - lastUpdate > satuHari) {
    syncData();
  }
}
async function syncData() {
  try {
	document.getElementById("status").innerText = "Memproses...";
    const res1 = await fetch("https://wam-kryon-api.vercel.app/api/gaps-v1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ db: 'produk',repo:root.repo })
    });
	const res2 = await fetch("https://wam-kryon-api.vercel.app/api/gaps-v1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ db: 'setting',repo:root.repo })
    });
	

    const data1 = await res1.json();
	const data2 = await res2.json();

    if (res1.ok && res2.ok) {
      console.log("Data Setting dan Produk berhasil diperbarui.";
	} else {
      console.log("Gagal memperbarui data: " + data.error);
    }
  } catch (error) {
    console.error(error);
  }
}

function replaceChar(text, targetChar, replacementChar) {
  if (text.includes(targetChar)) {
    return text.replaceAll(targetChar, replacementChar);
  }
  return text;
}

init();