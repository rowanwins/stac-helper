import{T as r,H as i}from"./components.93344f8d.js";import{a as p,o as _,c as m,w as n,b as h,e as a,f as e,j as t,l as u}from"./entry.caa1fe82.js";/* empty css                *//* empty css              */import"./composables.7b6ed98d.js";const d={},f=t("h2",null,"Example Usage",-1),g=t("h3",null,"Basic",-1),y=t("p",null,[e(" This function will "),t("ul",null,[t("li",null,"Load the URL"),t("li",null,"Detect the STAC Type (eg whether the JSON represents a Catalog, Collection or Item)"),t("li",null,"Create the relevant STAC-Helper Class")])],-1),w=t("pre",{class:"codeFormatting"},[e(""),t("code",null,`import {createStacEntityFromUrlOrLink} from 'stac-helper'

const stacEntity = await createStacEntityFromUrlOrLink('https://explorer.prod.dea.ga.gov.au/stac')
console.log(stacEntity.stacType) 
// => 'Catalog'

if (stacEntity.numberOfChildren > 0) {
  await stacEntity.loadChildren()
  console.log(stacEntity.collections.map(c => c.titleOrId))
  // => ['aster_aloh_group_composition', 'aster_aloh_group_content', ...]
}
`)],-1),x=t("h3",{style:{"margin-top":"40px"}},"Searching & Pagination",-1),T=t("pre",{class:"codeFormatting"},[e(""),t("code",null,`import {createStacEntityFromUrlOrLink} from 'stac-helper'

const catalog = await createStacEntityFromUrlOrLink('https://planetarycomputer.microsoft.com/api/stac/v1/')

const searcher = await catalog.createSearch()

searcher
  .limit(20)
  .collections(['landsat-8-c2-l2'])
  .bbox([135, -45, 140, -37])
  .between('2020-08-15', '2020-11-15')

const numResults = await searcher.checkTotalNumberOfItems()
const pageOfResults = await searcher.loadActiveItemCollection()

if (pageOfResults.hasNextLink) {
    const anotherPage = await pageOfResults.loadNextPage()
}
`)],-1);function C(S,O){const c=r,l=i,o=u,s=h;return _(),m(s,{name:"main"},{default:n(()=>[a(l,null,{default:n(()=>[a(c,null,{default:n(()=>[e("STAC Helper")]),_:1})]),_:1}),f,g,t("p",null,[e("The "),a(o,{code:""},{default:n(()=>[e("createStacEntityFromUrlOrLink")]),_:1}),e(" utility function offers a streamlined way to create a class from a known STAC URL.")]),y,w,x,t("p",null,[e("The following example shows using a "),a(o,{code:""},{default:n(()=>[e("Search")]),_:1}),e(" class to find a subset of items within a collection, and then paginate through the results.")]),T]),_:1})}const b=p(d,[["render",C]]);export{b as default};
