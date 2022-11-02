A small (< 15kb minified) library for helping interacting with and search STAC API endpoints in a web browser. 

Note: Uses the [`Fetch API`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) for making requests, so if you'd like to use it in NodeJS then you'll need to use a polyfill like isomorphic-fetch which makes Fetch available as a global.

For more information on the STAC API head to the [spec](https://github.com/radiantearth/stac-api-spec).



## Installation
````
npm install stac-helper
````

## Basic Usage
````
  import initialiseFromUrl from 'stac-helper'

  const stacEntity = await initialiseFromUrl('https://explorer.prod.dea.ga.gov.au/stac')
  console.log(stacEntity.stacType) 
  // => 'Catalog'

  if (stacEntity.numberOfChildren > 0) {
    await stacEntity.loadChildren()
    console.log(stacEntity.collections.map(c => c.titleOrId))
    // => ['aster_aloh_group_composition', 'aster_aloh_group_content', ...]
  }

````

### Example - Searching a catalog 
````
  const catalog = await initialiseFromUrl('https://explorer.prod.dea.ga.gov.au/stac')

  const searcher = catalog.createSearch()

  searcher
    .limit(20)
    .collections('wofs_albers')
    .bbox([135, -45, 140, -37])
    .between('1989-08-15', '1990-11-15')

  const numResults = await searcher.checkTotalNumberOfItems()
  
  const pageOfResults = await searcher.run()
  
  if (pageOfResults.hasNextLink) {
      const anotherPage = await pageOfResults.loadNextPage()
  }
````



### Library scope 
- This library aims to provide a set of generic methods for working with STAC API services.
  - This library does not help in rendering the STAC items.
