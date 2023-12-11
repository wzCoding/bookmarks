<template>
    <div>{{ id }}</div>
</template>
<script setup>
const props = defineProps(({
    id: { type: String, default: "0", required: true }
}))
console.log(props.id)
</script>
<style lang="scss" scoped></style>