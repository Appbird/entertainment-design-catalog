import"../modulepreload-polyfill-B5Qt9EMX.js";import{a as p,b as u}from"../data-DS67y8c2.js";function h(e,r){return`${e}::${r}`}function n(e){return e.replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r])}function $(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function m(e,r){if(!r)return e;const t=new RegExp($(n(r)),"g");return e.replace(t,a=>`<strong>${a}</strong>`)}function f(e,r){const t=r[e];return t?`<a class="paper-ref" href="${n(t.url)}" target="_blank" rel="noopener noreferrer">${n(t.title)}（${n(t.year)}）</a>`:`<span class="paper-ref">${n(e)}</span>`}function l(e,r,t){return e.length===0?'<p class="word-detail-empty">該当する記述はありません。</p>':`<ul class="sentence-list">${e.map(s=>`<li>${m(n(s.text),r)}<div class="paper-ref-line">${f(s.paperId,t)}</div></li>`).join("")}</ul>`}function d(e){return e.length===0?"":`<div class="word-highlight-box"><div class="word-chip-list">${e.map(t=>{const a=t.stat?`<span class="word-chip__stat">${t.stat}</span>`:"";return`<span class="word-chip"><span class="word-chip__term">${n(t.word)}</span>${a}</span>`}).join("")}</div></div>`}function c(e,r){const t=d(e.topWords.map(s=>({word:s.word,stat:`p=${s.p.toFixed(4)} n=${s.n}`})));if(e.usages.length===0)return`${t}<p class="word-detail-empty">有意な上位語は見つかりませんでした。</p>`;const a=e.usages.map(s=>`
        <div class="usage-group">
          <div class="usage-group__title">「${n(s.word)}」の用法</div>
          ${l(s.sentences,s.word,r)}
        </div>`).join("");return`${t}${a}`}function g(e,r){return`
    <a class="word-detail-back" href="./ec2026si.html">&larr; EC2026特集号ページに戻る</a>
    <div class="word-detail-header">
      <p class="word-detail-header__cluster">C${e.clusterId}　${n(e.clusterName)}</p>
      <span class="word-detail-header__word">「${n(e.word)}」</span>
      <span class="word-detail-header__stat">反応の記述に${e.rCount}論文（クラスタ内${e.rCount+e.restCount}論文中）で出現</span>
    </div>

    <div class="word-detail-section">
      <h3>該当する「反応」の記述</h3>
      ${d([{word:e.word}])}
      ${l(e.response,e.word,r)}
    </div>

    <div class="word-detail-section">
      <h3>「アプローチ」の観点での用法</h3>
      ${c(e.approach,r)}
    </div>

    <div class="word-detail-section">
      <h3>「状況理解」の観点での用法</h3>
      ${c(e.grasp,r)}
    </div>`}async function w(){const e=document.getElementById("word-detail-root");if(!e)return;const r=new URLSearchParams(location.search),t=Number(r.get("cluster")),a=r.get("word")??"";if(!Number.isFinite(t)||!a){e.innerHTML='<p class="u-subtle">語が指定されていません。<a href="./ec2026si.html">EC2026特集号ページに戻る</a></p>';return}e.innerHTML='<p class="u-subtle">読み込み中...</p>';try{const[s,o]=await Promise.all([p(),u()]),i=s[h(t,a)];if(!i){e.innerHTML='<p class="u-subtle">該当するデータが見つかりませんでした。<a href="./ec2026si.html">EC2026特集号ページに戻る</a></p>';return}document.title=`「${i.word}」(C${i.clusterId} ${i.clusterName}) | EC2026特集号`,e.innerHTML=g(i,o)}catch(s){console.error(s),e.innerHTML='<p class="u-subtle">データの読み込みに失敗しました。</p>'}}w();
//# sourceMappingURL=ec2026si-word-S_I8rX3J.js.map
