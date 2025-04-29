<template>
  <Computer v-if="!isMobile()" />
  <Mobile v-else />
</template>

<script lang="ts" setup>
import Computer from './computer.vue';
import Mobile from './mobile.vue';
import { isMobile } from './utils/common';

if (import.meta.env.MODE === 'production') {
  window.onbeforeunload = () => false;
}

console.log('isMobile', isMobile());
</script>
