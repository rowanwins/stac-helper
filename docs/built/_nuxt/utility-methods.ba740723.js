import{T as k,H as L}from"./components.221cf19f.js";import{_ as d,c as U}from"./parameters-table.96e24987.js";import{a as l,o as n,h as m,j as e,t as c,e as i,c as _,w as s,b as H,f as N,i as $,F as b}from"./entry.b063c8b0.js";import"./composables.29675c91.js";/* empty css                *//* empty css              */const B={name:"UtilityMethod",props:["method"],components:{ParametersTable:d}},O=["id"],v=e("h3",{style:{"margin-top":"30px"}},"Arguments",-1),w=e("h3",{style:{"margin-top":"30px"}},"Returns",-1),S=["innerHTML"];function j(o,h,t,p,y,r){const a=d;return n(),m("div",{class:"method",id:t.method.name},[e("h2",null,c(t.method.name),1),e("p",null,c(t.method.description),1),v,i(a,{"row-data":t.method.params},null,8,["row-data"]),w,e("p",{innerHTML:t.method.returns},null,8,S)],8,O)}const u=l(B,[["render",j]]),F=["getNextLinkObj","getPrevLinkObj","getLinkByRelType","detectStacType","loadUrlOrLink","createStacEntityFromUrlOrLink"],P={name:"UtilityMethods",computed:{methods(){return U.filter(o=>F.indexOf(o.name)>-1)}},components:{UtilityMethod:u}},V=e("h2",null,"Utility Methods",-1);function A(o,h,t,p,y,r){const a=k,f=L,x=u,T=H;return n(),_(T,{name:"main"},{default:s(()=>[i(f,null,{default:s(()=>[i(a,null,{default:s(()=>[N("STAC Helper - Utility Methods")]),_:1})]),_:1}),V,(n(!0),m(b,null,$(r.methods,(g,M)=>(n(),_(x,{key:M,method:g},null,8,["method"]))),128))]),_:1})}const G=l(P,[["render",A]]);export{G as default};
