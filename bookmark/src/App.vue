<template>
  <BookHeader :height="headerHeight"></BookHeader>
  <div class="book-container">
    <router-view v-slot="{ Component }">
      <transition name="rotate">
        <component :is="Component" />
      </transition>
    </router-view>
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

.rotate-enter-active,
.rotate-leave-active {
  transition: all 0.3s cubic-bezier(0.67, 0.01, 0.36, 1);
}

.rotate-enter-from,
.rotate-leave-to {
  transform: rotateX(-90deg) translateY(-10%) scale(0);
}
</style>
