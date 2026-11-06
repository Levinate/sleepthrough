import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {build} from 'esbuild';
import {QUIZ_FACTS,pendingFact,normalizeVisits,recordVisit,attendance} from './web-src/engagement.mjs';
import {profileFocus,targetFor} from './web-src/profile-copy.mjs';

test('Facts interrupt only after Q5, Q10, Q15 and Q20, then stay dismissed',()=>{
 const q={step:0,factsSeen:[]};
 for(let step=0;step<21;step++){
  q.step=step;
  assert.equal(!!pendingFact(q),[5,10,15,20].includes(step));
  if(pendingFact(q)){q.factsSeen.push(step);assert.equal(pendingFact(q),undefined);}
 }
 assert.equal(QUIZ_FACTS.length,4);
 for(const f of QUIZ_FACTS)assert.match(f.url,/^https:\/\/www\.(cdc|nhlbi\.nih)\.gov\//);
});
test('Attendance uses local calendar days, deduplicates reloads and handles gaps',()=>{
 const date=new Date(2026,10,6,0,5);
 let days=recordVisit(['2026-11-04','2026-11-05'],date);
 days=recordVisit(days,new Date(2026,10,6,23,59));
 assert.deepEqual(days,['2026-11-04','2026-11-05','2026-11-06']);
 assert.equal(attendance(days,date).streak,3);
 assert.equal(attendance(days,new Date(2026,10,7)).streak,3,'Yesterday is still a chance to continue');
 assert.equal(attendance(days,new Date(2026,10,8)).streak,0);
 assert.equal(attendance(['2026-11-04','2026-11-06','2026-11-07'],date).streak,1,'future days never inflate today’s streak');
 const week=attendance(days,date).week;
 assert.equal(week[0].day,'2026-11-02');assert.equal(week[6].day,'2026-11-08');
 assert.equal(week.filter(d=>d.today).length,1);
 assert.deepEqual(normalizeVisits(['bad','2026-02-30','2026-11-05','2026-11-05']),['2026-11-05']);
 assert.equal(attendance(recordVisit(['2026-12-31'],new Date(2027,0,1)),new Date(2027,0,1)).streak,2);
});
test('Published normalizer preserves visits and fact dismissals across reloads',()=>{
 const context={window:{},structuredClone};vm.createContext(context);
 vm.runInContext(fs.readFileSync('dist/mvp-web.js','utf8'),context);
 const normalize=context.window.SleepMvp.normalize;
 const saved=normalize({attendanceHidden:true,attendance:['2026-11-05','bad','2026-11-06'],quiz:{step:10,answers:[0,2],factsSeen:[5,5,9]},tour:3,tourVersion:2});
 assert.deepEqual(Array.from(saved.attendance),['2026-11-05','2026-11-06']);
 assert.deepEqual(Array.from(saved.quiz.factsSeen),[5]);
 assert.equal(saved.attendanceHidden,true);assert.equal(normalize(saved).attendanceHidden,true,'dismissal survives reload');assert.equal(normalize(null).attendanceHidden,false,'new profiles show the visit strip');
 assert.equal(saved.tour,3);assert.equal(normalize({tour:3}).tour,4,'completed legacy tours stay completed');
 assert.deepEqual(Array.from(normalize(null).attendance),[],'a new account starts with no inherited visits');
});
test('Quiz UI dismisses a fact without advancing a question; retake resets all facts',async()=>{
 const bundle=await build({stdin:{contents:"export {createMvp} from './web-src/shared/mvp.js'",resolveDir:process.cwd()},bundle:true,format:'esm',write:false,platform:'node'});
 const {createMvp}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
 const store={state:{quiz:{step:5,answers:[0,1,2,1,2],factsSeen:[]},records:{},funnel:[]}},routes=[];
 let writes=0;
 const engine=createMvp({store,record:id=>store.state.records[id]?.data,records:()=>[],setRecord:async()=>{},persist:async()=>writes++,startLocal:async()=>{},native:false,setRoute:r=>routes.push(r),render:()=>{},toast:()=>{},currentRows:()=>[]});
 assert.match(engine.quiz(),/More than 1 in 5/);
 await engine.action({dataset:{action:'mvp-fact'}});
 assert.equal(store.state.quiz.step,5);assert.deepEqual(store.state.quiz.factsSeen,[5]);
 assert.doesNotMatch(engine.quiz(),/quiz-fact/);
 await engine.action({dataset:{action:'mvp-fact'}});assert.equal(writes,1,'duplicate fact tap cannot add another dismissal');
 await engine.action({dataset:{action:'mvp-retake'}});
 assert.equal(store.state.quiz.step,0);assert.deepEqual(store.state.quiz.factsSeen,[]);assert.equal(routes.at(-1),'quiz');
});
test('Profile targets preserve unknown and zero baselines and respect a valid chosen aim',()=>{
 assert.deepEqual(targetFor({nights:4},{}),{now:4,target:2});
 assert.deepEqual(targetFor({nights:0},{}),{now:0,target:0});
 assert.deepEqual(targetFor({nights:null},{}),{now:null,target:null});
 assert.deepEqual(targetFor({nights:null},{target:3}),{now:null,target:3});
 assert.deepEqual(targetFor({nights:4},{target:99}),{now:4,target:2});
 assert.match(profileFocus('timing').text,/caffeine and alcohol/);
 assert.match(profileFocus('unknown').title,/Understand your pattern/);
});
test('Result connects actual evidence to a focus and editable aim; night retains normal continuation',async()=>{
 const bundle=await build({stdin:{contents:"export {createMvp} from './web-src/shared/mvp.js'",resolveDir:process.cwd()},bundle:true,format:'esm',write:false,platform:'node'});
 const {createMvp}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
 const data={},store={state:{quiz:{step:20,answers:[0,2,2,1,2,2,0,3,1,0,0,1,2,2,1,0,3,2,1,2,1]},currentNightDay:'2026-11-06'}};
 const engine=createMvp({store,record:id=>data[id],records:()=>[],setRecord:async(id,kind,value)=>{data[id]=value;},persist:async()=>{},startLocal:async()=>{},native:false,setRoute:()=>{},render:()=>{},toast:()=>{},currentRows:()=>[]});
 const html=engine.result();assert.match(html,/What you told us/);assert.match(html,/Your plan’s first focus/);assert.match(html,/By night 28/);assert.match(html,/not a guaranteed result/);
 await engine.action({dataset:{mvpTarget:'3'}});assert.equal(data.goal.target,3);assert.match(engine.result(),/<strong>3<\/strong>/);
 data['night:2026-11-06']={day:'2026-11-06',activeId:'test',wakeEvents:[{id:'test',step:3}]};
 const night=engine.night();assert.doesNotMatch(night,/Demo: skip ahead|This wake-up is saved/);assert.match(night,/Continue when ready/);assert.match(night,/Pause breathing/);
});
