A small (5kb minified) library for helping interacting with and search STAC API endpoints in a web browser. 

Note: Uses the [`Fetch API`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) for making requests.

Note 2: For more information on the STAC API head to the [spec](https://github.com/radiantearth/stac-api-spec).

## Installation
````
npm install stac-helper
````

## Basic Usage
````
import initialiseCatalog from 'stac-helper'

async function getData() {
  const catalog = await initialiseCatalog('https://explorer.prod.dea.ga.gov.au/stac')
  await catalog.getCollections()
  console.log(catalog.collectionTitles)
}

getData()
````

### Example - Searching a catalog 
````
  const catalog = await initialiseCatalog('https://explorer.prod.dea.ga.gov.au/stac')

  const searcher = catalog.createSearch()
  searcher
    .limit(20)
    .collections('wofs_albers')
    .bbox([135, -45, 140, -37])
    .between('1989-08-15', '1990-11-15')

  const numResults = await searcher.checkNumberOfSearchMatches()
  await searcher.paginateThroughAllSearchResults()
  console.log(searcher.results)
````


## API
Users call the `initialiseCatalog` method with a url of a root catalog, this method returns a new `Catalog` class.

## Classes

### Catalog
The `Catalog` class is the base class for this library.

| Property  | Description                                                                     |
|-----------|---------------------------------------------------------------------------------|
| title | Catalog Title |
| supportsItemSearch | API service supports searching for items |
| supportsSearchSortExtension | API service supports the `sort` search parameter|
| supportsSearchContextExtension | API service supports the `context` search parameter|
| supportsSearchQueryExtension | API service supports the `query` search parameter |
| supportsSearchFilterExtension | API service supports the `filter` search parameter |
| supportsSearchFieldsExtension | API service supports the `fields` search parameter |
| collectionTitles [String] | An array of collection titles|


| Method                              | Description                                 |
|-------------------------------------|---------------------------------------------|
| getCollections() | Retrieves all the collections |
| getCollectionByTitle(string) | Returns a Collection based on the title. Returns `null` if no layer is found. |
| createSearch() | Creates a `Search` class for the catalog. |

### Collection
The `Collection` class provides access to information about a collection of items

| Property  | Description                                                                     |
|-----------|---------------------------------------------------------------------------------|
| title     | The title of the collection                                                         |
| description | The description from the collection       |
| bbox | The bbox of the collection       |
| collectionItemsUrl | The url of the collection items endpoint |
| isTimeEnabled | Whether the collection contains items with datetime information |
| hasMoreThanOneDate | Whether the collection contains items for more than one date |
| items | An array of items. This is populated when `paginateThroughAllCollectionItems` is called. |

| Method                              | Description                                                              |
|-------------------------------------|--------------------------------------------------------------------------|
| checkNumberOfCollectionItems() | Returns the number of the collection items without retrieving all the item information |
| getSampleOfCollectionItems(numberOfItemsToRetrieve: 1) | Returns an array of `Item`'s from the collection |
| paginateThroughAllCollectionItems() | Retrieves all the collection items and populates the `items` property | 
| createSearch() | Creates a `Search` class which defaults to only searching this collection. | 


### Item
The `Item` class provides access to information about an individual item

| Property  | Description                                                                     |
|-----------|---------------------------------------------------------------------------------|
| id      | The item of the item.                                                           |
| itemJson | The full json of the item                                                       |
| title | A title of the item.        |
| itemUrl | The url for the item endpoint  |
| numberOfAssets | The number of assets contained in the item |

### Search
The `Search` class provides a way to search a `Catalog` or `Collection` for `Item`'s based on a set of parameters. Note that some STAC API endpoints only support the core search parameters (`limit`, `bbox`, `collections` & `between`), while other parameters may not be supported as they are extensions (eg `filter`, `query`, `fields`).

| Property  | Description                                                                     |
|-----------|---------------------------------------------------------------------------------|
| searchUrl | The url of the search endpoint |
| results | An array of `Item`'s returned when the search has been run |

| Method                              | Description                                                              |
|-------------------------------------|--------------------------------------------------------------------------|
| itemLimitPerRequest(Number: 100 or null) | The number of items to retrieve in a single request. | 
| bbox([Number, Number, Number, Number] or null) | Limits the returned items to the supplied bbox. |
| collections(String or| null) | A comma-seperated list of collection titles to search. |
| between(to: String or null, from: String or null) | Limits the results by dates. | 
| filter(Object or null) | Set the [filter object](https://github.com/radiantearth/stac-api-spec/blob/master/fragments/filter) for the search. |
| query(Object or null) | Set the [query object](https://github.com/radiantearth/stac-api-spec/blob/master/fragments/query) for the search. NB Filter is prefered. |
| fields(Object or null) | Set the [fields object](https://github.com/radiantearth/stac-api-spec/blob/master/fragments/fields) for the search, limiting what fields are returned for each `Item` (useful for reducing the payload sizeof each item). |
| getFirstPageOfResults() | Retrieves only the first page of results | 
| paginateThroughAllSearchResults() | Retrieves all the `Item`'s and populates the `results` property. | 
| checkNumberOfSearchResults() | Returns the number of results for the current search parameters, without having to retrieve all the results. | 


### Library scope 
- This library aims to provide a set of generic methods for working with STAC API services.
  - This library does not help in rendering the STAC items.
