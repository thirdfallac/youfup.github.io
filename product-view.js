// Imported emoji assets are decorations, not product photographs.
function renderProductDetails(blocks, productName){
 const icons={
  'assets/uploads/af1466531324ec2c9f0f8ac387af45dc994d8e47014deab695d1fad010a85985.png':'👍',
  'assets/uploads/284cd11a463128afee6a67011f1ce913f5ed04f262fe29eb2809de898c59f9c8.png':'✅',
  'assets/uploads/31d3661a4cd9fe75d2e8b43a84a367b71f176d52870a69123ff8a4fb88493dbd.png':'✅',
  'assets/uploads/292c29bd6b0e987215f8ab98a997fc26795145191833ec16c063cd0c890344a0.png':'🔞'
 };
 const records=[],pending=new Set();
 function mark(symbol){const last=records[records.length-1];if(symbol!=='✅'&&last?.type==='text')last.marks.add(symbol);else pending.add(symbol)}
 for(const b of blocks){
  if(b.type==='image'){
   if(icons[b.src]){mark(icons[b.src]);continue}
   if(pending.size){const last=records[records.length-1];if(last?.type==='text')for(const m of pending)last.marks.add(m);pending.clear()}
   records.push(b);continue;
  }
  let text=String(b.text||'').replace(/\r\n?/g,'\n').trim().replace(/\n[\t ]*\n(?:[\t ]*\n)+/g,'\n\n');
  if(/^[\s:：,，.。!！✅☑✔✓👍👉👈👆👇🔞\uFE0F]+$/u.test(text)){
   if(/[✅☑✔✓]/u.test(text))mark('✅');
   if(/[👍👉👈👆👇]/u.test(text))mark('👍');
   if(text.includes('🔞'))mark('🔞');
   continue;
  }
  if(!text&&!b.title)continue;
  const marks=new Set(pending);pending.clear();
  text=text.replace(/^(?:\s*[✅☑✔✓👍👉👈👆👇]\uFE0F?\s*)+/u,prefix=>{if(/[✅☑✔✓]/u.test(prefix))marks.add('✅');if(/[👍👉👈👆👇]/u.test(prefix))marks.add('👍');return ''});
  records.push({...b,text,marks});
 }
 if(pending.size){const last=records[records.length-1];if(last?.type==='text')for(const m of pending)last.marks.add(m)}
 let html='',group=[];
 function flush(){if(!group.length)return;html+='<div class="longdetailtext detailcopy">'+group.join('')+'</div>';group=[]}
 for(const r of records){
  if(r.type==='image'){flush();const animated=/\.gif(?:$|[?#])/i.test(r.src)||/\.png(?:$|[?#])/i.test(r.src);const preview=animated?r.src:(r.thumbSrc||r.src);html+=`<div class="longdetailimage"><a href="/${r.src}" target="_blank" rel="noopener" aria-label="打开原图"><img src="/${preview}" alt="${r.alt||productName}" loading="lazy" decoding="async"></a></div>`;continue}
  if(r.title)group.push(`<h3>${r.title}</h3>`);
  const paras=r.text.split(/\n\s*\n/).filter(Boolean);
  paras.forEach((p,i)=>{const tag=!r.title&&paras.length===1&&p.length<=40&&/[：:]$/.test(p)?'h3':'p';group.push(`<${tag}>${p.replace(/\n/g,'<br>')}${i===paras.length-1&&r.marks.size?`<span class="detailmarks" aria-label="条目标记">${[...r.marks].join(' ')}</span>`:''}</${tag}>`)});
 }
 flush();return html||'<p>商品详情待补充。</p>';
}

function relatedProductType(p){
 const name=p.nameRaw||'';
 if(/安全套|避孕套/.test(name))return 'condom';
 if(/按摩器|自慰|跳蛋|震动|震動/.test(name))return 'device';
 if(/胶囊|膠囊|片剂|片劑|增强丸|增強丸|鹿鞭丸/.test(name))return 'capsule';
 if(/喷剂|噴劑|喷雾|噴霧/.test(name))return 'spray';
 if(/香水/.test(name))return 'perfume';
 if(/润滑|潤滑/.test(name))return 'lubricant';
 if(/膏|乳霜|凝胶|凝膠/.test(name))return 'cream';
 if(/咖啡/.test(name))return 'coffee';
 if(/糖/.test(name))return 'candy';
 return null;
}
function relatedProducts(p){
 const type=relatedProductType(p);
 const related=type?products.filter(q=>q.id!==p.id&&q.categoriesRaw.some(category=>p.categoriesRaw.includes(category))&&relatedProductType(q)===type).slice(0,2):[];
 return related.length?`<section class="related-products" aria-labelledby="related-title"><h2 id="related-title">相关推荐</h2><div class="related-grid">${related.map(card).join('')}</div></section>`:'';
}
function product(){
 const id=new URLSearchParams(location.search).get('id')||location.pathname.match(/product-([a-z0-9-]+)\.html$/)?.[1]||products[0]?.id;
 const p=productById(id);if(!p)return `<main class="wrap empty"><h1>没有找到这件商品</h1><a class="btn" href="index.html">返回商品列表</a></main>`;
 currentProduct=p;document.title=p.name+' · '+SHOP.name;document.body.classList.add('productpage');const gallery=p.gallery?.length?p.gallery:[0,1,2].map((_,i)=>({src:art(p,i),alt:['正面','细节','包装'][i]}));
 const blocks=p.detailBlocks?.length?p.detailBlocks:(p.details||[]).map(d=>({type:'text',title:d[0],text:d[1]}));
 return `<main class="wrap"><div class="crumb"><a href="index.html">首页</a> / <a href="index.html?category=${encodeURIComponent(p.categoryRaw)}#products">${p.category}</a> / ${p.name}</div><section class="product"><div><button class="mainimage" style="border:0;padding:0;width:100%" aria-label="放大商品图片"><img id="mainphoto" src="${gallery[0].src}" alt="${gallery[0].alt||p.name}" width="600" height="570"><span class="zoomlabel">＋ 点击放大</span></button><div class="thumbs" aria-label="商品图片">${gallery.map((i,n)=>`<button class="thumb ${n===0?'active':''}" data-view="${n}" aria-label="查看第${n+1}张商品图" aria-pressed="${n===0}"><img src="${i.src}" alt="${i.alt||p.name}" width="80" height="76"></button>`).join('')}</div></div><div class="productinfo"><div class="eyebrow">${p.category}</div><h1>${p.name}</h1><div><span class="price">${money(p.price)}</span></div><p class="intro">${p.intro.replace(/\n/g,'<br>')}</p>${p.count?`<div class="spec">规格 <span class="chip">${p.count}</span></div>`:''}<div style="display:flex;align-items:center;gap:25px">数量 ${quantity('detail',1)}</div><div class="buyrow"><button class="btn secondary" data-add>加入购物车</button><button class="btn" data-buy>立即购买</button></div><p class="smallnote">可先加入购物车，与其他商品一起结算。</p></div></section><nav class="detailnav" aria-label="详情目录"><a href="#details">图文详情</a>${p.count?'<a href="#specs">商品规格</a>':''}<a href="#purchasenotes">购买须知</a></nav><section class="detailsection" id="details"><h2>商品详情</h2>${renderProductDetails(blocks,p.name)}${p.count?`<section id="specs" class="productspecs"><h3>商品规格</h3><p>${p.count}</p></section>`:''}</section><section class="notes" id="purchasenotes"><h2>购买须知</h2><details><summary>配送方式与运费</summary><p><a href="delivery.html">查看送货地区、运费及预计运送时间</a>。</p></details></section>${relatedProducts(p)}</main><dialog id="zoom"><button class="dialogclose" aria-label="关闭大图">×</button><img src="${gallery[0].src}" alt="商品放大图"></dialog>`;
}
