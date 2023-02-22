import{a as v,o as d,h as u,e as s,w as l,p as m,j as a,u as n,q as T,s as y,v as C,x as i}from"./entry.b063c8b0.js";/* empty css                */const h=""+globalThis.__publicAssetsURL("stac_logo.png");const f={name:"MainLayout",computed:{routeName(){return this.$route.name}},methods:{headHome(){this.$router.push("/")}}},k=a("img",{src:h,height:"50"},null,-1),$=a("h1",{style:{"margin-bottom":"0px",color:"#0F3542"}},"STAC HELPER",-1),b=a("p",{style:{"font-size":"1rem","font-weight":"600","margin-top":"30px"}},"API",-1),L=a("p",{class:"subsection"},"Core Classes",-1),S=a("p",{class:"subsection",style:{"margin-top":"20px"}},"Base Classes",-1),w=a("p",{class:"subsection",style:{"margin-top":"20px"}},"Utility Methods",-1),A=a("div",{style:{height:"80px"}},null,-1);function E(e,t,B,N,O,g){const p=C,r=m;return d(),u("div",null,[s(r,{id:"wideContent",type:"flex",style:{"flex-wrap":"nowrap"}},{default:l(()=>[s(p,{id:"firstCol",flex:"0 0 300px"},{default:l(()=>[s(r,{id:"logoArea",type:"flex",align:"middle",style:{cursor:"pointer"},onClick:g.headHome},{default:l(()=>[s(p,{flex:"0 0 60px"},{default:l(()=>[k]),_:1}),s(p,{flex:"1 1 auto"},{default:l(()=>[$]),_:1})]),_:1},8,["onClick"]),s(r,{style:{"margin-top":"60px"}},{default:l(()=>[s(p,{span:"24"},{default:l(()=>[a("a",{onClick:t[0]||(t[0]=o=>("navigateTo"in e?e.navigateTo:n(i))({path:"/example-usage"}))},"Example Usage"),b,L,a("a",{class:T({active:g.routeName==="api-catalog"}),onClick:t[1]||(t[1]=o=>("navigateTo"in e?e.navigateTo:n(i))({path:"/api/catalog"}))},"Catalog",2),a("a",{onClick:t[2]||(t[2]=o=>("navigateTo"in e?e.navigateTo:n(i))({path:"/api/collection"}))},"Collection"),a("a",{onClick:t[3]||(t[3]=o=>("navigateTo"in e?e.navigateTo:n(i))({path:"/api/item"}))},"Item"),a("a",{onClick:t[4]||(t[4]=o=>("navigateTo"in e?e.navigateTo:n(i))({path:"/api/itemcollection"}))},"ItemCollection"),a("a",{onClick:t[5]||(t[5]=o=>("navigateTo"in e?e.navigateTo:n(i))({path:"/api/search"}))},"Search"),a("a",{onClick:t[6]||(t[6]=o=>("navigateTo"in e?e.navigateTo:n(i))({path:"/api/queryable"}))},"Queryable"),S,a("a",{onClick:t[7]||(t[7]=o=>("navigateTo"in e?e.navigateTo:n(i))({path:"/api/stac-entity"}))},"STAC Entity"),w,a("a",{onClick:t[8]||(t[8]=o=>("navigateTo"in e?e.navigateTo:n(i))({path:"/api/utility-methods",hash:"#createStacEntityFromUrlOrLink"}))},"createStacEntityFromUrlOrLink"),a("a",{onClick:t[9]||(t[9]=o=>("navigateTo"in e?e.navigateTo:n(i))({path:"/api/utility-methods",hash:"#detectStacType"}))},"detectStacType"),a("a",{onClick:t[10]||(t[10]=o=>("navigateTo"in e?e.navigateTo:n(i))({path:"/api/utility-methods",hash:"#getLinkByRelType"}))},"getLinkByRelType"),a("a",{onClick:t[11]||(t[11]=o=>("navigateTo"in e?e.navigateTo:n(i))({path:"/api/utility-methods",hash:"#getNextLinkObj"}))},"getNextLinkObj"),a("a",{onClick:t[12]||(t[12]=o=>("navigateTo"in e?e.navigateTo:n(i))({path:"/api/utility-methods",hash:"#getPrevLinkObj"}))},"getPrevLinkObj")]),_:1})]),_:1})]),_:1}),s(p,{id:"secondCol"},{default:l(()=>[y(e.$slots,"default"),A]),_:3})]),_:3})])}const U=v(f,[["render",E]]);export{U as default};