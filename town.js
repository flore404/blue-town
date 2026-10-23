import {lessons} from './lessons.js';

export const terms=[
 ['股票','Stock','公司所有权的一小份'],['债券','Bond','政府或企业借钱的凭证'],['ETF','Exchange-Traded Fund','能像股票一样买卖的基金'],['持仓','Position / Holdings','账户里实际拥有的资产'],['限价单','Limit Order / LMT','只接受设定价格或更好的价格'],['市价单','Market Order / MKT','按当时可获得的市场价格成交'],['止损单','Stop Order / STP','到指定价格触发的指令，不保证成交价'],['买卖价差','Bid–Ask Spread','最高买价与最低卖价之差'],['委托','Order','提出的交易请求'],['成交','Fill / Execution','已经完成的买卖'],['有效期','Time in Force / TIF','订单保留多久'],['模拟交易','Paper Trading','用虚拟资金练习交易'],
 ['回撤','Drawdown','资产从高点跌下来的比例'],['仓位','Position Size','一项投资的金额或占比'],['资产配置','Asset Allocation','在不同资产类别间分配资金'],['投资政策声明','Investment Policy Statement / IPS','把目标、风险和约束写成规则'],['相关系数','Correlation Coefficient','两项资产收益同向变化的程度'],['持有期收益率','Holding Period Return / HPR','一个持有期间的总收益'],['实际收益率','Real Return','扣除通胀后的购买力变化'],
 ['营收','Revenue','销售商品或服务取得的收入'],['净利润','Net Income','扣除成本费用等后的账面利润'],['自由现金流','Free Cash Flow / FCF','经营现金流减资本支出的常见简化口径'],['利润表','Income Statement','一段时期的收入、费用和利润'],['资产负债表','Balance Sheet','某一时点拥有和欠下什么'],['现金流量表','Cash Flow Statement','一段时期现金如何进出'],['估值倍数','Valuation Multiple','价格与盈利、销售额或现金流的比率'],['市盈率','Price-to-Earnings / P/E','每股价格除以每股收益'],['每股收益','Earnings per Share / EPS','归属于每股普通股的盈利'],
 ['到期收益率','Yield to Maturity / YTM','满足一组假设时持有债券至到期的内部收益率'],['久期','Duration','债券价格对利率变化的敏感度'],['指引','Guidance','公司对未来经营结果的预计'],['同比','Year over Year / YoY','与去年同期比较'],['看跌期权','Put Option','按约定价格卖出的权利'],['权利金','Premium','购买期权支付的价格'],['隐含波动率','Implied Volatility / IV','从期权价格反推的预期波动'],['到期日','Expiration Date','期权权利失效的日期'],['行权价','Strike Price','合约约定的买卖价格'],['行权','Exercise','使用期权约定的权利']
];

export function bilingual(s){let out=s;for(const [cn,en] of [...terms].sort((a,b)=>b[0].length-a[0].length))out=out.split(cn+'（').join(cn+'（'+en+'；');return out;}
export const dayKey=(d=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
export function normalizeExtras(s){
 const t=s.town||{};s.town={earned:Array.isArray(t.earned)?[...new Set(t.earned.filter(x=>typeof x==='string'&&x.length<150))]:[],feeds:Array.isArray(t.feeds)?[...new Set(t.feeds.filter(x=>typeof x==='string'&&x.length<150))]:[]};
 for(const [id,p]of Object.entries(s.progress))for(const n of p.done){const key='learn:'+id+':'+n;if(!s.town.earned.includes(key))s.town.earned.push(key);}
 if(s.town.feeds.length>s.town.earned.length)throw Error('建造记录超过获得的建材');
 const ids=new Set(lessons.map(x=>x.id));s.repetition=s.repetition||{};for(const [id,r]of Object.entries(s.repetition)){if(!ids.has(id)||!r||!Number.isInteger(r.level)||r.level<0||r.level>5||!Number.isFinite(Date.parse(r.due))||typeof r.answer!=='string'||r.answer.length>20000)throw Error('复习记录格式错误');if(!Array.isArray(r.history)||r.history.length>2000)throw Error('复习历史格式错误');for(const h of r.history)if(!h||typeof h.answer!=='string'||h.answer.length>20000||!['again','hard','good'].includes(h.rating)||!Number.isFinite(Date.parse(h.at)))throw Error('复习历史无效');}
 return s;
}
export function earn(s,key){if(s.town.earned.includes(key))return false;s.town.earned.push(key);return true;}
export function earnMany(s,key,count){let added=0;for(let i=0;i<count;i++)if(earn(s,i===0?key:key+':bonus'+i))added++;return added;}
export function schedule(s,id){if(!s.repetition[id])s.repetition[id]={level:0,due:new Date(Date.now()+86400000).toISOString(),answer:'',history:[]};}
export function reviewResult(s,id,rating){const r=s.repetition[id];const days=rating==='again'?1:rating==='hard'?2:[3,7,14,30,60,90][r.level];r.level=rating==='again'?0:rating==='hard'?r.level:Math.min(5,r.level+1);r.history.push({at:new Date().toISOString(),rating,answer:r.answer});r.answer='';r.due=new Date(Date.now()+days*86400000).toISOString();earn(s,'review:'+id+':'+dayKey());return days;}

const colors=['#e6a84b','#d96f5d','#5f86b7','#4c9a8c','#d98ca5','#e5c75f','#6f78a8','#c76d48','#75a7b0','#e59655','#bb6b81','#789769'];
function house(x,y,i,far=false){const w=32+(i%3)*3,h=42+(i%4)*5,c=colors[i%colors.length],roof=i%3===0?`<path d="M${x-2} ${y-h} L${x+w/2} ${y-h-15} L${x+w+2} ${y-h}Z" fill="#324968"/>`:`<rect x="${x-2}" y="${y-h-7}" width="${w+4}" height="7" rx="2" fill="#324968"/>`;let windows='';for(let r=0;r<2;r++)for(let q=0;q<2;q++)windows+=`<rect x="${x+6+q*(w-16)}" y="${y-h+11+r*14}" width="6" height="8" rx="1" fill="${far?'#dcecff':'#f7e8ad'}"/>`;return `<g class="canal-house">${roof}<rect x="${x}" y="${y-h}" width="${w}" height="${h}" rx="1.5" fill="${c}"/>${windows}<rect x="${x+w/2-4}" y="${y-13}" width="8" height="13" fill="#28425e"/></g>`;}
export function townSvg(materials){
 const completed=Math.min(12,2+Math.floor(materials/3));let far='',near='',reflections='';
 for(let i=0;i<6;i++){if(i*2<completed)far+=house(22+i*61,82,i*2,true);if(i*2+1<completed)near+=house(30+i*60,194,i*2+1,false);}
 for(let i=0;i<completed;i++){const slot=Math.floor(i/2),x=31+slot*60,y=i%2===0?100:132,c=colors[i%colors.length];reflections+=`<path d="M${x} ${y}l16 0 7 25-28 0z" fill="${c}" opacity=".16"/>`;}
 const slot=Math.floor(completed/2),isNear=completed%2===1,next=completed<12?`<g opacity=".75"><rect x="${28+slot*60}" y="${isNear?190:76}" width="37" height="4" rx="2" fill="#f3d58c"/><path d="M${47+slot*60} ${isNear?165:51}v25m-9-17h18" stroke="#d29b3f" stroke-width="2"/></g>`:'';
 return `<svg viewBox="0 0 400 220" role="img" aria-label="运河小镇，已建成 ${completed} 座彩色房屋"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#cfe4fb"/><stop offset="1" stop-color="#edf5fd"/></linearGradient><linearGradient id="water" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#74b8d6"/><stop offset="1" stop-color="#3d87ae"/></linearGradient></defs><rect width="400" height="220" rx="22" fill="url(#sky)"/><circle cx="348" cy="31" r="14" fill="#fff0b8"/><path d="M0 83h400v20H0z" fill="#d9c8aa"/>${far}<path d="M0 97 C105 90 292 111 400 96 V177 C270 163 125 184 0 173Z" fill="url(#water)"/>${reflections}<path d="M0 176h400v44H0z" fill="#d5c0a2"/>${near}${next}<path d="M0 99c100-8 300 14 400-2M0 173c135 12 268-10 400 4" stroke="#fff" stroke-opacity=".7" stroke-width="2" fill="none"/><g transform="translate(182 133)"><path d="M0 0h43l-7 10H8z" fill="#f8f4e8"/><path d="M7-2h24l7-8H12z" fill="#d95f54"/><path d="M20-2v-17" stroke="#344e69" stroke-width="2"/><path d="M20-18l13 7H20z" fill="#fff" opacity=".85"/></g></svg>`;
}
