<script setup lang="ts">
import type { SourceSwitchInfo } from '@/types/models';

defineProps<{
  info: SourceSwitchInfo;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <div class="toast">
    <div class="toast__content">
      平台已自动切换: {{ info.from }} → {{ info.to }}
    </div>
    <button class="toast__close" @click="emit('close')">×</button>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

.toast {
  position: fixed;
  top: $spacing-xl;
  right: $spacing-xl;
  z-index: $z-index-toast;
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  padding: $spacing-lg $spacing-xl;
  background: $glass-bg;
  backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid $glass-border;
  border-radius: $radius-xl;
  box-shadow: $shadow-xl;
  animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  @include mobile {
    top: $spacing-lg;
    right: $spacing-md;
    left: $spacing-md;
  }

  &__content {
    font-size: $font-size-base;
    font-weight: 500;
    color: $color-text-primary;
  }

  &__close {
    @include button-reset;
    @include flex-center;
    width: 28px;
    height: 28px;
    font-size: $font-size-xl;
    color: $color-text-secondary;
    background: rgba(0, 0, 0, 0.05);
    border-radius: $radius-round;
    transition: all $transition-base;

    &:hover {
      color: $color-text-primary;
      background: rgba(0, 0, 0, 0.1);
      transform: rotate(90deg);
    }
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
