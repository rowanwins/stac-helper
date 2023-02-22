<template>
  <NuxtLayout name="main">

    <Head>
      <Title>STAC Helper</Title>
    </Head>

    <h2>Example Usage</h2>

    <h3>Basic</h3>

    <p>The <a-typography-text code>createStacEntityFromUrlOrLink</a-typography-text> utility function offers a streamlined way to create a class from a known STAC URL.</p>
    <p>
    This function will 
    <ul>
      <li>Load the URL</li>
      <li>Detect the STAC Type (eg whether the JSON represents a Catalog, Collection or Item)</li>
      <li>Create the relevant STAC-Helper Class</li>
    </ul>
    </p>
    
    <pre class="codeFormatting">
<code>import {createStacEntityFromUrlOrLink} from 'stac-helper'

const stacEntity = await createStacEntityFromUrlOrLink('https://explorer.prod.dea.ga.gov.au/stac')
console.log(stacEntity.stacType) 
// => 'Catalog'

if (stacEntity.numberOfChildren > 0) {
  await stacEntity.loadChildren()
  console.log(stacEntity.collections.map(c => c.titleOrId))
  // => ['aster_aloh_group_composition', 'aster_aloh_group_content', ...]
}
</code></pre>


    <h3 style="margin-top: 40px;">Searching & Pagination</h3>

    <p>The following example shows using a <a-typography-text code>Search</a-typography-text> class to find a subset of items within a collection, and then paginate through the results.</p>

    <pre class="codeFormatting">
<code>import {createStacEntityFromUrlOrLink} from 'stac-helper'

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
</code></pre>

  </NuxtLayout>
</template>