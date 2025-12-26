<script setup>
const isAuthenticated = ref(false)
const showLogin = ref(false)


useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: 'anonymous'
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap'
    }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Nuxt Starter Template'
const description = 'A production-ready starter template powered by Nuxt UI. Build beautiful, accessible, and performant applications in minutes, not hours.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterCard: 'summary_large_image'
})

const handleLoginSuccess = () => {
  isAuthenticated.value = true
}
</script>

<template>
  <UApp>
    <!-- Top teal strip --> 
    
    <!-- Custom header matching Figma design -->
    <header class="sticky top-0 z-50 bg-white border-b border-gray-100">
      <UContainer class="flex items-center justify-between h-16">
        <!-- Left: Logo and text -->
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center gap-2"> 
            <span class="text-base font-semibold text-mokshya-text">
              Mokshya OS
            </span>
          </NuxtLink>
        </div>

        <!-- Center: Navigation links -->
        <nav class="hidden lg:flex items-center gap-8 text-sm font-medium text-mokshya-text absolute left-1/2 transform -translate-x-1/2">
          <NuxtLink to="home" class="hover:text-mokshya-dark transition-colors">
            Home
          </NuxtLink>
          <NuxtLink to="pricing" class="hover:text-mokshya-dark transition-colors">
            Pricing
          </NuxtLink>
          <NuxtLink to="why-us" class="hover:text-mokshya-dark transition-colors">
            Why Us
          </NuxtLink>
          <NuxtLink to="how-it-works" class="hover:text-mokshya-dark transition-colors">
            How it works
          </NuxtLink>
          <NuxtLink to="about-us" class="hover:text-mokshya-dark transition-colors">
            About Us
          </NuxtLink>
        </nav>

        <!-- Right: Login button or user info -->
        <div class="flex items-center gap-4">
          <template v-if="!isAuthenticated">
            <button
              class="rounded-lg px-6 py-2.5 font-semibold text-white bg-[#09423C] hover:bg-[#07332e] transition-colors"
              @click="showLogin = true"
            >
              Log in
            </button>
          </template>
          <template v-else>
            <div class="flex items-center gap-3">
              <div class="text-right text-sm leading-tight">
                <p class="font-semibold text-mokshya-text">
                  Risk Leader
                </p> 
              </div>
              <div
                class="flex h-9 w-9 items-center justify-center rounded-full bg-[#09423C] text-xs font-bold text-white"
              >
                RL
              </div>
            </div>
          </template>
        </div>
      </UContainer>
    </header>

    <UMain>
      <NuxtPage />
    </UMain>
 
    <LoginDialog
      v-model="showLogin"
      @success="handleLoginSuccess"
    />
  </UApp>
</template>
