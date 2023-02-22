<template>
  <NuxtLayout name="main">

    <Head>
      <Title>STAC Helper</Title>
    </Head>

    <h2>STAC Helper</h2>


    <p>The <a href="https://github.com/radiantearth/stac-spec" target="_blank">STAC specification</a>, and the associated <a href="https://github.com/radiantearth/stac-api-spec" target="_blank">API spec</a>, is a fantastic standard for storing and serving geospatial metadata. One of it's strengths is that the spec allows a degree of flexibility. 
      However this flexibility also presents a challenge, particuarly if you need to develop an application which consumes data from
    multiple STAC Catalogs.</p>

    <p>If you're attempting to create an application that utilises a STAC data, either from static files or STAC endpoints, then you'll have a range of considerations</p>
    <ul>
      <li>Is the STAC Catalog static (eg just JSON files) or are you dealing with an API implementation?</li>
      <li>What endpoints does the API support, eg just GET endpoints, or also optional POST endpoints?</li>
      <li>What query parameters or fields can you use for searching?</li>
      <li>Which syntax does the API implementation support for querying?</li>
      <li>How will you handle paginating through results?</li>
    </ul>

    <p>This library aims to take some of the pain away from those challenges by providing a range of 
      Classes with getters and methods which make the task of working with STAC more straight-forward.</p>

    <p>This library won't cover every use case for integrating STAC into your application, but it should help with alot of the common aspects. 
      To cover your bases we also ensure that you still have access to the raw JSON of the STAC so that you can do anything extra you require.</p>

  </NuxtLayout>
</template>