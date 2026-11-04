/* Supabase is the identity provider; database RLS is the authorization boundary. */
window.SleepAuth = (() => {
  const config = window.SLEEPTHROUGH_CONFIG;
  const client = config && window.supabase?.createClient(config.url, config.publishableKey);
  const api = { user:null, ready:false, loaded:false, error:'', status:'', recovery:false, loadVersion:0 };
  let listener = () => {}, generation = 0, timer, pending = null, draining = false, version = 0;
  const empty = () => ({complete:[], notes:{}, lessonSteps:{}, history:[], entry:null});
  api.data = empty();
  api.name = '';
  function emit(){ listener(api); }
  function message(error){
    const code = error?.code;
    if(code === 'email_not_confirmed') return 'Please confirm your email before signing in.';
    if(code === 'invalid_credentials') return 'The email or password is incorrect.';
    if(code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') return 'Too many requests. Please wait a few minutes and try again.';
    if(code === 'email_address_not_authorized') return 'Email delivery is not configured for this address yet. Please contact SleepThrough support.';
    return 'We could not complete this request. Check your connection and try again.';
  }
  function normalize(p){
    p = p && typeof p === 'object' ? p : {};
    const history = (Array.isArray(p.history) ? p.history : []).filter(e => e && /^\d{4}-\d{2}-\d{2}$/.test(e.day) && Number.isFinite(e.wakes) && e.wakes>=0 && e.wakes<=30 && Number.isFinite(e.awake) && e.awake>=0 && e.awake<=720 && Number.isFinite(e.hours) && e.hours>=0 && e.hours<=16).slice(-366);
    const notes = Object.fromEntries(Object.entries(p.notes||{}).filter(([k,v])=>Number(k)>=1&&Number(k)<=28&&typeof v==='string').map(([k,v])=>[k,v.slice(0,1500)]));
    const lessonSteps = Object.fromEntries(Object.entries(p.lessonSteps||{}).filter(([k,v])=>Number(k)>=1&&Number(k)<=28&&[0,1,2].includes(v)));
    return {complete:[...new Set((Array.isArray(p.complete)?p.complete:[]).filter(n=>Number.isInteger(n)&&n>=1&&n<=28))], notes, lessonSteps, history, entry:history.at(-1)||null};
  }
  async function load(user, force=false){
    if(!force && api.user?.id===user?.id && api.loaded) return;
    const ticket=++generation;
    clearTimeout(timer); pending=null;
    api.user=user; api.loaded=false; api.error=''; api.data=empty(); api.name=''; emit();
    if(!user){ api.loaded=true; api.ready=true; api.status=''; emit(); return; }
    try {
      const {data,error}=await client.from('sleepthrough_user_state').select('display_name,payload').eq('user_id',user.id).maybeSingle();
      if(error) throw error;
      if(ticket!==generation) return;
      api.data=normalize(data?.payload); api.name=data?.display_name||user.user_metadata?.display_name||'Your';
      api.loaded=true; api.ready=true; api.loadVersion++; api.status='All changes saved';
    } catch(error){ if(ticket!==generation)return; api.error='Your data could not be loaded. Please retry before making changes.'; api.ready=true; }
    emit();
  }
  async function drain(){
    if(draining || !pending) return;
    draining=true;
    while(pending){
      const job=pending; pending=null;
      if(job.ticket!==generation) continue;
      api.status='Saving…'; emit();
      try {
        const {error}=await client.from('sleepthrough_user_state').upsert({user_id:job.uid,display_name:job.name,payload:job.payload,updated_at:new Date().toISOString()},{onConflict:'user_id'});
        if(error)throw error;
        if(job.ticket===generation && job.version===version) {api.status='All changes saved'; emit();}
      }catch(error){
        if(job.ticket===generation){ if(!pending)pending=job; api.status='Not saved — retry'; emit(); }
        break;
      }
    }
    draining=false;
  }
  api.subscribe = fn => {listener=fn;};
  api.save = (payload,name=api.name) => {
    if(!api.user || !api.loaded || api.error)return;
    api.data=normalize(payload); api.name=String(name).slice(0,80);
    pending={uid:api.user.id,ticket:generation,version:++version,name:api.name,payload:api.data};
    api.status='Unsaved changes'; emit(); clearTimeout(timer); timer=setTimeout(drain,600);
  };
  api.retrySave=drain;
  api.reload=()=>load(api.user,true);
  api.signOut=async()=>{
    clearTimeout(timer); await drain();
    if(pending || draining) throw new Error('Please wait for your changes to save, or retry saving before signing out.');
    const {error}=await client.auth.signOut({scope:'local'}); if(error)throw new Error(message(error));
    await load(null);
  };
  api.submit=async(mode,fields)=>{
    if(!client)throw new Error('Sign-in is temporarily unavailable. Please reload this page.');
    const email=String(fields.email||'').trim(),password=String(fields.password||'');
    let result;
    if(mode==='signup')result=await client.auth.signUp({email,password,options:{data:{display_name:String(fields.name||'').trim().slice(0,80)},emailRedirectTo:location.origin+'/'}});
    else if(mode==='forgot')result=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+'/'});
    else if(mode==='password'){
      if(!api.recovery)throw new Error('Open a fresh password-reset link from your email first.');
      result=await client.auth.updateUser({password});
    }else result=await client.auth.signInWithPassword({email,password});
    if(result.error)throw new Error(message(result.error));
    if(mode==='signup'&&!result.data.session)return 'Check your inbox to confirm your email, then return here to sign in. If the address is already registered, use Sign in or Reset password.';
    if(mode==='forgot')return 'If an account exists for this address, a reset link will arrive by email.';
    if(mode==='password'){api.recovery=false; return 'Your password has been updated. You can return to your sleep space.';}
    await load(result.data.user); location.hash='dashboard'; return '';
  };
  api.init=async()=>{
    if(!client){api.ready=true;api.error='Sign-in could not load. Please check your connection and reload.';emit();return;}
    client.auth.onAuthStateChange((event,session)=>{
      if(event==='PASSWORD_RECOVERY'){api.recovery=true;location.hash='password';}
      if(event==='SIGNED_OUT' || event==='SIGNED_IN' || event==='PASSWORD_RECOVERY') setTimeout(()=>load(session?.user||null),0);
    });
    try{
      const {data,error}=await client.auth.getSession();if(error)throw error;
      if(data.session){const verified=await client.auth.getUser();if(verified.error)throw verified.error;await load(verified.data.user);}
      else await load(null);
    }catch(error){api.ready=true;api.error='Your session could not be verified. Please reload and try again.';emit();}
  };
  window.addEventListener('online',()=>{if(pending)drain();});
  window.addEventListener('beforeunload',e=>{if(pending||draining){e.preventDefault();e.returnValue='';}});
  return api;
})();
