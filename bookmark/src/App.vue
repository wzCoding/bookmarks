<template>
  <BookHeader :height="headerHeight"></BookHeader>
  <div class="bookmark-container">
    <RouterView></RouterView>
  </div>
</template>
<script setup>
import BookHeader from './components/header.vue';
const headerHeight = "60px";
</script>
<style lang="scss">
body {
  margin: 0;
  padding: 0;
  position: relative;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
}

#app {
  font-family: Avenir,Helvetica,Arial,sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
   
  .bookmark-container {
    width: 100%;
    flex: 1;
  }
}</style>
