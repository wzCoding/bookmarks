<template>
  <BookHeader :height="headerHeight"></BookHeader>
  <div class="book-container">
    <RouterView></RouterView>
  </div>
</template>
<script setup>
import BookHeader from '@/components/header.vue';
const headerHeight = "56px"
</script>
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  height: 100%;
  

  .book-container {
    position: relative;
    top: v-bind(headerHeight);
    width: 100%;
    height: calc(100% - v-bind(headerHeight));
  }
}
</style>
