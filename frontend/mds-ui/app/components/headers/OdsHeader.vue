<script setup lang="ts">
import { ref, watch } from 'vue'
import OdsDropdownMenu from '@/components/OdsDropdownMenu.vue'
import { useI18n } from '#imports'

import type { OdsNavTabItem } from '~/model/ods-nav-tab-item'
import BurgerButton from '@/components/BurgerButton.vue'
import OdsNavigationPanel from '@/components/OdsNavigationPanel.vue'
import { NuxtLinkLocale } from '#components'

const { t, locale } = useI18n()
const route = useRoute()

interface Props {
  navigationItems: OdsNavTabItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'mobileMenuStateChange', value: boolean): void
}>()

const menuOpen = ref(false)

watch(menuOpen, (val) => {
  emit('mobileMenuStateChange', val)
})

function closeMobileMenu() {
  menuOpen.value = false
  emit('mobileMenuStateChange', false)
}

function isChildPage(item: OdsNavTabItem): boolean {
  if (item.to === '/') {
    return route.path === `/${locale.value}`
  }
  if (!item.subMenu || item.subMenu.length < 1) {
    return typeof item.to === 'string' && route.path.startsWith(`/${locale.value}${item.to}`)
  }
  return isChildPageOfSubMenu(item)
}

function isChildPageOfSubMenu(item: OdsNavTabItem) {
  if (item.subMenu) {
    return item.subMenu.some(subItem => isChildPage(subItem))
  }
  return false
}
</script>

<template>
  <NuxtLoadingIndicator color="red" />
  <div
    id="top-header-id"
    class="top-header"
  >
    <div class="container container--flex">
      <NuxtLinkLocale
        class="brand"
        to="/"
      >
        <span class="brand__name"><span class="brand__name--accent">metadata</span>.swiss</span>
        <span
          class="brand__ring"
          aria-hidden="true"
        />
      </NuxtLinkLocale>
      <div class="top-header__right">
        <BurgerButton
          v-model="menuOpen"
          :title="t('message.button.toggle_menu')"
        />
      </div>
    </div>
  </div>
  <div id="desktop-navigation-id">
    <div class="container container--flex">
      <nav
        id="main-navigation"
        class="main-navigation main-navigation--desktop"
      >
        <ul>
          <template
            v-for="item in props.navigationItems"
            :key="item.label"
          >
            <!-- a normal tab -->
            <li
              v-if="!item.subMenu"
              class="tab"
            >
              <NuxtLinkLocale
                :class="{ active: isChildPage(item) }"
                :to="item.to"
              >
                <span> {{ item.label }}</span>
              </NuxtLinkLocale>
            </li>

            <li
              v-if="item.subMenu"
              class="tab"
            >
              <OdsDropdownMenu
                :label="item.label"
                :menu="item"
                :class="isChildPage(item) ? 'active' : ''"
              />
            </li>
          </template>
        </ul>
      </nav>
    </div>
  </div>

  <!-- Mobile menu -->
  <Transition name="fade-menu">
    <div
      v-if="menuOpen"
      class="ods-mobile-menu"
    >
      <OdsNavigationPanel
        :items="props.navigationItems"
        @request-close="closeMobileMenu"
      />
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
@use '@/assets/ods/ods_breakpoints.scss' as mdeia;

#top-header-id {
  padding-block: 1.75rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--color-secondary-900);
}

.brand__name {
  font-family: Font-Bold, Hind, sans-serif;
  font-size: 1.75rem;
  line-height: 1;

  @include mdeia.respond-to-md {
    font-size: 2.75rem;
  }
}

.brand__name--accent {
  color: var(--color-primary-600);
}

.brand__ring {
  width: 1.25rem;
  height: 1.25rem;
  border: 4px solid var(--color-primary-600);
  border-radius: 50%;

  @include mdeia.respond-to-md {
    width: 1.75rem;
    height: 1.75rem;
    border-width: 5px;
  }
}

#main-navigation.main-navigation--desktop {
  height: 3.25rem;
}

// keep
#desktop-navigation-id{
  border-bottom: 1px solid rgb(229, 231, 235);
}
a {
  text-decoration: none;
}

.tab {
  display: block;
  margin-top: 0 !important;
  a {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

// end keep
.ods-mobile-menu {
   @include mdeia.respond-to-xs {
    display: flex;

    height: calc(100vh - 65px);
    background-color: var(--ods-light-dark-background-color);
  }

  @media (min-width: 1024px) {
    display: none;
  }
}

.fade-menu-enter-active {
  transition: opacity 0.4s cubic-bezier(0.4,0,0.2,1);
  transition-delay: 0.5s;
}
.fade-menu-leave-active {
  transition: opacity 0.4s cubic-bezier(0.4,0,0.2,1);
  transition-delay: 0s;
}
.fade-menu-enter-from, .fade-menu-leave-to {
  opacity: 0;
}
.fade-menu-enter-to, .fade-menu-leave-from {
  opacity: 1;
}
</style>
