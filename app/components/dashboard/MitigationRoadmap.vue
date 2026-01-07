<template>
  <div class="bg-white border border-[#e8f3f2] rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col">
    <h3 class="text-[16px] font-bold text-[#0e1b1a] mb-6">Mitigation Roadmap</h3>
    
    <div class="space-y-6 flex-1">
      <div class="flex items-start gap-4 pb-6 border-b border-[#f8fbfb]">
        <div class="size-8 bg-[#dcfce7] rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="size-4.5 text-[#15803d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] text-[#0e1b1a] font-bold truncate">Implement MFA for Admins</p>
          <p class="text-[12px] text-[#4f9690] mt-1">Status: In Progress</p>
        </div>
        <div class="bg-[#f0fdf4] px-2.5 py-1 rounded-[8px] flex-shrink-0">
          <span class="text-[12px] font-bold text-[#15803d]">ROI: 300%</span>
        </div>
      </div>
      
      <div class="flex items-start gap-4">
        <div class="size-8 bg-[#dbeafe] rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="size-4.5 text-[#1d4ed8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] text-[#0e1b1a] font-bold truncate">Cloud Security Audit</p>
          <p class="text-[12px] text-[#4f9690] mt-1">Status: Scheduled</p>
        </div>
        <div class="bg-[#eff6ff] px-2.5 py-1 rounded-[8px] flex-shrink-0">
          <span class="text-[12px] font-bold text-[#1d4ed8]">ROI: 150%</span>
        </div>
      </div>
    </div>
  </div>
</template>
