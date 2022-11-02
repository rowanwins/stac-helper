<template>
  <NuxtLayout name="main">

    <Head>
      <Title>STAC Helper</Title>
    </Head>

    <h2>Example Usage</h2>


    <p>STAC is a fantastic standard for storing geospatial metadata. One of it's strengths is that the spec allows a degree of flexibility. 
      However this flexibility also presents a challenge, particuarly if you need to develop an application which consumes data from
    multiple STAC Catalogs.</p>

    <p>If you're attempting to create an application that utilises a STAC endpoint you'll have a range of things that you'll need to consider or be aware of</p>
    <ul>
      <li>Is the STAC Catalog static (eg just JSON files) or are you dealing with an API implementation?</li>
      <li>What endpoints does the API support, eg just GET endpoints, or also optional POST endpoints?</li>
      <li>What query parameters or fields I can use for searching?</li>
      <li>How do I structure the syntax for querying?</li>
      <li>How will I handle paginating through results?</li>
    </ul>

    <p>This library aims to take some of the pain away from those challenges by providing a range of 
      Classes with getters and methods which make the task of working with STAC more straight-forward.</p>

    <p>This library won't cover every use case for integrating STAC into your application, but it should help with alot of the common aspects. 
      To cover your bases we also ensure that you still have access to the raw JSON of the STAC Entity so that you can do anything extra you require.</p>

  </NuxtLayout>
</template>