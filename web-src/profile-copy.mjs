const FOCUS={
 stress:{title:'Less pressure when you wake.',text:'Practise a familiar response to night waking, so your next step feels clear.',steps:['A calmer response','A simple night-time plan','Notice your progress']},
 mind:{title:'Give busy thoughts somewhere to go.',text:'An evening practice for unfinished thoughts, plus a familiar response for night-time.',steps:['Park a thought','Practise unwinding','Review your nights']},
 comfort:{title:'A more comfortable sleep space.',text:'Notice heat and discomfort, try one manageable adjustment, and reflect on what you observe.',steps:['Notice discomfort','Try one adjustment','Keep what helps']},
 timing:{title:'A steadier evening routine.',text:'Notice caffeine and alcohol timing. Try one small change and review your diary.',steps:['Notice drink timing','Try a small change','Review your diary']},
 bathroom:{title:'An easier return to rest.',text:'Build a calm, practical return-to-bed routine and notice the pattern in your diary.',steps:['A gentle return plan','Less clock watching','Notice your pattern']}
};
export function profileFocus(id){return FOCUS[id]||{title:'Understand your pattern first.',text:'Start with a short diary and simple daily practices. Your own observations will help you choose what to work on.',steps:['Notice your nights','Try a small practice','Build your toolkit']};}
export function targetFor(baseline,goal){
 const now=Number.isInteger(baseline?.nights)&&baseline.nights>=0&&baseline.nights<=7?baseline.nights:null;
 const chosen=Number.isInteger(goal?.target)&&goal.target>=0&&goal.target<=7?goal.target:null;
 return {now,target:chosen??(now===null?null:Math.min(2,now))};
}
