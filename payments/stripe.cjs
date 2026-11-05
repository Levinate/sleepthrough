'use strict';
const crypto=require('node:crypto');
const PLANS=[{months:1,today:1699,renewal:2999},{months:3,today:2799,renewal:4999},{months:6,today:3999,renewal:6999}];
const API_VERSION='2025-04-30.basil';
class PaymentError extends Error{constructor(status,code){super(code);this.status=status;this.code=code;}}
function paymentApi(options={}){
 const key=options.key??process.env.STRIPE_SECRET_KEY??'',secret=options.cookieSecret??process.env.STRIPE_COOKIE_SECRET??'';
 const origin=new URL(options.origin??process.env.SITE_URL??`http://127.0.0.1:${process.env.PORT||3000}`).origin;
 const configured=/^sk_test_[A-Za-z0-9]{12,}$/.test(key)&&secret.length>=32;
 const fetcher=options.fetcher||fetch,limits=new Map(),coupons=new Map();
 const sign=s=>crypto.createHmac('sha256',secret).update(s).digest('base64url');
 function owner(req,create=false){const raw=String(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('st_stripe_owner='))?.slice(16);if(raw){const [id,mac]=raw.split('.');if(/^[a-f0-9]{48}$/.test(id||'')&&mac&&mac.length===sign(id).length&&crypto.timingSafeEqual(Buffer.from(mac),Buffer.from(sign(id))))return{id,cookie:null};}if(!create)throw new PaymentError(401,'checkout_browser_required');const id=crypto.randomBytes(24).toString('hex');return{id,cookie:`st_stripe_owner=${id}.${sign(id)}; Path=/api/payments; HttpOnly; SameSite=Lax; Max-Age=31536000${origin.startsWith('https:')?'; Secure':''}`};}
 function limit(id){const now=Date.now();let item=limits.get(id);if(!item||item.until<now)item={count:0,until:now+15*60*1000};item.count++;limits.set(id,item);if(limits.size>1000)for(const [k,v]of limits)if(v.until<now)limits.delete(k);if(item.count>20)throw new PaymentError(429,'too_many_checkout_requests');}
 async function stripe(path,method='GET',fields=null,idempotency=null){
  const headers={Authorization:`Bearer ${key}`,'Stripe-Version':API_VERSION};if(fields)headers['Content-Type']='application/x-www-form-urlencoded';if(idempotency)headers['Idempotency-Key']=idempotency;
  let res;try{res=await fetcher('https://api.stripe.com/v1'+path,{method,headers,body:fields?new URLSearchParams(fields).toString():undefined,signal:AbortSignal.timeout(12000)});}catch{throw new PaymentError(503,'stripe_temporarily_unavailable');}
  let value;try{value=await res.json();}catch{throw new PaymentError(502,'stripe_invalid_response');}if(!res.ok)throw new PaymentError(res.status===404?404:502,res.status===404?'stripe_object_not_found':'stripe_request_failed');
  if(value.livemode===true)throw new PaymentError(403,'live_payments_disabled');return value;
 }
 async function coupon(plan){const id=`sleepthrough_pilot_intro_${plan.months}m_v1`;if(coupons.has(id))return coupons.get(id);const verify=c=>{if(c.id!==id||c.livemode!==false||c.amount_off!==plan.renewal-plan.today||c.currency!=='usd'||c.duration!=='once'||!c.valid)throw new PaymentError(409,'intro_coupon_mismatch');coupons.set(id,c.id);return c.id;};try{return verify(await stripe('/coupons/'+id));}catch(e){if(e.status!==404)throw e;}
  return verify(await stripe('/coupons','POST',{id,currency:'usd',amount_off:String(plan.renewal-plan.today),duration:'once',name:`SleepThrough ${plan.months}-month introductory price`},id));
 }
 async function read(req){let data='';for await(const chunk of req){data+=chunk;if(Buffer.byteLength(data)>8192)throw new PaymentError(413,'request_too_large');}try{const value=JSON.parse(data);if(!value||typeof value!=='object'||Array.isArray(value))throw Error();return value;}catch{throw new PaymentError(400,'invalid_json');}}
 function validatePricing(session){const i=Number(session.metadata?.plan),p=PLANS[i];if(!Number.isInteger(i)||!p||session.mode!=='subscription'||session.currency!=='usd'||session.amount_total!==p.today)throw new PaymentError(409,'checkout_price_mismatch');}
 function summary(sub,session){const planIndex=Number(session.metadata?.plan),plan=PLANS[planIndex];if(!plan||sub.livemode!==false)throw new PaymentError(403,'invalid_subscription');return{processor:'stripe',test:true,demo:false,sessionId:session.id,planIndex,months:plan.months,today:plan.today/100,renewal:plan.renewal/100,status:sub.status,cancelAtEnd:!!sub.cancel_at_period_end,periodEnd:new Date((sub.items?.data?.[0]?.current_period_end||sub.current_period_end)*1000).toISOString(),pausedUntil:sub.pause_collection?.resumes_at?new Date(sub.pause_collection.resumes_at*1000).toISOString():null};}
 async function ownedSession(req,id){if(!/^cs_test_[A-Za-z0-9]+$/.test(id||''))throw new PaymentError(400,'invalid_checkout_session');const who=owner(req);const session=await stripe('/checkout/sessions/'+id+'?expand[]=subscription');if(session.livemode!==false||session.metadata?.owner!==who.id||session.client_reference_id!==who.id)throw new PaymentError(403,'checkout_not_owned');return{who,session};}
 async function handler(req,res,url){
  if(!url.pathname.startsWith('/api/payments/'))return false;
  const reply=(status,value,extra={})=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra});res.end(JSON.stringify(value));};
  try{
   if(req.method==='GET'&&url.pathname==='/api/payments/config'){const who=configured?owner(req,true):null;reply(200,{enabled:configured,testOnly:true,reason:configured?null:'sandbox_key_required'},who?.cookie?{'Set-Cookie':who.cookie}:{});return true;}
   if(!configured)throw new PaymentError(503,'sandbox_not_configured');
   if(req.method==='POST'){if(req.headers.origin!==new URL(origin).origin)throw new PaymentError(403,'invalid_origin');if(!String(req.headers['content-type']).startsWith('application/json'))throw new PaymentError(415,'json_required');}
   if(req.method==='POST'&&url.pathname==='/api/payments/checkout'){
    const data=await read(req),plan=PLANS[data.plan];if(!Number.isInteger(data.plan)||!plan)throw new PaymentError(400,'invalid_plan');if(data.consent!==true)throw new PaymentError(400,'subscription_consent_required');if(!/^[a-zA-Z0-9-]{16,80}$/.test(data.attempt||''))throw new PaymentError(400,'invalid_attempt');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email||'')||data.email.length>254)throw new PaymentError(400,'invalid_email');
    const who=owner(req,true);limit(who.id);const discount=await coupon(plan),once=crypto.createHash('sha256').update(who.id+':'+data.attempt+':'+data.plan+':'+data.email.trim()).digest('hex');
    const session=await stripe('/checkout/sessions','POST',{
     mode:'subscription',locale:'en','adaptive_pricing[enabled]':'false','payment_method_types[0]':'card','line_items[0][price_data][currency]':'usd','line_items[0][price_data][product_data][name]':'SleepThrough 28-night reset',
     'line_items[0][price_data][unit_amount]':String(plan.renewal),'line_items[0][price_data][recurring][interval]':'month','line_items[0][price_data][recurring][interval_count]':String(plan.months),'line_items[0][quantity]':'1',
     'discounts[0][coupon]':discount,customer_email:data.email.trim(),client_reference_id:who.id,'metadata[owner]':who.id,'metadata[plan]':String(data.plan),'metadata[terms_version]':'pilot-2026-11-06',
     'subscription_data[metadata][owner]':who.id,'subscription_data[metadata][plan]':String(data.plan),success_url:origin+'/?checkout_session_id={CHECKOUT_SESSION_ID}#stripe-return',cancel_url:origin+'/#plans'
    },'st-checkout-v2-'+once);
    if(session.livemode!==false||!/^cs_test_/.test(session.id))throw new PaymentError(403,'live_payments_disabled');const next=new URL(session.url);if(next.protocol!=='https:'||next.hostname!=='checkout.stripe.com')throw new PaymentError(502,'invalid_checkout_url');
    reply(200,{sessionId:session.id,url:session.url},who.cookie?{'Set-Cookie':who.cookie}:{});return true;
   }
   if(req.method==='GET'&&url.pathname==='/api/payments/session'){
    const{session}=await ownedSession(req,url.searchParams.get('session_id'));if(session.status!=='complete'||session.payment_status!=='paid'||!session.subscription){reply(200,{verified:false,status:session.status});return true;}
    validatePricing(session);if(session.subscription.metadata?.owner!==session.metadata.owner)throw new PaymentError(403,'subscription_not_owned');reply(200,{verified:true,subscription:summary(session.subscription,session)});return true;
   }
   if(req.method==='POST'&&['/api/payments/cancel','/api/payments/pause'].includes(url.pathname)){
    const data=await read(req);if(data.confirmed!==true)throw new PaymentError(400,'confirmation_required');const{session,who}=await ownedSession(req,data.sessionId),sub=session.subscription;
    if(session.status!=='complete'||session.payment_status!=='paid'||!sub||sub.metadata?.owner!==who.id||sub.livemode!==false||!/^sub_[A-Za-z0-9]+$/.test(sub.id))throw new PaymentError(403,'subscription_not_owned');
    validatePricing(session);let fields;if(url.pathname.endsWith('/cancel'))fields={cancel_at_period_end:'true'};else{if(sub.status!=='active'||sub.cancel_at_period_end)throw new PaymentError(409,'subscription_not_active');const d=new Date(),day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+1);d.setUTCDate(Math.min(day,new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate()));fields={'pause_collection[behavior]':'void','pause_collection[resumes_at]':String(Math.floor(d.getTime()/1000))};}
    const updated=await stripe('/subscriptions/'+sub.id,'POST',fields,'st-'+url.pathname.split('/').at(-1)+'-'+crypto.createHash('sha256').update(who.id+':'+sub.id+':'+(fields['pause_collection[resumes_at]']||'end')).digest('hex'));
    reply(200,{subscription:summary(updated,session)});return true;
   }
   throw new PaymentError(405,'method_not_allowed');
  }catch(e){reply(e instanceof PaymentError?e.status:500,{error:e instanceof PaymentError?e.code:'payment_unavailable'});return true;}
 }
 return{handler,configured};
}
module.exports={paymentApi,PLANS,API_VERSION};
