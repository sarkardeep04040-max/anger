const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>[...r.querySelectorAll(s)];

async function discover(){
  if(window.ASSET_MANIFEST){
    const manifest=window.ASSET_MANIFEST;
    const images=[];for(const url of manifest.images||[])if(await urlExists(url))images.push(url);
    const videos=[];for(const url of manifest.videos||[])if(await fileExists(url))videos.push(url);
    const poems=[];for(const url of manifest.poems||[]){try{const r=await fetch(url);if(r.ok)poems.push(await r.text())}catch{}}
    return{images,poems,videos};
  }
  const extensions=['jpg','jpeg','png','webp','gif','avif'];
  const images=[];for(let i=1;i<=100;i++){const name=String(i).padStart(2,'0');let found=false;for(const ext of extensions){const url=`img/${name}.${ext}`;if(await urlExists(url)){images.push(url);found=true;break}}}
  const videos=[];for(let i=1;i<=100;i++){const name=String(i).padStart(2,'0');for(const ext of ['mp4','webm','ogg','mov']){const url=`video/${name}.${ext}`;if(await urlExists(url)){videos.push(url);break}}}
  const poems=[];for(let i=1;i<=5;i++){const name=String(i).padStart(2,'0');try{const r=await fetch(`kobita/${name}.txt`);if(r.ok)poems.push(await r.text())}catch{}}
  return{images,poems,videos};
}
function urlExists(url){return new Promise(resolve=>{const x=new Image();x.onload=()=>resolve(true);x.onerror=()=>resolve(false);x.src=url})}
function fileExists(url){return fetch(url,{method:'HEAD'}).then(r=>r.ok).catch(()=>false)}

let assets={images:[],poems:[],videos:[]};let currentPage=1;
function bg(url){$('#background').style.backgroundImage=`url('${url}')`}
function makePetals(count=18){const box=$('#petals');if(!count)return;for(let i=0;i<count;i++){const e=document.createElement('span');e.className=i%5?'petal':'heart';e.textContent=i%5?'🌹':'♡';e.style.left=Math.random()*100+'%';e.style.animationDuration=(7+Math.random()*7)+'s';e.style.animationDelay=Math.random()*-10+'s';e.style.setProperty('--drift',(Math.random()*180-90)+'px');box.append(e)}}
function burst(parent=document.body,amount=34){const icons=['❤','💗','🌸','✨','😘','💋','🌹','★'];for(let i=0;i<amount;i++){const e=document.createElement('span');e.className='burst-item';e.textContent=icons[i%icons.length];e.style.setProperty('--tx',(Math.random()*600-300)+'px');e.style.setProperty('--ty',(Math.random()*560-280)+'px');e.style.animationDelay=(Math.random()*0.18)+'s';parent.append(e);setTimeout(()=>e.remove(),2400)}}
function animatePoem(el,text){el.innerHTML='';const lines=text.trim().split('\n').filter(Boolean);lines.forEach((line,i)=>{const span=document.createElement('span');span.className='poem-line';span.textContent=line;span.style.animationDelay=(i*.38)+'s';el.append(span)})}
function setScene(n){if(n===currentPage&&$('#story').dataset.ready)return;const old=$(`.scene[data-page="${currentPage}"]`);const next=$(`.scene[data-page="${n}"]`);if(old)old.classList.remove('active');if(next)next.classList.add('active');currentPage=n;$$('#pageDots button').forEach((b,i)=>b.classList.toggle('active',i+1===n));
  if(n===1&&assets.images[0])bg(assets.images[0]);
  if(n===2&&assets.images[1])bg(assets.images[1]);
  if(n===3&&assets.images[2])bg(assets.images[2]);
  if(n===4&&assets.images[0])bg(assets.images[0]);
  if(n===5&&assets.images[0])bg(assets.images[0]);
}

async function init(){assets=await discover();if(!assets.images.length){$('#background').style.background='#5e1831'}else{bg(assets.images[0])}
  if(assets.images[0])$('#queenLower')&&($('#queenLower').style.backgroundImage=`url('${assets.images[0]}')`);
  setupScenes();setupDots();makePetals(24);$('#story').dataset.ready='true'}

function setupDots(){for(let i=1;i<=5;i++){const b=document.createElement('button');b.setAttribute('aria-label',`Go to page ${i}`);b.addEventListener('click',()=>setScene(i));$('#pageDots').append(b)}$('#pageDots button').first?.classList.add('active')}

function setupScenes(){
  animatePoem($('#poem1'),assets.poems[0]||'');
  animatePoem($('#poem2'),assets.poems[1]||'');
  animatePoem($('#poem3'),assets.poems[2]||'');
  animatePoem($('#poem4'),assets.poems[3]||'');
  if(assets.images[0])bg(assets.images[0]);
  if(assets.images[1])$('#xPhotoOne').style.backgroundImage=`url('${assets.images[1]}')`;
  if(assets.images[2])$('#xPhotoTwo').style.backgroundImage=`url('${assets.images[2]}')`;
  if(assets.images[5])$('#queenUpper').style.backgroundImage=`url('${assets.images[5]}')`;
  if(assets.images[6])$('#queenLower').style.backgroundImage=`url('${assets.images[6]}')`;
  if(assets.images[3]){$('#revealedPhotos').append(photoDiv(assets.images[3]))}
  if(assets.images[4])$('#revealedPhotos').append(photoDiv(assets.images[4]));

  $$('[data-next]').forEach(b=>b.addEventListener('click',()=>setScene(Number(b.dataset.next)+1)));

  $('#envelope').addEventListener('click',openEnvelope);
  $('#queenButton').addEventListener('click',openQueen);
  $('#albumInvite').addEventListener('click',openAlbum);
  $('#rotationHint').addEventListener('click',openAlbum);
  $('#album').addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#album').classList.contains('closed'))closeAlbum()});
}
function photoDiv(src){const d=document.createElement('div');d.className='revealed-photo';d.style.backgroundImage=`url('${src}')`;return d}

function openEnvelope(){const e=$('#envelope');if(e.classList.contains('shake'))return;e.classList.add('shake');setTimeout(()=>{e.style.transform='scale(1.25)';e.style.opacity='0';burst(document.body,45);const r=$('#letterReveal');r.classList.add('open');r.setAttribute('aria-hidden','false');animatePoem($('#poem3'),assets.poems[2]||'');$('#page3Next').hidden=false},650)}
function openQueen(){const s=$('#queenStage');if(s.classList.contains('separated'))return;s.classList.add('separated');$('#queenPoem').setAttribute('aria-hidden','false');$('#queenButton').style.opacity='0';$('#queenButton').style.pointerEvents='none';animatePoem($('#poem4'),assets.poems[3]||'');burst(document.body,18);setTimeout(()=>{$('#page4Next').hidden=false},900)}

let albumIndex=0;
let spreadList=[];

const albumState={index:0,spreads:[],closed:false,opening:false,albumIsOpen:false,isAnimating:false,pendingSpreadIndex:null};

function buildSpreads(){
  albumState.spreads=[];
  // Images 0–6 are reserved for the five main scenes.
  const reserved=new Set([0,1,2,3,4,5,6]);
  const remaining=assets.images
    .map((src,index)=>({src,index}))
    .filter(item=>!reserved.has(item.index));

  if(remaining.length){
    const first=remaining.shift();
    albumState.spreads.push({
      type:'intro',
      left:{kind:'photo',src:first.src,caption:'A beautiful memory of us',single:true},
      right:{kind:'poem',text:assets.poems[4]||''}
    });
  }

  for(let i=0;i<remaining.length;i+=2){
    albumState.spreads.push({
      type:'photos',
      left:remaining[i]?.src||null,
      right:remaining[i+1]?.src||null
    });
  }

  albumState.spreads.push({type:'videos',videos:[...assets.videos].slice(0,2)});
  if(assets.videos.length>2)albumState.spreads.push({type:'video-final',video:assets.videos[2]});
  albumState.spreads.push({type:'apology'});
  albumState.index=0;
  albumState.closed=false;
  albumState.albumIsOpen=false;
  albumState.isAnimating=false;
  albumState.pendingSpreadIndex=null;
  albumIndex=0;
  spreadList=albumState.spreads;
}

function openAlbum(){
  if(!window.matchMedia('(orientation: landscape)').matches){
    $('#rotationHint').innerHTML='Please rotate your phone to landscape, then tap again ❤️';
    $('#rotationHint').classList.add('visible');
    $('#albumInvite').animate([{transform:'scale(1)'},{transform:'scale(.96)'},{transform:'scale(1)'}],{duration:450});
    return;
  }

  buildSpreads();
  renderSpread();
  setNavigationEnabled(false);

  $('#albumInvite').classList.add('hidden');
  $('#rotationHint').style.display='none';
  $('.album-scene').classList.add('ready');

  const album=$('#album');
  albumState.opening=true;
  albumState.isAnimating=true;
  album.classList.add('opening');
  album.tabIndex=0;
  album.focus({preventScroll:true});

  const finishOpening=()=>{
    album.removeEventListener('transitionend',onAlbumOpeningEnd);
    $('#albumFront')?.removeEventListener('transitionend',onCoverOpeningEnd);
    albumState.opening=false;
    albumState.albumIsOpen=true;
    albumState.isAnimating=false;
    setNavigationEnabled(true);
  };
  const onAlbumOpeningEnd=()=>{};
  const onCoverOpeningEnd=(event)=>{
    if(event.propertyName==='transform')finishOpening();
  };
  $('#albumFront')?.addEventListener('transitionend',onCoverOpeningEnd);

  requestAnimationFrame(()=>album.classList.add('opened'));
}

function turnPage(direction){
  if(albumState.closed||albumState.isAnimating||!albumState.albumIsOpen)return;
  const nextIndex=albumState.index+direction;
  if(nextIndex<0||nextIndex>=albumState.spreads.length)return;

  albumState.isAnimating=true;
  albumState.pendingSpreadIndex=nextIndex;
  setNavigationEnabled(false);

  const sheet=$('#turnSheet');
  sheet.className='turn-sheet';
  sheet.innerHTML='';
  const source=direction>0?$('#rightPage'):$('#leftPage');
  if(source){
    const pageClone=source.cloneNode(true);
    pageClone.removeAttribute('id');
    pageClone.querySelectorAll('.album-nav-btn,.close-album-btn').forEach(button=>button.remove());
    sheet.append(pageClone);
  }
  void sheet.offsetWidth;
  sheet.classList.add(direction>0?'turning-next':'turning-prev');

  const finishTurn=(event)=>{
    if(!['turnNext','turnPrev','turnPrevForward'].includes(event.animationName))return;
    sheet.removeEventListener('animationend',finishTurn);
    sheet.className='turn-sheet';
    sheet.innerHTML='';

    albumState.index=albumState.pendingSpreadIndex;
    albumIndex=albumState.index;
    albumState.pendingSpreadIndex=null;

    // Render left and right from the same spread object only after the turn finishes.
    renderSpread();
    albumState.isAnimating=false;
    setNavigationEnabled(true);
  };
  sheet.addEventListener('animationend',finishTurn,{once:false});
}

function setNavigationEnabled(enabled){
  $$('.album-nav-btn').forEach(button=>{
    const isFirstDisabledButton=button.classList.contains('previous')&&albumState.index===0;
    const disable=!enabled||isFirstDisabledButton;
    button.disabled=disable;
    button.setAttribute('aria-disabled',String(disable));
  });
  const close=$('#closeAlbum');
  if(close){close.disabled=!enabled;close.setAttribute('aria-disabled',String(!enabled));}
}

function pageImage(src,caption='',single=false){
  if(!src)return '<div class="decorated-empty"><span>♥</span><p>Every moment is precious</p></div>';
  return `<div class="photo-print ${single?'single':''}"><img src="${src}" alt="${caption||'Our memory'}" loading="eager" decoding="async"></div>${caption?`<div class="photo-caption">${escapeHtml(caption)}</div>`:''}`;
}

function renderSpread(){
  const spread=albumState.spreads[albumState.index];
  const left=$('#leftPage');
  const right=$('#rightPage');
  left.innerHTML='';
  right.innerHTML='';
  if(!spread)return;

  if(spread.type==='intro'){
    const leftContent=spread.left&&typeof spread.left==='object'?spread.left:{src:spread.left,caption:'A beautiful memory of us',single:true};
    const rightContent=spread.right&&typeof spread.right==='object'?spread.right:{text:assets.poems[4]||''};
    left.innerHTML=pageImage(leftContent.src,leftContent.caption||'A beautiful memory of us',leftContent.single!==false);
    right.innerHTML=`<div class="album-poem" role="article" aria-label="Fifth Bengali poem">${rightContent.text?escapeHtml(rightContent.text):'পঞ্চম কবিতা লোড করা যায়নি।'}</div>`;
  }else if(spread.type==='photos'){
    const leftContent=spread.left&&typeof spread.left==='object'?spread.left:{src:spread.left,caption:'Our memory'};
    const rightContent=spread.right&&typeof spread.right==='object'?spread.right:{src:spread.right,caption:'A moment I treasure'};
    left.innerHTML=pageImage(leftContent.src,leftContent.caption||'Our memory',false);
    right.innerHTML=pageImage(rightContent.src,rightContent.caption||'A moment I treasure',false);
  }else if(spread.type==='videos'){
    left.innerHTML=spread.videos[0]?videoHtml(spread.videos[0]):'<div class="decorated-empty"><span>♪</span><p>Our special moments</p></div>';
    right.innerHTML=spread.videos[1]?videoHtml(spread.videos[1]):'<div class="decorated-empty"><span>♪</span><p>Love captured in motion</p></div>';
  }else if(spread.type==='video-final'){
    left.innerHTML=spread.video?videoHtml(spread.video):'<div class="decorated-empty"><span>♫</span><p>A memory from my heart</p></div>';
    right.innerHTML=`<div class="decorated-letter-preview"><span>💌</span><h3>One more thing...</h3><p>A letter straight from my heart is waiting on the next page.</p></div>`;
  }else if(spread.type==='apology'){
    left.innerHTML=`<div class="decorated-letter-preview"><span>💗</span><h3>For Rishita</h3><p>From the heart of someone who loves you endlessly.</p></div>`;
    right.innerHTML=`<div class="apology-letter"><h3>My Dearest Rishita ❤️,</h3>${apologyHtml()}<button class="close-album-btn" id="closeAlbum">Close Album ❤️</button></div>`;
    $('#closeAlbum')?.addEventListener('click',closeAlbum);
  }

  addSpreadNavigation(left,right);
  if(!albumState.isAnimating)setNavigationEnabled(true);
}

function addSpreadNavigation(left,right){
  if(albumState.index===0){
    const previous=document.createElement('button');
    previous.type='button';
    previous.className='album-nav-btn previous';
    previous.textContent='← Previous';
    previous.disabled=true;
    previous.setAttribute('aria-disabled','true');
    left.append(previous);
  }else{
    const previous=document.createElement('button');
    previous.type='button';
    previous.className='album-nav-btn previous';
    previous.textContent='← Previous';
    previous.addEventListener('click',()=>turnPage(-1));
    left.append(previous);
  }

  if(albumState.index<albumState.spreads.length-1){
    const next=document.createElement('button');
    next.type='button';
    next.className='album-nav-btn next';
    next.textContent='Next →';
    next.addEventListener('click',()=>turnPage(1));
    right.append(next);
  }
}

function videoHtml(src){
  return `<div class="video-frame"><video src="${src}" controls preload="metadata" playsinline muted controlslist="nodownload"></video></div>`;
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function apologyHtml(){
  const p=`I know that sometimes I fail to give you the love, care and pampering you truly deserve.

I feel genuinely guilty for not always taking care of you, not pampering you enough, and sometimes failing to make you feel as special as you are to me.

You deserve attention, affection, little surprises, endless hugs, and all the happiness in this world.

I never want you to feel that you are unimportant to me. You mean so much more than words can express.

I know that saying sorry is easy, but showing it through my actions matters more. I want to become better at understanding you, caring for you, and making you smile.

Please forgive my mistakes. I don't promise to be perfect, but I promise to keep trying, keep learning, and keep loving you.

You are my favourite person, my happiness, and my forever Queen.

I Love You, Rishita. ❤️

Forever Yours. 💗`;
  return escapeHtml(p).replace(/\n/g,'<br>');
}

function closeAlbum(){
  if(albumState.closed)return;
  albumState.closed=true;
  const album=$('#album');
  album.classList.add('closed');
  setTimeout(()=>{
    $('#albumPages').style.display='none';
    $('#albumFront').style.opacity='0';
    $('#albumBackCover').style.opacity='1';
    $('#albumBackCover').style.transform='none';
    makePetals(12);
  },900);
}

window.addEventListener('keydown',e=>{if(e.key==='ArrowRight'&&currentPage<5)setScene(currentPage+1);if(e.key==='ArrowLeft'&&currentPage>1)setScene(currentPage-1)});
window.addEventListener('orientationchange',()=>{
  if(currentPage!==5)return;
  const hint=$('#rotationHint');
  if(window.matchMedia('(orientation: portrait)').matches){
    hint.textContent='Please rotate your phone and click here ❤️';
    hint.style.display='block';
  }else if(!albumState.opening){
    hint.textContent='You can open the album in landscape ❤️';
    hint.style.display='block';
  }
});
init();
