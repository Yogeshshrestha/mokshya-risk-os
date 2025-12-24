<script setup lang="ts">
  const imgImageBackgroundBorder = "https://www.figma.com/api/mcp/asset/1070b3e4-c788-4120-85dd-f93e5bdbaea0";
  const imgImageBackgroundBorder1 = "https://www.figma.com/api/mcp/asset/7a1d0f88-39c0-44c0-bdc7-586dcc21967e";
  const imgImageBackgroundBorder2 = "https://www.figma.com/api/mcp/asset/1abb31bd-18c9-4037-a706-1e1c3dd6c1d2";
  const imgChatGptImageDec222025033800Pm1 = "https://www.figma.com/api/mcp/asset/2deefa85-2da3-479f-9183-5be1c68b6ab2";
  const imgChatGptImageDec222025032534Pm1 = "https://www.figma.com/api/mcp/asset/34aa53bb-f4d4-4087-8ac2-ee861c3696a3";
  const imgChatGptImageDec222025032949Pm1 = "https://www.figma.com/api/mcp/asset/2570011c-7f2c-47d3-985a-bbc8d23a5f04";
  const imgImageBorderShadow = "https://www.figma.com/api/mcp/asset/f77b0594-e93b-4dc2-a382-fa40038b8943";
  const imgGradient = "https://www.figma.com/api/mcp/asset/91aacb77-a6bb-4678-98d2-f08850c9b163";
  const imgIcon = "https://www.figma.com/api/mcp/asset/cfa0c888-bd12-49e0-b78e-021722cd6b3e";
  const imgIcon1 = "https://www.figma.com/api/mcp/asset/ce227972-cef8-4362-a210-ca06585a72c8";
  const imgIcon2 = "https://www.figma.com/api/mcp/asset/201a8054-060a-4110-a0fe-a612215f4d34";
  const imgIcon3 = "https://www.figma.com/api/mcp/asset/3a8b4425-1fbe-44ab-880f-59d8fdc955a2";
  const imgIcon4 = "https://www.figma.com/api/mcp/asset/d1197255-8a67-4f95-989b-464730b986cc";
  const imgIcon5 = "https://www.figma.com/api/mcp/asset/5b0b5e4b-3c52-421a-9098-8a17637ce8aa";
  const imgIcon6 = "https://www.figma.com/api/mcp/asset/620aa9d8-1c82-471b-8f48-d1766d71685d";
  const imgIcon7 = "https://www.figma.com/api/mcp/asset/715126d9-4983-4349-a969-668bbf5dfb82";
  const imgIcon8 = "https://www.figma.com/api/mcp/asset/73049dbd-8774-4010-a765-a33b2218c5e7";
  const imgIcon9 = "https://www.figma.com/api/mcp/asset/fcde63c6-e126-4e60-aa4e-ae9d81633dfc";
  const imgIcon10 = "https://www.figma.com/api/mcp/asset/6fb491f7-375e-43f0-ba5b-daffada1044d";
  const imgIcon11 = "https://www.figma.com/api/mcp/asset/e10892b6-f9e3-403a-be23-da1b941b556a";
  const imgIcon12 = "https://www.figma.com/api/mcp/asset/723071da-a75c-4653-87e2-db1a7000d7b7";
  const imgIcon13 = "https://www.figma.com/api/mcp/asset/0bc76aa1-de9a-4028-ad6c-005ad50c0144";
  const imgIcon14 = "https://www.figma.com/api/mcp/asset/80ff9ea6-c2fd-48e7-ac73-965403340b4d";
  const imgIcon15 = "https://www.figma.com/api/mcp/asset/c650750f-8eab-4e7e-9964-982e0bb5f09a";
  const imgIcon16 = "https://www.figma.com/api/mcp/asset/271233c1-24b9-40fd-ab31-a7915eb3e905";
  const imgIcon17 = "https://www.figma.com/api/mcp/asset/300cf6d9-a40b-4cf9-aba8-6761543f4e44";
  const imgIcon18 = "https://www.figma.com/api/mcp/asset/c1d4aa83-0a8a-4609-a17f-3bb2f3afa6da";
  const imgIcon19 = "https://www.figma.com/api/mcp/asset/a2ae8b87-cd81-4097-b132-9c9af1f2ae36";
  // Target Audience Section Icons
  const imgIcon20 = "https://www.figma.com/api/mcp/asset/24855bba-e504-473d-bab3-02746a7dff42"; // Risk Mgrs
  const imgIcon21 = "https://www.figma.com/api/mcp/asset/7077dc6c-5892-4dc6-b2fd-bdd5f688fcd6"; // CRO
  const imgIcon22 = "https://www.figma.com/api/mcp/asset/e1f5f3f1-e157-47bf-8861-d1a3475f8eb7"; // CISO
  const imgIcon23 = "https://www.figma.com/api/mcp/asset/52e3d001-2d10-45f1-abc8-70fb382d52e1"; // CFO
  const imgIcon24 = "https://www.figma.com/api/mcp/asset/c99a13aa-b559-4617-9ec0-d97d9182118e"; // Board Members
  const imgIcon25 = "https://www.figma.com/api/mcp/asset/1de5420a-5b4e-46bb-af93-03f8cc03209a"; // Underwriters
  const imgVector = "https://www.figma.com/api/mcp/asset/c0957895-6585-44ab-9878-c5041f9a7004"; // Orbital paths vector
  const imgLogoIcon1 = "https://www.figma.com/api/mcp/asset/01d10d8c-c9d1-4331-b324-d7a0bf8c65ca"; // Updated logo
  const imgPlus = "https://www.figma.com/api/mcp/asset/aec0ea96-7183-4207-9561-d75d5bec7e42";
  
  useSeoMeta({
    title: 'Mokshya OS - Cyber Risk Intelligence',
    description: 'Translate complex cyber signals into clear financial risk exposure.'
  })
  
  const activeAccordion = ref<number | null>(0)
  
  const toggleAccordion = (index: number) => {
    activeAccordion.value = activeAccordion.value === index ? null : index
  }
  
  const faqItems = [
    { q: 'What is Mokshya OS?', a: 'Mokshya OS is a comprehensive risk management platform that translates technical cybersecurity data into financial risk metrics, enabling organizations to quantify exposure in real-time.' },
    { q: 'Who is Mokshya OS built for?', a: 'It is designed for CISOs, CFOs, Risk Managers, and Board Members who need to bridge the gap between technical security signals and business risk decisions.' },
    { q: 'How does the assessment work?', a: 'We securely integrate with your existing security stack (cloud, identity, endpoint) via API to collect data, then use our proprietary engine to model potential loss scenarios.' },
    { q: 'What kind of results do I get?', a: 'You receive a real-time risk tier (A-F), estimated financial exposure (probable vs max), policy readiness scores, and actionable remediation paths prioritized by financial impact.' }
  ]
  </script>
  
  <template>
    <div class="font-sans text-mokshya-text overflow-hidden scroll-smooth">
      <!-- Hero Section -->
      <div class="relative w-full overflow-hidden bg-white">
          <!-- Gradient Background -->
         <div class="absolute inset-0 pointer-events-none" :style="{ maskImage: `url('${imgGradient}')`, maskSize: '100% 100%', maskPosition: '0% 0%', maskRepeat: 'no-repeat' }">
            <div class="absolute inset-0 bg-gradient-to-r from-mokshya-light to-white"></div>
         </div>
         
         <UContainer class="relative z-10 pt-32 pb-20">
           <div class="lg:grid lg:grid-cols-12 gap-8 items-center">
             <!-- Hero Text -->
             <div class="lg:col-span-6 space-y-8 animate-fade-in-up">
                <h1 class="text-5xl lg:text-[72px] font-extrabold leading-tight tracking-tight text-mokshya-text">
                  Decide<br/>
                  Insurance With<br/>
                  <span class="text-mokshya-dark relative inline-block">
                    Confidence
                    <svg class="absolute w-full h-3 -bottom-1 left-0 text-green-400 opacity-60" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00025 6.99997C25.7509 4.61334 112.981 -2.00002 198.001 3.50001" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
                  </span>
                </h1>
                <p class="text-xl text-mokshya-gray leading-relaxed max-w-lg delay-100">
                  Board-ready insights. Insurance-aligned outcomes. Translate complex cyber signals into clear financial risk exposure.
                </p>
                
                <div class="flex flex-wrap gap-4 delay-200">
                  <button class="bg-mokshya-dark text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-opacity-90 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    Request a Demo
                  </button>
                  <button class="bg-white border border-mokshya-dark text-mokshya-dark font-bold py-3 px-8 rounded-lg hover:bg-gray-50 transition-all duration-300">
                    See How It Works
                  </button>
                </div>
  
                <!-- Social Proof -->
                <div class="flex items-center gap-4 pt-4 delay-300">
                   <div class="flex -space-x-3">
                     <div class="w-10 h-10 rounded-full border-2 border-white overflow-hidden relative bg-gray-200 hover:z-10 transition-transform hover:scale-110">
                       <img :src="imgImageBackgroundBorder" class="object-cover w-full h-full" alt="User 1"/>
                     </div>
                     <div class="w-10 h-10 rounded-full border-2 border-white overflow-hidden relative bg-gray-300 hover:z-10 transition-transform hover:scale-110">
                       <img :src="imgImageBackgroundBorder1" class="object-cover w-full h-full" alt="User 2"/>
                     </div>
                     <div class="w-10 h-10 rounded-full border-2 border-white overflow-hidden relative bg-gray-400 hover:z-10 transition-transform hover:scale-110">
                       <img :src="imgImageBackgroundBorder2" class="object-cover w-full h-full" alt="User 3"/>
                     </div>
                   </div>
                   <div class="flex flex-col">
                      <div class="flex text-yellow-500 text-xs mb-0.5">★★★★★</div>
                      <p class="text-sm font-medium text-gray-600">Trusted by 500+ Risk Leaders</p>
                   </div>
                </div>
             </div>
  
             <!-- Hero Dashboard Visual -->
             <div class="lg:col-span-6 mt-12 lg:mt-0 relative perspective-1000">
                <div class="bg-white rounded-xl shadow-2xl border border-gray-100 p-6 relative transform lg:rotate-y-6 lg:rotate-x-2 lg:translate-x-8 hover:rotate-0 hover:translate-x-0 transition-all duration-700 ease-out shadow-mokshya-green/10">
                    <!-- Dashboard Header -->
                    <div class="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                      <div class="flex gap-2">
                        <div class="w-3 h-3 rounded-full bg-red-400"></div>
                        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div class="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Mokshya OS Dashboard</div>
                    </div>
  
                    <!-- Dashboard Grid -->
                    <div class="grid grid-cols-2 gap-6">
                        <!-- Overall Risk Tier -->
                        <div class="bg-mokshya-light border border-green-100/50 rounded-lg p-6 relative group hover:bg-white hover:shadow-md transition-all duration-300">
                            <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Overall Risk Tier</div>
                            <div class="flex items-end gap-2">
                               <span class="text-4xl font-bold text-mokshya-text group-hover:text-mokshya-green transition-colors">A-</span>
                               <div class="w-4 h-4 mb-2"><img :src="imgIcon" alt="Trend" /></div>
                            </div>
                            <div class="text-sm font-medium text-mokshya-dark mt-1">Top 10%</div>
                        </div>
  
                        <!-- Est. Financial Exposure -->
                        <div class="bg-mokshya-light border border-green-100/50 rounded-lg p-6 col-span-1 relative overflow-hidden group hover:bg-white hover:shadow-md transition-all duration-300">
                             <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Est. Financial Exposure</div>
                             <div class="flex items-center gap-2">
                                 <span class="text-2xl font-bold text-mokshya-text">$250K</span>
                                 <span class="text-gray-300 font-bold">-</span>
                                 <span class="text-2xl font-bold text-mokshya-text">$1.2M</span>
                             </div>
                             <div class="text-xs text-gray-500 mt-1">Based on 14k+ data points</div>
                             <div class="flex items-center gap-2 mt-4">
                                 <span class="relative flex h-2 w-2">
                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span class="relative inline-flex rounded-full h-2 w-2 bg-mokshya-green"></span>
                                  </span>
                                 <span class="text-xs font-medium text-mokshya-text">Real-time sync active</span>
                             </div>
                             <div class="absolute top-4 right-4 w-12 opacity-80 group-hover:scale-110 transition-transform"><img :src="imgIcon1" alt="Chart" /></div>
                        </div>
                        
                         <!-- Policy Readiness -->
                        <div class="bg-mokshya-light border border-green-100/50 rounded-lg p-6 col-span-2 group hover:bg-white hover:shadow-md transition-all duration-300">
                            <div class="flex justify-between mb-2">
                               <div class="text-xs font-bold text-gray-400 uppercase tracking-wider">Policy Readiness</div>
                               <div class="text-xs font-bold text-mokshya-dark">85% Ready</div>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div class="bg-mokshya-dark h-2 rounded-full animate-progress" style="width: 85%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Floating Elements -->
                    <div class="absolute -right-8 top-16 bg-white/90 backdrop-blur-md border border-gray-100 rounded-lg p-3 flex gap-3 items-center w-48 shadow-lg animate-float">
                        <div class="bg-green-100 rounded-md p-1.5 w-8 h-8 flex items-center justify-center shrink-0"><img :src="imgIcon3" class="w-4 h-4" /></div>
                        <div>
                            <div class="text-[10px] font-bold text-gray-400 uppercase">Compliance</div>
                            <div class="text-sm font-bold text-mokshya-text">SOC2 Ready</div>
                        </div>
                    </div>
                    
                     <div class="absolute -left-6 bottom-12 bg-white/90 backdrop-blur-md rounded-lg p-3 flex gap-3 items-center shadow-lg border border-gray-100 animate-float-delayed">
                        <div class="bg-yellow-50 border border-yellow-100 rounded-full p-1.5 w-8 h-8 flex items-center justify-center shrink-0"><img :src="imgIcon2" class="w-4 h-4" /></div>
                        <div>
                            <div class="text-[10px] font-bold text-gray-400 uppercase">Alert</div>
                            <div class="text-xs font-bold text-mokshya-text">New CVE Detected</div>
                        </div>
                    </div>
                </div>
             </div>
           </div>
         </UContainer>
      </div>
  
      <!-- What Mokshya OS Does Section -->
      <div class="py-24 bg-white">
         <UContainer>
             <div class="text-center max-w-2xl mx-auto mb-16">
                 <h2 class="text-4xl font-bold text-mokshya-text mb-4">What Mokshya OS Does</h2>
                 <p class="text-lg text-mokshya-gray">We bridge the gap between technical security signals and business risk decisions.</p>
             </div>
  
             <div class="grid md:grid-cols-3 gap-8">
                 <!-- Card 1 -->
                 <div class="bg-mokshya-light border border-green-100/50 rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                     <div class="absolute top-8 right-8 bg-green-500/10 border border-green-500/10 rounded-full px-3 py-1">
                         <span class="text-[10px] font-bold text-mokshya-dark uppercase tracking-widest">Core Capability</span>
                     </div>
                     <div class="mt-8 mb-4 h-32 relative">
                          <img :src="imgChatGptImageDec222025033800Pm1" class="object-contain w-full h-full transform group-hover:scale-110 transition-transform duration-500" alt="Assess Risk" />
                     </div>
                     <h3 class="text-2xl font-bold text-mokshya-dark mb-2">Assess Risk</h3>
                     <p class="text-mokshya-dark/70 text-sm leading-relaxed">
                         Convert abstract cyber threats into quantified real-time risk scores (A-F) that the board can understand immediately.
                     </p>
                 </div>
  
                  <!-- Card 2 -->
                 <div class="bg-mokshya-light border border-green-100/50 rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                     <div class="absolute top-8 right-8 bg-green-500/10 border border-green-500/10 rounded-full px-3 py-1">
                         <span class="text-[10px] font-bold text-mokshya-dark uppercase tracking-widest">Audit-Ready</span>
                     </div>
                     <div class="mt-8 mb-4 h-32 relative">
                          <img :src="imgChatGptImageDec222025032534Pm1" class="object-contain w-full h-full transform group-hover:scale-110 transition-transform duration-500" alt="Analyze Risk" />
                     </div>
                     <h3 class="text-2xl font-bold text-mokshya-dark mb-2">Analyze Risk</h3>
                     <p class="text-mokshya-dark/70 text-sm leading-relaxed">
                         Automated mapping of your security posture to key compliance frameworks like SOC2, ISO 27001, and HIPAA.
                     </p>
                 </div>
  
                  <!-- Card 3 -->
                 <div class="bg-mokshya-light border border-green-100/50 rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                     <div class="absolute top-8 right-8 bg-green-500/10 border border-green-500/10 rounded-full px-3 py-1">
                         <span class="text-[10px] font-bold text-mokshya-dark uppercase tracking-widest">Real-Time</span>
                     </div>
                     <div class="mt-8 mb-4 h-32 relative">
                          <img :src="imgChatGptImageDec222025032949Pm1" class="object-contain w-full h-full transform group-hover:scale-110 transition-transform duration-500" alt="Decide & Act" />
                     </div>
                     <h3 class="text-2xl font-bold text-mokshya-dark mb-2">Decide & Act</h3>
                     <p class="text-mokshya-dark/70 text-sm leading-relaxed">
                         Calculate potential loss expectancy instantly based on your unique tech stack and threat landscape.
                     </p>
                 </div>
             </div>
         </UContainer>
      </div>
  
      <!-- How It Works Section -->
      <div class="py-24 bg-mokshya-light">
          <UContainer>
               <div class="text-center mb-20">
                 <h2 class="text-4xl font-bold text-mokshya-text mb-4">How It Works</h2>
                 <p class="text-lg text-mokshya-gray">From integration to insight in three simple steps.</p>
             </div>
  
             <div class="lg:grid lg:grid-cols-2 gap-16 items-center">
                 <!-- Left Side Visual (Dashboard Timeline) -->
                 <div class="relative">
                     <div class="bg-white/50 border border-green-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                         <!-- Mockup of the dashboard interface from Figma -->
                         <div class="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                             <div class="flex items-center gap-4 mb-6">
                                 <div class="w-12 h-12 rounded-full bg-gray-200"></div> <!-- Placeholder for user avatar -->
    <div>
                                     <div class="text-xs font-bold text-mokshya-dark uppercase">Good morning, John.</div>
                                     <div class="text-[10px] text-gray-500">Here is your risk intelligence overview.</div>
                                 </div>
                             </div>
                             
                             <!-- Status Cards Row -->
                             <div class="grid grid-cols-3 gap-2 mb-4">
                                 <div class="bg-white p-2 rounded border border-gray-100">
                                     <div class="text-[8px] font-semibold text-gray-500 uppercase">Status</div>
                                     <div class="text-[10px] font-bold text-mokshya-dark">Connected</div>
                                 </div>
                                  <div class="bg-white p-2 rounded border border-gray-100">
                                     <div class="text-[8px] font-semibold text-gray-500 uppercase">Risk Coverage</div>
                                     <div class="text-[10px] font-bold text-mokshya-dark">94%</div>
                                 </div>
                                  <div class="bg-white p-2 rounded border border-gray-100">
                                     <div class="text-[8px] font-semibold text-gray-500 uppercase">Assets</div>
                                     <div class="text-[10px] font-bold text-mokshya-dark">1,240</div>
                                 </div>
                             </div>
  
                             <!-- Chart Placeholder -->
                             <div class="h-24 bg-gray-50 rounded border border-gray-100 mb-4 flex items-end justify-between px-2 pb-2">
                                 <div class="w-2 bg-green-200 h-1/3 rounded-t"></div>
                                 <div class="w-2 bg-green-200 h-1/2 rounded-t"></div>
                                 <div class="w-2 bg-mokshya-dark h-3/4 rounded-t"></div>
                                 <div class="w-2 bg-green-200 h-2/3 rounded-t"></div>
                                 <div class="w-2 bg-green-200 h-1/2 rounded-t"></div>
                             </div>
  
                             <!-- Table Placeholder -->
                             <div class="space-y-2">
                                 <div class="flex justify-between text-[8px] text-gray-400 font-bold uppercase border-b border-gray-100 pb-1">
                                     <span>Source</span><span>Status</span>
                                 </div>
                                 <div class="flex justify-between text-[10px] items-center">
                                     <span class="font-medium text-mokshya-dark">Gateway Router</span>
                                     <span class="bg-orange-100 text-orange-600 px-1 rounded text-[8px] font-bold">Medium</span>
                                 </div>
                                 <div class="flex justify-between text-[10px] items-center">
                                     <span class="font-medium text-mokshya-dark">Database Cluster</span>
                                     <span class="bg-gray-100 text-gray-600 px-1 rounded text-[8px] font-bold">Low</span>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>
  
                 <!-- Right Side Steps -->
                 <div class="space-y-12 relative">
                     <div class="absolute left-8 top-8 bottom-8 w-px bg-mokshya-dark/20"></div>
  
                     <!-- Step 1 -->
                     <div class="relative pl-24">
                         <div class="absolute left-0 top-0 w-16 h-16 rounded-full bg-mokshya-dark border border-mokshya-dark flex items-center justify-center z-10">
                             <img :src="imgIcon4" class="w-8 h-8 invert brightness-0 saturate-100 filter invert" /> 
                             <!-- Note: The icon in Figma is white on dark green, assuming svg needs inversion or use white version -->
                         </div>
                         <div class="flex items-center gap-4 mb-2">
                             <h3 class="text-2xl font-bold text-mokshya-text">Connect Stack</h3>
                             <span class="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">10 Minutes</span>
                         </div>
                         <p class="text-mokshya-gray text-lg">Securely integrate with your existing cloud, identity, and security tools via API.</p>
                     </div>
  
                      <!-- Step 2 -->
                     <div class="relative pl-24">
                         <div class="absolute left-0 top-0 w-16 h-16 rounded-full bg-mokshya-dark border border-mokshya-dark flex items-center justify-center z-10">
                             <img :src="imgIcon5" class="w-8 h-8" />
                         </div>
                         <div class="flex items-center gap-4 mb-2">
                             <h3 class="text-2xl font-bold text-mokshya-text">Analyze Risk</h3>
                             <span class="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Instant</span>
                         </div>
                         <p class="text-mokshya-gray text-lg">Our engine maps vulnerabilities to business impact and calculates financial exposure.</p>
                     </div>
  
                      <!-- Step 3 -->
                     <div class="relative pl-24">
                         <div class="absolute left-0 top-0 w-16 h-16 rounded-full bg-mokshya-dark border border-mokshya-dark flex items-center justify-center z-10">
                             <img :src="imgIcon6" class="w-8 h-8" />
                         </div>
                         <div class="flex items-center gap-4 mb-2">
                             <h3 class="text-2xl font-bold text-mokshya-text">Decide & Act</h3>
                             <span class="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Continuous</span>
                         </div>
                         <p class="text-mokshya-gray text-lg">Receive board-ready reports and actionable remediation paths optimized for insurance.</p>
                     </div>
                 </div>
             </div>
          </UContainer>
      </div>
  
      <!-- Target Audience Section -->
      <div class="py-24 bg-white relative overflow-hidden border-t border-gray-100">
          <UContainer class="relative z-10">
              <div class="text-center max-w-3xl mx-auto mb-20">
                  <span class="text-mokshya-dark font-bold uppercase tracking-[1.2px] text-base block mb-4">Target Audience</span>
                  <h2 class="text-3xl font-bold text-mokshya-text">Designed for decision-makers across risk, security, finance, and governance.</h2>
              </div>
  
              <!-- Radial Layout - Exact Figma Positioning -->
              <div class="relative h-[641px] w-[581px] mx-auto hidden lg:block">
                  <!-- Background Vector (Orbital Paths) -->
                  <div class="absolute inset-0" style="padding: 9.82% 3.42% 8.85% 6.86%;">
                      <img :src="imgVector" class="w-full h-full object-contain opacity-30" alt="Orbital paths" />
                  </div>
  
                  <!-- Orbital Container (rotates around center logo) -->
                  <div class="absolute inset-0 animate-orbit-slow" style="transform-origin: 296.77px 306.29px;">
                      <!-- CISO - Top Center (x=237, y=0) -->
                      <div class="absolute w-[119px] h-[119px] animate-orbit-counter" style="left: 237px; top: 0px; transform: translate(-50%, -50%); transform-origin: center center;">
                          <div class="w-full h-full bg-mokshya-dark rounded-full shadow-lg flex flex-col items-center justify-center text-white hover:scale-110 transition-transform duration-300 cursor-default">
                              <div class="flex items-center justify-center mb-1.5">
                                  <img :src="imgIcon22" class="w-[32px] h-[38px] object-contain scale-y-[-1]" alt="CISO" />
                              </div>
                              <span class="font-bold text-base uppercase tracking-[0.3104px] leading-[18.624px]">CISO</span>
                          </div>
                      </div>
  
                      <!-- CRO - Top Left (x=0, y=122) -->
                      <div class="absolute w-[119px] h-[119px] animate-orbit-counter" style="left: 0px; top: 122px; transform: translate(-50%, -50%); transform-origin: center center;">
                          <div class="w-full h-full bg-mokshya-dark rounded-full shadow-lg flex flex-col items-center justify-center text-white hover:scale-110 transition-transform duration-300 cursor-default">
                              <div class="flex items-center justify-center mb-1.5">
                                  <img :src="imgIcon21" class="w-[30px] h-[35px] object-contain scale-y-[-1]" alt="CRO" />
                              </div>
                              <span class="font-bold text-base uppercase tracking-[0.3104px] leading-[15.52px]">CRO</span>
                          </div>
                      </div>
  
                      <!-- CFO - Top Right (x=462, y=122) -->
                      <div class="absolute w-[119px] h-[119px] animate-orbit-counter" style="left: 462px; top: 122px; transform: translate(-50%, -50%); transform-origin: center center;">
                          <div class="w-full h-full bg-mokshya-dark rounded-full shadow-lg flex flex-col items-center justify-center text-white hover:scale-110 transition-transform duration-300 cursor-default">
                              <div class="flex items-center justify-center mb-2">
                                  <img :src="imgIcon23" class="w-[30px] h-[35px] object-contain scale-y-[-1]" alt="CFO" />
                              </div>
                              <span class="font-bold text-base uppercase tracking-[0.3104px] leading-[18.624px]">CFO</span>
                          </div>
                      </div>
  
                      <!-- Risk Mgrs - Bottom Right (x=462.05, y=378.86) -->
                      <div class="absolute w-[119px] h-[119px] animate-orbit-counter" style="left: 462.05px; top: 378.86px; transform: translate(-50%, -50%); transform-origin: center center;">
                          <div class="w-full h-full bg-mokshya-dark rounded-full shadow-lg flex flex-col items-center justify-center text-white border border-mokshya-dark/20 hover:scale-110 transition-transform duration-300 cursor-default">
                              <div class="flex items-center justify-center mb-1.5">
                                  <img :src="imgIcon20" class="w-[30px] h-[35px] object-contain scale-y-[-1]" alt="Risk Mgrs" />
                              </div>
                              <span class="font-bold text-sm uppercase tracking-[0.3104px] text-center leading-[15.52px]">
                                  <div>Risk</div>
                                  <div>Mgrs</div>
                              </span>
                          </div>
                      </div>
  
                      <!-- Board Members - Bottom Left (x=0, y=379) -->
                      <div class="absolute w-[119px] h-[119px] animate-orbit-counter" style="left: 0px; top: 379px; transform: translate(-50%, -50%); transform-origin: center center;">
                          <div class="w-full h-full bg-mokshya-dark rounded-full shadow-lg flex flex-col items-center justify-center text-white hover:scale-110 transition-transform duration-300 cursor-default">
                              <div class="flex items-center justify-center mb-1.5">
                                  <img :src="imgIcon24" class="w-[30px] h-[35px] object-contain scale-y-[-1]" alt="Board Members" />
                              </div>
                              <span class="font-bold text-sm uppercase tracking-[0.3104px] text-center leading-[15.52px]">
                                  <div>Board</div>
                                  <div>Members</div>
                              </span>
                          </div>
                      </div>
  
                      <!-- Underwriters - Bottom Center (x=241.13, y=521.98) -->
                      <div class="absolute w-[119px] h-[119px] animate-orbit-counter" style="left: 241.13px; top: 521.98px; transform: translate(-50%, -50%); transform-origin: center center;">
                          <div class="w-full h-full bg-mokshya-dark rounded-full shadow-lg flex flex-col items-center justify-center text-white hover:scale-110 transition-transform duration-300 cursor-default">
                              <div class="flex items-center justify-center mb-1.5">
                                  <img :src="imgIcon25" class="w-[30px] h-[35px] object-contain scale-y-[-1]" alt="Underwriters" />
                              </div>
                              <span class="font-bold text-sm uppercase tracking-[0.3104px] text-center leading-[15.52px]">
                                  <div>Under</div>
                                  <div>writers</div>
                              </span>
                          </div>
                      </div>
                  </div>
  
                  <!-- Center Logo (stationary) - x=223.93, y=233.45, w=145.68, h=145.68 -->
                  <div class="absolute w-[146px] h-[146px] bg-mokshya-dark rounded-full shadow-2xl flex flex-col items-center justify-center text-white z-20 border border-white/10" style="left: 223.93px; top: 233.45px; transform: translate(0, 0);">
                      <div class="bg-mokshya-dark/5 rounded-full absolute inset-[7.45px]"></div>
                      <div class="relative z-10 flex flex-col items-center gap-1.5">
                          <img :src="imgLogoIcon1" class="w-[52px] h-[60px] object-contain" alt="Mokshya OS Logo" />
                          <span class="font-bold text-[16.555px] tracking-[-0.4139px] leading-[23.177px]">Mokshya OS</span>
                      </div>
                  </div>
  
                  <!-- Badge at Bottom - x=189.44, y=392.38, w=222.41, h=24.83 -->
                  <div class="absolute backdrop-blur-sm bg-white/90 border border-mokshya-dark/20 rounded-full px-4 py-1.5 shadow-sm" style="left: 189.44px; top: 392.38px;   height: 24.83px; display: flex; align-items: center; justify-content: center;">
                      <span class="text-[9.933px] font-bold text-mokshya-dark uppercase tracking-[0.2483px] leading-[13.244px]">Unified Risk Intelligence Platform</span>
                  </div>
              </div>
  
              <!-- Mobile Grid Fallback -->
              <div class="grid grid-cols-2 gap-4 lg:hidden">
                   <div class="bg-mokshya-dark text-white p-6 rounded-xl flex flex-col items-center text-center">
                       <img :src="imgIcon22" class="w-8 h-8 mb-2" />
                       <span class="font-bold">CISO</span>
                   </div>
                   <div class="bg-mokshya-dark text-white p-6 rounded-xl flex flex-col items-center text-center">
                       <img :src="imgIcon21" class="w-8 h-8 mb-2" />
                       <span class="font-bold">CRO</span>
                   </div>
                   <div class="bg-mokshya-dark text-white p-6 rounded-xl flex flex-col items-center text-center">
                       <img :src="imgIcon23" class="w-8 h-8 mb-2" />
                       <span class="font-bold">CFO</span>
                   </div>
                   <div class="bg-mokshya-dark text-white p-6 rounded-xl flex flex-col items-center text-center">
                       <img :src="imgIcon25" class="w-8 h-8 mb-2" />
                       <span class="font-bold">Underwriters</span>
                   </div>
                   <div class="bg-mokshya-dark text-white p-6 rounded-xl flex flex-col items-center text-center">
                       <img :src="imgIcon24" class="w-8 h-8 mb-2" />
                       <span class="font-bold">Board</span>
                   </div>
                   <div class="bg-mokshya-dark text-white p-6 rounded-xl flex flex-col items-center text-center">
                       <img :src="imgIcon20" class="w-8 h-8 mb-2" />
                       <span class="font-bold">Risk Mgrs</span>
                   </div>
              </div>
          </UContainer>
      </div>
  
      <!-- About / Accordion Section -->
      <div class="py-24 bg-mokshya-light">
          <UContainer>
              <div class="lg:grid lg:grid-cols-12 gap-16">
                  <div class="lg:col-span-5 text-center lg:text-left">
                       <span class="text-mokshya-dark font-bold uppercase tracking-widest text-xs block mb-4">About Us</span>
                       <h2 class="text-4xl font-bold text-mokshya-text mb-8">Bridging the Gap</h2>
                       <p class="text-lg text-mokshya-gray leading-relaxed">
                          Mokshya was founded on a simple belief: security shouldn't be a black box. By translating complex cyber signals into financial language, we empower organizations to make smarter risk decisions and secure the right insurance coverage at the right price.
                       </p>
                  </div>
                  <div class="lg:col-span-7 mt-12 lg:mt-0 space-y-6">
                      <!-- Custom Accordion using standard HTML/Vue -->
                      <div v-for="(item, index) in faqItems" :key="index" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300" :class="{ 'ring-2 ring-mokshya-green/20': activeAccordion === index }">
                          <button @click="toggleAccordion(index)" class="w-full flex items-center justify-between p-6 text-left font-bold text-xl text-mokshya-text hover:bg-gray-50 transition-colors">
                              <span>{{ item.q }}</span>
                              <img :src="imgPlus" class="w-6 h-6 transform transition-transform duration-300" :class="{ 'rotate-45': activeAccordion === index }" />
                          </button>
                          <div class="overflow-hidden transition-all duration-300 ease-in-out" :style="{ maxHeight: activeAccordion === index ? '200px' : '0' }">
                              <div class="p-6 pt-0 text-mokshya-gray leading-relaxed">
                                  {{ item.a }}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </UContainer>
      </div>
  
      <!-- Footer CTA -->
      <div class="relative py-32 overflow-hidden bg-mokshya-dark">
          <!-- Glow Effects -->
          <div class="absolute top-1/2 -left-20 w-48 h-48 bg-mokshya-green/20 blur-[70px] rounded-full"></div>
          <div class="absolute top-1/2 -right-20 w-48 h-48 bg-mokshya-green/20 blur-[70px] rounded-full"></div>
          
          <UContainer class="relative z-10 text-center">
              <h2 class="text-4xl lg:text-5xl font-bold text-white mb-6">Make Cyber Risk a Business Decision.</h2>
              <p class="text-gray-300 text-xl mb-12">Clear risk signals. Confident insurance decisions. Start your journey today.</p>
              <div class="flex flex-wrap justify-center gap-4">
                   <button class="bg-white text-mokshya-dark font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-100 transition-all">
                    Request a Demo
                  </button>
                  <button class="bg-transparent border border-white/20 text-white font-bold py-3 px-8 rounded-lg hover:bg-white/10 transition-all">
                    Contact Us
                  </button>
              </div>
          </UContainer>
      </div>
    </div>
  </template>
  
  <style scoped>
  /* Any highly specific layout tweaks from Figma that can't be handled by Tailwind */
  </style>
  