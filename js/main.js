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

  if (document.querySelector('script[src*="gtag/js?id=G-7D0RLQEEQD"]')) return;

  const gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-7D0RLQEEQD';

  const gtagConfigScript = document.createElement('script');
  gtagConfigScript.text = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-7D0RLQEEQD');
  `;
  head.appendChild(gtagScript);
  head.appendChild(gtagConfigScript);
}

insertGtagScript();


/*Variabel*/
const dirImg = 'https://ik.imagekit.io/mustofa/web/img/';

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
          <img src="https://ik.imagekit.io/mustofa/web/img/icon-wa.png" class="icon-xlarge" onclick="chatWa('6285161517176','Hallo kak, saya ingin bertanya tentang produk Kryon')">
          <div class="container-auto flex flex-align-center flex-justify-center" style="background-color:white;border-radius:20px 20px 20px 0px ;padding:10px;height:20px;">
            <h6 onclick="chatWa('6285161517176','Hallo kak, saya ingin bertanya tentang produk Kryon')">Butuh Bantuan?</h6>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', htmlString);	
}
const loadingScreen = document.getElementById('loading-screen');
addElementAfterBody ();
// Lazy Load Images
function lazyLoadImg() {
  const images = document.querySelectorAll("img");
  images.forEach(img => {
    if (!img.hasAttribute("loading")) {
      img.setAttribute("loading", "lazy");
    }
  });
}
lazyLoadImg();
// Share Function
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
// Show Confirm Pop Up
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
// WA
function chatWa(no,pesan) {
  const enPesan = encodeURIComponent(pesan);
  const url = `https://wa.me/${no}?text=${enPesan}`;
  window.open(url, "_blank");
}
function chatAdmin(pesan) {
  const enPesan = encodeURIComponent(pesan);
  const url = `https://wa.me/6285161517176?text=${enPesan}`;
  window.open(url, "_blank");
}
// Popup WhatsApp
  let timerPopWa;
  let popWa = document.getElementById('pop-wa');
  function showPopWa() {
    if (popWa) popWa.classList.remove('imp-hidden');
  }
  function hidePopWa() {
    if (popWa && !popWa.classList.contains('imp-hidden')) {
      popWa.classList.add('imp-hidden');
    }
  }
  function resetTimerPopWa() {
    clearTimeout(timerPopWa);
    hidePopWa();
    timerPopWa = setTimeout(showPopWa, 5000);
  }
//GAPS
function gaps(database, query) {
    const baseUrl = "https://wam-kryon-api.vercel.app/api/get-data";
    const encodedQuery = encodeURIComponent(query);
    const encodedDatabase = encodeURIComponent(database);
    const fullUrl = `${baseUrl}?conn=DATABASE=${encodedDatabase}&data=${encodedQuery}`;
    return fetch(fullUrl, {
        method: 'GET',
        redirect: 'follow'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Gagal mengambil data: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (!Array.isArray(data.data)) {
            throw new Error('Data tidak valid atau gagal decode JSON.');
        }
        return data;
    })
    .catch(error => {
        console.error("Gagal mengambil data dari Google Apps Script. Error:", error);
        return null;
    });
}
async function getDataMainProduct() {
  const result = await gaps(
    'kryon',
    'SELECT id,jenis_produk,nama,img,kategori1,kategori2,status,keterangan FROM produk WHERE jenis_produk=utama'
  );
  return result?.data ?? [];
}
async function getDataProductUc() {
  const result = await gaps(
    'kryon',
    'SELECT id,nama,img,kategori1,kategori2,status,keterangan FROM produk WHERE nama=Undangan-Pernikahan'
  );
  return result?.data ?? [];
}
async function getDataAntrian() {
    const result = await gaps('kryon', 'SELECT * FROM antrian');
	return result?.data?? [];
}
async function getDataSingleProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const id_produk = urlParams.get('id');
    const result = await gaps('kryon', `SELECT * FROM produk WHERE id=${id_produk}`);
    return result?.data ?? [];
}

function productRenderingWithFilters({
  containerId,
  dataProduk,
  filterButtonClass,
  kategori1Key,
  kategori2Key,
  defaultFilterLabel,
  filterContainerId
}) {
/*how to use
productRenderingWithFilters({
  containerId: 'produk-container',
  dataProduk: data_produk,
  filterButtonClass: 'produk-uc-filter-button',
  kategori1Key: 'kategori1',
  kategori2Key: 'status',
  defaultFilterLabel: 'Ready',
  filterContainerId: 'filterKatalog'
});
*/
  const filterContainer = document.getElementById(filterContainerId);
  const produkContainer = document.getElementById(containerId);
  // Reset konten
  filterContainer.innerHTML = '';
  produkContainer.innerHTML = '';
  // Ambil semua kategori unik berdasarkan kategori1Key
  const kategoriSet = new Set();
  dataProduk.forEach(produk => {
    if (produk[kategori1Key]) {
      kategoriSet.add(produk[kategori1Key].trim());
    }
  });
  // Tambah tombol default
  const allButton = document.createElement('button');
  allButton.className = filterButtonClass + ' active';
  allButton.textContent = defaultFilterLabel;
  filterContainer.appendChild(allButton);
  // Tambah tombol kategori lainnya
  kategoriSet.forEach(kategori => {
    const button = document.createElement('button');
    button.className = filterButtonClass;
    button.textContent = kategori;
    filterContainer.appendChild(button);
  });
  // Fungsi render berdasarkan filter aktif
  function renderFilteredProducts() {
    produkContainer.innerHTML = '';
    const activeFilter = document.querySelector(`.${filterButtonClass}.active`);
    const filter = activeFilter ? activeFilter.textContent.trim() : '';
    const filteredData = filter
      ? dataProduk.filter(produk => 
          produk[kategori1Key] === filter || produk[kategori2Key] === filter)
      : dataProduk;
    filteredData.forEach(produk => {
      const produkItem = document.createElement('a');
      produkItem.classList.add('produk-item');
      produkItem.href = `/produk.html?id=${produk.id}`;
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
    if (event.target.classList.contains(filterButtonClass)) {
      const buttons = filterContainer.querySelectorAll(`.${filterButtonClass}`);
      buttons.forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      renderFilteredProducts();
    }
  });
  // Render awal
  renderFilteredProducts();
}

function productRendering({
  containerId,
  dataProduk,
  filterKey,
  filterValue
}) {
/* How to use:
productRendering({
  containerId: 'produk-container',
  dataProduk: data_produk,
  filterKey: 'status',
  filterValue: 'Ready'
});
*/

  const produkContainer = document.getElementById(containerId);
  if (!produkContainer || !dataProduk) return;

  produkContainer.innerHTML = '';

  const filteredData = filterValue
    ? dataProduk.filter(produk => produk[filterKey] === filterValue)
    : dataProduk;

  filteredData.forEach(produk => {
    const produkItem = document.createElement('a');
    produkItem.classList.add('produk-item');
    produkItem.href = `/produk.html?id=${produk.id}`;
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

function navBottom() {
	const navBottom = document.getElementById("nav-bottom");
	if (!navBottom) {
        return;
    }
	navBottom.innerHTML = `
      <a href="/" class="nav-link" data-page="/"><i class="fa-solid fa-house fa-xl"></i><br>Beranda</a>
	  <a href="/katalog.html" class="nav-link" data-page="katalog.html"><i class="fa-solid fa-images fa-xl"></i><br>Katalog</a>
      <a href="/antrian.html" class="nav-link" data-page="antrian.html"><i class="fa-solid fa-list fa-xl"></i><br>Antrian</a>	
	`;

	const links = document.querySelectorAll('.nav-link');
	const path = window.location.pathname;
	const currentPage = path === '/' ? '/' : path.split('/').pop();

	links.forEach(link => {
		const targetPage = link.getAttribute('data-page');
		if (targetPage === currentPage) {
			link.classList.add('active');
		}
	});
}

navBottom();


function replaceChar(text, targetChar, replacementChar) {
  if (text.includes(targetChar)) {
    return text.replaceAll(targetChar, replacementChar);
  }
  return text;
}

