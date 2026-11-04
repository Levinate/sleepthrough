const account = () => window.SleepAuth;
const signedIn = () => !!account()?.user;
function authPage(mode='login',notice=''){
  const a=account(),signup=mode==='signup',forgot=mode==='forgot',reset=mode==='password';
  const title=signup?'Make room<br>for better nights.':forgot?'A fresh way<br>back in.':reset?'Your next<br>fresh start.':'Your quiet space.<br>Ready when you are.';
  main.innerHTML=`<section class="auth-layout"><div class="auth-story"><span class="eyebrow">YOUR PERSONAL SLEEP SPACE</span><h1>${title}</h1><p>Your nights, your reflections, and one small next step. Together in one place.</p><div class="auth-orbit" aria-hidden="true"><span>☾</span><i>✦</i><b>✧</b></div><div class="auth-benefits"><span>${icon('check')} Pick up your 28-day path</span><span>${icon('check')} Notice your waking patterns</span><span>${icon('check')} Return to your 3am protocol</span></div></div><div class="auth-card"><span class="eyebrow">SLEEPTHROUGH ACCOUNT</span><h2>${signup?'Create your account':forgot?'Reset your password':reset?'Choose a new password':'Welcome back.'}</h2><p>${signup?'Save your place. Return at your own pace.':forgot?'We’ll email you a link to choose a new password.':reset?'Use a unique password with at least 10 characters.':'Sign in to continue your sleep journey.'}</p><form id="auth-form" data-mode="${mode}">${signup?'<label>Your first name<input name="name" autocomplete="given-name" maxlength="80" required></label>':''}${!reset?'<label>Email address<input name="email" type="email" autocomplete="email" required></label>':''}${!forgot?`<label>Password<input name="password" type="password" autocomplete="${signup||reset?'new-password':'current-password'}" ${signup||reset?'minlength="10"':''} maxlength="128" required></label>`:''}<div class="auth-message" role="status" aria-live="polite">${escapeHTML(notice)}</div><button class="button" type="submit" ${reset&&!a?.recovery?'disabled':''}>${signup?'Create my account':forgot?'Send reset link':reset?'Update password':'Sign in'} ${icon('arrow')}</button></form>${mode==='login'?'<a class="text-link" href="#forgot">Forgot your password?</a><p class="auth-switch">New here? <a href="#signup">Create an account ↗</a></p>':`<p class="auth-switch">${reset?'<a href="#dashboard">Return to my sleep space ↗</a>':'Already have an account? <a href="#login">Sign in ↗</a>'}</p>`}<p class="auth-privacy">Your diary belongs to your account. Email confirmation is required for new registrations.</p><a class="text-link" href="#demo">Explore the demo first →</a></div></section>`;
  $('#auth-form').addEventListener('submit',async e=>{
    e.preventDefault();const form=e.target,button=form.querySelector('button[type="submit"]'),output=form.querySelector('.auth-message');
    button.disabled=true;button.setAttribute('aria-busy','true');output.textContent='One moment…';
    try{const fields=Object.fromEntries(new FormData(form)),message=await a.submit(mode,fields);if(message){output.textContent=message;output.classList.add('success');form.querySelector('input[name="password"]')?.value&&(form.querySelector('input[name="password"]').value='');}}
    catch(error){output.textContent=error.message;output.classList.remove('success');}
    finally{button.disabled=reset&&!a.recovery;button.removeAttribute('aria-busy');}
  });
}
function accountGate(){
  const a=account();
  if(!a.ready){main.innerHTML='<div class="account-loading" role="status"><span class="loading-moon">☾</span><h2>Opening your quiet space…</h2></div>';return true;}
  if(a.error){main.innerHTML=`<section class="account-loading"><span class="eyebrow">YOUR SLEEP SPACE</span><h1>Let’s reconnect.</h1><p role="alert">${escapeHTML(a.error)}</p><button class="button" data-action="reload-account">Retry</button><a class="text-link" href="#home">Back to home</a></section>`;return true;}
  if(!a.user){authPage('login');return true;}
  if(!a.loaded){main.innerHTML='<div class="account-loading" role="status"><span class="loading-moon">☾</span><h2>Bringing your nights together…</h2></div>';return true;}
  return false;
}
function ownNights(){const cutoff=new Date();cutoff.setHours(0,0,0,0);cutoff.setDate(cutoff.getDate()-state.period+1);return(state.history||[]).filter(e=>new Date(e.day+'T00:00:00')>=cutoff).sort((a,b)=>a.day.localeCompare(b.day));}
function average(field){const nights=ownNights();return nights.length?(nights.reduce((sum,e)=>sum+Number(e[field]),0)/nights.length).toFixed(1):'—';}
function ownChart(){const nights=ownNights();if(!nights.length)return `<div class="empty-state">${icon('moon')}<h3>Your story starts with one night.</h3><p>Add a morning check-in to see your awakenings here.</p><button class="button outline small" data-action="checkin">Record my first night →</button></div>`;
  const max=Math.max(3,...nights.map(e=>e.wakes));return `<div class="own-chart" role="img" aria-label="Your recorded awakenings: ${nights.map(e=>e.day+': '+e.wakes).join('; ')}">${nights.map(e=>`<div class="own-bar-col"><strong>${e.wakes}</strong><i style="height:${Math.max(3,e.wakes/max*140)}px"></i><small>${new Date(e.day+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</small></div>`).join('')}</div><p class="muted">${nights.length} recorded night${nights.length===1?'':'s'} · Missing nights are left out of the average.</p>`;
}
function cloudInsights(){appShell('insights',`${pageHead('YOUR OWN DATA','Understand your nights.<br>One check-in at a time.')}<article class="card insights-main"><div class="card-top"><span class="eyebrow">AWAKENINGS PER NIGHT</span><div class="segmented"><button data-period="7" aria-pressed="${state.period===7}">7 days</button><button data-period="28" aria-pressed="${state.period===28}">28 days</button></div></div><div class="insight-number">${average('wakes')}<small>/ recorded night</small></div>${ownChart()}</article><div class="stat-grid"><article class="card"><span class="eyebrow">TIME AWAKE</span><strong>${average('awake')} <small>min / night</small></strong><p>Your morning estimates.</p></article><article class="card"><span class="eyebrow">TIME ASLEEP</span><strong>${average('hours')} <small>h / night</small></strong><p>Averages from your recorded nights.</p></article><article class="card"><span class="eyebrow">YOUR LEARNING</span><strong>${state.complete.length}<small> / 28</small></strong><p>Small steps in your toolkit.</p></article></div><div class="gentle-note">${icon('moon')}<p>Look at your nights with curiosity. A change in the diary does not establish what caused it.</p></div>`);}
function accountSettings(){const a=account();appShell('account',`${pageHead('YOUR ACCOUNT','A space that’s yours.')}<div class="account-settings card"><span class="eyebrow">PROFILE</span><h2>Your personal details</h2><form id="profile-form"><label>First name<input name="name" maxlength="80" required value="${escapeHTML(a.name)}" autocomplete="given-name"></label><label>Email address<input type="email" value="${escapeHTML(a.user.email)}" disabled></label><p class="muted">Your diary, reflections and lesson progress sync securely to this account.</p><button class="button" type="submit">Save profile ${icon('check')}</button></form><hr><h3>Ready to pause?</h3><p>You can return to your journey whenever you like.</p><button class="button outline" data-action="signout">Sign out</button></div>`);$('#profile-form').addEventListener('submit',e=>{e.preventDefault();a.save(state,new FormData(e.target).get('name'));toast('Saving your profile…');});}
function animateScreen(){
  if(typeof MutationObserver==='undefined')return;
  main.classList.remove('screen-enter');requestAnimationFrame(()=>main.classList.add('screen-enter'));
  if(typeof IntersectionObserver==='undefined')return;
  revealObserver?.disconnect();revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');revealObserver.unobserve(e.target);}}),{threshold:.08});
  main.querySelectorAll('.section,.recognition-grid article,.steps article,.path-row').forEach(el=>{el.classList.add('reveal');revealObserver.observe(el);});
}
let revealObserver;
document.addEventListener('click',async e=>{
  const action=e.target.closest('button')?.dataset.action,a=account();
  if(action==='retry-save')a.retrySave();
  if(action==='reload-account'){if(a.user)a.reload();else location.reload();}
  if(action==='signout')try{await a.signOut();location.hash='login';}catch(error){toast(error.message);}
});
