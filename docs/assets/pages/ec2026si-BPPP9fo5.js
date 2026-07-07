import"../modulepreload-polyfill-B5Qt9EMX.js";import{f as d}from"../data-DS67y8c2.js";function o(t,r,s){return t.length===0?'<span class="word-table__empty">—</span>':`<div class="word-chip-list">${t.map(e=>{const n=`<span class="word-chip__stat">z=${e.z.toFixed(2)} n=${e.n}</span>`,a=`<span class="word-chip__term">${c(e.word)}</span>`;return s?`<a class="word-chip word-chip--link" href="${`./ec2026si-word.html?cluster=${r}&word=${encodeURIComponent(e.word)}`}">${a}${n}</a>`:`<span class="word-chip">${a}${n}</span>`}).join("")}</div>`}function c(t){return t.replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r])}function l(t){return`
    <p class="word-legend">語をクリックすると、該当する記述と「状況理解」「アプローチ」の観点での用法を確認できます。</p>
    <div class="word-table-wrap">
      <table class="word-table">
        <thead>
          <tr>
            <th>クラスタ</th>
            <th>反応（response）の特徴語</th>
            <th>状況理解（grasp）の特徴語</th>
          </tr>
        </thead>
        <tbody>${t.map(s=>`
        <tr>
          <td class="word-table__cluster">
            <span class="word-table__cid">C${s.id}</span>
            <span class="word-table__cname">${c(s.name)}</span>
            <span class="word-table__cn">n=${s.n}</span>
          </td>
          <td>${o(s.facets.response,s.id,!0)}</td>
          <td>${o(s.facets.grasp,s.id,!1)}</td>
        </tr>`).join("")}</tbody>
      </table>
    </div>`}async function p(){const t=document.getElementById("word-analysis-root");if(t){t.innerHTML='<p class="u-subtle">読み込み中...</p>';try{const r=await d();t.innerHTML=l(r)}catch(r){console.error(r),t.innerHTML='<p class="u-subtle">データの読み込みに失敗しました。</p>'}}}p();
//# sourceMappingURL=ec2026si-BPPP9fo5.js.map
