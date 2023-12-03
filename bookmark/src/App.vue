<template>
  <BookHeader :height="headerHeight"></BookHeader>
  <div class="book-container">
    <RouterView></RouterView>
  </div>
</template>
<script setup>
import BookHeader from './components/header.vue';
const headerHeight = "60px"
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

::-webkit-scrollbar {
  width: 5px;
  background-color: #ddd;
  z-index: 999;
}

::-webkit-scrollbar-thumb {
  background-color: #409eff;
  border-radius: 2px;
  cursor: pointer;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  height: 100%;
  overflow-y: scroll;

  .book-container {
    position: relative;
    width: 100%;
    top: v-bind(headerHeight);
    height: calc(100% - v-bind(headerHeight));
  }
}
</style>
