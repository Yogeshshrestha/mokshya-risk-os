<script setup lang="ts">
const route = useRoute()
const isAuthenticated = ref(false)
const showLogin = ref(false)

// Determine header background color based on route
const headerBgClass = computed(() => {
  const path = route.path
  
  if (path === '/pricing') {
    return 'bg-[#F6F8F8]'
  } else if (path === '/' || path === '/home') {
    return 'bg-[#F8FCF9CC]'
  } else {
    return 'bg-white'
  }
})

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

// Handle navigation with smooth scrolling
const handleNavigation = (e: Event, target: string) => {
  e.preventDefault()
  const router = useRouter()
  const currentPath = route.path

  // If target is pricing, navigate to pricing page
  if (target === 'pricing') {
    router.push('/pricing')
    return
  }

  // If target is home, navigate to home
  if (target === 'home') {
    router.push('/')
    return
  }

  // For section links (why-us, how-it-works, about-us)
  const scrollToSection = () => {
    nextTick(() => {
      setTimeout(() => {
        const element = document.getElementById(target)
        if (element) {
          const headerOffset = 80 // Account for sticky header
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          })
        }
      }, 100)
    })
  }

  // Check if we're on home page
  if (currentPath === '/' || currentPath === '/home') {
    // Already on home page, just scroll to section
    scrollToSection()
  } else {
    // Not on home page, navigate to home first then scroll
    router.push('/').then(() => {
      scrollToSection()
    })
  }
}
</script>

<template>
  <UApp>
    <!-- Top teal strip --> 
    
    <!-- Custom header matching Figma design -->
    <header :class="['sticky top-0 z-50 border-b border-gray-100 transition-colors duration-300', headerBgClass]">
      <UContainer class="flex items-center justify-between h-16">
        <!-- Left: Logo and text -->
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center gap-2 cursor-pointer"> 
            <span class="text-base font-semibold  text-mokshya-dark">
              Mokshya OS
            </span>
          </NuxtLink>
        </div>

        <!-- Center: Navigation links -->
        <nav class="hidden lg:flex items-center gap-8 text-sm font-medium text-mokshya-text absolute left-1/2 transform -translate-x-1/2">
          <a href="/" @click.prevent="handleNavigation($event, 'home')" class="text-mokshya-dark transition-colors hover:text-mokshya-green cursor-pointer">
            Home
          </a>
          <a href="/pricing" @click.prevent="handleNavigation($event, 'pricing')" class="text-mokshya-dark transition-colors hover:text-mokshya-green cursor-pointer">
            Pricing
          </a>
          <a href="#why-us" @click.prevent="handleNavigation($event, 'why-us')" class="text-mokshya-dark transition-colors hover:text-mokshya-green cursor-pointer">
            Why Us
          </a>
          <a href="#how-it-works" @click.prevent="handleNavigation($event, 'how-it-works')" class="text-mokshya-dark transition-colors hover:text-mokshya-green cursor-pointer">
            How it works
          </a>
          <a href="#about-us" @click.prevent="handleNavigation($event, 'about-us')" class="text-mokshya-dark transition-colors hover:text-mokshya-green cursor-pointer">
            About Us
          </a>
        </nav>

        <!-- Right: Login button or user info -->
        <div class="flex items-center gap-4">
          <template v-if="!isAuthenticated">
            <button
              class="rounded-lg px-6 py-2.5 font-semibold text-white bg-[#09423C] hover:bg-[#07332e] transition-colors cursor-pointer"
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
