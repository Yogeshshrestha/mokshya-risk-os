<script setup lang="ts">
const personas = [
  { label: 'CRO', value: 'cro' },
  { label: 'CISO', value: 'ciso' },
  { label: 'CFO', value: 'cfo' }
]
const selectedPersona = ref('cro')
</script>

<template>
  <header class="h-[81px] bg-white border-b border-[#e8f3f2] flex items-center justify-between px-8 sticky top-0 z-20 w-full">
    <h1 class="text-[20px] font-extrabold text-[#09433e] tracking-tight">CRO Dashboard</h1>
    
    <div class="flex items-center gap-8">
      <div class="bg-[#e8f3f2] h-[48px] rounded-[14px] px-4 flex items-center gap-4 shadow-sm border border-[#d0e6e5]/30">
        <span class="text-[12px] font-extrabold text-[#09433e] uppercase tracking-widest">Persona:</span>
        <UDropdown :items="[personas.map(p => ({ label: p.label, click: () => selectedPersona = p.value }))]">
          <UButton 
            class="bg-[#09423c] text-white rounded-[10px] px-4 py-2 flex items-center gap-5 hover:bg-[#07332e] h-[34px] shadow-sm transition-all border-none"
          >
            <span class="text-[15px] font-bold">{{ selectedPersona.toUpperCase() }}</span>
            <UIcon name="i-lucide-chevron-down" class="size-4" />
          </UButton>
        </UDropdown>
      </div>
      
      <div class="flex items-center gap-5">
        <button class="relative size-10 flex items-center justify-center hover:bg-gray-100/50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-gray-200">
          <UIcon name="i-lucide-bell" class="size-6 text-[#09433e]" />
          <div class="absolute top-2.5 right-2.5 size-2 bg-[#ef4444] rounded-full ring-2 ring-white"></div>
        </button>
        
        <div class="h-8 w-px bg-[#d0e6e5]/50"></div>
        
        <div class="flex items-center gap-3.5 group cursor-pointer">
          <div class="text-right">
            <p class="text-[14px] font-bold text-[#0e1b1a] group-hover:text-[#09433e] transition-colors">Alexandra Chen</p>
            <p class="text-[12px] text-[#4f9690] font-medium">Chief Risk Officer</p>
          </div>
          <UAvatar 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80" 
            size="md" 
            class="border-2 border-[#d0e6e5] shadow-sm group-hover:border-[#09433e] transition-all" 
          />
        </div>
      </div>
    </div>
  </header>
</template>

