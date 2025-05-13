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

/*Variabel*/
let dirImg = 'https://ik.imagekit.io/mustofa/web/img/';
let timerPopWa;
let popWa;
let root, dataProduk, pageConfig;

const loadingScreen = document.getElementById('loading-screen');

const burger = document.getElementById('burger');
const dropdown = document.getElementById('dropdownMenu');

burger.addEventListener('click', () => {
  dropdown.classList.toggle('imp-hidden');
});


const fungsiMap = {
  insertGtagScript,
  lazyLoadImg,
  navBottom
};
async function init() {
	root = await getRoot();
	dataProduk = await getData('produk');
	setting = await getData('setting');
	const currentPath = window.location.pathname;
    
	
	getDataSingleProduct();
	fungsiDefault();
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
async function fungsiDefault() {
	await insertGtagScript();
	await loadMenu();
	await lazyLoadImg();
	await loadingScreen.classList.add('imp-hidden');
}
function loadMenu() {
	setting["menu"].forEach(item => {
	  const link = document.createElement('a');
	  link.href = item.url;
	  link.textContent = item.label;
	  dropdown.appendChild(link);
	});
      
}
function lazyLoadImg() {
  const images = document.querySelectorAll("img");
  images.forEach(img => {
    if (!img.hasAttribute("loading")) {
      img.setAttribute("loading", "lazy");
    }
  });
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

async function getDataSingleProduct() {
    const urlParams = new URLSearchParams(window.location.search);
	const kodeProduk = urlParams.get('p');
    const idProduk = urlParams.get('id');
	const item = getItemById(dataProduk[kodeProduk],idProduk);
    renderSingleProduk(item);
	
}
function getItemById(dataArray, id) {
  return dataArray.find(item => item.id == id);
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

function replaceChar(text, targetChar, replacementChar) {
  if (text.includes(targetChar)) {
    return text.replaceAll(targetChar, replacementChar);
  }
  return text;
}

init();