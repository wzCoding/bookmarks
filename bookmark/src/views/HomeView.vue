<template>
  <div class="home">
    home
  </div>
</template>

<script setup>
const handleTree = (tree) => {
   console.log(tree)
}
chrome.bookmarks.getTree(handleTree)
</script>
