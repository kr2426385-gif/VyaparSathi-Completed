import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search, ArrowRight, Lightbulb, Compass, Calculator,
  Landmark, ShieldCheck, CheckCircle2, ChevronRight,
  MapPin, Sparkles, Building2, TrendingUp, Users,
  FileText, Mic, BarChart3, HelpCircle, Briefcase,
  DollarSign, Check, ExternalLink, Sprout, Factory,
  Store, ArrowLeft, IndianRupee, Bot, MessageSquare, Zap,
  RotateCw, Layers, ShieldAlert, Target, RefreshCw, Eye,
  CheckCircle, ChevronLeft
} from 'lucide-react';
import { MAHARASHTRA_DISTRICTS } from '../utils/maharashtraData.js';
import { formatIndianCurrency, calculateFinancialMetrics } from '../utils/calculations.js';
import { VERIFIED_SCHEMES, matchSchemesClient } from '../utils/verifiedSchemesData.js';
import {
  BUSINESS_CATEGORIES,
  generateSIHFeasibilityCards,
  calculateSIHFinancialStructure
} from '../utils/sihFeasibilityData.js';
import { apiService } from '../services/api.js';
import OpportunityHeatmap from '../components/home/OpportunityHeatmap.jsx';

// Pan-India States & Major Enterprise Clusters
const INDIAN_STATES_AND_DISTRICTS = {
  "Maharashtra": ["Satara", "Pune", "Nashik", "Kolhapur", "Nagpur", "Chhatrapati Sambhajinagar", "Solapur", "Thane", "Amravati", "Jalgaon", "Ahmednagar", "Sangli", "Nanded"],
  "Uttar Pradesh": ["Varanasi", "Lucknow", "Gorakhpur", "Prayagraj", "Kanpur", "Agra", "Meerut", "Jhansi", "Bareilly", "Ayodhya"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Alwar", "Bhilwara", "Sikar"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Anand", "Mehsana", "Bhavnagar", "Jamnagar", "Kutch"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa", "Satna"],
  "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia", "Begusarai", "Nalanda"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi-Dharwad", "Belagavi", "Mangaluru", "Tumakuru", "Shivamogga", "Mandya"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore"],
  "West Bengal": ["Kolkata", "Howrah", "Siliguri", "Durgapur", "Asansol", "Bardhaman", "Murshidabad", "Darjeeling"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Hoshiarpur", "Mohali"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar", "Rohtak"],
  "Meghalaya": ["East Khasi Hills", "West Khasi Hills", "Ri Bhoi", "West Garo Hills", "East Jaintia Hills"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Pakyong", "Soreng"],
  "Assam": ["Guwahati (Kamrup)", "Dibrugarh", "Silchar", "Jorhat", "Nagaon", "Tinsukia", "Tezpur"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Kurnool", "Nellore"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
  "Kerala": ["Thiruvananthapuram", "Kochi (Ernakulam)", "Kozhikode", "Thrissur", "Kollam", "Palakkad"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Balasore"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon"],
  "Himachal Pradesh": ["Shimla", "Dharamshala (Kangra)", "Mandi", "Solan", "Kullu"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Nainital", "Rishikesh", "Udhamsingh Nagar"],
  "Jammu & Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur"]
};



const HERO_THEME_SLIDES = [
  {
    id: 'agriculture',
    name: 'Agriculture',
    nameMr: 'शेती व कृषी व्यवसाय',
    subtitle: 'High-Yield Farming & Agri Enterprises',
    image: '/images/hero-agriculture.jpg',
    icon: Sprout
  },
  {
    id: 'foodtech',
    name: 'FoodTech',
    nameMr: 'अन्न प्रक्रिया उद्योग',
    subtitle: 'Agro-Processing & Value Addition',
    image: '/images/hero-foodtech.jpg',
    icon: Factory
  },
  {
    id: 'rural-development',
    name: 'Rural Development',
    nameMr: 'ग्रामीण विकास व उद्योग',
    subtitle: 'Village Clusters & Artisan Enterprises',
    image: '/images/hero-rural-development.jpg',
    icon: Building2
  }
];

const STATE_LINKAGE_CARDS = [
  {
    id: 'maharashtra',
    name: 'MAHARASHTRA',
    tagline: 'The State of Maharashtra • India',
    image: '/images/state-linkage-maharashtra.jpg',
    description: "India's second-most populous state, located in the western region, known as the nation's financial powerhouse with its capital Mumbai.",
    route: '/schemes/match',
    district: 'Satara'
  },
  {
    id: 'meghalaya',
    name: 'MEGHALAYA',
    tagline: 'Scotland of the East • India',
    image: '/images/state-linkage-meghalaya.jpg',
    description: "Meghalaya, known as the Abode of Clouds, is a beautiful northeastern state of India famous for its rolling hills, heavy rainfall, and organic spices.",
    route: '/business-ideas/discover',
    district: 'East Khasi Hills'
  },
  {
    id: 'rajasthan',
    name: 'RAJASTHAN',
    tagline: 'The Land of Kings • India',
    image: '/images/state-linkage-rajasthan.jpg',
    description: "Rajasthan, the Land of Kings, is India's largest state known for its grand forts, royal palaces, vast deserts, colorful culture, and historic trading corridors.",
    route: '/market/local-demand',
    district: 'Jaipur'
  },
  {
    id: 'sikkim',
    name: 'SIKKIM',
    tagline: 'The Rivers and Mountains • Himalayan Beauty',
    image: '/images/state-linkage-sikkim.jpg',
    description: "The Sikkim is gifted with good fertile land and natural resources with unique bio-diversity, pioneering 100% organic farming and eco-enterprise development.",
    route: '/journey/idea',
    district: 'Gangtok'
  }
];

export default function Home({ user, onNavigate, onOpenAuth, onTriggerVoice }) {
  const { t, i18n } = useTranslation();

  // Hero query input
  const [heroSearch, setHeroSearch] = useState('');

  // Hero theme background rotation state (6000ms interval)
  const [activeThemeSlide, setActiveThemeSlide] = useState(0);

  useEffect(() => {
    // Respect user's motion preferences
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const interval = setInterval(() => {
      setActiveThemeSlide((prev) => (prev + 1) % HERO_THEME_SLIDES.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Journey pathway scroll entrance animation (IntersectionObserver)
  const journeySectionRef = useRef(null);
  const [journeyVisible, setJourneyVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setJourneyVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setJourneyVisible(true);
          observer.disconnect(); // Animate once
        }
      },
      { threshold: 0.15 }
    );

    if (journeySectionRef.current) {
      observer.observe(journeySectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Flip-card active toggle state for touch & mobile devices
  const [flippedCardId, setFlippedCardId] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);


  // SIH26091 Hyper-Local Input & Feasibility State (Pan-India)
  const [village, setVillage] = useState(user?.village || '');
  const [block, setBlock] = useState(user?.block || '');
  const [selectedState, setSelectedState] = useState(user?.state || 'Maharashtra');
  const [district, setDistrict] = useState(user?.district || 'Satara');
  const [bizType, setBizType] = useState('Dairy');
  const [marginCapital, setMarginCapital] = useState(100000);
  const [stage, setStage] = useState('new');
  const [goal, setGoal] = useState('Planning & Project Report (DPR)');
  const [hasBuiltPlan, setHasBuiltPlan] = useState(true);
  const [formError, setFormError] = useState('');

  // SIH26091 3D Information Pillars State & Auto-Rotation
  const [activePillarIndex, setActivePillarIndex] = useState(0);
  const [isPillarFlipped, setIsPillarFlipped] = useState(false);
  const [isPillarHovered, setIsPillarHovered] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Auto-rotation every 4.5 seconds (pauses on hover or when card is flipped)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    if (isPillarHovered || isPillarFlipped) return;

    const autoRotateTimer = setInterval(() => {
      setActivePillarIndex((prev) => (prev + 1) % 6);
    }, 4500);

    return () => clearInterval(autoRotateTimer);
  }, [isPillarHovered, isPillarFlipped]);

  // Dynamic Feasibility & Financial Data based on user's entered Village, Block, District, Biz Category & Margin
  const sihPillarCards = generateSIHFeasibilityCards({
    village,
    block,
    district,
    bizCategory: bizType,
    marginCapital
  });

  const sihFinStructure = calculateSIHFinancialStructure(marginCapital);

  // Pillar Carousel Navigation Handlers
  const handleNextPillarCard = (e) => {
    e?.stopPropagation();
    setIsPillarFlipped(false);
    setActivePillarIndex((prev) => (prev + 1) % sihPillarCards.length);
  };

  const handlePrevPillarCard = (e) => {
    e?.stopPropagation();
    setIsPillarFlipped(false);
    setActivePillarIndex((prev) => (prev - 1 + sihPillarCards.length) % sihPillarCards.length);
  };

  const handleSelectPillar = (idx) => {
    if (idx === activePillarIndex) {
      setIsPillarFlipped((prev) => !prev);
    } else {
      setIsPillarFlipped(false);
      setActivePillarIndex(idx);
    }
  };

  const handleTogglePillarFlip = (e) => {
    e?.stopPropagation();
    setIsPillarFlipped((prev) => !prev);
  };



  // State Government Linkage Carousel State
  const stateCarouselRef = useRef(null);
  const [hoveredStateId, setHoveredStateId] = useState(null);

  const scrollStateCarousel = (direction) => {
    if (stateCarouselRef.current) {
      const scrollAmount = direction === 'left' ? -390 : 390;
      stateCarouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Calculations based on user's project cost
  const investment = sihFinStructure.projectCost;
  const ownContribution = sihFinStructure.marginCapital;
  const financialMetrics = calculateFinancialMetrics({
    investmentRequirement: Number(investment) || 1000000,
    ownContribution: ownContribution,
    monthlyRevenue: Math.round(investment * 0.22),
    monthlyExpenses: Math.round(investment * 0.13),
    existingDebt: 0,
    cashInHand: Math.round(investment * 0.08),
    loanTenureMonths: 60,
    annualInterestRate: 9.0
  });

  // Matched schemes based on personalization
  const matchedSchemes = matchSchemesClient({
    state: selectedState,
    businessType: bizType,
    investmentRequirement: Number(investment) || 1000000,
    businessStage: stage,
    isRural: true
  });

  const topScheme = matchedSchemes[0] || VERIFIED_SCHEMES[0];
  const secondScheme = matchedSchemes[1] || VERIFIED_SCHEMES[1];

  const handleHeroSearchSubmit = (e) => {
    e?.preventDefault();
    if (!heroSearch.trim()) return;
    const q = heroSearch.toLowerCase();
    if (q.includes('idea') || q.includes('start') || q.includes('advisor')) {
      onNavigate('advisor');
    } else if (q.includes('market') || q.includes('demand') || q.includes('price')) {
      onNavigate('market');
    } else if (q.includes('fund') || q.includes('loan') || q.includes('emi') || q.includes('calc')) {
      onNavigate('planning');
    } else if (q.includes('ready') || q.includes('dpr') || q.includes('report')) {
      onNavigate('loanready');
    } else {
      onNavigate('schemes');
    }
  };

  const handleBuildPlan = (e) => {
    e?.preventDefault();
    if (!bizType || !district || !marginCapital || Number(marginCapital) <= 0) {
      setFormError('Please select your business type, district and margin capital to continue.');
      return;
    }
    setFormError('');
    setHasBuiltPlan(true);
    // Persist to storage for consistency across tabs
    apiService.saveProfile({
      name: user?.name || 'Rural Entrepreneur',
      village,
      block,
      district,
      businessType: bizType,
      businessStage: stage,
      businessGoal: goal,
      investmentRequirement: sihFinStructure.projectCost,
      ownContribution: sihFinStructure.marginCapital,
      monthlyRevenue: Math.round(sihFinStructure.projectCost * 0.22),
      monthlyExpenses: Math.round(sihFinStructure.projectCost * 0.13)
    });
  };

  const handleLoadDemo = (type) => {
    if (type === 'dairy') {
      setBizType('Dairy');
      setDistrict('Satara');
      setInvestment(650000);
      setStage('new');
      setGoal('Purchase modern high-yield cattle & modern shed');
    } else if (type === 'food') {
      setBizType('Food Processing');
      setDistrict('Kolhapur');
      setInvestment(1200000);
      setStage('existing');
      setGoal('Install automated turmeric polishing & pouch packaging unit');
    }
    setHasBuiltPlan(true);
  };

  // 6 Journey Milestones Definition (Light, clean, research-aligned rural business steps)
  const journeyMilestones = [
    {
      id: 'idea',
      stepNum: '01',
      stageLabel: t('journey.step_idea', { defaultValue: 'Idea' }),
      title: t('journey.idea_title', { defaultValue: 'Shape Your Business Idea' }),
      backTitle: t('journey.idea_title', { defaultValue: 'Shape Your Business Idea' }),
      desc: t('journey.idea_desc', { defaultValue: 'Turn your skill or local resource into a practical venture.' }),
      bullets: [
        t('journey.idea_bullet_1', { defaultValue: 'Find a practical opportunity around local skills and resources' }),
        t('journey.idea_bullet_2', { defaultValue: 'Check raw materials and basic feasibility' }),
        t('journey.idea_bullet_3', { defaultValue: 'Identify ways to add value' })
      ],
      icon: Lightbulb,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200/60',
      stepBorder: 'border-amber-400 text-amber-600',
      activeStepBg: 'bg-amber-400 text-stone-950 border-amber-400',
      image: '/assets/images/vyaparsathi-journey-idea.webp',
      tab: '/journey/idea'
    },
    {
      id: 'market',
      stepNum: '02',
      stageLabel: t('journey.step_market', { defaultValue: 'Market' }),
      title: t('journey.market_title', { defaultValue: 'Understand Your Market' }),
      backTitle: t('journey.market_title', { defaultValue: 'Understand Your Market' }),
      desc: t('journey.market_desc', { defaultValue: 'Check local demand, nearby buyers and weekly APMC channels.' }),
      bullets: [
        t('journey.market_bullet_1', { defaultValue: 'Check local demand and nearby buyers' }),
        t('journey.market_bullet_2', { defaultValue: 'Explore channels such as local markets and APMCs' }),
        t('journey.market_bullet_3', { defaultValue: 'Compare pricing and competition' })
      ],
      icon: Store,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
      stepBorder: 'border-emerald-500 text-emerald-600',
      activeStepBg: 'bg-emerald-500 text-white border-emerald-500',
      image: '/assets/images/vyaparsathi-journey-market.webp',
      tab: '/journey/market'
    },
    {
      id: 'planning',
      stepNum: '03',
      stageLabel: t('journey.step_finance', { defaultValue: 'Finance' }),
      title: t('journey.finance_title', { defaultValue: 'Plan Your Finances' }),
      backTitle: t('journey.finance_title', { defaultValue: 'Plan Your Finances' }),
      desc: t('journey.finance_desc', { defaultValue: 'Estimate setup costs, monthly expenses and working capital.' }),
      bullets: [
        t('journey.finance_bullet_1', { defaultValue: 'Estimate setup and operating costs' }),
        t('journey.finance_bullet_2', { defaultValue: 'Plan income, expenses and working capital' }),
        t('journey.finance_bullet_3', { defaultValue: 'Understand EMI, cash flow and break-even' })
      ],
      icon: Calculator,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-200/60',
      stepBorder: 'border-blue-500 text-blue-600',
      activeStepBg: 'bg-blue-600 text-white border-blue-600',
      image: '/assets/images/vyaparsathi-journey-finance.webp',
      tab: '/journey/finance'
    },
    {
      id: 'schemes',
      stepNum: '04',
      stageLabel: t('journey.step_schemes', { defaultValue: 'Schemes' }),
      title: t('journey.schemes_title', { defaultValue: 'Find the Right Support' }),
      backTitle: t('journey.schemes_title', { defaultValue: 'Find the Right Support' }),
      desc: t('journey.schemes_desc', { defaultValue: 'Explore government subsidies, grants and scheme eligibility.' }),
      bullets: [
        t('journey.schemes_bullet_1', { defaultValue: 'Explore relevant government schemes' }),
        t('journey.schemes_bullet_2', { defaultValue: 'Check subsidy and incentive possibilities' }),
        t('journey.schemes_bullet_3', { defaultValue: 'Understand eligibility and application requirements' }),
        t('journey.schemes_bullet_4', { defaultValue: 'Examples where relevant: PMFME, CMEGP, MUDRA' })
      ],
      icon: Landmark,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200/60',
      stepBorder: 'border-amber-400 text-amber-600',
      activeStepBg: 'bg-amber-400 text-stone-950 border-amber-400',
      image: '/assets/images/vyaparsathi-journey-schemes.webp',
      tab: '/journey/schemes'
    },
    {
      id: 'loanready',
      stepNum: '05',
      stageLabel: t('journey.step_loan', { defaultValue: 'Loan Ready' }),
      title: t('journey.loan_title', { defaultValue: 'Get Loan Ready' }),
      backTitle: t('journey.loan_title', { defaultValue: 'Prepare for Finance' }),
      desc: t('journey.loan_desc', { defaultValue: 'Organise project dossier, papers and bank credit readiness.' }),
      bullets: [
        t('journey.loan_bullet_1', { defaultValue: 'Organise business and project information' }),
        t('journey.loan_bullet_2', { defaultValue: 'Prepare DPR and project details' }),
        t('journey.loan_bullet_3', { defaultValue: 'Understand lender requirements, repayment and credit readiness' })
      ],
      icon: FileText,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200/60',
      stepBorder: 'border-indigo-500 text-indigo-600',
      activeStepBg: 'bg-indigo-600 text-white border-indigo-600',
      image: '/assets/images/vyaparsathi-journey-loan-ready.webp',
      tab: '/journey/loan-ready'
    },
    {
      id: 'growth',
      stepNum: '06',
      stageLabel: t('journey.step_growth', { defaultValue: 'Growth' }),
      title: t('journey.growth_title', { defaultValue: 'Grow Your Enterprise' }),
      backTitle: t('journey.growth_title', { defaultValue: 'Grow Your Enterprise' }),
      desc: t('journey.growth_desc', { defaultValue: 'Improve production, reach new markets and build linkages.' }),
      bullets: [
        t('journey.growth_bullet_1', { defaultValue: 'Improve production and operations' }),
        t('journey.growth_bullet_2', { defaultValue: 'Reach new customers and markets' }),
        t('journey.growth_bullet_3', { defaultValue: 'Explore local support, clusters and business linkages' })
      ],
      icon: TrendingUp,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
      stepBorder: 'border-emerald-500 text-emerald-600',
      activeStepBg: 'bg-emerald-500 text-white border-emerald-500',
      image: '/assets/images/vyaparsathi-journey-growth.webp',
      tab: '/journey/growth'
    }
  ];

  // 4 Hero Action Cards Definition with authentic themed visuals
  const heroActionCards = [
    {
      id: 'start-business',
      title: t('hero.start_business_title', { defaultValue: 'Start a Business' }),
      desc: t('hero.start_business_desc', { defaultValue: 'Fill business profile & build customized roadmap' }),
      icon: Briefcase,
      iconBg: 'bg-amber-400 text-stone-950',
      bgImage: '/images/hero-agriculture.jpg',
      themeTag: 'Agriculture',
      onClick: () => {
        const el = document.getElementById('personalization-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 'business-ideas',
      title: t('hero.find_ideas_title', { defaultValue: 'Find Business Ideas' }),
      desc: t('hero.find_ideas_desc', { defaultValue: 'Explore high-margin agro & village enterprise models' }),
      icon: Lightbulb,
      iconBg: 'bg-blue-500 text-white',
      bgImage: '/images/hero-foodtech.jpg',
      themeTag: 'FoodTech',
      onClick: () => onNavigate('/business-ideas/discover')
    },
    {
      id: 'find-funding',
      title: t('hero.find_funding_title', { defaultValue: 'Find Funding' }),
      desc: t('hero.find_funding_desc', { defaultValue: 'Calculate project cost, own margin & monthly EMI' }),
      icon: Calculator,
      iconBg: 'bg-emerald-500 text-white',
      bgImage: '/images/business-finance.jpg',
      themeTag: 'Finance',
      onClick: () => onNavigate('/finance/project-cost')
    },
    {
      id: 'find-scheme',
      title: t('hero.find_scheme_title', { defaultValue: 'Find a Scheme' }),
      desc: t('hero.find_scheme_desc', { defaultValue: 'Match CMEGP, PMFME, MUDRA with up to 35% subsidy' }),
      icon: Landmark,
      iconBg: 'bg-amber-400 text-stone-950',
      bgImage: '/images/hero-rural-development.jpg',
      themeTag: 'Rural Dev',
      onClick: () => onNavigate('/schemes/discover')
    }
  ];

  return (
    <div className="space-y-10 pb-12 select-none">

      {/* 1. HERO SECTION: "WHAT DO YOU WANT TO DO?" & 4 THEMED ACTIONS */}
      <section className="relative w-full bg-[#071d37] text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#13315c] shadow-lg overflow-hidden">

        {/* Full-Bleed Thematic Background Images (Agriculture, FoodTech, Rural Development) */}
        {HERO_THEME_SLIDES.map((slide, idx) => {
          const isActive = idx === activeThemeSlide;
          return (
            <img
              key={slide.id}
              src={slide.image}
              alt={slide.name}
              aria-hidden="true"
              className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ease-in-out pointer-events-none filter brightness-110 contrast-105 saturate-110 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
            />
          );
        })}

        {/* Refined Translucent Gradient: Vibrant image visibility while keeping text 100% readable */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(6, 20, 40, 0.40) 0%, rgba(8, 28, 55, 0.55) 45%, rgba(5, 17, 34, 0.78) 100%)'
          }}
          aria-hidden="true"
        />
        {/* Bottom subtle gradient vignette to blend into next section */}
        <div
          className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(5, 17, 34, 0.95) 0%, rgba(5, 17, 34, 0.40) 60%, transparent 100%)'
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-5xl mx-auto space-y-6 text-center">

          {/* Main Question Heading */}
          <div className="space-y-2 max-w-3xl mx-auto">
            <h1 className="text-[26px] sm:text-[32px] lg:text-[38px] font-bold tracking-tight font-sans text-white drop-shadow-md leading-[1.2]">
              {t('home.hero_h1', { defaultValue: 'Plan your rural enterprise step by step' })}
            </h1>
            <p className="text-sm sm:text-[15px] text-stone-200 font-normal leading-relaxed drop-shadow-sm">
              {t('home.hero_subtitle', { defaultValue: 'From business discovery to local market trends, banking finance, government subsidies, and loan readiness — tailored for Indian MSMEs.' })}
            </p>
          </div>

          {/* Large Search / Input Bar */}
          <div className="max-w-3xl mx-auto pt-1">
            <form
              onSubmit={handleHeroSearchSubmit}
              className="bg-white rounded-2xl md:rounded-full p-2 shadow-2xl flex flex-col md:flex-row items-center gap-2 border-2 border-amber-400/80"
            >
              <div className="flex-1 flex items-center px-3.5 w-full">
                <Search size={18} className="text-stone-400 shrink-0 mr-2.5" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder={t('home.search_placeholder', { defaultValue: 'Search schemes, funding, business ideas, or ask anything...' })}
                  className="w-full text-xs sm:text-sm font-semibold text-stone-900 placeholder-stone-400 bg-transparent focus:outline-none min-h-[42px]"
                />
                {onTriggerVoice && (
                  <button
                    type="button"
                    onClick={onTriggerVoice}
                    title={t('header.voice_search_title', { defaultValue: 'Voice Assistant' })}
                    className="p-1.5 text-stone-400 hover:text-amber-600 transition-colors ml-1"
                  >
                    <Mic size={18} />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-7 py-3 rounded-xl md:rounded-full bg-[#0b2545] hover:bg-[#13315c] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 shrink-0"
              >
                <span>{t('home.search_button', { defaultValue: 'Search' })}</span>
                <ArrowRight size={15} />
              </button>
            </form>
          </div>

          {/* Thematic Carousel Logo-Only Buttons: Agriculture | FoodTech | Rural Development */}
          <div className="flex items-center justify-center gap-2 pt-0.5">
            <div className="inline-flex items-center gap-2.5 p-1.5 rounded-full bg-stone-950/65 backdrop-blur-md border border-white/25 shadow-2xl">
              {HERO_THEME_SLIDES.map((slide, idx) => {
                const isActive = idx === activeThemeSlide;
                const IconComp = slide.icon;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveThemeSlide(idx)}
                    title={`${slide.name} • ${slide.nameMr}`}
                    className={`relative group flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 ${isActive
                        ? 'bg-amber-400 text-stone-950 shadow-xl scale-110 ring-2 ring-amber-300 ring-offset-2 ring-offset-[#071d37]'
                        : 'text-stone-300 hover:text-white hover:bg-white/20'
                      }`}
                    aria-label={`Switch theme to ${slide.name}`}
                  >
                    <IconComp size={22} className="shrink-0 transition-transform group-hover:scale-115" />

                    {/* Floating Tooltip on hover & focus */}
                    <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap bg-stone-950/95 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg border border-white/15 z-30">
                      {slide.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4 Clear Actions with Highly Visible Themed Background Images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 pt-3 text-left">
            {heroActionCards.map((card) => {
              const IconComp = card.icon;
              return (
                <div
                  key={card.id}
                  onClick={card.onClick}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      card.onClick();
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${card.title} - ${card.desc}`}
                  className="relative rounded-2xl overflow-hidden border border-white/25 hover:border-amber-400/95 shadow-xl hover:shadow-2xl cursor-pointer transition-all duration-300 md:hover:-translate-y-1.5 group flex flex-col justify-between p-5 min-h-[175px] sm:min-h-[190px] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 bg-[#071d37]/75 backdrop-blur-sm"
                >
                  {/* Layer 1: Themed Card Background Image with gentle hover zoom */}
                  <img
                    src={card.bgImage}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out pointer-events-none filter brightness-110 contrast-105"
                  />

                  {/* Layer 2: Card Translucent Overlay - crystal clear at top, high-contrast dark scrim at bottom */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(to top, rgba(5, 17, 34, 0.94) 0%, rgba(6, 22, 45, 0.65) 50%, rgba(6, 22, 45, 0.30) 100%)'
                    }}
                    aria-hidden="true"
                  />
                  {/* Subtle directional vignette & bottom scrim for maximum text contrast */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to top, rgba(4, 14, 28, 0.98) 0%, rgba(4, 14, 28, 0.60) 60%, transparent 100%)'
                    }}
                    aria-hidden="true"
                  />

                  {/* Layer 3: Card Header with Upgraded Logo Badge & Chevron */}
                  <div className="relative z-10 flex items-center justify-between pb-3">
                    <span className={`w-11 h-11 rounded-2xl ${card.iconBg} flex items-center justify-center font-black shadow-xl ring-2 ring-white/25 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComp size={21} />
                    </span>
                    <ChevronRight size={19} className="text-stone-300 group-hover:text-amber-400 group-hover:translate-x-1.5 transition-all" />
                  </div>

                  {/* Layer 4: Card Title, Description */}
                  <div className="relative z-10 pt-2 space-y-1">
                    <h3 className="text-[18px] sm:text-[19px] font-bold text-white tracking-tight leading-[1.35] drop-shadow-md">
                      {card.title}
                    </h3>
                    <p className="text-sm sm:text-[15px] text-stone-200 leading-[1.5] font-normal drop-shadow-sm">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 2. "YOUR 6-STEP BUSINESS JOURNEY" SECTION (Full Screen Width, Professional Blue & Rural Development Green Theme) */}
      <section
        ref={journeySectionRef}
        id="business-journey"
        aria-label={t('journey.title', { defaultValue: 'Your 6-Step Business Journey' })}
        className="w-full relative z-10 !mt-0 py-8 sm:py-12 border-b border-[#0a2342]/10 overflow-hidden select-none scroll-mt-20 transition-all"
        style={{
          background: 'linear-gradient(180deg, #d7e6f6 0%, #e1eff9 22%, #eaf4f0 60%, #eef7f3 100%)'
        }}
      >
        {/* Top Joint Accent Line: Soft blue highlight connecting with hero above */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#2563eb]/40 to-transparent" aria-hidden="true" />

        {/* Subtle visual texture (clean, elegant navy micro-dots across full screen) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: 'radial-gradient(#0a2342 0.75px, transparent 0.75px)',
            backgroundSize: '24px 24px'
          }}
          aria-hidden="true"
        />

        {/* Ambient light accents: soft navy glow top, warm golden-yellow center, rural development green base */}
        <div className="absolute -top-24 left-1/4 w-[500px] h-64 bg-[#0a2342]/[0.06] rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute top-1/3 right-12 w-96 h-96 bg-amber-400/[0.08] rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-20 left-12 w-96 h-96 bg-emerald-600/[0.07] rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        {/* Centered Content Container across full screen */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header: Clean centered journey introduction */}
          <div className={`text-center max-w-2xl mx-auto transition-all duration-700 ${journeyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
            {/* Visual Mark: Dual-tone sprout (green & gold) */}
            <div className="flex justify-center mb-2.5">
              <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xs" aria-hidden="true">
                <path d="M18 31V18" stroke="#0a2342" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M18 20C13.5 20 9.5 15.5 9.5 10.5C14.5 10.5 18 14.5 18 20Z" fill="#16a34a" />
                <path d="M18 17C22.5 17 26.5 12.5 26.5 7.5C21.5 7.5 18 11.5 18 17Z" fill="#e59b10" />
              </svg>
            </div>

            <h2 className="text-[22px] sm:text-[26px] lg:text-[30px] font-bold text-[#0a2342] tracking-tight leading-[1.25]">
              {t('home.six_step_journey', { defaultValue: 'Your 6-Step Business Journey' })}
            </h2>
            <p className="mt-2 text-sm sm:text-[15px] text-stone-600 font-normal leading-[1.5]">
              {t('home.journey_subheading', { defaultValue: 'From a small idea to a growing enterprise — the right support at every step.' })}
            </p>
          </div>

          {/* Connected 6-Step Progress Indicator (Desktop & Tablet) */}
          <div className="hidden sm:block relative py-6 max-w-4xl mx-auto">
            {/* Connecting Base Line */}
            <div className="absolute top-10 left-12 right-12 h-0.5 bg-stone-200 z-0" />
            <div className="relative grid grid-cols-6 z-10">
              {journeyMilestones.map((m, idx) => {
                const isSelected = (hoveredCardId === m.id) || (flippedCardId === m.id) || (!hoveredCardId && !flippedCardId && idx === 0);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFlippedCardId(flippedCardId === m.id ? null : m.id)}
                    onMouseEnter={() => setHoveredCardId(m.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    className="flex flex-col items-center cursor-pointer group focus:outline-none"
                    aria-label={`Step ${m.stepNum}: ${m.stageLabel}`}
                  >
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all duration-300 shadow-xs ${isSelected
                        ? 'bg-[#e59b10] border-[#e59b10] text-stone-950 scale-110 shadow-sm'
                        : `bg-white ${m.stepBorder} group-hover:scale-105 group-hover:border-[#e59b10] group-hover:text-[#e59b10]`
                      }`}>
                      {m.stepNum}
                    </div>
                    <span className={`mt-2 text-xs font-bold transition-colors ${isSelected ? 'text-[#e59b10]' : 'text-stone-700 group-hover:text-[#0a2342]'
                      }`}>
                      {m.stageLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Connected 6-Step Progress Indicator (Mobile Compact Horizontal Sequence - No Scroll) */}
          <div className="sm:hidden relative py-3 my-1">
            <div className="flex items-center justify-between relative">
              {/* Connecting Line */}
              <div className="absolute top-3.5 left-3 right-3 h-0.5 bg-stone-200 z-0" />
              {journeyMilestones.map((m, idx) => {
                const isSelected = (hoveredCardId === m.id) || (flippedCardId === m.id) || (!hoveredCardId && !flippedCardId && idx === 0);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFlippedCardId(flippedCardId === m.id ? null : m.id)}
                    className="relative z-10 flex flex-col items-center focus:outline-none"
                    aria-label={`Step ${m.stepNum}: ${m.stageLabel}`}
                  >
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all shadow-xs ${isSelected
                        ? 'bg-[#e59b10] border-[#e59b10] text-stone-950 scale-110'
                        : `bg-white ${m.stepBorder}`
                      }`}>
                      {m.stepNum}
                    </div>
                    <span className={`mt-1 text-[10px] font-bold tracking-tight ${isSelected ? 'text-[#e59b10]' : 'text-stone-600'
                      }`}>
                      {m.stageLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6 Journey Cards Grid (Desktop: Horizontal 6-card row, Mobile: Intentional vertical sequence) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 mt-2 sm:mt-4">
            {journeyMilestones.map((m, idx) => {
              const Icon = m.icon;
              const isFlipped = flippedCardId === m.id;
              const isSelected = (hoveredCardId === m.id) || isFlipped;

              return (
                <div
                  key={m.id}
                  onClick={() => setFlippedCardId(isFlipped ? null : m.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setFlippedCardId(isFlipped ? null : m.id);
                    }
                  }}
                  onMouseEnter={() => setHoveredCardId(m.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isFlipped}
                  aria-label={`Step ${m.stepNum}: ${m.title}. Click to ${isFlipped ? 'flip back to front' : 'view steps'}.`}
                  style={{
                    transitionDelay: journeyVisible ? `${idx * 60}ms` : '0ms'
                  }}
                  className={`journey-flip-card group relative h-[395px] sm:h-[405px] w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e59b10] transition-all duration-500 rounded-2xl ${journeyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    } ${isFlipped ? 'is-flipped' : ''}`}
                >
                  <div className={`journey-flip-inner rounded-2xl transition-all duration-300 ${isSelected ? 'shadow-md ring-2 ring-amber-400/80' : 'shadow-xs hover:shadow-md'
                    }`}>

                    {/* 1ST SIDE (FRONT): Step Pill, Icon, Circular Photo, Stage Title, Short Desc, Action Label */}
                    <div className="journey-flip-front bg-white border border-stone-200/90 group-hover:border-amber-300 p-4 flex flex-col items-center justify-between text-center rounded-2xl transition-colors">

                      {/* Top Row: Step Badge & Icon */}
                      <div className="w-full flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200/70 text-stone-800 font-black text-[11px] tracking-wider">
                          {m.stepNum}
                        </span>
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center border shadow-2xs ${m.iconBg}`}>
                          <Icon size={16} strokeWidth={2.2} />
                        </span>
                      </div>

                      {/* Center: Prominent Circular Rural-Business Photo & Stage Title */}
                      <div className="my-auto flex flex-col items-center space-y-2.5 py-1">
                        <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-amber-200/80 shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-300">
                          <img
                            src={m.image}
                            alt={m.title}
                            className="w-full h-full object-cover object-center"
                            loading="lazy"
                          />
                        </div>

                        <div className="space-y-1 px-1">
                          <h3 className="text-[18px] sm:text-[19px] font-bold text-[#0a2342] tracking-tight leading-[1.35]">
                            {m.title}
                          </h3>
                          <p className="text-sm sm:text-[15px] text-stone-500 font-normal leading-[1.5] line-clamp-2">
                            {m.desc}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Action Label: "View Steps →" */}
                      <div className="pt-2 w-full">
                        <div className="w-full py-2 px-3 rounded-full border border-amber-300/80 bg-amber-50/60 group-hover:bg-amber-100 text-[#0a2342] font-semibold text-sm sm:text-[15px] flex items-center justify-center gap-1.5 transition-colors shadow-2xs min-h-[44px]">
                          <span>{t('home.view_steps', { defaultValue: 'View Steps' })}</span>
                          <ArrowRight size={13} className="text-[#e59b10]" />
                        </div>
                      </div>

                    </div>

                    {/* 2ND SIDE (BACK): Back button, Step, Back Title, Practical Bullets, Navigation CTA */}
                    <div className="journey-flip-back bg-[#fffdf9] border-2 border-amber-400 p-4 sm:p-4.5 flex flex-col justify-between text-left rounded-2xl shadow-md">

                      {/* Top Bar: "← Back" button & Step Number */}
                      <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/60">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFlippedCardId(null);
                          }}
                          className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1 p-1 -ml-1 cursor-pointer min-h-[36px]"
                          aria-label={t('common.back_to_front', { defaultValue: 'Back to front side' })}
                        >
                          <ArrowLeft size={13} className="text-stone-700" />
                          <span>{t('home.back', { defaultValue: 'Back' })}</span>
                        </button>
                        <span className="text-[10px] font-black text-stone-400 tracking-wider uppercase">
                          {t('journey.step_tag', { defaultValue: 'STEP' })} {m.stepNum}
                        </span>
                      </div>

                      {/* Title Area with Icon */}
                      <div className="flex items-center gap-2 pt-2 pb-1">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center border shrink-0 shadow-2xs ${m.iconBg}`}>
                          <Icon size={14} strokeWidth={2.2} />
                        </span>
                        <h4 className="text-xs sm:text-[13px] font-black text-[#0a2342] leading-snug">
                          {m.backTitle}
                        </h4>
                      </div>

                      {/* Bullet Points with Warm Yellow/Gold Checkmarks */}
                      <ul className="space-y-2 py-2 my-auto">
                        {m.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-1.5 text-[11px] text-stone-700 leading-snug font-medium">
                            <CheckCircle2 size={13} className="text-[#e59b10] shrink-0 mt-0.5" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Action Button: Opens actual stage route without breaking functionality */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate(m.tab);
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-[#e59b10] hover:bg-[#d97706] active:scale-[0.98] text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all min-h-[44px]"
                        >
                          <span>{t('home.view_steps', { defaultValue: 'View Steps' })}</span>
                          <ArrowRight size={13} className="text-stone-950" />
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Optional Clean Closing Message */}
          <div className="pt-5 pb-1 text-center">
            <p className="text-xs text-stone-500 font-medium">
              {t('home.journey_subheading', { defaultValue: 'Take one clear step at a time. Your business journey starts with an idea.' })}
            </p>
          </div>

        </div>
      </section>

      {/* 3. SIH26091 HYPER-LOCAL BUSINESS ADVISORY (6 MODERN INFORMATION PILLARS) */}
      <section
        id="hyper-local-advisory-section"
        aria-label={t('home.hyper_local_title', { defaultValue: 'Hyper-Local Business Advisory' })}
        className="w-full relative py-12 sm:py-16 select-none bg-[#faf8f5] border-y border-stone-200/80 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">



          {/* Centered Heading & Subtitle */}
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0a2342] tracking-tight">
              {t('home.hyper_local_title', { defaultValue: 'Hyper-Local Business Advisory' })}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-medium mt-2">
              {t('home.hyper_local_subtitle', { defaultValue: 'Structured 6-pillar feasibility evaluation modeled for rural and micro-entrepreneurs across Pan-India.' })}
            </p>
          </div>

          {/* 3D Modern Information Pillars Coverflow Stage */}
          <div
            className="pillars-carousel-container relative w-full max-w-6xl mx-auto flex items-center justify-center py-4 min-h-[500px] sm:min-h-[530px] overflow-hidden"
            onMouseEnter={() => setIsPillarHovered(true)}
            onMouseLeave={() => setIsPillarHovered(false)}
          >
            {/* Left Navigation Arrow */}
            <button
              type="button"
              onClick={handlePrevPillarCard}
              aria-label={t('common.previous_pillar', { defaultValue: 'Previous information pillar' })}
              className="absolute left-1 sm:left-3 z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/95 border border-stone-200 text-[#0a2342] hover:text-amber-600 hover:border-amber-400 shadow-lg hover:shadow-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer backdrop-blur-xs"
            >
              <ChevronLeft size={22} className="shrink-0" />
            </button>

            {/* Right Navigation Arrow */}
            <button
              type="button"
              onClick={handleNextPillarCard}
              aria-label={t('common.next_pillar', { defaultValue: 'Next information pillar' })}
              className="absolute right-1 sm:right-3 z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/95 border border-stone-200 text-[#0a2342] hover:text-amber-600 hover:border-amber-400 shadow-lg hover:shadow-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer backdrop-blur-xs"
            >
              <ChevronRight size={22} className="shrink-0" />
            </button>

            {/* The 6 Vertical Information Pillars */}
            <div className="relative w-full h-[470px] sm:h-[490px] flex items-center justify-center">
              {sihPillarCards.map((pCard, idx) => {
                let offset = (idx - activePillarIndex + 6) % 6;
                if (offset > 3) offset -= 6;

                const isCenter = offset === 0;

                // Coverflow Positioning Dynamics
                let transformStyle = '';
                let zIndex = 1;
                let opacity = 0;
                let pointerEvents = 'none';

                if (offset === 0) {
                  transformStyle = 'translateX(0px) translateZ(50px) scale(1.04)';
                  zIndex = 30;
                  opacity = 1;
                  pointerEvents = 'auto';
                } else if (offset === 1) {
                  transformStyle = 'translateX(260px) translateZ(-60px) rotateY(-18deg) scale(0.88)';
                  zIndex = 20;
                  opacity = 0.85;
                  pointerEvents = 'auto';
                } else if (offset === -1) {
                  transformStyle = 'translateX(-260px) translateZ(-60px) rotateY(18deg) scale(0.88)';
                  zIndex = 20;
                  opacity = 0.85;
                  pointerEvents = 'auto';
                } else if (offset === 2) {
                  transformStyle = 'translateX(470px) translateZ(-160px) rotateY(-30deg) scale(0.74)';
                  zIndex = 10;
                  opacity = 0.45;
                  pointerEvents = 'auto';
                } else if (offset === -2) {
                  transformStyle = 'translateX(-470px) translateZ(-160px) rotateY(30deg) scale(0.74)';
                  zIndex = 10;
                  opacity = 0.45;
                  pointerEvents = 'auto';
                } else {
                  transformStyle = 'translateX(0px) translateZ(-300px) scale(0.6)';
                  zIndex = 1;
                  opacity = 0;
                  pointerEvents = 'none';
                }

                return (
                  <div
                    key={pCard.id}
                    onClick={() => handleSelectPillar(idx)}
                    style={{
                      transform: transformStyle,
                      zIndex,
                      opacity,
                      pointerEvents
                    }}
                    className="pillar-card-3d absolute w-[260px] xs:w-[285px] sm:w-[315px] md:w-[330px] max-w-[calc(100vw-48px)] h-[460px] sm:h-[480px] cursor-pointer"
                  >
                    <div className={`pillar-flip-inner ${isCenter && isPillarFlipped ? 'is-flipped' : ''}`}>

                      {/* FRONT FACE: Modern VyaparSathi Information Pillar */}
                      <div className={`pillar-face-front bg-white border ${isCenter
                          ? 'border-amber-400 ring-4 ring-amber-400/20 shadow-2xl'
                          : 'border-stone-200/90 shadow-md'
                        } rounded-3xl flex flex-col justify-between p-4 sm:p-5 text-left transition-all duration-300`}>

                        {/* Pillar Header: Number Badge + Title */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${isCenter
                                ? 'bg-amber-400 text-[#0a2342]'
                                : 'bg-stone-100 text-stone-600'
                              }`}>
                              0{pCard.pillarNum}
                            </span>
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                              {t('home.pillar_prefix', { defaultValue: 'Pillar' })} 0{pCard.pillarNum}
                            </span>
                          </div>

                          <h3 className="text-[18px] sm:text-[19px] font-bold text-[#0a2342] tracking-tight leading-[1.35]">
                            {i18n.language === 'mr' ? (pCard.titleMr || pCard.title) : (i18n.language === 'hi' ? (pCard.titleHi || pCard.title) : pCard.title)}
                          </h3>
                          <p className="text-[13px] text-stone-500 font-normal line-clamp-1 leading-[1.4]">
                            {i18n.language === 'mr' ? pCard.title : (i18n.language === 'hi' ? pCard.title : (pCard.titleMr || pCard.titleHi))}
                          </p>
                        </div>

                        {/* Visual: Realistic Rural Business Image */}
                        <div className="relative rounded-2xl overflow-hidden h-40 sm:h-44 w-full my-1 border border-stone-100 shadow-inner group-hover:scale-[1.02] transition-transform">
                          <img
                            src={pCard.image}
                            alt={pCard.title}
                            className="w-full h-full object-cover brightness-95 contrast-[1.05]"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <span className="absolute bottom-2 left-2.5 right-2.5 text-xs font-semibold text-white drop-shadow-xs line-clamp-1">
                            {i18n.language === 'mr' ? (pCard.taglineMr || pCard.tagline) : (i18n.language === 'hi' ? (pCard.taglineHi || pCard.tagline) : pCard.tagline)}
                          </span>
                        </div>

                        {/* Key Insight */}
                        <div className="space-y-2">
                          <p className="text-sm sm:text-[15px] text-stone-700 font-normal line-clamp-2 leading-[1.5]">
                            {i18n.language === 'mr' ? (pCard.frontInsightMr || pCard.frontInsight) : (i18n.language === 'hi' ? (pCard.frontInsightHi || pCard.frontInsight) : pCard.frontInsight)}
                          </p>

                          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-stone-100">
                            {pCard.frontMetrics?.slice(0, 2).map((m, mIdx) => (
                              <div key={mIdx} className="bg-stone-50 rounded-lg p-1.5 border border-stone-200/60">
                                <span className="text-[9px] font-black text-stone-500 uppercase block">{m.label}</span>
                                <span className="text-[11px] font-extrabold text-[#0a2342] truncate block">{m.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Card Interactive Footer */}
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                          {isCenter ? (
                            <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1.5">
                              <RotateCw size={11} className="text-amber-500" />
                              {t('home.auto_details', { defaultValue: 'Details shown automatically' })}
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-stone-400">
                              {t('home.feasibility_pillar_badge', { defaultValue: 'Feasibility Pillar' })} 0{pCard.pillarNum}
                            </span>
                          )}
                        </div>

                      </div>

                      {/* BACK FACE: Practical SIH26091 Feasibility Information */}
                      <div className="pillar-face-back bg-gradient-to-b from-[#0a2342] to-[#0e3360] text-white rounded-3xl p-5 flex flex-col justify-between text-left shadow-2xl border-2 border-amber-400">

                        {/* Back Header */}
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-white/15">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-amber-400 text-[#0a2342] flex items-center justify-center text-xs font-black">
                                0{pCard.pillarNum}
                              </span>
                              <div>
                                <h4 className="text-sm font-black text-amber-300 leading-tight">
                                  {i18n.language === 'mr' ? (pCard.titleMr || pCard.title) : (i18n.language === 'hi' ? (pCard.titleHi || pCard.title) : pCard.title)}
                                </h4>
                                <span className="text-[10px] text-stone-300 font-medium">
                                  {t('home.practical_breakdown', { defaultValue: 'Practical Breakdown' })}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleTogglePillarFlip}
                              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              ↺ {t('home.back', { defaultValue: 'Back' })}
                            </button>
                          </div>

                          {/* Dynamic Pillar Back Information */}
                          <div className="mt-3 space-y-2.5 text-xs text-stone-200">
                            {pCard.id === 'market-reach' && (
                              <>
                                <p className="text-stone-300 leading-relaxed font-medium">
                                  <strong className="text-amber-300 font-black">{t('home.local_target_label', { defaultValue: 'Local Target:' })}</strong> {pCard.backData.consumerBase}
                                </p>
                                <div className="space-y-1 pt-1">
                                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">{t('home.distribution_channels_label', { defaultValue: 'Distribution Channels' })}</span>
                                  {pCard.backData.distributionChannels.slice(0, 2).map((item, i) => (
                                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-stone-200">
                                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                                      <span>{item}</span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}

                            {pCard.id === 'local-opportunity' && (
                              <>
                                <p className="text-stone-300 leading-relaxed font-medium">
                                  {pCard.backData.nicheDescription}
                                </p>
                                <div className="space-y-1 pt-1">
                                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">{t('home.action_steps_label', { defaultValue: 'Action Steps' })}</span>
                                  {pCard.backData.actionPoints.slice(0, 2).map((item, i) => (
                                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-stone-200">
                                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                                      <span>{item}</span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}

                            {pCard.id === 'swot-analysis' && (
                              <div className="space-y-1.5 text-[11px]">
                                <div className="bg-white/10 p-2 rounded-xl">
                                  <span className="text-emerald-300 font-black block text-[10px] uppercase">{t('cards.swot.strengths', { defaultValue: 'Strengths' })}</span>
                                  <span className="line-clamp-2">{pCard.backData.strengths}</span>
                                </div>
                                <div className="bg-white/10 p-2 rounded-xl">
                                  <span className="text-amber-300 font-black block text-[10px] uppercase">{t('cards.swot.opportunities', { defaultValue: 'Opportunities' })}</span>
                                  <span className="line-clamp-2">{pCard.backData.opportunities}</span>
                                </div>
                              </div>
                            )}

                            {pCard.id === 'local-threats' && (
                              <>
                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">{t('home.operational_factors_label', { defaultValue: 'Key Operational Factors' })}</span>
                                  {(pCard.backData.operationalFactors || pCard.backData.riskFactors || []).slice(0, 2).map((rf, i) => (
                                    <div key={i} className="bg-amber-500/15 border border-amber-400/30 p-2 rounded-xl text-[11px]">
                                      <strong className="text-amber-200 block font-bold">{rf.name}</strong>
                                      <span className="text-stone-300 text-[10px] line-clamp-1">{rf.desc}</span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}

                            {pCard.id === 'competitor-mapping' && (
                              <>
                                <p className="text-stone-300 leading-relaxed font-medium">
                                  {pCard.backData.densityNote}
                                </p>
                                <div className="space-y-1 pt-1">
                                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">{t('home.differentiators_label', { defaultValue: 'Differentiators' })}</span>
                                  {pCard.backData.differentiatorAreas.slice(0, 2).map((diff, i) => (
                                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-stone-200">
                                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                                      <span>{diff}</span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}

                            {pCard.id === 'product-market-value' && (
                              <>
                                <div className="space-y-1">
                                  <span className="text-[10px] font-black uppercase text-cyan-300 tracking-wider">{t('home.unit_economics_label', { defaultValue: 'Cost-Plus Unit Economics' })}</span>
                                  {pCard.backData.pricingFramework.map((line, i) => (
                                    <div key={i} className="bg-cyan-500/10 border border-cyan-400/20 px-2 py-1 rounded-lg text-[10px] text-cyan-100">
                                      {line}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Back Action Button */}
                        <div className="pt-2 border-t border-white/15">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (pCard.backData?.actionRoute) {
                                onNavigate(pCard.backData.actionRoute);
                              }
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#0a2342] font-black text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer"
                          >
                            <span>{pCard.backData?.actionLabel || 'Explore Further'}</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Minimal 6-Pillar Carousel Indicator */}
          <div className="flex items-center justify-center gap-2 mt-4 pb-1">
            {sihPillarCards.map((p, pIdx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPillar(pIdx)}
                aria-label={`Go to pillar 0${pIdx + 1}: ${p.title}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${activePillarIndex === pIdx
                    ? 'w-7 h-2 bg-amber-500 shadow-xs'
                    : 'w-2 h-2 bg-stone-300 hover:bg-stone-400'
                  }`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 2: State Government Linkage (Video-Accurate Horizontal Carousel with Stick Photo Collage Maps) */}
      <section
        id="state-linkage-section"
        aria-label={t('home.state_linkage_title', { defaultValue: 'State Government Linkage' })}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none space-y-4"
      >
        {/* Top Header Row: "View All" on right */}
        <div className="flex items-center justify-end">

          <button
            type="button"
            onClick={() => onNavigate('/schemes')}
            className="px-5 py-2 rounded-xl bg-[#1a56db] hover:bg-[#1e40af] text-white font-black text-xs sm:text-sm shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {t('home.view_all', { defaultValue: 'View All' })}
          </button>
        </div>

        {/* Carousel Container with Left/Right Nav Arrows */}
        <div className="relative group/carousel">

          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => scrollStateCarousel('left')}
            aria-label={t('common.previous_state', { defaultValue: 'Previous state' })}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white border border-stone-200 text-stone-700 hover:text-stone-900 flex items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer"
          >
            <ChevronRight size={18} className="rotate-180" />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => scrollStateCarousel('right')}
            aria-label={t('common.next_state', { defaultValue: 'Next state' })}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white border border-stone-200 text-stone-700 hover:text-stone-900 flex items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>

          {/* Cards Track */}
          <div
            ref={stateCarouselRef}
            className="flex items-center gap-4.5 sm:gap-5 overflow-x-auto scrollbar-none scroll-smooth py-2 px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {STATE_LINKAGE_CARDS.map((card) => {
              const isHovered = hoveredStateId === card.id;
              return (
                <div
                  key={card.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`${card.name} State Linkage`}
                  onMouseEnter={() => setHoveredStateId(card.id)}
                  onMouseLeave={() => setHoveredStateId(null)}
                  onClick={() => setHoveredStateId(prev => (prev === card.id ? null : card.id))}
                  className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-md hover:shadow-xl transition-all duration-300 shrink-0 w-[275px] xs:w-[320px] sm:w-[370px] lg:w-[395px] max-w-[calc(100vw-36px)] h-[210px] sm:h-[225px] cursor-pointer group bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {/* Stick Photo Collage Map Graphic */}
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Hover / Active Reveal Overlay as shown in video */}
                  <div
                    className={`absolute inset-0 p-5 sm:p-6 bg-white/94 backdrop-blur-sm flex flex-col justify-between items-center text-center transition-opacity duration-300 ${isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                      }`}
                  >
                    <p className="text-xs sm:text-[13px] text-stone-800 font-medium leading-relaxed my-auto max-w-xs">
                      {card.description}
                    </p>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (card.id === 'maharashtra') {
                          onNavigate('/schemes/match');
                        } else {
                          onNavigate(card.route);
                        }
                      }}
                      className="px-6 py-2 rounded-lg bg-[#1a56db] hover:bg-[#1e40af] text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      {t('home.explore', { defaultValue: 'Explore' })}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 3.5: Opportunity Heatmap (Real Google Maps JavaScript & Places API) */}
      <OpportunityHeatmap
        initialState={selectedState || "All India"}
        initialDistrict={district || "Satara"}
        initialBlock={block || "Karad"}
        initialVillage={village || "Supane"}
        initialCategory={bizType === 'Dairy' ? 'Dairy & Animal Husbandry' : (bizType === 'Food Processing' ? 'Food Processing' : 'Dairy & Animal Husbandry')}
        onNavigate={onNavigate}
      />


      {/* ENTERPRISE ACTION & ADVISORY SECTION (Full-width light animated background, direct dual cards) */}
      <section className="relative w-full overflow-hidden py-12 sm:py-16 my-8 select-none">
        {/* Full-width Animated Wave Background (Light Theme, Zero Watermarks) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center"
            src="/videos/wave-light.mp4"
          />
          {/* Subtle soft gradient fade at top and bottom to seamlessly merge with the rest of the page */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#fbfbf9] via-transparent to-[#fbfbf9] opacity-75" />
        </div>

        {/* The Two Cards (Directly on the background, no enclosing card container) */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

            {/* Left Card: Bank-Ready DPR & Project Dossier */}
            <div className="bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-5 transition-all hover:border-amber-400/80 hover:shadow-xl shadow-md">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-800 shadow-2xs">
                    <FileText size={20} className="stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 border border-amber-200 px-2.5 py-1 rounded-full">
                    {t('home.banking_standards', { defaultValue: 'Banking Standards' })}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight leading-snug">
                  {t('home.dpr_card_title', { defaultValue: 'Project Dossier & Bankable DPR' })}
                </h3>
                <p className="text-xs sm:text-[13px] text-stone-600 font-normal leading-relaxed">
                  {t('home.dpr_card_desc', { defaultValue: 'Generate bank-ready 1-page business canvas, 5-year cash flows, and loan due-diligence report structured for bank evaluation.' })}
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('/business-plan')}
                  className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white font-bold text-xs sm:text-[13px] flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer hover:scale-[1.01]"
                >
                  <span>{t('home.build_plan_btn', { defaultValue: 'Build 1-Page Plan' })}</span>
                  <ArrowRight size={14} className="stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/reports')}
                  className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs sm:text-[13px] flex items-center justify-center gap-1 transition-all cursor-pointer border border-stone-300 hover:scale-[1.01]"
                >
                  <span>{t('home.view_dpr_btn', { defaultValue: 'View DPR' })}</span>
                </button>
              </div>
            </div>

            {/* Right Card: Business Advisory & Guidance */}
            <div className="bg-[#0a2342]/95 backdrop-blur-md border border-[#13315c] rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-5 text-white shadow-md hover:border-amber-400/50 hover:shadow-xl transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-amber-400 shadow-2xs">
                    <Compass size={20} className="stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-white/10 border border-white/15 px-2.5 py-1 rounded-full">
                    मराठी • हिंदी • English
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  {t('home.advisory_card_title', { defaultValue: 'Business Journey Advisory' })}
                </h3>
                <p className="text-xs sm:text-[13px] text-stone-200 font-normal leading-relaxed">
                  {t('home.advisory_card_desc', { defaultValue: 'Verified assistance on scheme eligibility, subsidy calculations, and funding gap analysis grounded in official guidelines.' })}
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('/ai-assistant')}
                  className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs sm:text-[13px] flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer hover:scale-[1.01]"
                >
                  <span>{t('home.ask_advisor_btn', { defaultValue: 'Ask Business Advisor' })}</span>
                  <ArrowRight size={14} className="stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/support/nearby')}
                  className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-[13px] flex items-center justify-center gap-1 transition-all cursor-pointer border border-white/20 hover:scale-[1.01]"
                >
                  <span>{t('home.local_centers_btn', { defaultValue: 'Local Centers' })}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
