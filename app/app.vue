<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const auth = useAuth()
const showLogin = ref(false)
const showProfileDropdown = ref(false)

// Sync auth state
const isAuthenticated = computed(() => auth.isAuthenticated.value)

// Get user display name
const userDisplayName = computed(() => {
  const user = auth.user.value
  if (user?.full_name) {
    return user.full_name
  }
  if (user?.email) {
    return user.email.split('@')[0]
  }
  return 'User'
})

// Get user initials for avatar
const userInitials = computed(() => {
  const user = auth.user.value
  if (user?.full_name) {
    const parts = user.full_name.split(' ')
    if (parts.length >= 2) {
      const first = parts[0]
      const last = parts[parts.length - 1]
      if (first && last && first.length > 0 && last.length > 0) {
        return `${first[0]}${last[0]}`.toUpperCase()
      }
    }
    return user.full_name.substring(0, 2).toUpperCase()
  }
  if (user?.email && user.email.length > 0) {
    const firstChar = user.email[0]
    return firstChar ? firstChar.toUpperCase() : 'U'
  }
  return 'U'
})

// Handle logout
const handleLogout = async () => {
  showProfileDropdown.value = false
  await auth.logout()
  router.push('/')
}

// Close dropdown when clicking outside
onMounted(() => {
  if (import.meta.client) {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.profile-dropdown-container')) {
        showProfileDropdown.value = false
      }
    }
    document.addEventListener('click', handleClickOutside)
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })
  }
})

// Determine header background color based on route
const headerBgClass = computed(() => {
  const path = route.path
  
  if (path === '/pricing') {
    return 'bg-[#F6F8F8]'
  } else if (path === '/' || path === '/home') {
    return 'bg-[#F8FCF9CC]'
  } else if (path.startsWith('/assessment')) {
    return 'bg-white'
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
  // Auth state is managed by useAuth composable
  showLogin.value = false
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
            <div class="relative profile-dropdown-container">
              <button
                @click="showProfileDropdown = !showProfileDropdown"
                class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div class="text-right text-sm leading-tight">
                  <p class="font-semibold text-mokshya-text">
                    {{ userDisplayName }}
                  </p>
                  <p v-if="!auth.user.value?.is_verified" class="text-xs text-orange-600">
                    Verify email
                  </p>
                </div>
                <div
                  class="flex h-9 w-9 items-center justify-center rounded-full bg-[#09423C] text-xs font-bold text-white"
                >
                  {{ userInitials }}
                </div>
                <svg
                  class="w-4 h-4 text-mokshya-text transition-transform"
                  :class="{ 'rotate-180': showProfileDropdown }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <Transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  v-if="showProfileDropdown"
                  class="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-[0_10px_40px_-10px_rgba(9,67,62,0.15)] border border-gray-100 py-1 z-50"
                >
                  <NuxtLink
                    to="/profile"
                    @click="showProfileDropdown = false"
                    class="block px-4 py-2 text-sm text-mokshya-text hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div class="flex items-center gap-2">
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>Profile</span>
                    </div>
                  </NuxtLink>
                  <NuxtLink
                    v-if="!auth.user.value?.is_verified"
                    to="/verify-email"
                    @click="showProfileDropdown = false"
                    class="block px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                  >
                    <div class="flex items-center gap-2">
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Verify Email</span>
                    </div>
                  </NuxtLink>
                  <div class="border-t border-gray-100 my-1" />
                  <button
                    @click="handleLogout"
                    class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </Transition>
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
