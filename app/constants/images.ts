/**
 * Image asset constants
 * All Figma image URLs and local images are centralized here for easy management
 */

// Import local images directly - Vite will process these at build time
import assessRiskIcon from '~/assets/images/landing/assess.png'
import analyzeRiskIcon from '~/assets/images/landing/analyze.png'
import decideActIcon from '~/assets/images/landing/decide.png'
import dashboardPreview from '~/assets/images/landing/dashboard.svg'
import logoIcon from '~/assets/images/logo.png'

export const IMAGES = {
  // Local feature card images
  logoIcon,
  assessRiskIcon,
  analyzeRiskIcon,
  decideActIcon,
  dashboardPreview,
  // User avatars for social proof
  avatar1: 'https://www.figma.com/api/mcp/asset/1070b3e4-c788-4120-85dd-f93e5bdbaea0',
  avatar2: 'https://www.figma.com/api/mcp/asset/7a1d0f88-39c0-44c0-bdc7-586dcc21967e',
  avatar3: 'https://www.figma.com/api/mcp/asset/1abb31bd-18c9-4037-a706-1e1c3dd6c1d2',

  // Feature illustrations
  // assessRisk: 'https://www.figma.com/api/mcp/asset/2deefa85-2da3-479f-9183-5be1c68b6ab2',
  // analyzeRisk: 'https://www.figma.com/api/mcp/asset/34aa53bb-f4d4-4087-8ac2-ee861c3696a3',
  // decideAct: 'https://www.figma.com/api/mcp/asset/2570011c-7f2c-47d3-985a-bbc8d23a5f04',

  // Dashboard icons
  gradient: 'https://www.figma.com/api/mcp/asset/91aacb77-a6bb-4678-98d2-f08850c9b163',
  trendIcon: 'https://www.figma.com/api/mcp/asset/cfa0c888-bd12-49e0-b78e-021722cd6b3e',
  chartIcon: 'https://www.figma.com/api/mcp/asset/ce227972-cef8-4362-a210-ca06585a72c8',
  alertIcon: 'https://www.figma.com/api/mcp/asset/201a8054-060a-4110-a0fe-a612215f4d34',
  complianceIcon: 'https://www.figma.com/api/mcp/asset/3a8b4425-1fbe-44ab-880f-59d8fdc955a2',

  // How it works icons
  connectIcon: 'https://www.figma.com/api/mcp/asset/d1197255-8a67-4f95-989b-464730b986cc',
  analyzeIcon: 'https://www.figma.com/api/mcp/asset/5b0b5e4b-3c52-421a-9098-8a17637ce8aa',
  decideIcon: 'https://www.figma.com/api/mcp/asset/620aa9d8-1c82-471b-8f48-d1766d71685d',

  // Target audience icons
  riskMgrs: 'https://www.figma.com/api/mcp/asset/24855bba-e504-473d-bab3-02746a7dff42',
  cro: 'https://www.figma.com/api/mcp/asset/7077dc6c-5892-4dc6-b2fd-bdd5f688fcd6',
  ciso: 'https://www.figma.com/api/mcp/asset/e1f5f3f1-e157-47bf-8861-d1a3475f8eb7',
  cfo: 'https://www.figma.com/api/mcp/asset/52e3d001-2d10-45f1-abc8-70fb382d52e1',
  boardMembers: 'https://www.figma.com/api/mcp/asset/c99a13aa-b559-4617-9ec0-d97d9182118e',
  underwriters: 'https://www.figma.com/api/mcp/asset/1de5420a-5b4e-46bb-af93-03f8cc03209a',

  // Other assets
  orbitalVector: 'https://www.figma.com/api/mcp/asset/c0957895-6585-44ab-9878-c5041f9a7004',
   
  plusIcon: 'https://www.figma.com/api/mcp/asset/aec0ea96-7183-4207-9561-d75d5bec7e42'
} as const


