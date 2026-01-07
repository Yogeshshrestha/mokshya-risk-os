<template>
  <div class="bg-white border border-[#e8f3f2] rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-6 h-full">
    <h3 class="text-[16px] font-bold text-[#0e1b1a] mb-8">Coverage Summary</h3>
    
    <div class="space-y-8">
      <div>
        <div class="flex justify-between items-center mb-3">
          <span class="text-[14px] text-[#4f9690]">Liability Coverage</span>
          <span class="text-[14px] font-medium text-[#0e1b1a]">$10M / $15M</span>
        </div>
        <div class="h-2 bg-[#f8fbfb] rounded-full overflow-hidden">
          <div class="h-full bg-[#09433e] rounded-full w-[66%] transition-all duration-500"></div>
        </div>
      </div>
      
      <div>
        <div class="flex justify-between items-center mb-3">
          <span class="text-[14px] text-[#4f9690]">First-Party Loss</span>
          <span class="text-[14px] font-medium text-[#0e1b1a]">$2.5M / $5M</span>
        </div>
        <div class="h-2 bg-[#f8fbfb] rounded-full overflow-hidden">
          <div class="h-full bg-[#4f9690] rounded-full w-[50%] transition-all duration-500"></div>
        </div>
      </div>
      
      <div class="pt-8 mt-4 border-t border-[#e8f3f2] flex justify-between items-center">
        <span class="text-[14px] text-[#09433e] font-medium">Active Policies</span>
        <span class="text-[20px] font-bold text-[#0e1b1a]">3</span>
      </div>
    </div>
  </div>
</template>

