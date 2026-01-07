<script setup lang="ts">
interface Props {
  title: string
  persona: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:persona': [val: string]
}>()

const personas = [
  { label: 'CRO', value: 'cro' },
  { label: 'CISO', value: 'ciso' },
  { label: 'CFO', value: 'cfo' }
]

const showPersonaDropdown = ref(false)

const togglePersona = (val: string) => {
  emit('update:persona', val)
  showPersonaDropdown.value = false
}
</script>

<template>
  <header class="h-[81px] bg-white border-b border-[#e8f3f2] flex items-center justify-between px-8 sticky top-0 z-20 w-full">
    <h1 class="text-[20px] font-extrabold text-[#09433e] tracking-tight">{{ title }}</h1>
    
    <div class="flex items-center gap-8">
      <NuxtLink 
        to="/organizations"
        class="flex items-center gap-2 text-[13px] font-bold text-[#4f9690] hover:text-[#09433e] transition-colors group"
      >
        <svg class="size-4 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
        </svg>
        Switch Org
      </NuxtLink>

      <div class="bg-[#e8f3f2] h-[48px] rounded-[14px] px-4 flex items-center gap-4 shadow-sm border border-[#d0e6e5]/30 relative">
        <span class="text-[12px] font-extrabold text-[#09433e] uppercase tracking-widest">Persona:</span>
        <div class="relative">
          <button 
            @click="showPersonaDropdown = !showPersonaDropdown"
            class="bg-[#09423c] text-white rounded-[10px] px-4 py-2 flex items-center gap-5 hover:bg-[#07332e] h-[34px] shadow-sm transition-all border-none cursor-pointer"
          >
            <span class="text-[15px] font-bold">{{ persona.toUpperCase() }}</span>
            <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div v-if="showPersonaDropdown" class="absolute top-full left-0 mt-2 w-32 bg-white border border-gray-100 rounded-lg shadow-xl py-1 z-30">
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
      
      <div class="flex items-center gap-5">
        <button class="relative size-10 flex items-center justify-center hover:bg-gray-100/50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-gray-200">
          <svg class="size-6 text-[#09433e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <div class="absolute top-2.5 right-2.5 size-2 bg-[#ef4444] rounded-full ring-2 ring-white"></div>
        </button>
        
        <div class="h-8 w-px bg-[#d0e6e5]/50"></div>
        
        <div class="flex items-center gap-3.5 group cursor-pointer">
          <div class="text-right">
            <p class="text-[14px] font-bold text-[#0e1b1a] group-hover:text-[#09433e] transition-colors">
              {{ persona === 'ciso' ? 'David Ross' : 'Alexandra Chen' }}
            </p>
            <p class="text-[12px] text-[#4f9690] font-medium">
              {{ persona === 'ciso' ? 'Chief Info Sec Officer' : 'Chief Risk Officer' }}
            </p>
          </div>
          <div class="size-10 rounded-full border-2 border-[#d0e6e5] shadow-sm group-hover:border-[#09433e] transition-all overflow-hidden bg-gray-200">
            <img :src="persona === 'ciso' ? 'https://avatar.vercel.sh/david' : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80'" alt="Avatar" class="size-full object-cover">
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
