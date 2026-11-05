export function checkoutDetails(commerce={},user=null,enteredEmail){
 const email=String(enteredEmail!==undefined?enteredEmail:(commerce.email||user?.email||'')).trim();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254){const error=new Error('Enter an email address for your test receipt before continuing.');error.code='invalid_email';throw error;}
 return{email,plan:commerce.planIndex};
}
export function checkoutAttempt(commerce,email,makeId){
 return commerce.stripeAttempt&&commerce.stripeAttemptPlan===commerce.planIndex&&commerce.stripeAttemptEmail===email?commerce.stripeAttempt:makeId();
}
