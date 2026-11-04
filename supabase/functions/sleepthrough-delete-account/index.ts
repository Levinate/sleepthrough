import {createClient} from "npm:@supabase/supabase-js@2.119.0";
const headers={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, apikey, content-type, x-client-info","Content-Type":"application/json"};
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers});
 if(req.method!=="POST")return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers});
 const authorization=req.headers.get("Authorization")||"";
 const token=authorization.startsWith("Bearer ")?authorization.slice(7):"";
 const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await admin.auth.getUser(token);
 if(error||!data.user)return new Response(JSON.stringify({error:"Unauthorized"}),{status:401,headers});
 let payload;try{payload=await req.json();}catch{return new Response(JSON.stringify({error:"Bad request"}),{status:400,headers});}
 if(payload.confirmation!=="DELETE")return new Response(JSON.stringify({error:"Confirmation required"}),{status:400,headers});
 // A freshly reauthenticated session is required; the client never supplies the user id.
 const claims=JSON.parse(atob(token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));
 if(!Array.isArray(claims.amr)||!claims.amr.some((a: {method:string,timestamp:number})=>a.method==="password"&&Date.now()/1000-a.timestamp<300))return new Response(JSON.stringify({error:"Reauthenticate first"}),{status:403,headers});
 await admin.auth.admin.signOut(token,"global");
 const result=await admin.auth.admin.deleteUser(data.user.id);
 if(result.error)return new Response(JSON.stringify({error:"Deletion could not finish"}),{status:500,headers});
 return new Response(JSON.stringify({deleted:true}),{headers});
});
