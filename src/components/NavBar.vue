<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <nav class="nav-bar">
    <div class="nav-bar__container">
      <div class="nav-bar__logo">
        <span class="logo-icon">🎵</span>
        <span class="logo-text">TuneHub</span>
      </div>

      <div class="nav-bar__menu">
        <router-link
          to="/"
          class="nav-bar__item"
          :class="{ 'nav-bar__item--active': route.name === 'Home' }"
        >
          首页
        </router-link>

        <router-link
          to="/toplists"
          class="nav-bar__item"
          :class="{ 'nav-bar__item--active': route.name === 'Toplists' || route.name === 'ToplistDetail' }"
        >
          排行榜
        </router-link>

        <router-link
          to="/search"
          class="nav-bar__item"
          :class="{ 'nav-bar__item--active': route.name === 'Search' }"
        >
          搜索
        </router-link>
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

.nav-bar {
  position: sticky;
  top: 0;
  z-index: $z-index-header;
  background: $glass-bg;
  backdrop-filter: blur(40px) saturate(180%);
  border-bottom: 1px solid $glass-border;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  &__container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 $spacing-xl;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;

    @include mobile {
      padding: 0 $spacing-md;
      height: 56px;
    }
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-size: $font-size-xl;
    font-weight: 700;
    color: $color-text-primary;
    cursor: default;

    .logo-icon {
      font-size: $font-size-2xl;
    }

    .logo-text {
      background: $color-primary-gradient;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;

      @include mobile {
        display: none;
      }
    }
  }

  &__menu {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  &__item {
    position: relative;
    padding: $spacing-sm $spacing-lg;
    font-size: $font-size-base;
    font-weight: 600;
    color: $color-text-secondary;
    text-decoration: none;
    border-radius: $radius-lg;
    transition: all $transition-base;

    @include mobile {
      padding: $spacing-sm $spacing-md;
      font-size: $font-size-sm;
    }

    &:hover {
      color: $color-primary;
      background: rgba(250, 36, 60, 0.08);
    }

    &--active {
      color: $color-primary;
      background: rgba(250, 36, 60, 0.12);

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 24px;
        height: 3px;
        background: $color-primary-gradient;
        border-radius: 2px;
      }
    }
  }
}
</style>
