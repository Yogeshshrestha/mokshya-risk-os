<template>
  <div class="bg-white border border-[#e8f3f2] rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col ">
    <h3 class="text-[16px] font-bold text-[#0e1b1a] mb-6">Renewal Countdown</h3>
    
    <div class="flex items-center gap-5">
      <div class="size-[72px] bg-[#e8f3f2] rounded-[12px] flex flex-col items-center justify-center flex-shrink-0 border border-[#d0e6e5]">
        <span class="text-[24px] font-bold text-[#09433e] leading-none">45</span>
        <span class="text-[11px] font-bold text-[#4f9690] uppercase mt-1.5 tracking-widest">Days</span>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-[14px] font-bold text-[#0e1b1a] truncate">Cyber Liability Policy</p>
        <p class="text-[12px] text-[#4f9690] mt-1 font-medium">Expires Dec 31, 2024</p>
        <button class="text-[12px] font-bold text-[#09433e] mt-3 hover:text-[#07332e] transition-colors flex items-center gap-1 cursor-pointer">
          Start Renewal Process
          <UIcon name="i-lucide-arrow-right" class="size-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>

