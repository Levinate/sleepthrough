// These are educational pauses, never an inference about an individual user.
export const QUIZ_FACTS = [
 {after:5,tag:'You’re not alone',title:'More than 1 in 5.',art:'calendar',takeaway:'Your experience is shared. Your plan will start with your own waking pattern.',text:'In a 2024 U.S. survey, 22.3% of adults aged 50–64 reported trouble staying asleep most days or every day.',source:'CDC / NCHS · Data Brief 559, April 2026',url:'https://www.cdc.gov/nchs/products/databriefs/db559.htm'},
 {after:10,tag:'A little sleep science',title:'Sleep comes in cycles.',art:'rhythm',takeaway:'We’re looking at your pattern across nights, with room for the nights that feel different.',text:'Sleep cycles usually repeat every 80–100 minutes. Brief awakenings can happen between cycles; waking once doesn’t describe your whole night.',source:'NIH / NHLBI · Sleep phases and stages',url:'https://www.nhlbi.nih.gov/health/sleep/stages-of-sleep'},
 {after:15,tag:'Your everyday rhythm',title:'Light helps set your body clock.',art:'room',takeaway:'Your plan will include everyday habits you can notice and practise.',text:'Light and darkness help your internal clock decide when to feel alert or sleepy. Your daily surroundings are part of the sleep picture, too.',source:'NIH / NHLBI · Your sleep/wake cycle',url:'https://www.nhlbi.nih.gov/health/sleep/sleep-wake-cycle'},
 {after:20,tag:'One more answer to go',title:'Sleep skills can be learned.',art:'thoughts',takeaway:'Next, see the patterns in your answers and the first steps we’d suggest.',text:'CBT-I combines work on sleep-related thoughts, relaxation and habits. SleepThrough offers self-guided learning inspired by these skills, rather than a full clinical treatment.',source:'NIH / NHLBI · Insomnia treatment',url:'https://www.nhlbi.nih.gov/health/insomnia/treatment'}
];
export const normalizeFacts = value => [...new Set((Array.isArray(value)?value:[]).filter(n=>QUIZ_FACTS.some(f=>f.after===n)))];
export const pendingFact = quiz => QUIZ_FACTS.find(f=>f.after===quiz.step&&!normalizeFacts(quiz.factsSeen).includes(f.after));

export function calendarDay(date=new Date()) {
 return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function validDay(day) {
 if(typeof day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(day))return false;
 const d=new Date(day+'T12:00:00');return Number.isFinite(d.getTime())&&calendarDay(d)===day;
}
export const normalizeVisits = value => [...new Set((Array.isArray(value)?value:[]).filter(validDay))].sort().slice(-400);
function shifted(date,days) {const d=new Date(date);d.setHours(12,0,0,0);d.setDate(d.getDate()+days);return d;}
export function recordVisit(visits,date=new Date()) {
 return normalizeVisits([...normalizeVisits(visits),calendarDay(date)]);
}
export function attendance(visits,date=new Date()) {
 const days=new Set(normalizeVisits(visits)),today=calendarDay(date);
 let cursor=days.has(today)?date:shifted(date,-1),streak=0;
 while(days.has(calendarDay(cursor))){streak++;cursor=shifted(cursor,-1);}
 const monday=shifted(date,-((date.getDay()+6)%7));
 return {streak,today,visitedToday:days.has(today),week:Array.from({length:7},(_,i)=>{
  const d=shifted(monday,i),day=calendarDay(d);
  return {day,label:d.toLocaleDateString('en-US',{weekday:'short'}),visited:days.has(day),today:day===today,future:day>today};
 })};
}
