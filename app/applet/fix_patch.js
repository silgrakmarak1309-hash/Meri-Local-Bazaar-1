const fs = require("fs");

function patchFile(filePath) {
  let code = fs.readFileSync(filePath, "utf8");
  console.log("Patching:", filePath);

  const isUserAdminCode = `function isUserAdmin(e) {
  if (!e) return false;
  const role = String(e.role || "").toLowerCase();
  const email = String(e.email || (e.user && e.user.email) || (e.user_metadata && e.user_metadata.email) || "").toLowerCase().trim();
  if (role === "admin" || role === "super_admin" || e.is_admin === true) return true;
  const adminEmails = [
    "silgrak1309@gmail.com",
    "silgrakmarak1309@gmail.com",
    "sengmimarak12@gmail.com",
    "grejamarak@gmail.com",
    "megamarak8@gmail.com"
  ];
  return adminEmails.includes(email);
}
`;

  // 1. Replace bw (AuthProvider)
  const oldBwStart = code.indexOf("function bw({children:e}){");
  const oldBwEnd = code.indexOf("function Ae(){", oldBwStart);

  if (oldBwStart !== -1 && oldBwEnd !== -1) {
    const newBw = isUserAdminCode + `function bw({children:e}){
  const[t,n]=m.useState(null),
  [r,s]=m.useState(null),
  [i,l]=m.useState(null),
  [o,c]=m.useState(!0),
  u=m.useCallback(async w=>{
    try {
      const{data:j,error:f}=await L.from("profiles").select("*").eq("id",w).maybeSingle();
      if(f){console.error("Profile fetch error:",f.message);}
      let p_data=j;
      try{
        const{data:u_auth}=await L.auth.getUser();
        const u_email=u_auth?.user?.email;
        const u_name=u_auth?.user?.user_metadata?.name||u_email?.split("@")[0]||"User";
        const defaultExpiry=new Date(Date.now()+30*86400000).toISOString();
        if(!p_data){
          p_data={id:w,email:u_email,name:u_name,role:(isUserAdmin({email:u_email}))?"super_admin":"user",is_pro:!0,pro_status:"active",pro_expires_at:defaultExpiry,created_at:new Date().toISOString()};
          try{await L.from("profiles").upsert(p_data)}catch(err){}
        }else{
          if(isUserAdmin({email:u_email})){
            p_data={...p_data,role:"super_admin",is_pro:!0,pro_status:"active"};
            try{await L.from("profiles").update({role:"super_admin",is_pro:!0,pro_status:"active"}).eq("id",w)}catch(err){}
          }else if(!p_data.pro_expires_at&&p_data.is_pro===undefined){
            p_data={...p_data,is_pro:!0,pro_status:"active",pro_expires_at:defaultExpiry};
            try{await L.from("profiles").update({is_pro:!0,pro_status:"active",pro_expires_at:defaultExpiry}).eq("id",w)}catch(err){}
          }
        }
      }catch(e){}
      l(p_data);
    } catch(err) {
      console.warn("Profile fetch failure:", err);
    }
  },[]),
  d=m.useCallback(async()=>{t&&await u(t.id)},[t,u]);

  m.useEffect(()=>{
    let isMounted = true;
    const safetyTimer = setTimeout(() => {
      if (isMounted) c(false);
    }, 1500);

    try {
      L.auth.getSession().then(({data:j})=>{
        if (!isMounted) return;
        var f,g;
        s(j.session);
        n(((f=j.session)==null?void 0:f.user)??null);
        if((g=j.session)!=null&&g.user){
          u(j.session.user.id).catch(()=>{}).finally(()=>{ if(isMounted) c(false); });
        } else {
          if (isMounted) c(false);
        }
      }).catch(err => {
        console.warn("getSession error:", err);
        if (isMounted) c(false);
      });
    } catch(err) {
      if (isMounted) c(false);
    }

    let unsub = null;
    try {
      const { data: w } = L.auth.onAuthStateChange((j,f)=>{
        if (!isMounted) return;
        s(f);
        n((f==null?void 0:f.user)??null);
        if(f!=null&&f.user){
          u(f.user.id).catch(()=>{});
        } else {
          l(null);
        }
      });
      unsub = w?.subscription?.unsubscribe;
    } catch(err) {}

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      if(unsub) unsub();
    };
  },[u]);

  const h=async(w,j,f)=>{try{const{error:g}=await L.auth.signUp({email:w,password:j,options:{data:{name:f}}});return{error:(g==null?void 0:g.message)??null}}catch(e){return{error:e.message||"Sign up failed"}}},
  p=async(w,j)=>{try{const{error:f}=await L.auth.signInWithPassword({email:w,password:j});return{error:(f==null?void 0:f.message)??null}}catch(e){return{error:e.message||"Sign in failed"}}},
  v=async()=>{try{await L.auth.signOut()}catch(e){}l(null)},
  x=async w=>{try{const{error:j}=await L.auth.resetPasswordForEmail(w);return{error:(j==null?void 0:j.message)??null}}catch(e){return{error:e.message||"Reset failed"}}};

  return a.jsx(Tp.Provider,{value:{user:t,session:r,profile:i,loading:o,signUp:h,signIn:p,signOut:v,resetPassword:x,refreshProfile:d},children:e})
}
`;
    code = code.substring(0, oldBwStart) + newBw + code.substring(oldBwEnd);
    console.log("Replaced bw successfully!");
  } else {
    console.log("WARN: bw not found");
  }

  // 2. Replace Pt and jj
  const oldPtStart = code.indexOf("function Pt({children:e}){");
  const oldPtEnd = code.indexOf("class ErrorBoundary", oldPtStart);

  if (oldPtStart !== -1 && oldPtEnd !== -1) {
    const newPtAndJj = `function Pt({children:e}){
  const{user:t,loading:n}=Ae();
  return n?a.jsx("div",{className:"min-h-screen flex items-center justify-center bg-slate-50",children:a.jsx("div",{className:"animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full"})})
  :t?a.jsx(a.Fragment,{children:e}):a.jsx(ip,{to:"/auth",replace:!0})
}
function jj(){
  return a.jsxs(a.Fragment,{
    children:[
      a.jsxs(ky,{
        children:[
          a.jsx(Ce,{path:"/",element:a.jsx(W1,{})}),
          a.jsx(Ce,{path:"/search",element:a.jsx(V1,{})}),
          a.jsx(Ce,{path:"/listing/:id",element:a.jsx(q1,{})}),
          a.jsx(Ce,{path:"/auth",element:a.jsx(K1,{})}),
          a.jsx(Ce,{path:"/post",element:a.jsx(Pt,{children:a.jsx(nj,{})})}),
          a.jsx(Ce,{path:"/favorites",element:a.jsx(Pt,{children:a.jsx(rj,{})})}),
          a.jsx(Ce,{path:"/messages",element:a.jsx(Pt,{children:a.jsx(bd,{})})}),
          a.jsx(Ce,{path:"/messages/:chatId",element:a.jsx(Pt,{children:a.jsx(bd,{})})}),
          a.jsx(Ce,{path:"/account",element:a.jsx(Pt,{children:a.jsx(sj,{})})}),
          a.jsx(Ce,{path:"/my-ads",element:a.jsx(Pt,{children:a.jsx(aj,{})})}),
          a.jsx(Ce,{path:"/recharge",element:a.jsx(Pt,{children:a.jsx(lj,{})})}),
          a.jsx(Ce,{path:"/notifications",element:a.jsx(Pt,{children:a.jsx(cj,{})})}),
          a.jsx(Ce,{path:"/admin",element:a.jsx(Pt,{children:a.jsx(uj,{})})}),
          a.jsx(Ce,{path:"*",element:a.jsx(ip,{to:"/",replace:!0})})
        ]
      }),
      a.jsx(s1,{})
    ]
  })
}
`;
    code = code.substring(0, oldPtStart) + newPtAndJj + code.substring(oldPtEnd);
    console.log("Replaced Pt and jj successfully!");
  } else {
    console.log("WARN: Pt and jj not found");
  }

  // 3. Replace mount logic at end of bundle
  const oldMountStart = code.indexOf("function _j(){return a.jsx(ErrorBoundary");
  if (oldMountStart !== -1) {
    const newMount = `function _j(){
  return a.jsx(ErrorBoundary,{
    children:a.jsx(bw,{
      children:a.jsx(r1,{
        children:a.jsx(Jy,{
          children:a.jsx(jj,{})
        })
      })
    })
  });
}

function mountApp(){
  try{
    const rootEl = document.getElementById("root");
    if(rootEl){
      Mf(rootEl).render(a.jsx(_j,{}));
    }
  }catch(err){
    console.error("Mount error:", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountApp);
} else {
  mountApp();
}
`;
    code = code.substring(0, oldMountStart) + newMount;
    console.log("Replaced mount logic successfully!");
  } else {
    console.log("WARN: mount logic not found");
  }

  fs.writeFileSync(filePath, code, "utf8");
  console.log("Finished writing to:", filePath);
}

patchFile("bundle.js");
patchFile("public/bundle.js");
