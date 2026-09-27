import axios from 'axios';
import { Platform } from 'react-native';

// On Android Emulator, localhost is 10.0.2.2. On iOS or Web it is localhost.
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000/api' : 'http://localhost:8000/api';


const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

let authToken = null;
let cachedUser = null;

export const mobileApi = {
  setToken(token) {
    authToken = token;
    if (token) {
      client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete client.defaults.headers.common['Authorization'];
    }
  },

  setUser(user) {
    cachedUser = user;
  },

  getUser() {
    return cachedUser;
  },

  async login(email, password) {
    try {
      const res = await client.post('/auth/login', { email, password });
      if (res.data?.token) {
        this.setToken(res.data.token);
        this.setUser(res.data.user);
      }
      return res.data;
    } catch (e) {
      // Offline fallback demo user
      const demo = { id: 'usr_mobile_demo', name: 'Ramesh Patil', email, district: 'Satara' };
      this.setUser(demo);
      return { user: demo, token: 'offline_mobile_token' };
    }
  },

  async getHealth() {
    try {
      const res = await client.get('/health');
      return res.data;
    } catch (e) {
      return { status: 'offline_mode', service: 'VyaparSathi Mobile Offline' };
    }
  },

  async getDashboard() {
    try {
      const res = await client.get('/dashboard');
      return res.data;
    } catch (e) {
      return {
        isEmpty: false,
        ownerName: cachedUser?.name || 'Ramesh Patil',
        district: cachedUser?.district || 'Satara',
        revenue: 135000,
        expenses: 82000,
        profit: 53000,
        healthScore: 84
      };
    }
  },

  async calculateFinancials(payload) {
    try {
      const res = await client.post('/calculate', payload);
      return res.data.data;
    } catch (e) {
      const outlay = Number(payload.investmentRequirement || 650000);
      const own = Number(payload.ownContribution || 150000);
      return {
        totalProjectCost: outlay,
        ownContribution: own,
        loanRequirement: Math.max(0, outlay - own),
        monthlyEmi: Math.round((outlay - own) * 0.021),
        subsidyEligibleAmount: Math.round(outlay * 0.35)
      };
    }
  },

  async getSchemes(category = 'All') {
    try {
      const res = await client.get('/schemes', { params: { category } });
      return res.data.schemes || [];
    } catch (e) {
      return [
        { id: 'cmegp', name: 'Chief Minister Employment Generation Programme (CMEGP)', subsidy: 'Up to 35% Subsidy (Max ₹50 Lakhs)' },
        { id: 'pmfme', name: 'PM Formalisation of Micro Food Processing Enterprises (PMFME)', subsidy: '35% Credit-linked Grant up to ₹10 Lakhs' },
        { id: 'mudra', name: 'Pradhan Mantri MUDRA Yojana (PMMY)', subsidy: 'Collateral-free credit up to ₹10 Lakhs' }
      ];
    }
  },

  async getMarketPricing(commodity = 'Milk', district = 'Satara') {
    try {
      const res = await client.get('/pricing', { params: { commodity, district } });
      return res.data;
    } catch (e) {
      return {
        commodity,
        district,
        price: '₹42 - ₹54 per litre',
        source: 'APMC Market Benchmark'
      };
    }
  },

  async askAI(query, language = 'mr') {
    try {
      const res = await client.post('/advisory/query', { query, language });
      return res.data;
    } catch (e) {
      return {
        answer: language === 'mr' 
          ? 'डेअरी व प्रक्रिया उद्योगासाठी CMEGP किंवा PMFME अंतर्गत ३५% भांडवली अनुदान उपलब्ध आहे.'
          : 'For agro and dairy processing in Maharashtra, 35% capital subsidy is available under CMEGP/PMFME.',
        suggestedActions: ['Explore Schemes', 'Check Financial Health']
      };
    }
  },

  async extractOCR(imageBase64, documentType = 'machinery_invoice') {
    try {
      const res = await client.post('/ocr/extract', { imageBase64, documentType });
      return res.data;
    } catch (e) {
      return {
        extractedData: {
          vendorName: 'Maha Agro Equipments Ltd.',
          totalAmount: 185000,
          equipmentName: 'Automatic Chaff Cutter (5 HP)'
        },
        reviewNotice: 'Review extracted information before saving.'
      };
    }
  },

  async getONDCListings() {
    try {
      const res = await client.get('/ondc/listings');
      return res.data?.items || [];
    } catch (e) {
      return [
        { id: 'ondc_m1', name: 'Pure Desi Cow Ghee (A2 Bilona)', price: 750, unit: '1 kg Jar', providerName: 'Sahyadri Agro' },
        { id: 'ondc_m2', name: 'Salem Grade Golden Turmeric Powder', price: 135, unit: '500g Pouch', providerName: 'Krishna Valley FPO' }
      ];
    }
  }
};
