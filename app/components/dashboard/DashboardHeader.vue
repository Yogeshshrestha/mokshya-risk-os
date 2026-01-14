<script setup lang="ts">
interface Props {
  title: string
  persona?: string
  showPersona?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showPersona: true
})
const emit = defineEmits<{
  'update:persona': [val: string]
  'toggle-sidebar': []
}>()

const auth = useAuth()

const personas = [
  { label: 'CRO', value: 'cro' },
  { label: 'CISO', value: 'ciso' },
  { label: 'Board', value: 'board' }
]

const showPersonaDropdown = ref(false)

const togglePersona = (val: string) => {
  emit('update:persona', val)
  showPersonaDropdown.value = false
}

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

// Get user email
const userEmail = computed(() => {
  return auth.user.value?.email || ''
})

// Get user avatar URL or generate initials
const userAvatarUrl = computed(() => {
  return auth.user.value?.avatar_url || null
})

// Get user initials for avatar fallback
const userInitials = computed(() => {
  const user = auth.user.value
  if (!user) return 'U'
  
  if (user.full_name) {
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
  
  if (user.email && user.email.length > 0) {
    return user.email[0].toUpperCase()
  }
  
  return 'U'
})

// Get persona-based title
const personaTitle = computed(() => {
  const titles: Record<string, string> = {
    cro: 'Chief Risk Officer',
    ciso: 'Chief Info Sec Officer',
    board: 'Board of Directors'
  }
  return titles[props.persona || ''] || 'User'
})

// Fetch user data on mount if not already loaded
onMounted(async () => {
  if (auth.isAuthenticated.value && !auth.user.value) {
    try {
      await auth.fetchUser()
    } catch (err) {
      console.error('Failed to fetch user data:', err)
    }
  }
})
</script>

<template>
  <header class="h-[81px] bg-white border-b border-[#e8f3f2] flex items-center justify-between px-4 sm:px-6 lg:px-8 z-20 w-full flex-shrink-0">
    <div class="flex items-center gap-4">
      <button 
        @click="emit('toggle-sidebar')"
        class="lg:hidden size-10 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
      >
        <UIcon name="i-lucide-menu" class="size-6 text-[#09423c]" />
      </button>
      <h1 class="text-[18px] sm:text-[20px] font-black text-[#09423c] tracking-tight uppercase">{{ title }}</h1>
    </div>
    
    <div class="flex items-center gap-2 sm:gap-6 lg:gap-8">
      <div v-if="showPersona" class="flex bg-[#e8f3f2] h-[40px] sm:h-[48px] rounded-[12px] sm:rounded-[14px] px-2 sm:px-4 items-center gap-2 sm:gap-4 shadow-sm border border-[#d0e6e5]/30 relative">
        <span class="hidden md:inline text-[12px] font-extrabold text-[#09433e] uppercase tracking-widest">Persona:</span>
        <div class="relative">
          <button 
            @click="showPersonaDropdown = !showPersonaDropdown"
            class="bg-[#09423c] text-white rounded-[8px] sm:rounded-[10px] px-2 sm:px-4 py-1 sm:py-2 flex items-center gap-2 sm:gap-5 hover:bg-[#07332e] h-[28px] sm:h-[34px] shadow-sm transition-all border-none cursor-pointer"
          >
            <span class="text-[12px] sm:text-[15px] font-bold">{{ persona?.toUpperCase() }}</span>
            <svg class="size-3 sm:size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div v-if="showPersonaDropdown" class="absolute top-full right-0 sm:left-0 mt-2 w-32 bg-white border border-gray-100 rounded-lg shadow-xl py-1 z-30">
            <button 
              v-for="p in personas" 
              :key="p.value"
              @click="togglePersona(p.value)"
              class="w-full text-left px-4 py-2 text-sm text-[#09433e] hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {{ p.label }}
            </button>
          </div>
        </div>
      </div>
      
      <div class="flex items-center gap-3 sm:gap-5">
        <div class="hidden sm:block h-8 w-px bg-[#d0e6e5]/50"></div>
        
        <div class="flex items-center gap-2 sm:gap-3.5 group cursor-pointer">
          <div class="hidden md:block text-right">
            <p class="text-[14px] font-bold text-[#0e1b1a] group-hover:text-[#09433e] transition-colors">
              {{ userDisplayName }}
            </p>
            <p class="text-[12px] text-[#4f9690] font-medium">
              {{ personaTitle }}
            </p>
          </div>
          <div class="size-9 sm:size-10 rounded-full border-2 border-[#d0e6e5] shadow-sm group-hover:border-[#09433e] transition-all overflow-hidden bg-gray-200 flex items-center justify-center">
            <img 
              v-if="userAvatarUrl" 
              :src="userAvatarUrl" 
              :alt="userDisplayName" 
              class="size-full object-cover"
            >
            <span 
              v-else 
              class="text-[13px] sm:text-[14px] font-bold text-[#09433e]"
            >
              {{ userInitials }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
