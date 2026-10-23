import {lessons} from './lessons.js';
import {normalizeExtras} from './town.js';
export const APP='finance-small-steps', VERSION=1;
export const uid=()=>globalThis.crypto?.randomUUID?.() || Date.now().toString(36)+Math.random().toString(36).slice(2);
export const now=()=>new Date().toISOString();
export const emptyProgress=()=>({answer:'',practice:'',review:'',quiz:null,checked:false,seen:false,done:[],updatedAt:now()});
export const emptyTrade=()=>({symbol:'',reason:'',invalid:'',exitPlan:'',planPrice:'',quantity:'',paperConfirmed:false,status:'观察',buy:'',sell:'',fees:'',review:'',evidence:''});
export const initialState=()=>normalizeExtras({profileId:uid(),current:0,step:0,energy:'5',progress:{},trades:[],feedback:[],draft:emptyTrade()});
export function tradePnL(t){
 if(t.status!=='已结束'||[t.buy,t.sell,t.quantity,t.fees].some(x=>x===''||x==null))return null;
 const [b,s,q,f]=[t.buy,t.sell,t.quantity,t.fees].map(Number);
 if(![b,s,q,f].every(Number.isFinite)||b<=0||s<0||q<=0||f<0)return null;
 return (s-b)*q-f;
}
export function tradeIssue(t){
 if(!t.symbol.trim())return '先填一个产品名称或代码。';
 if(!t.reason.trim())return '写一句观察或买入的理由就好。';
 if(t.status!=='观察'&&!t.paperConfirmed)return '请先在券商界面确认这是模拟交易；未确认可保存为观察。';
 for(const k of ['planPrice','quantity','buy','sell','fees'])if(t[k]!==''&&(!Number.isFinite(Number(t[k]))||Number(t[k])<0))return '价格、数量和费用请填非负数字。';
 if(t.quantity!==''&&Number(t.quantity)<=0)return '数量必须大于零。';
 if(['已买入','已结束'].includes(t.status)&&(Number(t.buy)<=0||Number(t.quantity)<=0))return '已成交的记录需要实际买入价和数量。';
 if(t.status==='已结束'&&tradePnL(t)===null)return '结束记录还需卖出价与往返费用；无费用请明确填 0。';
 return '';
}
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
function text(x,key,max=20000){if(typeof x!=='string'||x.length>max)throw Error(key+' 格式不正确或太长');return x;}
function stamp(x){text(x,'日期',80);if(!Number.isFinite(Date.parse(x)))throw Error('日期格式不正确');return x;}
const ids=new Set(lessons.map(x=>x.id));
function cleanProgress(p){
 if(!object(p)||!Array.isArray(p.done)||p.done.some(x=>!Number.isInteger(x)||x<0||x>3))throw Error('学习进度格式不正确');
 if(p.quiz!==null&&(!Number.isInteger(p.quiz)||p.quiz<0||p.quiz>2))throw Error('选择题答案无效');
 if(typeof p.checked!=='boolean'||typeof p.seen!=='boolean')throw Error('学习标记无效');
 return {answer:text(p.answer,'解释'),practice:text(p.practice,'练习'),review:text(p.review,'复盘'),quiz:p.quiz,checked:p.checked,seen:p.seen,done:[...new Set(p.done)],updatedAt:stamp(p.updatedAt)};
}
function cleanTrade(t,draft=false){
 if(!object(t))throw Error('模拟记录格式无效');const out={};
 for(const k of Object.keys(emptyTrade())){
  if(k==='paperConfirmed'){if(typeof t[k]!=='boolean')throw Error('模拟确认无效');out[k]=t[k];}
  else out[k]=text(t[k],k,k==='symbol'?120:20000);
 }
 if(!['观察','已挂单','已买入','已结束'].includes(out.status))throw Error('订单状态无效');
 if(!draft){out.id=text(t.id,'记录编号',120);out.createdAt=stamp(t.createdAt);out.updatedAt=stamp(t.updatedAt);}
 return out;
}
function cleanFeedback(f){
 if(!object(f)||!['lesson','trade'].includes(f.targetType))throw Error('批改对象无效');
 if(!['基本理解','需补充','有误'].includes(f.verdict))throw Error('批改结论须为：基本理解、需补充、有误');
 return {id:text(f.id,'批改编号',200),requestId:text(f.requestId,'请求编号',120),targetType:f.targetType,targetId:text(f.targetId,'目标编号',120),targetRevision:stamp(f.targetRevision),verdict:f.verdict,comment:text(f.comment,'批改意见'),nextQuestion:text(f.nextQuestion,'追问'),importedAt:stamp(f.importedAt)};
}
export function cleanState(s){
 if(!object(s)||!object(s.progress)||!Array.isArray(s.trades)||!Array.isArray(s.feedback))throw Error('备份内容缺少记录区');
 if(s.trades.length>1000||s.feedback.length>2000)throw Error('记录数量超出本版限制');
 if(!Number.isInteger(s.current)||s.current<0||s.current>=lessons.length||!Number.isInteger(s.step)||s.step<0||s.step>3||!['2','5'].includes(s.energy))throw Error('学习位置无效');
 const progress={};for(const [id,p] of Object.entries(s.progress)){if(!ids.has(id))throw Error('包含本版本不认识的课程');progress[id]=cleanProgress(p);}
 const trades=s.trades.map(t=>cleanTrade(t)),feedback=s.feedback.map(cleanFeedback);
 if(new Set(trades.map(x=>x.id)).size!==trades.length||new Set(feedback.map(x=>x.id)).size!==feedback.length)throw Error('文件内有重复记录编号');
 return normalizeExtras({profileId:text(s.profileId,'学习档案编号',120),current:s.current,step:s.step,energy:s.energy,progress,trades,feedback,draft:cleanTrade(s.draft,true),town:s.town,repetition:s.repetition});
}
export function parseImport(raw){
 if(raw.length>2000000)throw Error('文件过大，请限制在 2 MB 以内');
 const stripped=raw.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');let p;try{p=JSON.parse(stripped);}catch{throw Error('不是完整 JSON。请导入备份文件，或只粘贴批改 JSON 代码块。');}
 if(!object(p)||p.app!==APP||p.version!==VERSION)throw Error('不是本站支持的 v1 文件');
 if(p.kind==='backup')return {kind:'backup',state:cleanState(p.state),exportedAt:stamp(p.exportedAt)};
 if(p.kind==='feedback'){
  const req=text(p.requestId,'请求编号',120);
  if(!Array.isArray(p.items)||p.items.length===0||p.items.length>100)throw Error('批改文件须有 1–100 条意见');
  return {kind:'feedback',items:p.items.map((x,i)=>cleanFeedback({...x,id:req+':'+i,requestId:req,importedAt:now()}))};
 }
 throw Error('这个文件不能导入。备份须为 backup，批改须为 feedback。');
}
export const backup=s=>({app:APP,version:VERSION,kind:'backup',exportedAt:now(),state:s});
export function mergeStates(local,incoming,prefer='local'){
 const choose=(a,b)=>prefer==='incoming'?b:a;
 const progress={...local.progress};for(const [id,p]of Object.entries(incoming.progress))progress[id]=progress[id]?choose(progress[id],p):p;
 const combine=(a,b)=>{const m=new Map(a.map(x=>[x.id,x]));for(const x of b)m.set(x.id,m.has(x.id)?choose(m.get(x.id),x):x);return [...m.values()];};
 const repetition={...local.repetition};for(const [id,r]of Object.entries(incoming.repetition||{}))repetition[id]=repetition[id]?choose(repetition[id],r):r;
 const earned=[...new Set([...local.town.earned,...incoming.town.earned])],feeds=[...new Set([...local.town.feeds,...incoming.town.feeds])].slice(0,earned.length);
 return normalizeExtras({...local,progress,repetition,town:{earned,feeds},trades:combine(local.trades,incoming.trades),feedback:combine(local.feedback,incoming.feedback)});
}
export function importSummary(local,incoming){
 let conflicts=0,added=0;
 for(const [id,p]of Object.entries(incoming.progress)){if(!local.progress[id])added++;else if(JSON.stringify(p)!==JSON.stringify(local.progress[id]))conflicts++;}
 for(const key of ['trades','feedback']){const m=new Map(local[key].map(x=>[x.id,x]));for(const x of incoming[key]){if(!m.has(x.id))added++;else if(JSON.stringify(m.get(x.id))!==JSON.stringify(x))conflicts++;}}
 return {conflicts,added};
}
