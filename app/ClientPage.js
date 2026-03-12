"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { supabase } from '@/lib/supabaseClient';

import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { 
  Wallet, TrendingDown, TrendingUp, DollarSign, Trash2, Edit2, Plus, 
  LayoutDashboard, List, Receipt, AlertCircle, Target, BookOpen, Briefcase, Activity, CheckCircle2, AlertTriangle, Calculator, Sparkles, Percent, Palette, Crown, ShoppingCart, Film, Utensils, ShoppingBag, CreditCard, Tv, Youtube, Music, Car, Coffee, Smartphone, Home, Heart, Zap, Coins, ShieldCheck, Calendar, LogOut, User, Mail, Lock, Loader2,
  Moon, Sun, CloudRain, Trees
} from "lucide-react";

// Initial mock data
const INITIAL_EXPENSES = [];

const CATEGORIES = [
  "Alimentação", 
  "Moradia", 
  "Transporte", 
  "Lazer", 
  "Saúde", 
  "Educação", 
  "Compras", 
  "Assinaturas", 
  "Cuidados Pessoais", 
  "Pets", 
  "Viagem", 
  "Presentes", 
  "Investimentos", 
  "Imprevistos", 
  "Outros"
];
const ASSET_CLASSES = [
  "ETF USA", "Ação USA", "REITs", 
  "ETF Brasil", "Ação BR", "FII", 
  "Renda Fixa", "Tesouro Direto", "CDB/LCI/LCA", "Debêntures",
  "Fundos de Inv.", "Previdência", 
  "Cripto", "Ouro/Prata", "Crowdfunding", "Reserva Valor"
];
const COLORS = [
  "#8b5cf6", "#10b981", "#ef4444", "#f59e0b", "#3b82f6", 
  "#ec4899", "#6366f1", "#14b8a6", "#f97316", "#84cc16", 
  "#06b6d4", "#d946ef", "#22c55e", "#64748b", "#94a3b8"
];
const ASSET_COLORS = ["#10b981", "#8b5cf6", "#f59e0b", "#3b82f6", "#ef4444", "#ec4899"];

const ASSET_CLASS_COLORS = {
  "ETF USA": "#10b981",
  "Ação USA": "#059669",
  "REITs": "#34d399",
  "ETF Brasil": "#ec4899",
  "Ação BR": "#f59e0b",
  "FII": "#8b5cf6",
  "Renda Fixa": "#3b82f6",
  "Tesouro Direto": "#2563eb",
  "CDB/LCI/LCA": "#60a5fa",
  "Debêntures": "#1d4ed8",
  "Fundos de Inv.": "#6366f1",
  "Previdência": "#818cf8",
  "Cripto": "#ef4444",
  "Ouro/Prata": "#fbbf24",
  "Crowdfunding": "#f97316",
  "Reserva Valor": "#94a3b8"
};

// Total Return (Appreciation + Dividends)
const ASSET_RETURNS = {
  "ETF USA": 12, "Ação USA": 13, "REITs": 11,
  "ETF Brasil": 11, "Ação BR": 12, "FII": 11,
  "Renda Fixa": 9, "Tesouro Direto": 10, "CDB/LCI/LCA": 9.5, "Debêntures": 11,
  "Fundos de Inv.": 10, "Previdência": 9,
  "Cripto": 15, "Ouro/Prata": 7, "Crowdfunding": 14, "Reserva Valor": 4
};

// Estimated Annual Dividend Yield (Paid as Cash)
const ASSET_YIELDS = {
  "ETF USA": 1.5, "Ação USA": 1.5, "REITs": 4.0,
  "ETF Brasil": 4.0, "Ação BR": 6.0, "FII": 10.0,
  "Renda Fixa": 10.0, "Tesouro Direto": 10.0, "CDB/LCI/LCA": 9.5, "Debêntures": 11.0,
  "Fundos de Inv.": 0.0, "Previdência": 0.0,
  "Cripto": 0.0, "Ouro/Prata": 0.0, "Crowdfunding": 0.0, "Reserva Valor": 0.0
};

const THEMES = [
  { id: 'default', label: 'Dark Original', icon: <Moon size={16} />, color: '#0a0a0f' },
  { id: 'light', label: 'Claro', icon: <Sun size={16} />, color: '#f3f4f6' },
  { id: 'midnight', label: 'Midnight', icon: <CloudRain size={16} />, color: '#0f172a' },
  { id: 'forest', label: 'Floresta', icon: <Trees size={16} />, color: '#052e16' },
];

const PRESET_EXPENSES = [
  { label: 'Mercado', icon: ShoppingCart, category: 'Alimentação', color: '#10b981' },
  { label: 'Uber/99', icon: Car, category: 'Transporte', color: '#3b82f6' },
  { label: 'Lanche', icon: Utensils, category: 'Alimentação', color: '#f59e0b' },
  { label: 'Contas', icon: Zap, category: 'Moradia', color: '#f59e0b' },
  { label: 'Celular', icon: Smartphone, category: 'Outros', color: '#8b5cf6' },
  { label: 'Cartão', icon: CreditCard, category: 'Outros', color: '#ef4444' },
  { label: 'Saúde', icon: Heart, category: 'Saúde', color: '#ec4899' },
  { label: 'Lazer', icon: Film, category: 'Lazer', color: '#8b5cf6' },
];

import Link from 'next/link';

export default function FalidaoApp() {
  const [mounted, setMounted] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    // PWA Install Prompt Listener
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);
  }, []);

  const handleInstallApp = async () => {
    if (installPrompt) {
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
            setInstallPrompt(null);
        }
    } else {
        // Show manual instructions for iOS or others
        setShowInstallModal(true);
    }
  };

  // --- STATE DEFINITIONS (Must be at top) ---
  
  // 1. Auth State
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', gender: 'male' });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false); // Loading state for auth actions

  // 2. General App State
  // Initialize with safe defaults
  const [salary, setSalary] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newExpense, setNewExpense] = useState({ description: "", amount: "", category: "Outros" });
  const [editingId, setEditingId] = useState(null);
  const [theme, setTheme] = useState('default');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [userGender, setUserGender] = useState('male');
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Flag to prevent saving before loading
  const [savingStatus, setSavingStatus] = useState('idle'); // idle, saving, saved, error

  // Apply Theme Effect (Moved here to access 'theme')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 3. Fixed Debts State
  const [fixedDebts, setFixedDebts] = useState([]);
  const [newDebt, setNewDebt] = useState({ description: "", amount: "", type: "fixed", monthsRemaining: "", totalMonths: "" });
  const [isAddingDebt, setIsAddingDebt] = useState(false);

  // 4. Investment State
  const [investmentGoalPct, setInvestmentGoalPct] = useState(0);
  const [userInvestmentGoal, setUserInvestmentGoal] = useState(1000000); // Default 1M Goal
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [emergencyFundPct, setEmergencyFundPct] = useState(5);
  const [emergencyMonths, setEmergencyMonths] = useState(6); // Default 6 months for Emergency Fund
  const [classAllocations, setClassAllocations] = useState({
    "ETF USA": 0, "Ação USA": 0, "REITs": 0,
    "ETF Brasil": 0, "Ação BR": 0, "FII": 0,
    "Renda Fixa": 0, "Tesouro Direto": 0, "CDB/LCI/LCA": 0, "Debêntures": 0,
    "Fundos de Inv.": 0, "Previdência": 0,
    "Cripto": 0, "Ouro/Prata": 0, "Crowdfunding": 0, "Reserva Valor": 0
  });
  const [portfolio, setPortfolio] = useState([]);
  const [currency, setCurrency] = useState('BRL');
  const [exchangeRate, setExchangeRate] = useState(5.00); // Mock exchange rate USD -> BRL
  const [newAsset, setNewAsset] = useState({ name: "", type: "Ação BR", percentage: "", quantity: "", currentPrice: "" });

  // 5. Simulation State
  const [simYears, setSimYears] = useState(10);
  const [simMonthly, setSimMonthly] = useState(500);
  const [showIncomeChart, setShowIncomeChart] = useState(false);

  // 6. Rebalancing State
  const [manualContribution, setManualContribution] = useState("");
  const [rebalanceResult, setRebalanceResult] = useState(null);
  const [selectedClassesForRebalance, setSelectedClassesForRebalance] = useState(ASSET_CLASSES);

  // 7. XP & Missions State
  const [xp, setXp] = useState(0);
  const [completedMissions, setCompletedMissions] = useState([]);

  // 8. Market Data State (USD/BTC)
  const [btcRate, setBtcRate] = useState(0);
  const [usdRate, setUsdRate] = useState(0);
  const [isSearchingAsset, setIsSearchingAsset] = useState(false);

  // 10. Subscription State
  const [isPro, setIsPro] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // --- FUNCTIONS ---

  const fetchMarketRates = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
        const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,BTC-BRL');
        const data = await res.json();
        if (data.USDBRL) {
            const rate = parseFloat(data.USDBRL.bid);
            setUsdRate(rate);
            setExchangeRate(rate); // Sync for global usage
        }
        if (data.BTCBRL) setBtcRate(parseFloat(data.BTCBRL.bid));
    } catch (error) {
        console.error("Error fetching rates", error);
    }
  }, []);

  const fetchAssetPrice = useCallback(async (ticker) => {
    if (!ticker) return;
    setIsSearchingAsset(true);
    
    // Normalize ticker
    const cleanTicker = ticker.trim().toUpperCase();
    
    try {
        // 1. Check for Crypto (BTC, ETH, etc)
        const isCrypto = ['BTC', 'ETH', 'SOL', 'USDT', 'BNB', 'XRP', 'ADA', 'DOGE', 'DOT', 'AVAX'].includes(cleanTicker) || cleanTicker.endsWith('USDT');
        
        if (isCrypto) {
            // Use AwesomeAPI
            const targetCurr = currency; // BRL or USD
            const pair = `${cleanTicker}-${targetCurr}`;
            const res = await fetch(`https://economia.awesomeapi.com.br/last/${pair}`);
            
            if (res.ok) {
                const data = await res.json();
                const key = `${cleanTicker}${targetCurr}`;
                if (data[key]) {
                    setNewAsset(prev => ({
                        ...prev,
                        name: cleanTicker,
                        currentPrice: parseFloat(data[key].bid),
                        type: 'Cripto'
                    }));
                    setIsSearchingAsset(false);
                    return;
                }
            }
        }

        // 2. Check for B3 Assets (Brapi)
        // Brapi returns values in BRL.
        const res = await fetch(`https://brapi.dev/api/quote/${cleanTicker}?range=1d&interval=1d&fundamental=false&dividends=false`);
        
        if (res.ok) {
            const data = await res.json();
            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                let price = result.regularMarketPrice;
                
                // Currency Conversion Logic
                // Asset is BRL. 
                // If user selected USD, convert BRL -> USD
                if (currency === 'USD' && usdRate > 0) {
                    price = price / usdRate;
                }
                
                setNewAsset(prev => ({
                    ...prev,
                    name: result.symbol,
                    currentPrice: price,
                    // Try to infer type
                    type: result.symbol.endsWith('11') ? (prev.type === 'Ação BR' ? 'FII' : prev.type) : prev.type
                }));
                setIsSearchingAsset(false);
                return;
            }
        }
    } catch (e) {
        console.error("Error fetching asset price:", e);
    } finally {
        setIsSearchingAsset(false);
    }
  }, [currency, usdRate]);

  // 9. Auto-fetch price on currency change or typing (debounced)
  useEffect(() => {
    if (newAsset.name && !isSearchingAsset) {
        const timer = setTimeout(() => {
             fetchAssetPrice(newAsset.name);
        }, 800);
        return () => clearTimeout(timer);
    }
  }, [newAsset.name, fetchAssetPrice]);

  const loadData = useCallback(async () => {
    if (typeof window === 'undefined') return;
    if (!user || !user.id) return;

    try {
      console.log("Carregando dados...");
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Erro ao carregar:", error);
        return;
      }

      if (data) {
        setSalary(data.salario || 0);
        setExpenses(data.gastos || []);
        setFixedDebts(data.dividas || []);
        setPortfolio(data.carteira || []);
        setClassAllocations(data.alocacao || {
            "ETF USA": 0, "Ação USA": 0, "REITs": 0,
            "ETF Brasil": 0, "Ação BR": 0, "FII": 0,
            "Renda Fixa": 0, "Tesouro Direto": 0, "CDB/LCI/LCA": 0, "Debêntures": 0,
            "Fundos de Inv.": 0, "Previdência": 0,
            "Cripto": 0, "Ouro/Prata": 0, "Crowdfunding": 0, "Reserva Valor": 0
        });
        setInvestmentGoalPct(data.investimento_pct || 0);
        setUserInvestmentGoal(data.meta || 1000000);
        setXp(data.data?.xp || 0);
        setTheme(data.data?.theme || 'default');
        setUserGender(data.data?.gender || 'male');
        setEmergencyFundPct(data.data?.emergencyFundPct || 5);
        setEmergencyMonths(data.data?.emergencyMonths || 6);
        
        // Fetch subscription status
        const { data: subData } = await supabase
            .from('subscriptions')
            .select('status, plan')
            .eq('user_id', user.id)
            .maybeSingle();

        if (subData && subData.status === 'active') {
            setIsPro(true);
        } else {
            setIsPro(false);
        }

        setIsDataLoaded(true);
      } else {
        setIsDataLoaded(true);
      }
    } catch (e) {
      console.error("Exceção no loadData:", e);
    }
  }, [user]);

  const saveData = useCallback(async () => {
    if (typeof window === 'undefined') return;
    if (!user || !user.id || !isDataLoaded) return;

    setSavingStatus('saving');
    
    try {
      const currentPatrimony = portfolio.reduce((acc, asset) => acc + (Number(asset.quantity) * Number(asset.currentPrice)), 0);

      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: user.id,
          salario: salary,
          gastos: expenses,
          dividas: fixedDebts,
          carteira: portfolio,
          alocacao: classAllocations,
          investimento_pct: investmentGoalPct,
          meta: userInvestmentGoal,
          patrimonio: currentPatrimony,
          updated_at: new Date().toISOString(),
          data: {
             emergencyFundPct,
             emergencyMonths,
             xp,
             theme,
             gender: userGender
          }
        }, { onConflict: 'user_id' });

      if (error) {
        console.error("Erro ao salvar:", error);
        setSavingStatus('error');
      } else {
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 2000);
      }
    } catch (e) {
      console.error("Exceção no saveData:", e);
      setSavingStatus('error');
    }
  }, [user, isDataLoaded, salary, expenses, fixedDebts, portfolio, classAllocations, investmentGoalPct, userInvestmentGoal, emergencyFundPct, emergencyMonths, xp, theme, userGender]);



  // 1. Auth Check Effect
  useEffect(() => {
    let mounted = true;

    // Fetch Market Rates
    fetchMarketRates();

    const initAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
            if (session?.user) {
                setUser({ email: session.user.email, id: session.user.id, ...session.user.user_metadata });
            }
        }
    };
    
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;

        if (event === 'PASSWORD_RECOVERY') {
            setAuthView('update_password');
        }

        if (session?.user) {
             setUser(prev => {
                 if (prev?.id === session.user.id) return prev;
                 return { email: session.user.email, id: session.user.id, ...session.user.user_metadata };
             });
        } else {
            setUser(null);
            setIsDataLoaded(false);
        }
    });

    return () => {
        mounted = false;
        subscription.unsubscribe();
    };
  }, []);

  // 2. Load Data Effect
  useEffect(() => {
    if (user?.id) {
        loadData();
    }
  }, [user?.id, loadData]);

  // 3. Save User Data Effect (Debounced)
  useEffect(() => {
    if (!isDataLoaded) return;

    const timeoutId = setTimeout(() => {
      saveData();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [saveData, isDataLoaded]);


  // --- HELPERS & HANDLERS ---

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setIsAuthLoading(true);

    try {
        // Create a timeout promise to race against auth calls
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Tempo limite excedido. Verifique sua conexão ou tente novamente.')), 15000)
        );

        if (authView === 'login') {
            const { error } = await Promise.race([
                supabase.auth.signInWithPassword({
                    email: authForm.email,
                    password: authForm.password,
                }),
                timeoutPromise
            ]);
            if (error) throw error;
        } else if (authView === 'register') {
            const { error } = await Promise.race([
                supabase.auth.signUp({
                    email: authForm.email,
                    password: authForm.password,
                    options: {
                        data: {
                            name: authForm.name,
                            gender: authForm.gender
                        }
                    }
                }),
                timeoutPromise
            ]);
            if (error) throw error;
            
            // Check if session exists (auto-login) or if email confirm is needed
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setAuthSuccess("Cadastro realizado! Verifique seu e-mail para confirmar antes de entrar.");
                setAuthView('login');
            }
        } else if (authView === 'forgot') {
            const { error } = await Promise.race([
                supabase.auth.resetPasswordForEmail(authForm.email, {
                    redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
                }),
                timeoutPromise
            ]);
            if (error) throw error;
            setAuthSuccess("Instruções de recuperação enviadas para seu e-mail!");
        } else if (authView === 'update_password') {
            const { error } = await Promise.race([
                supabase.auth.updateUser({ password: authForm.password }),
                timeoutPromise
            ]);
            if (error) throw error;
            setAuthSuccess("Senha atualizada com sucesso! Você já está logado.");
            setTimeout(() => setAuthView('login'), 2000); 
        }
    } catch (error) {
        console.error("Auth error:", error);
        let msg = error.message;
        if (msg.includes('Invalid login credentials')) msg = 'E-mail ou senha incorretos.';
        else if (msg.includes('Email not confirmed')) msg = 'E-mail não confirmado. Verifique sua caixa de entrada.';
        else if (msg.includes('User already registered')) msg = 'Este e-mail já está cadastrado.';
        else if (msg.includes('rate limit')) msg = 'Muitas tentativas. Tente novamente mais tarde.';
        setAuthError(msg);
    } finally {
        setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAuthForm({ name: '', email: '', password: '', gender: 'male' });
    setAuthView('login');
    setAuthError('');
    setAuthSuccess('');
  };

  const calculateRebalancing = (contributionAmount) => {
    if (!contributionAmount || contributionAmount <= 0) return;
    if (!portfolio || !classAllocations) return;

    // 1. Setup: Calculate Total Value
    const currentPortfolioValue = portfolio.reduce((acc, asset) => acc + (asset.quantity * asset.currentPrice), 0);
    const newTotalValue = currentPortfolioValue + contributionAmount;
    
    // 2. Calculate Targets & Deficits per Asset
    // We flatten the structure to compare all assets directly
    let assetTargets = portfolio.map(asset => {
        // Ignore unselected classes
        if (!selectedClassesForRebalance.includes(asset.type)) {
            return { 
                ...asset, 
                targetValue: 0, 
                deficit: -Infinity // Ensure it's never picked
            };
        }

        const classAlloc = classAllocations[asset.type] || 0;
        
        // Calculate total relative weight of assets in this class
        const assetsInSameClass = portfolio.filter(a => a.type === asset.type);
        const totalWeightInClass = assetsInSameClass.reduce((sum, a) => sum + (a.percentage || 0), 0) || 1;
        
        // Global Target Value for this specific asset
        // Formula: (NewTotal * Class% * AssetRelative%)
        const classTargetValue = (newTotalValue * classAlloc) / 100;
        const assetTargetValue = classTargetValue * ((asset.percentage || 0) / totalWeightInClass);
        
        const currentValue = asset.quantity * asset.currentPrice;
        
        return {
            ...asset,
            targetValue: assetTargetValue,
            currentValue: currentValue,
            deficit: assetTargetValue - currentValue
        };
    });

    // 3. Greedy Allocation Loop (Knapsack-like approach)
    // We iteratively spend the contribution on the "most needy" asset that we can afford.
    
    let remainingMoney = contributionAmount;
    const suggestionsMap = {}; // id -> { ... }

    const addSuggestion = (asset, qty, cost) => {
        if (!suggestionsMap[asset.id]) {
            suggestionsMap[asset.id] = { 
                assetId: asset.id, 
                assetName: asset.name, 
                type: asset.type, 
                quantity: 0, 
                amount: 0 
            };
        }
        suggestionsMap[asset.id].quantity += qty;
        suggestionsMap[asset.id].amount += cost;
        
        // Update virtual state for next iteration
        const targetIndex = assetTargets.findIndex(a => a.id === asset.id);
        if (targetIndex !== -1) {
            assetTargets[targetIndex].currentValue += cost;
            assetTargets[targetIndex].deficit -= cost;
        }
    };

    let iterations = 0;
    // Loop while we have money (down to 1 cent) and safety break
    while (remainingMoney >= 0.01 && iterations < 1000) {
        iterations++;
        
        // Sort candidates by highest deficit
        // We only consider assets from selected classes (others have -Infinity deficit)
        const candidates = assetTargets
            .filter(a => selectedClassesForRebalance.includes(a.type))
            .sort((a, b) => b.deficit - a.deficit);
            
        // Find the best candidate we can afford
        let bestCandidate = null;
        
        for (const candidate of candidates) {
            if (candidate.currentPrice <= 0) continue; // Safety check

            if (candidate.type === 'Cripto' || candidate.type === 'Ouro/Prata') {
                // Crypto is divisible, always affordable
                bestCandidate = candidate;
                break; 
            } else {
                // Stocks/FIIs: must afford at least 1 unit
                if (candidate.currentPrice <= remainingMoney) {
                    bestCandidate = candidate;
                    break;
                }
            }
        }
        
        // If no asset is affordable (e.g. remaining R$ 50 but all stocks cost R$ 100), we stop.
        if (!bestCandidate) break; 
        
        // Buy Logic
        if (bestCandidate.type === 'Cripto' || bestCandidate.type === 'Ouro/Prata') {
            // For Crypto, we can fill the exact deficit or use all remaining money
            let amountToSpend = remainingMoney;
            
            if (bestCandidate.deficit > 0) {
                 amountToSpend = Math.min(remainingMoney, Math.max(0.01, bestCandidate.deficit));
            }
            
            if (remainingMoney - amountToSpend < 0.01) amountToSpend = remainingMoney;

            const qty = amountToSpend / bestCandidate.currentPrice;
            addSuggestion(bestCandidate, qty, amountToSpend);
            remainingMoney -= amountToSpend;
            
        } else {
            // For Stocks/FIIs/ETFs (Integer units)
            const maxAffordable = Math.floor(remainingMoney / bestCandidate.currentPrice);
            let qtyToBuy = 1; // Default to 1
            
            if (bestCandidate.deficit > bestCandidate.currentPrice) {
                 const neededToFill = Math.floor(bestCandidate.deficit / bestCandidate.currentPrice);
                 qtyToBuy = Math.min(neededToFill, maxAffordable);
                 if (qtyToBuy < 1) qtyToBuy = 1;
            }
            
            const cost = qtyToBuy * bestCandidate.currentPrice;
            addSuggestion(bestCandidate, qtyToBuy, cost);
            remainingMoney -= cost;
        }
    }
    
    setRebalanceResult(Object.values(suggestionsMap));
  };

  const applyRebalancing = () => {
    if (!rebalanceResult || !portfolio) return;

    // Use map to return a new array with updated quantities
    const updatedPortfolio = portfolio.map(asset => {
      // Find if there is a suggestion for this asset
      const suggestion = rebalanceResult.find(item => item.assetId === asset.id);
      
      if (suggestion) {
        // If found, update quantity
        return {
          ...asset,
          quantity: asset.quantity + suggestion.quantity
        };
      }
      // If not, return asset as is
      return asset;
    });

    setPortfolio(updatedPortfolio);
    setRebalanceResult(null);
    setManualContribution("");
    // Using setTimeout to allow UI update before alert (React batching)
    setTimeout(() => alert("Aporte realizado com sucesso! Sua carteira foi atualizada."), 100);
  };

  // Calculations
  const totalFixedDebts = useMemo(() => (fixedDebts || []).reduce((acc, curr) => acc + curr.amount, 0), [fixedDebts]);
  const investmentAmount = ((salary || 0) * (investmentGoalPct || 0)) / 100;
  const emergencyAmount = ((salary || 0) * (emergencyFundPct || 0)) / 100;
  const totalExpenses = useMemo(() => (expenses || []).reduce((acc, curr) => acc + curr.amount, 0), [expenses]);
  
  // Balance calculation: Salary - Fixed Debts - Variable Expenses - Investments
  const balance = (salary || 0) - totalFixedDebts - totalExpenses - investmentAmount;
  
  // Progress bar: (Fixed + Variable + Investment) / Salary
  const totalCommitment = totalFixedDebts + totalExpenses + investmentAmount;
  const progress = (salary || 0) > 0 ? Math.min((totalCommitment / salary) * 100, 100) : 0;
  const isOverBudget = (salary || 0) > 0 && totalCommitment > salary;

  // Mascot Logic
  const totalPatrimony = useMemo(() => {
    return (portfolio || []).reduce((acc, asset) => acc + (asset.quantity * asset.currentPrice), 0);
  }, [portfolio]);

  const passiveIncome = useMemo(() => {
     return (portfolio || []).reduce((acc, asset) => {
        const yieldRate = (ASSET_YIELDS[asset.type] || 0) / 100;
        return acc + (asset.quantity * asset.currentPrice * yieldRate / 12);
     }, 0);
  }, [portfolio]);

  // Emergency Fund Calculations
  const emergencyGoalValue = useMemo(() => totalExpenses * (emergencyMonths || 6), [totalExpenses, emergencyMonths]);
  
  const currentEmergencyValue = useMemo(() => {
    return (portfolio || [])
      .filter(asset => asset.type === 'Renda Fixa' || asset.name.includes('Tesouro'))
      .reduce((acc, asset) => acc + (asset.quantity * asset.currentPrice), 0);
  }, [portfolio]);

  const emergencyProgressPct = useMemo(() => {
     if (emergencyGoalValue === 0) return 0;
     return Math.min(100, (currentEmergencyValue / emergencyGoalValue) * 100);
  }, [currentEmergencyValue, emergencyGoalValue]);

  // Spending Analysis for Alert
  const spendingAnalysis = useMemo(() => {
    if (!isOverBudget) return null;

    const CUTTABLE_CATEGORIES = ['Lazer', 'Compras', 'Assinaturas', 'Viagem', 'Outros', 'Alimentação'];
    const analysis = {};

    (expenses || []).forEach(exp => {
        if (CUTTABLE_CATEGORIES.includes(exp.category)) {
            if (!analysis[exp.category]) analysis[exp.category] = 0;
            analysis[exp.category] += exp.amount;
        }
    });

    // Find top offender
    let topCategory = null;
    let maxAmount = 0;

    Object.entries(analysis).forEach(([cat, amount]) => {
        if (amount > maxAmount) {
            maxAmount = amount;
            topCategory = cat;
        }
    });

    if (topCategory) {
        return { category: topCategory, amount: maxAmount };
    }
    return null;
  }, [isOverBudget, expenses]);

  const mascotStatus = useMemo(() => {
    const isFemale = userGender === 'female';
    
    // 1. Corrida do Rato: Gastando mais que ganha ou sem controle
    if (isOverBudget || balance < 0) {
      return {
        level: 1,
        title: isFemale ? "Corrida da Rata" : "Corrida do Rato",
        description: "Você está correndo na roda! Precisa organizar as contas.",
        image: isFemale 
          ? "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=sad%20tired%20cute%20cartoon%20female%20rat%20with%20a%20pink%20bow%20wearing%20tattered%20clothes%20running%20inside%20a%20hamster%20wheel%2C%20sweating%2C%20stressed%2C%203d%20render%2C%20pixar%20style%2C%20dark%20moody%20lighting&image_size=square"
          : "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=sad%20tired%20cute%20cartoon%20rat%20wearing%20tattered%20clothes%20running%20inside%20a%20hamster%20wheel%2C%20sweating%2C%20stressed%2C%203d%20render%2C%20pixar%20style%2C%20dark%20moody%20lighting&image_size=square",
        color: "#ef4444", // Red
        current: balance,
        target: 0,
        metricLabel: "Saldo Livre",
        nextLevel: isFemale ? "Rata Organizada" : "Rato Organizado"
      };
    }

    // 2. Rato Organizado: Sobra dinheiro, mas ainda no início (< 5% da meta)
    if (totalPatrimony < (userInvestmentGoal * 0.05)) {
      return {
        level: 2,
        title: isFemale ? "Rata Organizada" : "Rato Organizado",
        description: "As contas fecham! Hora de começar a construir sua reserva.",
        image: isFemale 
          ? "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=happy%20organized%20cute%20cartoon%20female%20rat%20with%20a%20pink%20bow%20wearing%20casual%20clean%20clothes%20holding%20a%20calculator%20and%20a%20piggy%20bank%2C%20neat%20home%20office%20background%2C%203d%20render%2C%20pixar%20style%2C%20bright%20lighting&image_size=square"
          : "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=happy%20organized%20cute%20cartoon%20rat%20wearing%20casual%20clean%20clothes%20holding%20a%20calculator%20and%20a%20piggy%20bank%2C%20neat%20home%20office%20background%2C%203d%20render%2C%20pixar%20style%2C%20bright%20lighting&image_size=square",
        color: "#3b82f6", // Blue
        current: totalPatrimony,
        target: userInvestmentGoal * 0.05,
        metricLabel: "Patrimônio Inicial",
        nextLevel: isFemale ? "Rata Investidora" : "Rato Investidor"
      };
    }

    // 3. Rato Investidor: Construindo patrimônio (< 40% da meta)
    if (totalPatrimony < (userInvestmentGoal * 0.40)) {
      return {
        level: 3,
        title: isFemale ? "Rata Investidora" : "Rato Investidor",
        description: "Seu dinheiro começou a trabalhar por você. Continue construindo seu patrimônio.",
        image: isFemale 
          ? "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=smart%20confident%20cute%20cartoon%20female%20rat%20with%20a%20pink%20bow%20wearing%20business%20casual%20clothes%20analyzing%20a%20growing%20stock%20chart%20hologram%2C%20modern%20office%20background%2C%203d%20render%2C%20pixar%20style&image_size=square"
          : "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=smart%20confident%20cute%20cartoon%20rat%20wearing%20business%20casual%20clothes%20analyzing%20a%20growing%20stock%20chart%20hologram%2C%20modern%20office%20background%2C%203d%20render%2C%20pixar%20style&image_size=square",
        color: "#8b5cf6", // Purple
        current: totalPatrimony,
        target: userInvestmentGoal * 0.40,
        metricLabel: "Patrimônio",
        nextLevel: isFemale ? "Rata Estratégica" : "Rato Estratégico"
      };
    }

    // 4. Rato Estratégico: Patrimônio robusto (< 100% da meta)
    if (totalPatrimony < userInvestmentGoal) {
      return {
        level: 4,
        title: isFemale ? "Rata Estratégica" : "Rato Estratégico",
        description: "Você domina o jogo! A liberdade está próxima.",
        image: isFemale 
          ? "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=wealthy%20sophisticated%20cute%20cartoon%20female%20rat%20with%20a%20pink%20bow%20wearing%20an%20elegant%20business%20suit%2C%20holding%20a%20money%20bag%2C%20luxury%20office%20with%20city%20view%2C%203d%20render%2C%20pixar%20style&image_size=square"
          : "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=wealthy%20sophisticated%20cute%20cartoon%20rat%20wearing%20a%20sharp%20suit%2C%20holding%20a%20money%20bag%2C%20luxury%20office%20with%20city%20view%2C%203d%20render%2C%20pixar%20style&image_size=square",
        color: "#f59e0b", // Amber
        current: totalPatrimony,
        target: userInvestmentGoal,
        metricLabel: "Patrimônio vs Meta",
        nextLevel: isFemale ? "Rata Livre" : "Rato Livre"
      };
    }

    // 5. Rato Livre: Meta Atingida!
    return {
      level: 5,
      title: isFemale ? "Rata Livre" : "Rato Livre",
      description: "Você venceu o sistema! Aproveite a vida.",
      image: isFemale 
        ? "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=triumphant%20extremely%20rich%20cute%20cartoon%20female%20rat%20with%20a%20pink%20bow%20wearing%20a%20gala%20dress%20and%20tiara%2C%20relaxing%20on%20a%20huge%20pile%20of%20gold%20coins%20on%20a%20tropical%20beach%2C%20sunny%20paradise%2C%203d%20render%2C%20pixar%20style&image_size=square"
        : "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=triumphant%20extremely%20rich%20cute%20cartoon%20rat%20wearing%20a%20tuxedo%20and%20top%20hat%2C%20relaxing%20on%20a%20huge%20pile%20of%20gold%20coins%20on%20a%20tropical%20beach%2C%20sunny%20paradise%2C%203d%20render%2C%20pixar%20style&image_size=square",
      color: "#10b981", // Emerald
      current: totalPatrimony,
      target: userInvestmentGoal * 1.5, // Infinite basically
      metricLabel: "Liberdade Financeira",
      nextLevel: "Lenda Viva"
    };
  }, [isOverBudget, balance, totalPatrimony, userInvestmentGoal, userGender]);

  // 4. Missions Effect (Moved here to access calculated values like isOverBudget)
  const MISSIONS = useMemo(() => [
    { id: 1, title: "Primeiro Gasto", xp: 100, icon: Receipt, check: () => (expenses || []).length > 0 },
    { id: 2, title: "Definir Meta", xp: 150, icon: Target, check: () => (investmentGoalPct || 0) > 0 },
    { id: 3, title: "Primeiro Investimento", xp: 300, icon: TrendingUp, check: () => (portfolio || []).length > 0 },
    { id: 4, title: "Reserva Iniciada", xp: 200, icon: ShieldCheck, check: () => (emergencyFundPct || 0) > 0 },
    { id: 5, title: "Nome Limpo", xp: 500, icon: Sparkles, check: () => !isOverBudget },
  ], [expenses, investmentGoalPct, portfolio, emergencyFundPct, isOverBudget]);

  useEffect(() => {
    // Check missions
    if (!isDataLoaded) return;

    MISSIONS.forEach(mission => {
        if (!completedMissions.includes(mission.id) && mission.check()) {
            setCompletedMissions(prev => [...prev, mission.id]);
            setXp(prev => prev + mission.xp);
        }
    });
  }, [MISSIONS, completedMissions, isDataLoaded]);

  // Investment Calculations
  const totalClassAllocation = useMemo(() => Object.values(classAllocations || {}).reduce((acc, curr) => acc + curr, 0), [classAllocations]);
  
  const allocationHealth = useMemo(() => {
    if (totalClassAllocation === 100) return "healthy";
    if (totalClassAllocation >= 80 && totalClassAllocation < 100) return "warning";
    return "danger";
  }, [totalClassAllocation]);

  const assetsByClass = useMemo(() => {
    const grouped = {};
    
    // Initialize groups based on allocation
    Object.keys(classAllocations || {}).forEach(cls => {
        if (classAllocations[cls] > 0) {
            grouped[cls] = { 
                targetPct: classAllocations[cls], 
                totalAmount: (investmentAmount * classAllocations[cls]) / 100,
                assets: [] 
            };
        }
    });

    // Distribute assets
    (portfolio || []).forEach(asset => {
      if (grouped[asset.type]) {
        const assetAmount = (grouped[asset.type].totalAmount * asset.percentage) / 100;
        grouped[asset.type].assets.push({ ...asset, amount: assetAmount });
      }
    });
    return grouped;
  }, [portfolio, investmentAmount, classAllocations]);

  // Chart Data
  const categoryData = useMemo(() => {
    const data = {};
    (expenses || []).forEach(exp => {
      if (!data[exp.category]) data[exp.category] = 0;
      data[exp.category] += exp.amount;
    });
    return Object.keys(data).map(key => ({ name: key, value: data[key] }));
  }, [expenses]);

  const portfolioData = useMemo(() => {
    return Object.keys(classAllocations || {})
      .filter(key => classAllocations[key] > 0)
      .map(key => ({ name: key, value: classAllocations[key] }));
  }, [classAllocations]);

  // Simulator Data & Weighted Average Rate
  const { weightedAverageRate, weightedAverageYield } = useMemo(() => {
    let totalWeightedReturn = 0;
    let totalWeightedYield = 0;
    let totalAllocation = 0;

    Object.keys(classAllocations || {}).forEach(cls => {
      const allocation = classAllocations[cls];
      if (allocation > 0) {
        totalWeightedReturn += allocation * (ASSET_RETURNS[cls] || 0);
        totalWeightedYield += allocation * (ASSET_YIELDS[cls] || 0);
        totalAllocation += allocation;
      }
    });

    return {
      weightedAverageRate: totalAllocation > 0 ? (totalWeightedReturn / totalAllocation) : 0,
      weightedAverageYield: totalAllocation > 0 ? (totalWeightedYield / totalAllocation) : 0
    };
  }, [classAllocations]);

  const simulationData = useMemo(() => {
    const data = [];
    const monthlyRate = weightedAverageRate / 12 / 100;
    const monthlyYieldRate = weightedAverageYield / 12 / 100;
    
    let currentAmount = 0;
    let totalInvested = 0;
    let crossoverPoint = null;

    for (let year = 1; year <= simYears; year++) {
      for (let month = 1; month <= 12; month++) {
        const interestThisMonth = currentAmount * monthlyRate;
        const potentialIncomeThisMonth = currentAmount * monthlyYieldRate;
        
        // Check for crossover point (Magic Moment) - based on Total Return (Wealth building)
        if (!crossoverPoint && potentialIncomeThisMonth > simMonthly) {
            crossoverPoint = { 
              year, 
              month, 
              interestAmount: potentialIncomeThisMonth,
              totalAmount: currentAmount,
              type: 'income'
            };
        }

        currentAmount += interestThisMonth + simMonthly;
        totalInvested += simMonthly;
      }
      
      // Push data for chart (every year)
      if (year % 1 === 0) { 
        data.push({
          year: `Ano ${year}`,
          invested: totalInvested,
          interest: currentAmount - totalInvested,
          total: currentAmount,
          monthlyReturn: (currentAmount * monthlyRate), 
          monthlyContribution: simMonthly,
          monthlyPassiveIncome: (currentAmount * monthlyYieldRate) // Projected Monthly Income
        });
      }
    }
    
    // Final passive income projection
    const finalMonthlyIncome = currentAmount * monthlyYieldRate;

    return { data, finalAmount: currentAmount, totalInvested, totalInterest: currentAmount - totalInvested, crossoverPoint, finalMonthlyIncome };
  }, [simYears, weightedAverageRate, weightedAverageYield, simMonthly]);

  // Handlers
  const handleSubscribe = async (planType) => {
    if (!user) return;
    
    // Use env vars or fallback to known working IDs
    const priceId = planType === 'monthly' 
        ? (process.env.NEXT_PUBLIC_STRIPE_PRICE_MENSAL || 'price_1T8iNhH3YZ3ci68QcbgDa0ln')
        : (process.env.NEXT_PUBLIC_STRIPE_PRICE_ANUAL || 'price_1T8iOtH3YZ3ci68QZ8jT1kYx');

    try {
        const res = await fetch('/api/create-checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                priceId,
                userEmail: user.email,
                userId: user.id,
            }),
        });

        const data = await res.json();
        
        if (!res.ok) {
            console.error('Checkout API Error:', data);
            alert(`Erro ao iniciar pagamento: ${data.error || 'Erro desconhecido'} (Status: ${res.status})`);
            return;
        }

        if (data.url) {
            window.location.href = data.url;
        } else {
            console.error('Failed to create checkout session', data);
            alert('Erro: O servidor não retornou a URL de pagamento.');
        }
    } catch (error) {
        console.error('Error subscribing:', error);
        alert(`Erro de conexão ao processar assinatura: ${error.message}`);
    }
  };

  const handleCloseMonth = () => {
    if (window.confirm("Tem certeza que deseja fechar o mês? Isso apagará todos os gastos variáveis (lista de compras, lazer, etc), mas manterá seu salário, investimentos e dívidas fixas.")) {
        setExpenses([]);
        // Force save immediately or let useEffect handle it (it will handle it)
        alert("Mês fechado com sucesso! Seus gastos variáveis foram zerados.");
    }
  };

  const handleAddDebt = (e) => {
    e.preventDefault();
    if (!newDebt.description || !newDebt.amount) return;

    setFixedDebts([
        ...fixedDebts,
        {
            id: Date.now(),
            ...newDebt,
            amount: parseFloat(newDebt.amount),
            monthsRemaining: newDebt.type === 'installment' ? parseInt(newDebt.monthsRemaining) : null,
            totalMonths: newDebt.type === 'installment' ? parseInt(newDebt.totalMonths || newDebt.monthsRemaining) : null
        }
    ]);
    setNewDebt({ description: "", amount: "", type: "fixed", monthsRemaining: "", totalMonths: "" });
    setIsAddingDebt(false);
  };

  const handleDeleteDebt = (id) => {
    setFixedDebts(fixedDebts.filter(d => d.id !== id));
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount) return;

    if (editingId) {
      setExpenses(expenses.map(exp => 
        exp.id === editingId ? { ...exp, ...newExpense, amount: parseFloat(newExpense.amount) } : exp
      ));
      setEditingId(null);
    } else {
      setExpenses([
        ...expenses, 
        { 
          id: Date.now(), 
          ...newExpense, 
          amount: parseFloat(newExpense.amount),
          date: new Date().toISOString().split('T')[0]
        }
      ]);
    }
    setNewExpense({ description: "", amount: "", category: "Outros" });
  };

  const handleEdit = (expense) => {
    setNewExpense({ 
      description: expense.description, 
      amount: expense.amount, 
      category: expense.category 
    });
    setEditingId(expense.id);
    setActiveTab("gastos");
  };

  const handleDelete = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const handleAddAsset = (e) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.percentage) return;
    setPortfolio([...portfolio, { 
      id: Date.now(), 
      ...newAsset, 
      percentage: parseFloat(newAsset.percentage),
      quantity: parseFloat(newAsset.quantity) || 0,
      currentPrice: parseFloat(newAsset.currentPrice) || 0
    }]);
    setNewAsset({ name: "", type: "Ação BR", percentage: "", quantity: "", currentPrice: "" });
  };

  const handleDeleteAsset = (id) => {
    setPortfolio(portfolio.filter(asset => asset.id !== id));
  };

  const handlePresetClick = (preset) => {
    setNewExpense({
      ...newExpense,
      description: preset.label,
      category: preset.category
    });
  };

  const formatCurrency = (value, curr = currency) => {
    const val = value || 0;
    if (curr === 'USD') {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const convertValue = (value) => {
    if (currency === 'BRL') return value;
    return value / exchangeRate;
  };

  const getMotivationalQuote = (amount, monthlyIncome) => {
    if (showIncomeChart) {
      if (monthlyIncome > 20000) return "Liberdade Financeira Total! 🏝️";
      if (monthlyIncome > 10000) return "Salário de executivo sem trabalhar! 💼";
      if (monthlyIncome > 5000) return "Já paga todas as contas da casa! 🏠";
      if (monthlyIncome > 2000) return "Uma renda extra considerável! 💰";
      if (monthlyIncome > 500) return "Já paga o condomínio ou a luz! ⚡";
      return "Começando a bola de neve de dividendos! ❄️";
    }

    if (amount > 1000000) return "Você será um MILIONÁRIO! 🚀";
    if (amount > 500000) return "Meio caminho andado para o milhão! 🔥";
    if (amount > 100000) return "Já dá para comprar um carro de luxo! 🚗";
    if (amount > 50000) return "Uma bela reserva de emergência! 💰";
    return "O começo de uma grande jornada! 🌱";
  };

  const getExpenseIcon = (description) => {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('supermercado') || lowerDesc.includes('mercado')) return <ShoppingCart size={16} />;
    if (lowerDesc.includes('cinema') || lowerDesc.includes('filme')) return <Film size={16} />;
    if (lowerDesc.includes('lanche') || lowerDesc.includes('burger') || lowerDesc.includes('food') || lowerDesc.includes('ifood')) return <Utensils size={16} />;
    if (lowerDesc.includes('compra') || lowerDesc.includes('shopping')) return <ShoppingBag size={16} />;
    if (lowerDesc.includes('netflix')) return <Tv size={16} />;
    if (lowerDesc.includes('youtube')) return <Youtube size={16} />;
    if (lowerDesc.includes('spotify') || lowerDesc.includes('music')) return <Music size={16} />;
    if (lowerDesc.includes('uber') || lowerDesc.includes('99') || lowerDesc.includes('taxi') || lowerDesc.includes('transporte')) return <Car size={16} />;
    if (lowerDesc.includes('assinatura') || lowerDesc.includes('cartão') || lowerDesc.includes('fatura')) return <CreditCard size={16} />;
    if (lowerDesc.includes('celular') || lowerDesc.includes('internet') || lowerDesc.includes('vivo') || lowerDesc.includes('tim') || lowerDesc.includes('claro')) return <Smartphone size={16} />;
    if (lowerDesc.includes('luz') || lowerDesc.includes('agua') || lowerDesc.includes('energia') || lowerDesc.includes('condominio')) return <Zap size={16} />;
    if (lowerDesc.includes('saude') || lowerDesc.includes('farmacia') || lowerDesc.includes('remedio') || lowerDesc.includes('medico')) return <Heart size={16} />;
    return null;
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">Carregando...</div>;
  }

  if (!user || authView === 'update_password') {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--bg-card)] p-8 rounded-2xl border border-[var(--border-color)] shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col items-center mb-8">
            <div className="p-4 bg-[var(--primary-soft)] rounded-2xl mb-4 shadow-lg shadow-purple-900/20">
              <Wallet className="w-12 h-12 text-[var(--primary)]" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] bg-clip-text text-transparent mb-2">
              CLT Rico
            </h1>
            <p className="text-[var(--text-secondary)] text-center">
              {authView === 'update_password' ? 'Crie sua nova senha' : 'Seu caminho para a liberdade financeira começa aqui.'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authError && (
               <div className="bg-[var(--danger-soft)]/20 border border-[var(--danger)]/50 text-[var(--danger)] p-3 rounded-xl text-sm flex items-center gap-2">
                   <AlertCircle size={16} />
                   {authError}
               </div>
            )}
            {authSuccess && (
               <div className="bg-[var(--success-soft)]/20 border border-[var(--success)]/50 text-[var(--success)] p-3 rounded-xl text-sm flex items-center gap-2">
                   <CheckCircle2 size={16} />
                   {authSuccess}
               </div>
            )}

            {authView === 'register' && (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="Seu nome"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-3 pl-10 pr-4 outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>
            )}

            {authView !== 'update_password' && (
                <div>
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">E-mail</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                    <input
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-3 pl-10 pr-4 outline-none focus:border-[var(--primary)] transition-colors"
                    />
                </div>
                </div>
            )}

            {authView !== 'forgot' && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                  {authView === 'update_password' ? 'Nova Senha' : 'Senha'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                <input
                  type="password"
                  required
                  placeholder={authView === 'update_password' ? "Mínimo 6 caracteres" : "******"}
                  value={authForm.password}
                  onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-3 pl-10 pr-4 outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              {authView === 'login' && (
                <div className="text-right mt-1">
                    {/* Forgot Password link moved to below the button for better layout */}
                </div>
              )}
            </div>
            )}

            {authView === 'register' && (
               <div className="animate-in fade-in slide-in-from-bottom-2">
                   <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Gênero (para o Mascote)</label>
                   <div className="flex gap-4">
                       <label className={`flex-1 cursor-pointer p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${authForm.gender === 'male' ? 'bg-[var(--primary-soft)] border-[var(--primary)] text-[var(--primary)]' : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-secondary)]'}`}>
                           <input type="radio" name="gender" value="male" checked={authForm.gender === 'male'} onChange={() => setAuthForm({...authForm, gender: 'male'})} className="hidden" />
                           <span>👨 Masculino</span>
                       </label>
                       <label className={`flex-1 cursor-pointer p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${authForm.gender === 'female' ? 'bg-[var(--primary-soft)] border-[var(--primary)] text-[var(--primary)]' : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-secondary)]'}`}>
                           <input type="radio" name="gender" value="female" checked={authForm.gender === 'female'} onChange={() => setAuthForm({...authForm, gender: 'female'})} className="hidden" />
                           <span>👩 Feminino</span>
                       </label>
                   </div>
               </div>
            )}

            <button
              type="submit"
              disabled={isAuthLoading}
              className={`w-full bg-[var(--primary)] hover:opacity-90 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-900/20 transition-all transform active:scale-95 flex justify-center items-center gap-2 ${isAuthLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isAuthLoading ? (
                  <>
                      <Loader2 className="animate-spin" size={20} />
                      Aguarde...
                  </>
              ) : (
                  authView === 'login' ? 'Entrar' : authView === 'register' ? 'Criar Conta' : authView === 'update_password' ? 'Salvar Nova Senha' : 'Enviar Link de Recuperação'
              )}
            </button>
            
            {authView === 'login' && (
                <button
                    type="button"
                    onClick={() => {
                        setAuthView('forgot');
                        setAuthError('');
                        setAuthSuccess('');
                    }}
                    className="w-full mt-3 text-sm text-[var(--primary)] hover:underline opacity-80 hover:opacity-100"
                >
                    Esqueci minha senha
                </button>
            )}
          </form>

          <div className="mt-6 text-center">
            {authView === 'forgot' || authView === 'update_password' ? (
                <button
                    type="button"
                    onClick={() => {
                        setAuthView('login');
                        setAuthError('');
                        setAuthSuccess('');
                        if (authView === 'update_password') {
                             window.location.reload(); 
                        }
                    }}
                    className="text-[var(--primary)] font-bold hover:underline text-sm"
                >
                    {authView === 'update_password' ? 'Cancelar' : 'Voltar para Login'}
                </button>
            ) : (
                <p className="text-[var(--text-secondary)] text-sm">
                {authView === 'login' ? 'Ainda não tem conta?' : 'Já tem uma conta?'}
                <button
                    type="button"
                    onClick={() => {
                        setAuthView(authView === 'login' ? 'register' : 'login');
                        setAuthError('');
                        setAuthSuccess('');
                    }}
                    className="ml-2 text-[var(--primary)] font-bold hover:underline"
                >
                    {authView === 'login' ? 'Cadastre-se' : 'Faça Login'}
                </button>
                </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleSimulatePremium = async () => {
    if (!user) return;
    try {
        // Check if already exists
        const { data } = await supabase.from('subscriptions').select('id').eq('user_id', user.id).maybeSingle();
        
        let error;
        if (data) {
            const res = await supabase.from('subscriptions').update({ status: 'active', plan: 'simulated_premium' }).eq('user_id', user.id);
            error = res.error;
        } else {
            const res = await supabase.from('subscriptions').insert({
                user_id: user.id,
                status: 'active',
                plan: 'simulated_premium'
            });
            error = res.error;
        }

        if (error) throw error;
        alert("Modo Premium Simulado Ativado! A página será recarregada.");
        window.location.reload();
    } catch (e) {
        console.error(e);
        alert("Erro ao simular premium: " + e.message);
    }
  };

  // Loading Screen for Data Fetching
  if (!isDataLoaded) {
      return (
          <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-[var(--primary)]" size={48} />
                  <p className="text-[var(--text-secondary)] animate-pulse">Carregando seus dados...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] p-4 md:p-8 font-sans transition-colors duration-300">
      {/* Virtual Card Modal */}
      {showCardModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setShowCardModal(false)}>
            <div className="relative w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowCardModal(false)} className="absolute -top-10 right-0 text-white hover:text-gray-300">
                    <Trash2 className="rotate-45" size={24} /> Fechar
                </button>
                
                {/* The Card */}
                <div 
                    className="aspect-[1.58/1] w-full rounded-2xl p-6 relative overflow-hidden shadow-2xl flex flex-col justify-between border border-white/10"
                    style={{ 
                        background: `linear-gradient(135deg, ${mascotStatus.color} 0%, #000000 100%)`,
                        boxShadow: `0 0 40px ${mascotStatus.color}40`
                    }}
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    
                    {/* Top Row */}
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Wallet className="text-white/90" size={20} />
                                <span className="font-bold text-white tracking-wider">CLT Rico</span>
                            </div>
                            <div className="text-xs text-white/60 font-mono uppercase tracking-[0.2em]">MEMBER CARD</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                            <span className="text-xs font-bold text-white uppercase">{mascotStatus.title}</span>
                        </div>
                    </div>

                    {/* Middle Row - Mascot & Level */}
                    <div className="relative z-10 flex items-center gap-4 my-4">
                        <div className="w-20 h-20 rounded-full border-2 border-white/30 overflow-hidden bg-black/20 shadow-lg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={mascotStatus.image} alt="Mascot" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white drop-shadow-md">{user?.name || 'Viajante'}</div>
                            <div className="text-sm text-white/80">Nível {mascotStatus.level}</div>
                        </div>
                    </div>

                    {/* Bottom Row - Stats */}
                    <div className="relative z-10">
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-[10px] text-white/60 uppercase mb-1">Patrimônio Total</div>
                                <div className="text-xl font-mono font-bold text-white tracking-tight">
                                    {formatCurrency(totalPatrimony)}
                                </div>
                            </div>
                            
                            {/* Fake Chip */}
                            <div className="w-10 h-8 rounded bg-gradient-to-br from-yellow-200 to-yellow-600 opacity-80 flex items-center justify-center overflow-hidden">
                                <div className="w-full h-[1px] bg-black/20 my-[2px]"></div>
                                <div className="absolute w-[1px] h-full bg-black/20 mx-[2px]"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center space-y-4">
                    <p className="text-gray-400 text-sm">Tire um print da tela para compartilhar sua evolução! 📸</p>
                    <button 
                        onClick={() => setShowCardModal(false)}
                        className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-bold text-white transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Install Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowInstallModal(false)}>
            <div className="bg-[var(--bg-card)] p-6 rounded-2xl max-w-sm w-full border border-[var(--border-color)] relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowInstallModal(false)} className="absolute top-4 right-4 text-[var(--text-secondary)]">✕</button>
                
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Smartphone className="text-[var(--primary)]" />
                    Instalar App
                </h3>

                {isIOS ? (
                    <div className="space-y-4">
                        <p className="text-[var(--text-secondary)]">Para instalar no iPhone/iPad:</p>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--text-primary)]">
                            <li>Toque no botão <strong className="text-[var(--primary)]">Compartilhar</strong> (ícone quadrado com seta) na barra inferior do Safari.</li>
                            <li>Role para baixo e toque em <strong className="text-[var(--primary)]">Adicionar à Tela de Início</strong>.</li>
                            <li>Toque em <strong>Adicionar</strong> no canto superior direito.</li>
                        </ol>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-[var(--text-secondary)]">Para instalar no Android/Chrome:</p>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--text-primary)]">
                            <li>Toque no menu do navegador (três pontinhos).</li>
                            <li>Selecione <strong className="text-[var(--primary)]">Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</li>
                        </ol>
                    </div>
                )}
                
                <button onClick={() => setShowInstallModal(false)} className="mt-6 w-full py-3 bg-[var(--primary)] rounded-xl font-bold text-white">
                    Entendi
                </button>
            </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)] shadow-xl grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          
          {/* Logo & Title */}
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="p-2 bg-[var(--primary-soft)] rounded-xl shrink-0">
              <Wallet className="w-8 h-8 text-[var(--primary)]" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] bg-clip-text text-transparent">
              CLT Rico <span className="text-[10px] opacity-50 font-mono text-[var(--text-secondary)]">v1.1</span>
            </h1>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full">
            {/* Virtual Card Button */}
            <button 
                onClick={() => setShowCardModal(true)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-lg active:scale-95"
            >
                <CreditCard size={14} />
                <span>Carteirinha</span>
            </button>

            {/* Install PWA Button */}
            <button 
                onClick={handleInstallApp}
                className="flex items-center justify-center gap-2 bg-[var(--primary)] text-white px-3 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-all animate-pulse shadow-lg shadow-purple-500/20 active:scale-95"
            >
                <Smartphone size={14} />
                <span>Instalar</span>
            </button>
            
            {/* Divider */}
            <div className="w-px h-6 bg-[var(--border-color)] mx-1 hidden sm:block"></div>

            {/* Theme Toggle */}
            <div className="relative">
                <button
                    onClick={() => setShowThemeMenu(!showThemeMenu)}
                    className="p-2 rounded-lg bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                    title="Mudar Tema"
                >
                    <Palette size={18} />
                </button>
                
                {showThemeMenu && (
                    <div className="absolute top-full right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl p-2 flex flex-col gap-1 z-50 min-w-[150px]">
                        {THEMES.map(t => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTheme(t.id);
                                    setShowThemeMenu(false);
                                }}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm w-full text-left ${theme === t.id ? 'bg-[var(--primary-soft)] text-[var(--primary)]' : 'hover:bg-[var(--bg-input)] text-[var(--text-primary)]'}`}
                            >
                                {t.icon}
                                {t.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Subscription Button */}
            <button
                onClick={() => setShowSubscriptionModal(true)}
                className={`p-2 rounded-lg transition-colors ${isPro ? 'bg-yellow-500/20 text-yellow-500' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-yellow-500'}`}
                title="Assinatura Premium"
            >
                <Crown size={18} className={isPro ? "fill-yellow-500" : ""} />
            </button>

            {/* Gender Toggle */}
            <button
                onClick={() => {
                    const newGender = userGender === 'male' ? 'female' : 'male';
                    setUserGender(newGender);
                    // Optional: Save immediately or let debouncer handle it
                }}
                className="p-2 rounded-lg bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                title="Mudar Gênero do Mascote"
            >
                <span className="text-lg leading-none">{userGender === 'male' ? '👨' : '👩'}</span>
            </button>

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                title="Sair"
            >
                <LogOut size={18} />
            </button>
          </div>

          {/* User Info & Actions (Hidden on tiny screens if needed, but lets keep it accessible) */}
          <div className="hidden">
            {/* Saving Indicator */}
            <div className="hidden lg:flex items-center gap-2 mr-2">
                {savingStatus === 'saving' && (
                    <span className="flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-[var(--warning)]"></span>
                        Salvando...
                    </span>
                )}
                {savingStatus === 'saved' && (
                    <span className="flex items-center gap-1 text-xs font-medium text-[var(--success)] animate-in fade-in slide-in-from-bottom-1">
                        <CheckCircle2 size={12} />
                        Salvo
                    </span>
                )}
                {savingStatus === 'error' && (
                    <span className="flex items-center gap-1 text-xs font-medium text-[var(--danger)]">
                        <AlertTriangle size={12} />
                        Erro ao salvar
                    </span>
                )}
            </div>

            <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-[var(--text-primary)]">{user?.name}</span>
                <span className="text-xs text-[var(--text-secondary)]">{user?.email}</span>
            </div>
            
            <button 
                onClick={handleLogout}
                className="p-3 bg-[var(--bg-input)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] rounded-xl border border-[var(--border-color)] transition-colors"
                title="Sair"
            >
                <LogOut size={20} />
            </button>

            <div className="flex items-center gap-4 bg-[var(--bg-input)] p-2 rounded-xl border border-[var(--border-color)] hover:border-[var(--primary)] transition-colors cursor-text group">
              <span className="text-[var(--text-secondary)] text-sm font-medium pl-2">Salário Mensal:</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">R$</span>
                <input 
                  type="number" 
                  value={salary || ''} 
                  placeholder="0,00"
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="bg-transparent border-none outline-none text-[var(--text-primary)] font-bold w-32 pl-8 py-1 focus:ring-0 placeholder-gray-500"
                />
              </div>
              <Edit2 size={14} className="text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity mr-2" />
            </div>

            {/* Gender Toggle */}
            <button 
              onClick={() => setUserGender(prev => prev === 'male' ? 'female' : 'male')}
              className="p-3 bg-[var(--bg-input)] hover:bg-[var(--primary-soft)] rounded-xl border border-[var(--border-color)] transition-colors text-xl"
              title={userGender === 'male' ? "Mudar para Feminino" : "Mudar para Masculino"}
            >
              {userGender === 'male' ? '👨' : '👩'}
            </button>

            {/* Theme Selector */}
            <div className="relative">
              <button 
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-3 bg-[var(--bg-input)] hover:bg-[var(--primary-soft)] rounded-xl border border-[var(--border-color)] transition-colors"
                title="Alterar Tema"
              >
                <Palette size={20} className="text-[var(--text-secondary)] hover:text-[var(--primary)]" />
              </button>
              
              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-2xl z-50 overflow-hidden">
                  {THEMES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setTheme(t.id); setShowThemeMenu(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 hover:bg-[var(--primary-soft)] transition-colors ${theme === t.id ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}
                    >
                      <div className="w-4 h-4 rounded-full border border-gray-500/20" style={{ backgroundColor: t.color }}></div>
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pro Subscription Button */}
            {!isPro && (
              <Link 
                href="/planos"
                className="p-3 rounded-xl border border-[#f59e0b] bg-[#f59e0b]/10 hover:bg-[#f59e0b] text-[#f59e0b] hover:text-black transition-all font-bold flex items-center gap-2 group"
              >
                <span>⭐</span>
                <span className="hidden md:inline">Seja Premium</span>
              </Link>
            )}
            
            {isPro && (
               <div className="p-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 flex items-center gap-2">
                  <Crown size={20} className="fill-yellow-500" />
                  <span className="text-xs font-bold hidden md:inline">PREMIUM</span>
               </div>
            )}
           </div>
         </header>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap gap-2 bg-[var(--bg-card)] p-1 rounded-xl w-fit mx-auto md:mx-0 border border-[var(--border-color)]">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "investimentos", label: "Investimentos", icon: TrendingUp },
            { id: "gastos", label: "Gastos", icon: Plus },
            { id: "extrato", label: "Extrato", icon: List },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-300 font-medium ${
                activeTab === tab.id 
                  ? "bg-[var(--primary)] text-white shadow-lg shadow-purple-900/20" 
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-app)]"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* Mascot Evolution Section - NEW */}
              <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] relative overflow-hidden transition-all hover:shadow-lg hover:shadow-purple-900/10 group">
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: mascotStatus.color }}></div>
                
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Avatar Area */}
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-[var(--bg-input)] flex items-center justify-center border-4 shadow-xl transition-transform transform group-hover:scale-110 overflow-hidden" style={{ borderColor: mascotStatus.color }}>
                      <img 
                        src={mascotStatus.image} 
                        alt={mascotStatus.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-[var(--bg-card)] px-3 py-1 rounded-full border border-[var(--border-color)] shadow-sm z-10">
                      <span className="text-xs font-bold" style={{ color: mascotStatus.color }}>Nv. {mascotStatus.level}</span>
                    </div>
                  </div>

                  {/* Info Area */}
                  <div className="flex-1 w-full text-center md:text-left space-y-3">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2 justify-center md:justify-start">
                          {mascotStatus.title}
                        </h2>
                        <p className="text-[var(--text-secondary)] text-sm">{mascotStatus.description}</p>
                      </div>
                      
                      <div className="bg-[var(--bg-input)] px-3 py-1 rounded-lg border border-[var(--border-color)] flex items-center gap-2 mt-2 md:mt-0 mx-auto md:mx-0">
                         <Sparkles size={14} className="text-yellow-400" />
                         <span className="text-xs font-bold text-[var(--text-primary)]">{xp} XP</span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 bg-[var(--bg-input)]/50 p-3 rounded-xl border border-[var(--border-color)]/50">
                       <div className="text-left">
                          <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-0.5">Patrimônio Atual</p>
                          <p className="font-bold text-[var(--text-primary)]">{formatCurrency(totalPatrimony)}</p>
                       </div>
                       <div className="text-right">
                          <div className="flex items-center justify-end gap-2 mb-0.5">
                            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Minha Meta</p>
                            <button 
                              onClick={() => setIsEditingGoal(!isEditingGoal)}
                              className="text-[var(--primary)] hover:text-[var(--primary-light)] transition-colors"
                              title="Editar Meta"
                            >
                              <Edit2 size={12} />
                            </button>
                          </div>
                          
                          {isEditingGoal ? (
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-xs text-[var(--text-secondary)]">R$</span>
                              <input 
                                type="number" 
                                value={userInvestmentGoal}
                                onChange={(e) => setUserInvestmentGoal(Number(e.target.value))}
                                onBlur={() => setIsEditingGoal(false)}
                                autoFocus
                                className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded px-1 py-0.5 text-sm font-bold text-[var(--text-primary)] w-24 text-right outline-none focus:border-[var(--primary)]"
                              />
                            </div>
                          ) : (
                            <p className="font-bold text-[var(--text-primary)] opacity-70 cursor-pointer" onClick={() => setIsEditingGoal(true)}>
                              {formatCurrency(userInvestmentGoal)}
                            </p>
                          )}
                       </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative pt-1">
                      <div className="flex mb-1 items-center justify-between text-xs font-medium text-[var(--text-secondary)]">
                        <span>Progresso da Meta</span>
                        <span>{Math.min(100, Math.max(0, ((totalPatrimony / (userInvestmentGoal || 1)) * 100))).toFixed(1)}%</span>
                      </div>
                      <div className="overflow-hidden h-3 mb-1 text-xs flex rounded-full bg-[var(--bg-input)] border border-[var(--border-color)]/30">
                        <div 
                          style={{ width: `${Math.min(100, Math.max(0, ((totalPatrimony / (userInvestmentGoal || 1)) * 100)))}%`, backgroundColor: mascotStatus.color }} 
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 bg-gradient-to-r from-transparent to-white/20"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] relative overflow-hidden group hover:border-[var(--primary)] transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <DollarSign size={64} className="text-[var(--success)]" />
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm mb-1">Entradas</p>
                  <h3 className="text-2xl font-bold text-[var(--success)]">{formatCurrency(salary)}</h3>
                </div>
                
                <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] relative overflow-hidden group hover:border-[var(--warning)] transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Calendar size={64} className="text-[var(--warning)]" />
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm mb-1">Dívidas Fixas</p>
                  <h3 className="text-2xl font-bold text-[var(--warning)]">{formatCurrency(totalFixedDebts)}</h3>
                </div>

                <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] relative overflow-hidden group hover:border-[var(--danger)] transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingDown size={64} className="text-[var(--danger)]" />
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[var(--text-secondary)] text-sm mb-1">Gastos Variáveis</p>
                        <h3 className="text-2xl font-bold text-[var(--danger)]">{formatCurrency(totalExpenses)}</h3>
                    </div>
                    <button 
                        onClick={handleCloseMonth}
                        className="text-xs bg-[var(--danger-soft)] hover:bg-[var(--danger)] hover:text-white text-[var(--danger)] px-2 py-1 rounded border border-[var(--danger)]/30 transition-all z-10"
                        title="Zerar gastos variáveis para iniciar novo mês"
                    >
                        Fechar Mês
                    </button>
                  </div>
                </div>

                <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] relative overflow-hidden group hover:border-[var(--primary)] transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Target size={64} className="text-[var(--primary)]" />
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm mb-1">Investimentos ({investmentGoalPct}%)</p>
                  <h3 className="text-2xl font-bold text-[var(--primary)]">{formatCurrency(investmentAmount)}</h3>
                </div>

                <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] relative overflow-hidden group hover:border-[var(--info)] transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp size={64} className="text-[var(--info)]" />
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm mb-1">Saldo Livre</p>
                  <h3 className={`text-2xl font-bold ${balance >= 0 ? "text-[var(--info)]" : "text-[var(--danger)]"}`}>
                    {formatCurrency(balance)}
                  </h3>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-[var(--text-secondary)]">Comprometimento da Renda (Dívidas + Gastos + Investimentos)</span>
                  <span className={`text-sm font-bold ${isOverBudget ? "text-[var(--danger)]" : "text-[var(--primary-light)]"}`}>
                    {salary > 0 ? Math.round((totalCommitment / salary) * 100) : 0}%
                  </span>
                </div>
                <div className="h-4 bg-[var(--bg-input)] rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${
                      isOverBudget ? "bg-[var(--danger)]" : "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)]"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {isOverBudget && (
                  <div className="mt-6 bg-[var(--danger-soft)]/20 border border-[var(--danger)] rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-[var(--danger)]/10 rounded-full text-[var(--danger)] mt-1 animate-pulse">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-[var(--danger)] text-lg mb-1">Atenção: Você está gastando mais do que ganha!</h4>
                            <p className="text-[var(--text-primary)] text-sm mb-3 opacity-90">
                                Identificamos que parte do seu dinheiro está indo para gastos que podem ser otimizados.
                            </p>
                            
                            {spendingAnalysis ? (
                                <div className="bg-[var(--bg-card)] rounded-lg p-4 border border-[var(--danger)]/30 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2 text-[var(--text-primary)] font-bold">
                                        <Sparkles size={16} className="text-[var(--warning)]" />
                                        <span>Dica Inteligente:</span>
                                    </div>
                                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                        Você já gastou <span className="font-bold text-[var(--danger)]">{formatCurrency(spendingAnalysis.amount)}</span> em <span className="font-bold text-[var(--text-primary)] uppercase tracking-wide text-xs bg-[var(--bg-input)] px-1.5 py-0.5 rounded">{spendingAnalysis.category}</span> este mês. 
                                        <br/>
                                        Tente reduzir os gastos com {spendingAnalysis.category.toLowerCase()} (como lanches, saídas ou compras não essenciais) para equilibrar suas contas e voltar a investir!
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--danger)]/30">
                                     <p className="text-sm text-[var(--text-secondary)]">
                                         Revise seus gastos variáveis e tente cortar o supérfluo para não entrar no vermelho.
                                     </p>
                                </div>
                            )}
                        </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)]">
                  <h3 className="text-lg font-bold mb-6 text-[var(--text-primary)]">Gastos por Categoria (Pizza)</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="var(--bg-card)" />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                          itemStyle={{ color: 'var(--text-primary)' }}
                          formatter={(value) => formatCurrency(value)}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)]">
                  <h3 className="text-lg font-bold mb-6 text-[var(--text-primary)]">Gastos por Categoria (Barras)</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData}>
                        <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                        <Tooltip 
                          cursor={{fill: 'var(--bg-input)'}}
                          contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                          itemStyle={{ color: 'var(--text-primary)' }}
                          labelStyle={{ color: 'var(--text-primary)' }}
                          formatter={(value) => formatCurrency(value)}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "gastos" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Fixed Debts Section */}
                <div className="max-w-4xl mx-auto bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
                            <Calendar className="text-[var(--warning)]" />
                            Dívidas Fixas & Parcelamentos
                        </h2>
                        <button 
                            onClick={() => setIsAddingDebt(!isAddingDebt)}
                            className="bg-[var(--warning)] hover:opacity-90 text-[var(--bg-app)] font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm"
                        >
                            {isAddingDebt ? "Cancelar" : "Adicionar Dívida"}
                        </button>
                    </div>

                    {isAddingDebt && (
                        <form onSubmit={handleAddDebt} className="bg-[var(--bg-input)] p-4 rounded-xl border border-[var(--border-color)] mb-6 animate-in fade-in slide-in-from-top-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Descrição</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ex: Financiamento"
                                        value={newDebt.description}
                                        onChange={(e) => setNewDebt({...newDebt, description: e.target.value})}
                                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--warning)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Valor Mensal (R$)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        placeholder="0.00"
                                        value={newDebt.amount}
                                        onChange={(e) => setNewDebt({...newDebt, amount: e.target.value})}
                                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--warning)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Tipo</label>
                                    <select 
                                        value={newDebt.type}
                                        onChange={(e) => setNewDebt({...newDebt, type: e.target.value})}
                                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--warning)]"
                                    >
                                        <option value="fixed">Fixo Mensal</option>
                                        <option value="installment">Parcelado</option>
                                    </select>
                                </div>
                                {newDebt.type === 'installment' && (
                                    <div>
                                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Meses Restantes</label>
                                        <input 
                                            type="number" 
                                            placeholder="Ex: 12"
                                            value={newDebt.monthsRemaining}
                                            onChange={(e) => setNewDebt({...newDebt, monthsRemaining: e.target.value, totalMonths: e.target.value})}
                                            className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--warning)]"
                                        />
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="w-full mt-4 bg-[var(--warning)] text-[var(--bg-app)] font-bold py-2 rounded-lg hover:opacity-90 transition-opacity">
                                Salvar Dívida
                            </button>
                        </form>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(fixedDebts || []).length === 0 && (
                            <div className="col-span-full text-center py-8 text-[var(--text-secondary)] border-2 border-dashed border-[var(--border-color)] rounded-xl">
                                Nenhuma dívida fixa cadastrada. Que tal adicionar uma para organizar melhor?
                            </div>
                        )}
                        {(fixedDebts || []).map(debt => (
                            <div key={debt.id} className="bg-[var(--bg-input)] p-4 rounded-xl flex justify-between items-center border border-[var(--border-color)] group hover:border-[var(--warning)] transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[var(--warning-soft)] rounded-lg text-[var(--warning)]">
                                        {debt.type === 'fixed' ? <Home size={18} /> : <CreditCard size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-[var(--text-primary)] text-sm">{debt.description}</p>
                                        <p className="text-xs text-[var(--text-secondary)]">
                                            {debt.type === 'installment' 
                                                ? `Parcelado (${debt.monthsRemaining}/${debt.totalMonths || debt.monthsRemaining}x)` 
                                                : 'Fixo Mensal'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-[var(--warning)] text-sm">- {formatCurrency(debt.amount)}</p>
                                    <button 
                                        onClick={() => handleDeleteDebt(debt.id)} 
                                        className="text-[var(--text-secondary)] hover:text-[var(--danger)] opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                                        title="Remover Dívida"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 max-w-4xl mx-auto">
                    <div className="h-px bg-[var(--border-color)] flex-1"></div>
                    <span className="text-[var(--text-secondary)] text-sm font-medium uppercase tracking-wider">Lançar Gastos do Dia a Dia</span>
                    <div className="h-px bg-[var(--border-color)] flex-1"></div>
                </div>

            <div className="max-w-2xl mx-auto bg-[var(--bg-card)] p-8 rounded-2xl border border-[var(--border-color)] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--gradient-start)] to-[var(--gradient-end)]"></div>
              <h2 className="text-2xl font-bold mb-6 text-center text-[var(--primary-light)]">
                {editingId ? "Editar Gasto" : "Adicionar Novo Gasto"}
              </h2>
              
              <form onSubmit={handleAddExpense} className="space-y-6">
                
                {/* Presets Grid */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">Acesso Rápido</label>
                  <div className="flex flex-wrap gap-3">
                    {PRESET_EXPENSES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handlePresetClick(preset)}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] transition-all group flex-1 min-w-[100px] justify-center"
                      >
                        <preset.icon size={18} className="text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors" />
                        <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Descrição</label>
                  <div className="relative">
                    <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                    <input
                      type="text"
                      placeholder="Ex: Supermercado"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Valor (R$)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                      <input
                        type="number"
                        placeholder="0,00"
                        step="0.01"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Categoria</label>
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-3 px-4 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all appearance-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setNewExpense({ description: "", amount: "", category: "Outros" });
                      }}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition-all"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] hover:opacity-90 text-white py-3 rounded-xl font-bold shadow-lg shadow-purple-900/30 transition-all transform hover:scale-[1.02]"
                  >
                    {editingId ? "Salvar Alterações" : "Adicionar Gasto"}
                  </button>
                </div>
              </form>
            </div>
            </div>
          )}

          {activeTab === "extrato" && (
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden">
              <div className="p-6 border-b border-[var(--border-color)]">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Histórico de Transações</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[var(--bg-input)] text-[var(--text-secondary)] text-sm uppercase">
                    <tr>
                      <th className="px-6 py-4 font-medium">Data</th>
                      <th className="px-6 py-4 font-medium">Descrição</th>
                      <th className="px-6 py-4 font-medium">Categoria</th>
                      <th className="px-6 py-4 font-medium">Valor</th>
                      <th className="px-6 py-4 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {(expenses || []).length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-[var(--text-secondary)]">
                          Nenhum gasto registrado ainda.
                        </td>
                      </tr>
                    ) : (
                      (expenses || []).map((expense) => (
                        <tr key={expense.id} className="hover:bg-[var(--bg-input)] transition-colors group">
                          <td className="px-6 py-4 text-[var(--text-secondary)] text-sm">
                            {new Date(expense.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 font-medium text-[var(--text-primary)] flex items-center gap-2">
                            {getExpenseIcon(expense.description) && (
                              <span className="text-[var(--primary)] bg-[var(--primary-soft)] p-1 rounded-md">
                                {getExpenseIcon(expense.description)}
                              </span>
                            )}
                            {expense.description}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--bg-input)] text-[var(--primary-light)] border border-[var(--border-color)]">
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-[var(--danger)]">
                            - {formatCurrency(expense.amount)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleEdit(expense)}
                                className="p-2 hover:bg-[var(--info-soft)] text-[var(--info)] rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(expense.id)}
                                className="p-2 hover:bg-[var(--danger-soft)] text-[var(--danger)] rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "investimentos" && (
            <div className="space-y-6">
              {/* Goal Card & Allocation Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)]">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-[var(--success-soft)] rounded-full">
                        <Target className="w-8 h-8 text-[var(--success)]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">Meta Mensal</h3>
                        <p className="text-[var(--text-secondary)] text-sm">Quanto investir?</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-[var(--bg-input)] p-4 rounded-xl border border-[var(--border-color)]">
                      <div className="flex flex-col flex-1">
                        <span className="text-xs text-[var(--text-secondary)]">Porcentagem</span>
                        <div className="flex items-center">
                          <input 
                            type="number" 
                            value={investmentGoalPct} 
                            onChange={(e) => setInvestmentGoalPct(Number(e.target.value))}
                            className="bg-transparent border-none outline-none text-[var(--text-primary)] font-bold w-full text-2xl focus:ring-0"
                          />
                          <span className="text-[var(--primary-light)] font-bold">%</span>
                        </div>
                      </div>
                      <div className="w-px h-10 bg-[var(--border-color)]"></div>
                      <div className="flex flex-col flex-1 text-right">
                        <span className="text-xs text-[var(--text-secondary)]">Valor</span>
                        <span className="text-[var(--success)] font-bold text-xl">{formatCurrency(investmentAmount)}</span>
                      </div>
                    </div>

                    <div className="bg-[var(--bg-input)] p-4 rounded-xl border border-[var(--warning)]/20 relative overflow-hidden transition-all hover:shadow-lg hover:shadow-orange-900/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                           <AlertCircle className="w-5 h-5 text-[var(--warning)]" />
                           <span className="text-sm font-bold text-[var(--warning)] uppercase tracking-wider">Reserva de Emergência</span>
                        </div>
                        <div className="flex items-center gap-1 bg-[var(--bg-card)] px-2 py-1 rounded border border-[var(--border-color)]">
                            <span className="text-[10px] text-[var(--text-secondary)]">Meta:</span>
                            <select 
                              value={emergencyMonths}
                              onChange={(e) => setEmergencyMonths(Number(e.target.value))}
                              className="bg-transparent text-[var(--text-primary)] text-xs font-bold outline-none cursor-pointer"
                            >
                              <option value={3}>3 meses</option>
                              <option value={6}>6 meses</option>
                              <option value={12}>12 meses</option>
                            </select>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-end mb-2">
                          <div>
                              <p className="text-xs text-[var(--text-secondary)] mb-0.5">Atual (Renda Fixa)</p>
                              <p className="text-lg font-bold text-[var(--text-primary)]">{formatCurrency(currentEmergencyValue)}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-xs text-[var(--text-secondary)] mb-0.5">Meta ({emergencyMonths}x Gastos)</p>
                              <p className="text-sm font-bold text-[var(--text-secondary)] opacity-70">{formatCurrency(emergencyGoalValue)}</p>
                          </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative h-5 bg-[var(--bg-card)] rounded-full overflow-hidden mb-3 border border-[var(--border-color)]">
                         <div 
                            className="h-full bg-[var(--warning)] transition-all duration-1000 flex items-center justify-center text-[10px] font-bold text-[var(--bg-app)] whitespace-nowrap px-2"
                            style={{ width: `${Math.max(5, emergencyProgressPct)}%` }}
                         >
                            {emergencyProgressPct.toFixed(0)}%
                         </div>
                      </div>
                      
                      {/* Dynamic Message */}
                      <div className="bg-[var(--bg-card)] p-2 rounded-lg border border-[var(--border-color)] text-center mb-3">
                        <p className="text-xs text-[var(--text-secondary)]">
                            {emergencyProgressPct >= 100 
                              ? "🎉 Parabéns! Sua reserva está completa!" 
                              : `Olha, sua reserva de emergência está ${emergencyProgressPct.toFixed(1)}% completa.`}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
                         <div className="flex flex-col">
                            <span className="text-[10px] text-[var(--text-secondary)]">Aporte Mensal</span>
                            <span className="text-[var(--warning)] font-bold text-sm">{formatCurrency(emergencyAmount)}</span>
                         </div>
                         <div className="flex items-center gap-2 bg-[var(--bg-card)] px-2 py-1 rounded border border-[var(--border-color)]">
                             <input 
                                type="number" 
                                value={emergencyFundPct} 
                                onChange={(e) => setEmergencyFundPct(Number(e.target.value))}
                                className="bg-transparent border-none outline-none text-[var(--text-primary)] font-bold w-10 text-sm text-right focus:ring-0"
                             />
                             <span className="text-[var(--text-secondary)] font-bold text-xs">%</span>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-[var(--text-primary)]">
                      <Activity size={20} className="text-[var(--primary-light)]" />
                      Alocação por Classe
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                      allocationHealth === "healthy" ? "bg-[var(--success-soft)] text-[var(--success)] border-[var(--success)]/30" :
                      allocationHealth === "warning" ? "bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/30" :
                      "bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger)]/30"
                    }`}>
                      {allocationHealth === "healthy" ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      Total: {totalClassAllocation}%
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {ASSET_CLASSES.map(cls => (
                      <div key={cls} className="bg-[var(--bg-input)] p-3 rounded-xl border-l-4 relative overflow-hidden group" style={{ borderColor: ASSET_CLASS_COLORS[cls] }}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-[var(--text-secondary)]">{cls}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={classAllocations[cls]}
                            onChange={(e) => setClassAllocations({ ...classAllocations, [cls]: Number(e.target.value) })}
                            className="bg-transparent border-none outline-none text-[var(--text-primary)] font-bold w-12 text-lg focus:ring-0"
                          />
                          <span className="text-[var(--text-secondary)] text-sm">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Automatic Rebalancing Panel */}
              <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--gradient-start)] to-[var(--gradient-end)]"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-[var(--text-primary)]">
                        <Activity size={20} className="text-[var(--info)]" />
                        Painel de Aporte do Mês (Automático)
                    </h3>
                    
                    {/* Market Rates Widget */}
                    <div className="flex gap-3 bg-[var(--bg-input)] p-2 rounded-xl border border-[var(--border-color)] text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[var(--text-secondary)]">🇺🇸 USD</span>
                            <span className="text-[var(--success)]">{usdRate > 0 ? formatCurrency(usdRate, 'BRL') : '...'}</span>
                        </div>
                        <div className="w-px bg-[var(--border-color)]"></div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[var(--text-secondary)]">₿ BTC</span>
                            <span className="text-[var(--warning)]">{btcRate > 0 ? formatCurrency(btcRate, 'BRL') : '...'}</span>
                        </div>
                    </div>
                </div>

                {/* Manual Contribution Input */}
                <div className="mb-8 bg-[var(--bg-input)] p-6 rounded-xl border border-[var(--border-color)]">
                    
                    {/* Class Selection Filter */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">Onde deseja aportar este mês?</label>
                        <div className="flex flex-wrap gap-2">
                            {ASSET_CLASSES.map(cls => (
                                <button
                                    key={cls}
                                    onClick={() => {
                                        if (selectedClassesForRebalance.includes(cls)) {
                                            setSelectedClassesForRebalance(selectedClassesForRebalance.filter(c => c !== cls));
                                        } else {
                                            setSelectedClassesForRebalance([...selectedClassesForRebalance, cls]);
                                        }
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${
                                        selectedClassesForRebalance.includes(cls) 
                                            ? 'bg-[var(--primary-soft)] text-[var(--primary)] border-[var(--primary)]' 
                                            : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] opacity-60'
                                    }`}
                                >
                                    {selectedClassesForRebalance.includes(cls) && <CheckCircle2 size={12} />}
                                    {cls}
                                </button>
                            ))}
                        </div>
                    </div>

                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">Quanto você quer aportar hoje?</label>
                    <div className="flex gap-4 items-center flex-wrap md:flex-nowrap">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">R$</span>
                            <input 
                                type="number" 
                                value={manualContribution}
                                onChange={(e) => setManualContribution(e.target.value)}
                                placeholder="Ex: 1000,00"
                                className="w-full bg-transparent border border-[var(--border-color)] rounded-xl py-3 pl-10 pr-4 text-lg font-bold text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
                            />
                        </div>
                        <button 
                            onClick={() => calculateRebalancing(parseFloat(manualContribution))}
                            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-purple-900/20 flex items-center gap-2 whitespace-nowrap"
                        >
                            <Calculator size={18} />
                            Calcular Rebalanceamento
                        </button>
                    </div>
                </div>

                {rebalanceResult && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 className="text-[var(--success)]" size={20} />
                            <h4 className="font-bold text-[var(--text-primary)]">Sugestão de Compra Inteligente</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rebalanceResult.map((item, idx) => (
                                <div key={idx} className="bg-[var(--bg-input)] p-4 rounded-xl border-l-4 relative overflow-hidden" style={{ borderColor: ASSET_CLASS_COLORS[item.type] }}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-[var(--text-primary)]">{item.assetName}</span>
                                        <span className="text-xs px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-color)]" style={{ color: ASSET_CLASS_COLORS[item.type] }}>{item.type}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-[var(--text-secondary)]">Comprar aprox.</p>
                                            <p className="text-lg font-bold text-[var(--success)]">{item.type === 'Cripto' ? item.quantity.toFixed(8) : item.quantity.toFixed(2)} <span className="text-xs font-normal text-[var(--text-secondary)]">cotas</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-[var(--text-secondary)]">Valor</p>
                                            <p className="font-bold text-[var(--text-primary)]">{formatCurrency(item.amount)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {rebalanceResult.length === 0 && (
                             <div className="text-center p-4 text-[var(--text-secondary)]">
                                 {parseFloat(manualContribution) > 0 
                                    ? "Não foi possível comprar nenhum ativo com este valor. Tente aumentar o aporte ou selecionar ativos mais acessíveis (ex: Renda Fixa ou Cripto)."
                                    : "Sua carteira já está balanceada!"}
                             </div>
                        )}

                        {rebalanceResult.length > 0 && (
                            <button
                                onClick={applyRebalancing}
                                className="w-full mt-4 bg-[var(--success)] hover:opacity-90 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={20} />
                                Confirmar e Realizar Aporte Automático
                            </button>
                        )}
                    </div>
                )}
                
                {/* Original Automatic Calculation (Hidden or Secondary if manual is used, but keeping for reference if user clears manual) */}
                {!rebalanceResult && (
                    <div className="mt-8 opacity-50 pointer-events-none filter blur-[1px]">
                         <p className="text-center text-sm text-[var(--text-secondary)] mb-4">Aguardando cálculo de aporte...</p>
                    </div>
                )}
              </div>

              {/* Simulator Section */}
              <div className="bg-[var(--bg-card)] p-6 md:p-8 rounded-2xl border border-[var(--border-color)] space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-[var(--primary-soft)] rounded-xl">
                    <Calculator className="w-6 h-6 text-[var(--primary-light)]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">Simulador de Juros Compostos</h3>
                    <p className="text-[var(--text-secondary)] text-sm">Veja o poder do tempo nos seus investimentos</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Controls */}
                  <div className="space-y-6 lg:col-span-1">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">Tempo de Investimento</span>
                        <span className="text-[var(--primary-light)] font-bold">{simYears} anos</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="50" 
                        value={simYears} 
                        onChange={(e) => setSimYears(Number(e.target.value))}
                        className="w-full h-2 bg-[var(--bg-input)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                      />
                    </div>

                    {/* Weighted Rate Display */}
                    <div className="bg-[var(--bg-input)] p-4 rounded-xl border border-[var(--primary-soft)]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-[var(--text-secondary)]">Rentabilidade Média</span>
                        <span className="text-[var(--primary-light)] font-bold text-lg">{weightedAverageRate.toFixed(1)}% ao ano</span>
                      </div>
                      <div className="space-y-1">
                          {Object.keys(classAllocations).map(cls => classAllocations[cls] > 0 && (
                              <div key={cls} className="flex justify-between text-xs text-[var(--text-secondary)]">
                                  <span>{cls} ({classAllocations[cls]}%)</span>
                                  <span>{ASSET_RETURNS[cls]}%</span>
                              </div>
                          ))}
                      </div>
                      <p className="text-[10px] text-[var(--text-secondary)] mt-2 italic">
                          *Baseado na sua alocação e médias históricas.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">Aporte Mensal</span>
                        <span className="text-[var(--primary-light)] font-bold">{formatCurrency(simMonthly)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="100" 
                        max="10000" 
                        step="100"
                        value={simMonthly} 
                        onChange={(e) => setSimMonthly(Number(e.target.value))}
                        className="w-full h-2 bg-[var(--bg-input)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                      />
                    </div>

                    {/* Chart Toggle - NEW FEATURE */}
                    <div className="flex justify-center mt-4">
                         <button 
                            onClick={() => setShowIncomeChart(!showIncomeChart)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-2 ${showIncomeChart ? 'bg-[var(--success-soft)] text-[var(--success)] border-[var(--success)]' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)]'}`}
                         >
                            <Coins size={16} />
                            {showIncomeChart ? "Mostrando Renda Mensal" : "Ver Renda Mensal Estimada"}
                         </button>
                    </div>

                    <div className="bg-[var(--bg-input)] p-4 rounded-xl border border-[var(--primary-soft)] mt-4">
                      <div className="flex items-center gap-2 mb-2">
                         <Sparkles className="w-4 h-4 text-[var(--warning)]" />
                         <span className="text-xs font-bold text-[var(--warning)] uppercase tracking-wider">Motivação</span>
                      </div>
                      <p className="text-sm text-[var(--text-primary)] font-medium">
                        {getMotivationalQuote(simulationData.finalAmount, simulationData.finalMonthlyIncome)}
                      </p>
                    </div>

                    {/* Magic Moment Card - Updated for Income */}
                    {simulationData.crossoverPoint && (
                      <div className="bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] p-4 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-2 mb-2 text-white">
                          <Crown className="w-5 h-5 text-yellow-300" />
                          <span className="text-sm font-bold uppercase tracking-wider">Ponto de Virada</span>
                        </div>
                        <p className="text-white/90 text-sm mb-2">
                          Em <strong>{simulationData.crossoverPoint.year} anos e {simulationData.crossoverPoint.month} meses</strong>, seus rendimentos superarão seu aporte!
                        </p>
                        <div className="bg-white/10 rounded-lg p-2 text-xs text-white flex justify-between">
                           <span>Rendimentos: {formatCurrency(simulationData.crossoverPoint.interestAmount)}</span>
                           <span>Aporte: {formatCurrency(simMonthly)}</span>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Results & Chart */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-[var(--bg-input)] p-4 rounded-xl border border-[var(--border-color)]">
                        <p className="text-xs text-[var(--text-secondary)] mb-1">Total Investido</p>
                        <p className="text-lg font-bold text-[var(--text-primary)]">{formatCurrency(simulationData.totalInvested)}</p>
                      </div>
                      <div className="bg-[var(--bg-input)] p-4 rounded-xl border border-[var(--border-color)]">
                         <p className="text-xs text-[var(--text-secondary)] mb-1">{showIncomeChart ? "Renda Mensal Estimada" : "Juros Recebidos"}</p>
                         <p className={`text-lg font-bold ${showIncomeChart ? "text-[var(--success)]" : "text-[var(--success)]"}`}>
                            {showIncomeChart ? formatCurrency(simulationData.finalMonthlyIncome) : `+${formatCurrency(simulationData.totalInterest)}`}
                         </p>
                      </div>
                      <div className="bg-[var(--bg-input)] p-4 rounded-xl border border-[var(--primary-soft)] bg-[var(--primary-soft)]">
                        <p className="text-xs text-[var(--primary-light)] mb-1">Patrimônio Final</p>
                        <p className="text-xl font-bold text-[var(--primary-light)]">{formatCurrency(simulationData.finalAmount)}</p>
                      </div>
                    </div>

                    <div className="h-64 w-full bg-[var(--bg-input)] p-4 rounded-xl border border-[var(--border-color)]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={simulationData.data}>
                          <XAxis dataKey="year" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis hide />
                          <Tooltip 
                            cursor={{fill: 'var(--bg-card)'}}
                            contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                            itemStyle={{ color: 'var(--text-primary)' }}
                            labelStyle={{ color: 'var(--text-primary)' }}
                            formatter={(value, name) => {
                                if (showIncomeChart && name === 'monthlyPassiveIncome') return [formatCurrency(value), 'Renda Mensal Estimada'];
                                if (name === 'monthlyPassiveIncome') return [formatCurrency(value), 'Renda Mensal Estimada'];
                                return [formatCurrency(value), name === 'monthlyReturn' ? 'Rendimento Mensal (fim do ano)' : name === 'monthlyContribution' ? 'Aporte Mensal' : name === 'total' ? 'Patrimônio Total' : name];
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                          {showIncomeChart ? (
                              <Bar dataKey="monthlyPassiveIncome" name="Renda Mensal Passiva" fill="var(--success)" radius={[4, 4, 0, 0]} />
                          ) : (
                              <Bar dataKey="total" name="Patrimônio Total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                          )}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Portfolio Form & List */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)]">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
                      <Briefcase size={20} className="text-[var(--primary-light)]" />
                      Configuração da Carteira
                    </h3>

                    {/* Currency Toggle */}
                    <div className="flex justify-end mb-4">
                        <div className="bg-[var(--bg-input)] p-1 rounded-lg flex border border-[var(--border-color)]">
                            <button
                                onClick={() => setCurrency('BRL')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${currency === 'BRL' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                                R$ BRL
                            </button>
                            <button
                                onClick={() => setCurrency('USD')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${currency === 'USD' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                                $ USD
                            </button>
                        </div>
                    </div>
                    
                    {/* Add Asset Form */}
                    <form onSubmit={handleAddAsset} className="flex flex-wrap gap-4 mb-6 bg-[var(--bg-input)] p-4 rounded-xl border border-[var(--border-color)]">
                      <div className="relative flex-1 min-w-[120px]">
                        <input
                            type="text"
                            placeholder="Ativo (ex: PETR4)"
                            value={newAsset.name}
                            onChange={(e) => setNewAsset({...newAsset, name: e.target.value.toUpperCase()})}
                            onBlur={(e) => fetchAssetPrice(e.target.value)}
                            className="w-full bg-transparent border-b border-[var(--text-secondary)] focus:border-[var(--primary)] outline-none py-2 text-sm text-[var(--text-primary)] pr-8"
                        />
                        {isSearchingAsset && (
                            <div className="absolute right-0 top-2">
                                <Loader2 className="animate-spin text-[var(--primary)]" size={14} />
                            </div>
                        )}
                      </div>
                      <select
                        value={newAsset.type}
                        onChange={(e) => setNewAsset({...newAsset, type: e.target.value})}
                        className="flex-1 min-w-[120px] bg-transparent border-b border-[var(--text-secondary)] focus:border-[var(--primary)] outline-none py-2 text-sm text-[var(--text-primary)]"
                      >
                        {ASSET_CLASSES.map(type => (
                          <option key={type} value={type} className="bg-[var(--bg-card)] text-[var(--text-primary)]">{type}</option>
                        ))}
                      </select>
                      
                      <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative w-24">
                          <input
                            type="number"
                            placeholder="Qtd."
                            value={newAsset.quantity}
                            onChange={(e) => setNewAsset({...newAsset, quantity: e.target.value})}
                            className="w-full bg-transparent border-b border-[var(--text-secondary)] focus:border-[var(--primary)] outline-none py-2 text-sm text-[var(--text-primary)]"
                          />
                        </div>
                        <div className="relative w-28">
                          <span className="absolute left-0 top-2 text-[var(--text-secondary)] text-xs">R$</span>
                          <input
                            type="number"
                            placeholder="Preço Atual"
                            value={newAsset.currentPrice}
                            onChange={(e) => setNewAsset({...newAsset, currentPrice: e.target.value})}
                            className="w-full bg-transparent border-b border-[var(--text-secondary)] focus:border-[var(--primary)] outline-none py-2 text-sm pl-6 text-[var(--text-primary)]"
                          />
                        </div>
                        <div className="relative w-24">
                          <input
                            type="number"
                            placeholder="% Meta"
                            value={newAsset.percentage}
                            onChange={(e) => setNewAsset({...newAsset, percentage: e.target.value})}
                            className="w-full bg-transparent border-b border-[var(--text-secondary)] focus:border-[var(--primary)] outline-none py-2 text-sm pr-4 text-[var(--text-primary)]"
                          />
                          <span className="absolute right-0 top-2 text-[var(--text-secondary)]">%</span>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="bg-[var(--primary)] hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors ml-auto"
                      >
                        <Plus size={16} />
                      </button>
                    </form>

                    {/* Assets Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="text-xs text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)]">
                          <tr>
                            <th className="px-4 py-3">Ativo</th>
                            <th className="px-4 py-3">Classe</th>
                            <th className="px-4 py-3 text-right">Qtd.</th>
                            <th className="px-4 py-3 text-right">Preço Atual</th>
                            <th className="px-4 py-3 text-right">Total Investido</th>
                            <th className="px-4 py-3 text-right">Peso na Classe</th>
                            <th className="px-4 py-3 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                          {portfolio.map(asset => (
                            <tr key={asset.id} className="group hover:bg-[var(--bg-input)] transition-colors">
                              <td className="px-4 py-3 font-bold text-[var(--text-primary)]">{asset.name}</td>
                              <td className="px-4 py-3">
                                <span 
                                  className="text-xs px-2 py-1 rounded text-white"
                                  style={{ backgroundColor: `${ASSET_CLASS_COLORS[asset.type]}40`, border: `1px solid ${ASSET_CLASS_COLORS[asset.type]}60` }}
                                >
                                  {asset.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                                {asset.type === 'Cripto' ? asset.quantity : Math.floor(asset.quantity)}
                              </td>
                              <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                                {formatCurrency(asset.currentPrice)}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-[var(--text-primary)]">
                                {formatCurrency(asset.quantity * asset.currentPrice)}
                              </td>
                              <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                                {assetsByClass[asset.type] && assetsByClass[asset.type].totalAmount > 0 ? (
                                    ((asset.quantity * asset.currentPrice) / assetsByClass[asset.type].totalAmount * 100).toFixed(1) + '%'
                                ) : '-'}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button 
                                  onClick={() => handleDeleteAsset(asset.id)}
                                  className="text-[var(--text-secondary)] hover:text-[var(--danger)] opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Subscription Modal */}
        {showSubscriptionModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
             <div 
                className="bg-[var(--bg-card)] max-w-4xl w-full rounded-3xl border border-[var(--border-color)] shadow-2xl relative overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
             >
                {/* Left Side: Visual & Benefits */}
                <div className="md:w-1/2 bg-gradient-to-br from-indigo-900 to-purple-900 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                    
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                                <Crown size={24} className="text-yellow-400 fill-yellow-400" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4 leading-tight">
                                Acelere sua jornada para a <span className="text-yellow-400">Liberdade Financeira</span>
                            </h2>
                            <p className="text-indigo-200 mb-8">
                                Desbloqueie ferramentas exclusivas e análises avançadas para tomar as melhores decisões.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                "Sem anúncios e distrações",
                                "Relatórios avançados de dividendos",
                                "Simulador de Aposentadoria Pro",
                                "Suporte prioritário via WhatsApp",
                                "Acesso antecipado a novas features"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
                                    <div className="bg-green-500/20 p-1 rounded-full">
                                        <CheckCircle2 size={16} className="text-green-400" />
                                    </div>
                                    <span className="text-sm font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Pricing */}
                <div className="md:w-1/2 p-8 bg-[var(--bg-card)] relative">
                    <button 
                        onClick={() => setShowSubscriptionModal(false)}
                        className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 hover:bg-[var(--bg-input)] rounded-full"
                    >
                        <LogOut size={20} />
                    </button>

                    <div className="h-full flex flex-col justify-center">
                        <div className="text-center mb-8">
                            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Escolha seu plano</h3>
                            <p className="text-[var(--text-secondary)] text-sm">Cancele quando quiser. Sem compromisso.</p>
                        </div>

                        {isPro ? (
                             <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-2xl text-center">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Crown size={32} className="text-green-500 fill-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-green-500 mb-2">Você é PRO!</h3>
                                <p className="text-[var(--text-secondary)]">Obrigado por apoiar o projeto. Sua assinatura está ativa.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Monthly Plan */}
                                <button 
                                    onClick={() => handleSubscribe('monthly')}
                                    className="w-full group relative p-5 rounded-2xl border border-[var(--border-color)] hover:border-[var(--primary)] transition-all bg-[var(--bg-input)] hover:bg-[var(--primary-soft)]/10 text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                                >
                                    <div>
                                        <div className="font-bold text-[var(--text-primary)] text-lg mb-1">Mensal</div>
                                        <div className="text-xs text-[var(--text-secondary)]">Pagamento recorrente</div>
                                    </div>
                                    <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-color)] sm:border-transparent">
                                        <div className="text-2xl font-bold text-[var(--text-primary)]">R$ 9,90</div>
                                        <div className="text-xs text-[var(--text-secondary)]">/mês</div>
                                    </div>
                                </button>
                                
                                {/* Yearly Plan */}
                                <button 
                                    onClick={() => handleSubscribe('yearly')}
                                    className="w-full group relative p-5 rounded-2xl border-2 border-yellow-500 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 hover:from-yellow-500/10 hover:to-orange-500/10 transition-all text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg shadow-yellow-500/10"
                                >
                                    <div className="absolute -top-3 left-6 bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md">
                                        ECONOMIZE 17%
                                    </div>
                                    <div>
                                        <div className="font-bold text-[var(--text-primary)] text-lg mb-1">Anual</div>
                                        <div className="text-xs text-[var(--text-secondary)]">Cobrado anualmente</div>
                                    </div>
                                    <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-yellow-500/20 sm:border-transparent">
                                        <div className="text-2xl font-bold text-[var(--text-primary)]">R$ 99,90</div>
                                        <div className="text-xs text-[var(--text-secondary)]">/ano</div>
                                    </div>
                                </button>

                                {/* Dev Simulator Button */}
                                <button 
                                    onClick={handleSimulatePremium}
                                    className="w-full mt-4 text-xs text-[var(--text-secondary)] hover:text-[var(--primary)] underline opacity-50 hover:opacity-100"
                                >
                                    (Dev) Simular Premium Ativo
                                </button>
                            </div>
                        )}

                        <div className="mt-8 text-center">
                            <p className="text-xs text-[var(--text-secondary)] flex items-center justify-center gap-2">
                                <Lock size={12} />
                                Pagamento seguro via Stripe
                            </p>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        )}
      </div>
      
      <div className="text-center text-[10px] text-[var(--text-secondary)] opacity-30 py-8">
        v1.0.6 - CLT Rico
      </div>
    </div>
  );
}
/* force deploy v1.1 */
/* force deploy v1.1 */
