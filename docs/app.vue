<template>
  <div>
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </div>
</template>

<script>

  export default {
    mounted () {
      this.scrollToAnchor(this.$route)

      this.$router.afterEach((to) => {
        this.scrollToAnchor(to)
      })
    },
    methods: {
      scrollToAnchor (route) {
        if (route.hash.length > 1) {
          var element = document.getElementById(route.hash.replace('#', ''));
          if (element) {
            element.scrollIntoView()
            element.classList.add("methodHighlight")
            setTimeout(()=> {
              element.classList.remove("methodHighlight")
            }, 3000)  
          }
        }
      }
    }
  }
  </script>

<style>
html {scroll-behavior: smooth;}

.codeFormatting {
    padding: 12px;
    background-color: #f6f6f6;
    border: 4px solid #c8c8c8;
    width: 100%;
    min-width: 100%;
    margin-top: 24px;
    overflow: auto;
  }
</style>