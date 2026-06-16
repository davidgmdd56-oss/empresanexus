import { useState, useMemo, useCallback, useEffect } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================================
// UI Utility
// ============================================================
function cn(...inputs: Array<string | undefined | false | null>) {
  return twMerge(clsx(inputs));
}

// ============================================================
// Domain Types
// ============================================================
type Role = "ADMIN" | "EMPLOYEE";

type Employee = {
  id: string;
  name: string;
  phone: string;
  pin: string;
  role: Role;
  createdAt: string;
};

type Plan = {
  id: string;
  name: string;
  price: number;
  maintenance?: number;
};

type PlanCategory = {
  id: string;
  name: string;
  plans: Plan[];
};

type CommissionStatus = "Pendiente" | "Pagada";

type PaymentRecord = {
  id: string;
  amount: number;
  date: string;
  note?: string;
};

type Client = {
  id: string;
  name: string;
  phone: string;
  planId: string;
  totalPrice: number;
  totalPaid: number;
  employeeId: string;
  commissionStatus: CommissionStatus;
  createdAt: string;
  payments: PaymentRecord[];
};

// ============================================================
// Plan Catalog — Costa Rica (Colones ₡)
// ============================================================
const PLAN_CATALOG: PlanCategory[] = [
  {
    id: "web_reservas",
    name: "Desarrollo Web y Reservas",
    plans: [
      { id: "plan_landing_interactiva", name: "Landing Page Interactiva", price: 80000, maintenance: 12000 },
      { id: "plan_servicios_reservas", name: "Web de Servicios y Reservas", price: 130000, maintenance: 20000 },
      { id: "plan_ecommerce_total", name: "E-Commerce y Operación Total", price: 170000 },
    ],
  },
  {
    id: "catalogos_sistemas",
    name: "Catálogos y Sistemas Automatizados",
    plans: [
      { id: "plan_catalogo_digital", name: "Catálogo Digital Automatizado", price: 90000, maintenance: 15000 },
      { id: "plan_operacion_autonoma", name: "Operación Autónoma (Web Dinámica + Panel)", price: 135000, maintenance: 25000 },
      { id: "plan_automatizacion_total", name: "Automatización Total", price: 175000, maintenance: 35000 },
    ],
  },
  {
    id: "combos_digitalizacion",
    name: "Combos de Digitalización Completa",
    plans: [
      { id: "plan_transformacion_inicial", name: "Transformación Inicial (Landing + Ads + Guiones)", price: 150000, maintenance: 50000 },
      { id: "plan_ecosistema_autonomo", name: "Ecosistema Autónomo (Full Web + Pauta + Multimedia)", price: 240000, maintenance: 65000 },
      { id: "plan_dominio_absoluto", name: "Dominio Absoluto", price: 315000, maintenance: 85000 },
    ],
  },
  {
    id: "marketing_digital",
    name: "Planes de Marketing Digital",
    plans: [
      { id: "plan_mkt_basico", name: "Plan Básico — Marketing Digital", price: 35000 },
      { id: "plan_mkt_estandar", name: "Plan Estándar — Marketing Digital", price: 65000 },
      { id: "plan_mkt_premium", name: "Plan Premium — Marketing Digital", price: 95000 },
    ],
  },
];

// ============================================================
// Marketing Digital Plans — Extended Data for Showcase
// ============================================================
type MarketingPlan = {
  id: string;
  tier: "basico" | "estandar" | "premium";
  name: string;
  subtitle: string;
  price: number;
  description: string;
  popular: boolean;
  features: string[];
  accent: {
    gradient: string;
    border: string;
    glow: string;
    badge: string;
    icon: string;
    bg: string;
    button: string;
    buttonHover: string;
  };
};

const MARKETING_PLANS: MarketingPlan[] = [
  {
    id: "plan_mkt_basico",
    tier: "basico",
    name: "Básico",
    subtitle: "Presencia Digital",
    price: 35000,
    description: "Ideal para negocios locales que están empezando su presencia digital.",
    popular: false,
    features: [
      "Gestión de 1 red social (Meta)",
      "2 publicaciones semanales (Feeds/Reels)",
      "Optimización de perfil y biografía",
      "Informe mensual de métricas básico",
    ],
    accent: {
      gradient: "from-slate-600 to-slate-500",
      border: "border-slate-700 hover:border-slate-500",
      glow: "",
      badge: "",
      icon: "text-slate-300",
      bg: "bg-slate-800/30",
      button: "bg-slate-700 hover:bg-slate-600 text-white",
      buttonHover: "",
    },
  },
  {
    id: "plan_mkt_estandar",
    tier: "estandar",
    name: "Estándar",
    subtitle: "Crecimiento Activo",
    price: 65000,
    description: "Perfecto para empresas en crecimiento que buscan consistencia y alcance.",
    popular: true,
    features: [
      "Gestión de 2 redes sociales (Meta + Instagram/TikTok)",
      "4 publicaciones semanales (Reels, Carruseles y Posts)",
      "Creación de estrategia de contenido mensual",
      "Gestión básica de campañas publicitarias (Ads — presupuesto no incluido)",
      "Reporte de rendimiento detallado y reunión de seguimiento",
    ],
    accent: {
      gradient: "from-indigo-500 to-violet-500",
      border: "border-indigo-500/50 hover:border-indigo-400/70",
      glow: "shadow-[0_0_60px_-10px_rgba(99,102,241,0.35)]",
      badge: "bg-gradient-to-r from-indigo-500 to-violet-500",
      icon: "text-indigo-300",
      bg: "bg-indigo-500/5",
      button: "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-400 hover:to-violet-400",
      buttonHover: "",
    },
  },
  {
    id: "plan_mkt_premium",
    tier: "premium",
    name: "Premium",
    subtitle: "Dominio Total",
    price: 95000,
    description: "Diseñado para marcas que quieren dominar su mercado con una estrategia integral.",
    popular: false,
    features: [
      "Gestión multicanal (Meta, Instagram, TikTok)",
      "6 publicaciones semanales (Prioridad en video vertical / Reels de alto impacto)",
      "Copys profesionales y diseño gráfico avanzado",
      "Campañas avanzadas de Paid Media (Segmentación de audiencias y Retargeting)",
      "Monitoreo de comunidad (Respuestas a comentarios y mensajes directos)",
      "Soporte prioritario y analítica avanzada con optimización continua",
    ],
    accent: {
      gradient: "from-amber-500 to-orange-500",
      border: "border-amber-500/30 hover:border-amber-400/50",
      glow: "",
      badge: "",
      icon: "text-amber-300",
      bg: "bg-amber-500/5",
      button: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400",
      buttonHover: "",
    },
  },
];

const ADMIN_PIN = "2222";
const COMMISSION_RATE = 0.05;

function findPlan(planId: string): Plan | undefined {
  for (const cat of PLAN_CATALOG) {
    const p = cat.plans.find((pl) => pl.id === planId);
    if (p) return p;
  }
  return undefined;
}

function formatPlanLabel(p: Plan): string {
  const base = `${p.name} — ${formatCurrency(p.price)}`;
  if (p.maintenance && p.maintenance > 0) {
    return `${base} (Mantenimiento: ${formatCurrency(p.maintenance)}/mes)`;
  }
  return base;
}

// ============================================================
// Format helpers
// ============================================================
function formatCurrency(value: number): string {
  return `₡${value.toLocaleString("es-CR")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ============================================================
// PIN generation
// ============================================================
function generateUniquePin(existingPins: string[]): string {
  const taken = new Set(existingPins);
  for (let i = 0; i < 300; i++) {
    const pin = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    if (pin === "0000" || taken.has(pin)) continue;
    return pin;
  }
  for (let i = 1000; i < 10000; i++) {
    const pin = String(i);
    if (!taken.has(pin)) return pin;
  }
  throw new Error("No hay códigos PIN disponibles");
}

// ============================================================
// Icons
// ============================================================
type IconName =
  | "users"
  | "cash"
  | "wallet"
  | "receipt"
  | "plus"
  | "arrow-right"
  | "check"
  | "x"
  | "lock"
  | "logout"
  | "sparkles"
  | "shield"
  | "clock"
  | "alert"
  | "briefcase"
  | "phone"
  | "tag"
  | "trash"
  | "copy"
  | "megaphone"
  | "crown"
  | "star"
  | "globe"
  | "zap"
  | "chart"
  | "layers";

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor" as const,
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "users":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "cash":
      return (
        <svg {...common}>
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="3" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...common}>
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </svg>
      );
    case "receipt":
      return (
        <svg {...common}>
          <path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 1 2V2H4z" />
          <path d="M8 7h8M8 11h8M8 15h5" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg {...common}>
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5M21 12H9" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...common}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
          <path d="M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "alert":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...common}>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case "tag":
      return (
        <svg {...common}>
          <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <circle cx="7" cy="7" r="1.2" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case "copy":
      return (
        <svg {...common}>
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      );
    case "megaphone":
      return (
        <svg {...common}>
          <path d="M3 11l18-5v12L3 13v-2z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
      );
    case "crown":
      return (
        <svg {...common}>
          <path d="M2 20h20L18 8l-4 4-2-6-2 6-4-4-4 12z" />
          <path d="M2 20h20" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "zap":
      return (
        <svg {...common}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
      );
    case "layers":
      return (
        <svg {...common}>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    default:
      return null;
  }
}

// ============================================================
// Login Screen — Blind access
// ============================================================
function LoginScreen({
  employees,
  onLogin,
}: {
  employees: Employee[];
  onLogin: (session: Session) => void;
}) {
  const [pin, setPin] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [shake, setShake] = useState(false);

  const authenticate = useCallback(
    (pinCode: string): Session | null => {
      const employee = employees.find((e) => e.pin === pinCode);
      if (!employee) return null;
      return { role: employee.role, employeeId: employee.id, name: employee.name };
    },
    [employees]
  );

  const triggerError = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const doSubmit = () => {
    if (pin.length !== 4) {
      triggerError("El PIN debe tener 4 dígitos");
      return;
    }
    const session = authenticate(pin);
    if (!session) {
      triggerError("PIN incorrecto");
      return;
    }
    onLogin(session);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    doSubmit();
  };

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      setPin((p) => p + digit);
      setError("");
    }
  };

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
    setError("");
  };

  const handleClear = () => {
    setPin("");
    setError("");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key >= "0" && e.key <= "9") handleDigit(e.key);
      else if (e.key === "Backspace") handleDelete();
      else if (e.key === "Enter" && pin.length === 4) doSubmit();
      else if (e.key === "Escape") handleClear();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, employees]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-10 h-[28rem] w-[28rem] rounded-full bg-indigo-600/20 blur-[140px]" />
        <div className="absolute -right-40 bottom-10 h-[28rem] w-[28rem] rounded-full bg-violet-600/15 blur-[140px]" />
        <div className="absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[150px]" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:64px_64px] opacity-25 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      <div className="relative w-full max-w-md">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 opacity-60 blur-xl" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-2xl shadow-indigo-500/40">
                <Icon name="sparkles" className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Nexus<span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Digital</span>
              </h1>
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-slate-400">Internal Console</p>
            </div>
          </div>
        </div>

        <div className={cn("rounded-2xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-2xl shadow-[0_0_60px_-15px_rgba(99,102,241,0.25)]", shake && "animate-pulse")}>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/50">
              <Icon name="lock" className="h-5 w-5 text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Acceso al Sistema</h2>
            <p className="mt-1 text-xs text-slate-400">Ingresa tu PIN de 4 dígitos para continuar</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-6 flex items-center justify-center gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={cn("flex h-14 w-12 items-center justify-center rounded-xl border transition-all duration-200", pin.length > i ? "border-indigo-400/60 bg-indigo-500/10 shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]" : "border-slate-700 bg-slate-800/40")}>
                  {pin.length > i && <div className="h-3 w-3 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />}
                </div>
              ))}
            </div>
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                <Icon name="alert" className="h-3.5 w-3.5" />
                {error}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {["1","2","3","4","5","6","7","8","9"].map((d) => (
                <button key={d} type="button" onClick={() => handleDigit(d)} className="h-12 rounded-xl border border-slate-700 bg-slate-800/40 text-base font-medium text-slate-200 transition-all hover:border-indigo-400/40 hover:bg-slate-700/60 active:scale-95">{d}</button>
              ))}
              <button type="button" onClick={handleClear} className="h-12 rounded-xl border border-slate-700 bg-slate-800/40 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 active:scale-95">Limpiar</button>
              <button type="button" onClick={() => handleDigit("0")} className="h-12 rounded-xl border border-slate-700 bg-slate-800/40 text-base font-medium text-slate-200 transition-all hover:border-indigo-400/40 hover:bg-slate-700/60 active:scale-95">0</button>
              <button type="button" onClick={handleDelete} className="flex h-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/40 text-slate-300 transition-all hover:bg-slate-700/60 active:scale-95" aria-label="Borrar"><Icon name="x" className="h-4 w-4" /></button>
            </div>
            <button type="submit" disabled={pin.length !== 4} className={cn("mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all", pin.length === 4 ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-400 hover:to-violet-400" : "cursor-not-allowed bg-slate-800/40 text-slate-500")}>
              Ingresar <Icon name="arrow-right" className="h-4 w-4" />
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-[11px] text-slate-500">© 2026 Nexus Digital · Panel Interno de Operaciones</p>
      </div>
    </div>
  );
}

// ============================================================
// Modal
// ============================================================
function Modal({ open, onClose, title, children, hideClose = false }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; hideClose?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !hideClose) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, hideClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={hideClose ? undefined : onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/60">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {!hideClose && (
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white">
              <Icon name="x" className="h-4 w-4" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

// ============================================================
// PIN Reveal Modal
// ============================================================
function PinRevealModal({ open, employeeName, pin, onClose }: { open: boolean; employeeName: string; pin: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(pin); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch { /* fallback */ }
  };
  return (
    <Modal open={open} onClose={onClose} title="Empleado Registrado" hideClose>
      <div className="space-y-5">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
            <Icon name="check" className="h-7 w-7 text-emerald-400" />
          </div>
          <p className="text-base font-semibold text-white">{employeeName}</p>
          <p className="mt-1 text-xs text-slate-400">ha sido agregado al equipo de Nexus Digital.</p>
        </div>
        <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 p-6 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">Su código de acceso es</p>
          <p data-pin-display className="mt-3 select-all font-mono text-5xl font-bold tracking-[0.3em] text-white">{pin}</p>
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200/90">
          <Icon name="alert" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p><span className="font-semibold">Importante:</span> este código es personal y no se volverá a mostrar. Compártelo de forma segura con el colaborador.</p>
        </div>
        <div className="flex justify-between gap-3 pt-1">
          <button onClick={handleCopy} className={cn("flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition", copied ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-slate-700 bg-slate-800/40 text-slate-200 hover:border-indigo-400/50 hover:bg-slate-800")}>
            <Icon name="copy" className="h-4 w-4" />{copied ? "Copiado" : "Copiar PIN"}
          </button>
          <button onClick={onClose} className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-400 hover:to-violet-400">Entendido</button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// Stat Card
// ============================================================
function StatCard({ icon, label, value, trend, accent }: { icon: IconName; label: string; value: string; trend?: string; accent: "indigo" | "cyan" | "emerald" | "amber" | "violet" }) {
  const am = { indigo: "from-indigo-500/30 to-violet-500/0 text-indigo-300", violet: "from-violet-500/30 to-indigo-500/0 text-violet-300", cyan: "from-cyan-500/30 to-cyan-500/0 text-cyan-300", emerald: "from-emerald-500/30 to-emerald-500/0 text-emerald-300", amber: "from-amber-500/30 to-amber-500/0 text-amber-300" } as const;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/60 to-slate-900/20 p-5 transition hover:border-slate-700">
      <div className={cn("absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-50 blur-2xl transition group-hover:opacity-80", am[accent])} />
      <div className="relative">
        <div className={cn("mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/60", am[accent])}><Icon name={icon} className="h-5 w-5" /></div>
        <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-slate-400">{label}</p>
        <p className="mt-1.5 text-2xl font-bold text-white">{value}</p>
        {trend && <p className="mt-1 text-xs text-slate-500">{trend}</p>}
      </div>
    </div>
  );
}

// ============================================================
// Empty State
// ============================================================
function EmptyState({ icon, title, description }: { icon: IconName; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50"><Icon name={icon} className="h-5 w-5 text-slate-500" /></div>
      <p className="text-sm font-medium text-slate-300">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-slate-500">{description}</p>
    </div>
  );
}

// ============================================================
// TopBar
// ============================================================
function TopBar({ session, employees, onLogout }: { session: Session; employees: Employee[]; onLogout: () => void }) {
  const me = employees.find((e) => e.id === session.employeeId);
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/30">
            <Icon name="sparkles" className="h-4 w-4 text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-white">Nexus</span>
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-sm font-bold text-transparent">Digital</span>
            <span className="ml-2 text-xs text-slate-600">/</span>
            <span className="ml-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{session.role === "ADMIN" ? "Administración" : "Colaborador"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {me && (
            <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs sm:flex">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[10px] font-bold text-white">{me.name.charAt(0)}</div>
              <span className="text-slate-300">{me.name}</span>
            </div>
          )}
          <button onClick={onLogout} className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white">
            <Icon name="logout" className="h-3.5 w-3.5" />Salir
          </button>
        </div>
      </div>
    </header>
  );
}

// ============================================================
// Marketing Plans Showcase — Full-width premium section
// ============================================================
function MarketingPlansSection({ ctaAction }: { ctaAction: "whatsapp" | "internal"; onSelectPlan?: (planId: string) => void }) {
  const whatsappLink = (planName: string) =>
    `https://wa.me/50688888888?text=${encodeURIComponent(`Hola Nexus Digital, me interesa el ${planName} de Marketing Digital. ¡Quiero más información!`)}`;

  const tierIcon: Record<string, IconName> = {
    basico: "globe",
    estandar: "zap",
    premium: "crown",
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background ambient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[30rem] w-[40rem] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[160px]" />
        <div className="absolute bottom-0 left-20 h-56 w-56 rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute bottom-0 right-20 h-56 w-56 rounded-full bg-amber-600/8 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        {/* Section header */}
        <div className="mb-14 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/20 to-violet-500/10">
            <Icon name="megaphone" className="h-7 w-7 text-indigo-400" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-400">Planes de Marketing Digital</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Impulsa tu marca con <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">estrategia real</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
            Cada plan está diseñado para una etapa de crecimiento diferente. Desde presencia básica hasta dominio total de tu mercado, Nexus Digital te acompaña en cada paso.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {MARKETING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300",
                plan.accent.border,
                plan.accent.glow,
                plan.popular ? "lg:-my-3 lg:py-3" : ""
              )}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute right-4 top-4 z-10">
                  <div className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold text-white", plan.accent.badge)}>
                    <Icon name="star" className="h-3 w-3" />
                    Más Popular
                  </div>
                </div>
              )}

              {/* Top gradient line */}
              <div className={cn("h-[2px] w-full bg-gradient-to-r", plan.accent.gradient)} />

              <div className={cn("flex flex-1 flex-col p-7", plan.accent.bg)}>
                {/* Header */}
                <div className="mb-6">
                  <div className={cn("mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/40", plan.accent.icon)}>
                    <Icon name={tierIcon[plan.tier]} className="h-5 w-5" />
                  </div>
                  <div className="mb-1 flex items-baseline gap-2">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <span className="text-xs font-medium text-slate-500">{plan.subtitle}</span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-slate-400">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-white">{formatCurrency(plan.price)}</span>
                  <span className="text-sm text-slate-500">/ mes</span>
                </div>

                {/* Divider */}
                <div className="mb-6 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

                {/* Features */}
                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-[13px]">
                      <div className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full", plan.popular ? "bg-indigo-500/20 text-indigo-300" : "bg-slate-800 text-slate-400")}>
                        <Icon name="check" className="h-3 w-3" />
                      </div>
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {ctaAction === "whatsapp" ? (
                  <a
                    href={whatsappLink(plan.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn("flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]", plan.accent.button)}
                  >
                    Contactar Asesor
                    <Icon name="arrow-right" className="h-4 w-4" />
                  </a>
                ) : (
                  <button className={cn("flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]", plan.accent.button)}>
                    Iniciar Plan
                    <Icon name="arrow-right" className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-10 text-center">
          <p className="text-xs text-slate-500">
            Todos los planes incluyen onboarding inicial sin costo adicional. Presupuesto de publicidad digital (Ads) no incluido.
          </p>
          <p className="mt-1 text-xs text-slate-600">
            ¿Necesitas un plan personalizado? <span className="text-indigo-400">Contáctanos</span> y armamos la estrategia perfecta para tu marca.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Admin Tabs
// ============================================================
type AdminTab = "dashboard" | "planes";

function AdminTabBar({ active, onChange }: { active: AdminTab; onChange: (t: AdminTab) => void }) {
  const tabs: { id: AdminTab; label: string; icon: IconName }[] = [
    { id: "dashboard", label: "Dashboard", icon: "chart" },
    { id: "planes", label: "Planes Marketing", icon: "megaphone" },
  ];
  return (
    <div className="mb-8 flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/40 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
            active === tab.id
              ? "bg-gradient-to-r from-indigo-500/20 to-violet-500/10 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Icon name={tab.icon} className="h-4 w-4" />
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// Admin Panel
// ============================================================
function AdminPanel({
  session, employees, store, onRegisterPayment, onPayrollPaid, onCreateEmployee, onLogout,
}: {
  session: Session;
  employees: Employee[];
  store: DataStore;
  onRegisterPayment: (clientId: string, amount: number, note?: string) => void;
  onPayrollPaid: () => void;
  onCreateEmployee: (data: { name: string; phone: string }) => { ok: boolean; pin?: string; error?: string };
  onLogout: () => void;
}) {
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; client: Client | null }>({ open: false, client: null });
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  const metrics = useMemo(() => {
    const activeClients = store.clients.length;
    const totalCollected = store.clients.reduce((s, c) => s + c.totalPaid, 0);
    const accountsReceivable = store.clients.reduce((s, c) => s + (c.totalPrice - c.totalPaid), 0);
    const payrollPending = store.clients.filter((c) => c.commissionStatus === "Pendiente").reduce((s, c) => s + c.totalPrice * COMMISSION_RATE, 0);
    return { activeClients, totalCollected, accountsReceivable, payrollPending };
  }, [store.clients]);

  const employeePayroll = useMemo(() => {
    return employees.filter((e) => e.role !== "ADMIN").map((emp) => {
      const commissions = store.clients.filter((c) => c.employeeId === emp.id && c.commissionStatus === "Pendiente");
      const total = commissions.reduce((s, c) => s + c.totalPrice * COMMISSION_RATE, 0);
      const clientCount = store.clients.filter((c) => c.employeeId === emp.id).length;
      return { employee: emp, total, count: commissions.length, clientCount };
    });
  }, [employees, store.clients]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <TopBar session={session} employees={employees} onLogout={onLogout} />
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">Panel de Administración</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Hola, {session.name.split(" ")[0]} 👋</h1>
            <p className="mt-1 text-sm text-slate-400">Control de clientes, ingresos y nómina de Nexus Digital.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
            <span>Sistema operativo</span>
          </div>
        </div>

        {/* Tabs */}
        <AdminTabBar active={activeTab} onChange={setActiveTab} />

        {/* TAB: Dashboard */}
        {activeTab === "dashboard" && (
          <>
            {/* Metrics */}
            <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon="users" label="Clientes Activos" value={String(metrics.activeClients)} accent="indigo" />
              <StatCard icon="cash" label="Ingresos Recaudados" value={formatCurrency(metrics.totalCollected)} accent="emerald" />
              <StatCard icon="receipt" label="Cuentas por Cobrar" value={formatCurrency(metrics.accountsReceivable)} accent="amber" />
              <StatCard icon="wallet" label="Nómina del Jueves" value={formatCurrency(metrics.payrollPending)} trend={`${store.clients.filter((c) => c.commissionStatus === "Pendiente").length} comisiones pendientes`} accent="violet" />
            </div>

            {/* Employee management */}
            <div className="mb-10 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="flex flex-col items-start gap-3 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/60 text-indigo-300"><Icon name="briefcase" className="h-5 w-5" /></div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Gestión de Personal</h2>
                    <p className="text-xs text-slate-400">Agrega colaboradores. El sistema genera su PIN de 4 dígitos automáticamente.</p>
                  </div>
                </div>
                <button onClick={() => setShowEmployeeForm((v) => !v)} className={cn("flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition", showEmployeeForm ? "border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-violet-400")}>
                  <Icon name="plus" className="h-4 w-4" />{showEmployeeForm ? "Cerrar formulario" : "Agregar Empleado"}
                </button>
              </div>
              {showEmployeeForm && <EmployeeCreateForm onCreate={onCreateEmployee} />}
              <div className="overflow-x-auto">
                {employees.filter((e) => e.role !== "ADMIN").length === 0 ? (
                  <EmptyState icon="users" title="Sin empleados registrados" description="Usa el botón 'Agregar Empleado' para registrar al personal de ventas que tendrá acceso al sistema." />
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/30 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        <th className="px-6 py-3">Empleado</th><th className="px-6 py-3">Teléfono</th><th className="px-6 py-3">PIN</th><th className="px-6 py-3 text-right">Clientes</th><th className="px-6 py-3 text-right">Comisiones Pendientes</th><th className="px-6 py-3">Ingreso</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {employees.filter((e) => e.role !== "ADMIN").map((emp) => {
                        const empClients = store.clients.filter((c) => c.employeeId === emp.id);
                        const empPending = empClients.filter((c) => c.commissionStatus === "Pendiente").reduce((s, c) => s + c.totalPrice * COMMISSION_RATE, 0);
                        return (
                          <tr key={emp.id} className="transition hover:bg-slate-800/30">
                            <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 text-xs font-bold text-white">{emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</div><span className="font-medium text-white">{emp.name}</span></div></td>
                            <td className="px-6 py-4 text-slate-300">{emp.phone}</td>
                            <td className="px-6 py-4"><span className="rounded-md border border-slate-700 bg-slate-800/60 px-2 py-1 font-mono text-xs text-indigo-300">{emp.pin}</span></td>
                            <td className="px-6 py-4 text-right text-slate-300">{empClients.length}</td>
                            <td className="px-6 py-4 text-right font-semibold text-violet-300">{formatCurrency(empPending)}</td>
                            <td className="px-6 py-4 text-xs text-slate-500">{formatDate(emp.createdAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Payroll Module */}
            <div className="mb-10 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="flex flex-col items-start gap-3 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/60 text-violet-300"><Icon name="wallet" className="h-5 w-5" /></div>
                  <div><h2 className="text-base font-semibold text-white">Cierre de Nómina · Jueves</h2><p className="text-xs text-slate-400">Comisiones generadas en la semana — 5% del valor de la cuota inicial del plan al primer pago del cliente.</p></div>
                </div>
                <button onClick={onPayrollPaid} disabled={metrics.payrollPending === 0} className={cn("flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all", metrics.payrollPending > 0 ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-violet-400" : "cursor-not-allowed border border-slate-700 bg-slate-800/40 text-slate-500")}>
                  <Icon name="check" className="h-4 w-4" />Pagar Nómina Semanal
                </button>
              </div>
              <div className="overflow-x-auto">
                {employeePayroll.length === 0 ? (
                  <EmptyState icon="wallet" title="Sin empleados registrados" description="Registra empleados en 'Gestión de Personal' para comenzar a trackear comisiones." />
                ) : (
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-slate-800 bg-slate-950/30 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400"><th className="px-6 py-3">Empleado</th><th className="px-6 py-3 text-right">Clientes</th><th className="px-6 py-3 text-right">Comisiones Pend.</th><th className="px-6 py-3 text-right">Total a Pagar</th><th className="px-6 py-3">Estado</th></tr></thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {employeePayroll.map(({ employee, total, count, clientCount }) => (
                        <tr key={employee.id} className="transition hover:bg-slate-800/30">
                          <td className="px-6 py-4 font-medium text-white">{employee.name}</td>
                          <td className="px-6 py-4 text-right text-slate-300">{clientCount}</td>
                          <td className="px-6 py-4 text-right text-slate-300">{count}</td>
                          <td className="px-6 py-4 text-right font-semibold text-violet-300">{formatCurrency(total)}</td>
                          <td className="px-6 py-4">{total > 0 ? <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300"><Icon name="clock" className="h-3 w-3" />Pendiente</span> : <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300"><Icon name="check" className="h-3 w-3" />Al día</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Client control table */}
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="border-b border-slate-800 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/60 text-indigo-300"><Icon name="users" className="h-5 w-5" /></div>
                  <div><h2 className="text-base font-semibold text-white">Control de Clientes y Pagos</h2><p className="text-xs text-slate-400">Gestiona abonos, saldos y comisiones de cada proyecto.</p></div>
                </div>
              </div>
              {store.clients.length === 0 ? (
                <EmptyState icon="users" title="Sin clientes registrados" description="Los clientes aparecerán aquí cuando los empleados los registren desde su panel de colaborador." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-slate-800 bg-slate-950/30 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400"><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Teléfono</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3 text-right">Cuota Inicial</th><th className="px-4 py-3 text-right">Pagado</th><th className="px-4 py-3 text-right">Saldo</th><th className="px-4 py-3">Vendedor</th><th className="px-4 py-3 text-right">Comisión</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Acciones</th></tr></thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {store.clients.map((client) => {
                        const plan = findPlan(client.planId);
                        const employee = employees.find((e) => e.id === client.employeeId);
                        const saldo = client.totalPrice - client.totalPaid;
                        const comision = client.totalPrice * COMMISSION_RATE;
                        const isCompleted = saldo === 0;
                        return (
                          <tr key={client.id} className="transition hover:bg-slate-800/30">
                            <td className="px-4 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 text-xs font-bold text-white">{client.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</div><span className="font-medium text-white">{client.name}</span></div></td>
                            <td className="px-4 py-4 font-mono text-xs text-slate-300">{client.phone}</td>
                            <td className="px-4 py-4 text-slate-300">{plan?.name ?? "-"}</td>
                            <td className="px-4 py-4 text-right font-medium text-white">{formatCurrency(client.totalPrice)}</td>
                            <td className="px-4 py-4 text-right text-emerald-300">{formatCurrency(client.totalPaid)}</td>
                            <td className={cn("px-4 py-4 text-right font-semibold", saldo === 0 ? "text-emerald-400" : "text-amber-400")}>{formatCurrency(saldo)}</td>
                            <td className="px-4 py-4 text-slate-300">{employee?.name ?? "-"}</td>
                            <td className="px-4 py-4 text-right text-violet-300">{formatCurrency(comision)}</td>
                            <td className="px-4 py-4">{client.commissionStatus === "Pagada" ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300"><Icon name="check" className="h-3 w-3" />Pagada</span> : <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300"><Icon name="clock" className="h-3 w-3" />⏳ Pendiente</span>}</td>
                            <td className="px-4 py-4 text-right"><button onClick={() => setPaymentModal({ open: true, client })} disabled={isCompleted} className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition", isCompleted ? "cursor-not-allowed bg-emerald-500/10 text-emerald-400" : "border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:border-indigo-400/50 hover:bg-indigo-500/20")}>{isCompleted ? "✓ Finalizado" : "Registrar Abono"}</button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB: Marketing Plans */}
        {activeTab === "planes" && <MarketingPlansSection ctaAction="internal" />}

      </main>

      <PaymentModal open={paymentModal.open} client={paymentModal.client} onClose={() => setPaymentModal({ open: false, client: null })} onSubmit={(amount, note) => { if (paymentModal.client) onRegisterPayment(paymentModal.client.id, amount, note); }} />
    </div>
  );
}

// ============================================================
// Employee Create Form
// ============================================================
function EmployeeCreateForm({ onCreate }: { onCreate: (data: { name: string; phone: string }) => { ok: boolean; pin?: string; error?: string } }) {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [error, setError] = useState<string>("");
  const [revealPin, setRevealPin] = useState<{ name: string; pin: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("El nombre es obligatorio");
    if (!form.phone.trim()) return setError("El teléfono es obligatorio");
    const result = onCreate({ name: form.name.trim(), phone: form.phone.trim() });
    if (result.ok && result.pin) { setRevealPin({ name: form.name.trim(), pin: result.pin }); setForm({ name: "", phone: "" }); }
    else if (result.error) setError(result.error);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="border-b border-slate-800 bg-slate-950/20 px-6 py-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Nombre completo</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Carlos Mendoza" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Teléfono</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+506 8888 8888" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-400 hover:to-violet-400"><Icon name="check" className="h-4 w-4" />Agregar Empleado</button>
          </div>
        </div>
        {error && <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300"><Icon name="alert" className="h-3.5 w-3.5" />{error}</div>}
        <p className="mt-3 text-[11px] text-slate-500"><Icon name="shield" className="mr-1 inline h-3 w-3" />El PIN de 4 dígitos se generará automáticamente y se mostrará al confirmar.</p>
      </form>
      <PinRevealModal open={!!revealPin} employeeName={revealPin?.name ?? ""} pin={revealPin?.pin ?? ""} onClose={() => setRevealPin(null)} />
    </>
  );
}

// ============================================================
// Payment Modal
// ============================================================
function PaymentModal({ open, client, onClose, onSubmit }: { open: boolean; client: Client | null; onClose: () => void; onSubmit: (amount: number, note?: string) => void }) {
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => { if (!open) { setAmount(""); setNote(""); setError(""); } }, [open]);

  if (!client) return <Modal open={open} onClose={onClose} title="Registrar Abono">{null}</Modal>;

  const plan = findPlan(client.planId);
  const saldo = client.totalPrice - client.totalPaid;
  const invalid = !amount || isNaN(Number(amount)) || Number(amount) <= 0;

  return (
    <Modal open={open} onClose={onClose} title={`Registrar Abono · ${client.name}`}>
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-sm">
          <div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Cuota inicial</p><p className="mt-1 font-semibold text-white">{formatCurrency(client.totalPrice)}</p></div>
          <div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Pagado</p><p className="mt-1 font-semibold text-emerald-300">{formatCurrency(client.totalPaid)}</p></div>
          <div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Saldo</p><p className="mt-1 font-bold text-amber-300">{formatCurrency(saldo)}</p></div>
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Monto del abono</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₡</span>
            <input type="number" value={amount} onChange={(e) => { setAmount(e.target.value); setError(""); }} placeholder="0" min={1} max={saldo} autoFocus className={cn("w-full rounded-xl border bg-slate-950/50 px-4 py-3 pl-9 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2", error ? "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20" : "border-slate-700 focus:border-indigo-500/60 focus:ring-indigo-500/20")} />
          </div>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Nota (opcional)</label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej: Abono febrero, segunda cuota..." className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-white placeholder:text-slate-600 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[10000, 25000, 50000, saldo].map((v) => (
            <button key={v} type="button" onClick={() => setAmount(String(Math.min(v, saldo)))} className="rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-1.5 text-xs text-slate-300 transition hover:border-indigo-400/50 hover:text-white">{v === saldo ? "Saldo total" : `₡${v.toLocaleString("es-CR")}`}</button>
          ))}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800">Cancelar</button>
          <button type="button" onClick={() => { const n = Number(amount); if (invalid) { setError("Ingresa un monto válido"); return; } if (n > saldo) { setError(`El monto no puede superar el saldo (${formatCurrency(saldo)})`); return; } onSubmit(n, note || undefined); }} className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-400 hover:to-violet-400">Confirmar Abono</button>
        </div>
        {plan && <p className="border-t border-slate-800 pt-3 text-[11px] text-slate-500">Plan: <span className="text-slate-300">{plan.name}</span> · Comisión estimada: <span className="font-semibold text-violet-300">{formatCurrency(client.totalPrice * COMMISSION_RATE)}</span></p>}
      </div>
    </Modal>
  );
}

// ============================================================
// Employee Panel
// ============================================================
type EmployeeTab = "ventas" | "planes";

function EmployeePanel({ session, employees, store, onRegisterClient, onLogout }: { session: Session; employees: Employee[]; store: DataStore; onRegisterClient: (data: { name: string; phone: string; planId: string }) => void; onLogout: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "", planId: PLAN_CATALOG[0].plans[0].id, categoryId: PLAN_CATALOG[0].id });
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<EmployeeTab>("ventas");

  const myClients = useMemo(() => store.clients.filter((c) => c.employeeId === session.employeeId), [store.clients, session.employeeId]);

  const stats = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const thisWeek = myClients.filter((c) => new Date(c.createdAt) > weekAgo);
    const pendingCommission = thisWeek.filter((c) => c.commissionStatus === "Pendiente").reduce((s, c) => s + c.totalPrice * COMMISSION_RATE, 0);
    const paidCommission = thisWeek.filter((c) => c.commissionStatus === "Pagada").reduce((s, c) => s + c.totalPrice * COMMISSION_RATE, 0);
    return { thisWeekCount: thisWeek.length, pendingCommission, paidCommission };
  }, [myClients]);

  const handleCategoryChange = (categoryId: string) => {
    const cat = PLAN_CATALOG.find((c) => c.id === categoryId);
    setForm({ ...form, categoryId, planId: cat?.plans[0]?.id ?? form.planId });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    onRegisterClient({ name: form.name, phone: form.phone, planId: form.planId });
    setForm({ name: "", phone: "", planId: PLAN_CATALOG[0].plans[0].id, categoryId: PLAN_CATALOG[0].id });
    setShowForm(false);
  };

  const empTabs: { id: EmployeeTab; label: string; icon: IconName }[] = [
    { id: "ventas", label: "Mis Ventas", icon: "receipt" },
    { id: "planes", label: "Planes Marketing", icon: "megaphone" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <TopBar session={session} employees={employees} onLogout={onLogout} />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">Panel de Colaborador</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Buen día, {session.name.split(" ")[0]} 🚀</h1>
            <p className="mt-1 text-sm text-slate-400">Registra nuevos clientes y consulta tus comisiones semanales.</p>
          </div>
          <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-400 hover:to-violet-400">
            <Icon name="plus" className="h-4 w-4" />Nuevo Cliente
          </button>
        </div>

        {/* Mini stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon="users" label="Ventas esta semana" value={String(stats.thisWeekCount)} accent="indigo" />
          <StatCard icon="wallet" label="Comisiones Pendientes" value={formatCurrency(stats.pendingCommission)} accent="amber" />
          <StatCard icon="cash" label="Comisiones Pagadas" value={formatCurrency(stats.paidCommission)} accent="emerald" />
        </div>

        {/* Registration form */}
        {showForm && (
          <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="mb-4 text-base font-semibold text-white">Registrar Nuevo Cliente</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-1">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Nombre del cliente</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Distribuidora XYZ" className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Teléfono</label>
                <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+506 8888 8888" className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Categoría</label>
                <select value={form.categoryId} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-2.5 text-sm text-white focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  {PLAN_CATALOG.map((cat) => <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Plan adquirido</label>
                <select value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-2.5 text-sm text-white focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  {PLAN_CATALOG.find((c) => c.id === form.categoryId)?.plans.map((p) => <option key={p.id} value={p.id} className="bg-slate-900">{formatPlanLabel(p)}</option>)}
                </select>
              </div>
              <div className="flex items-end justify-end gap-3 md:col-span-3">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800">Cancelar</button>
                <button type="submit" className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-400 hover:to-violet-400">Guardar Cliente</button>
              </div>
            </form>
          </div>
        )}

        {/* Employee tabs */}
        <div className="mb-6 flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/40 p-1">
          {empTabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all", activeTab === tab.id ? "bg-gradient-to-r from-indigo-500/20 to-violet-500/10 text-white shadow-sm" : "text-slate-400 hover:text-slate-200")}>
              <Icon name={tab.icon} className="h-4 w-4" />{tab.label}
            </button>
          ))}
        </div>

        {activeTab === "ventas" && (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
            <div className="border-b border-slate-800 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/60 text-emerald-300"><Icon name="receipt" className="h-5 w-5" /></div>
                <div><h2 className="text-base font-semibold text-white">Historial de Ventas</h2><p className="text-xs text-slate-400">Tus clientes registrados. Tus comisiones se activan al primer pago del cliente.</p></div>
              </div>
            </div>
            {myClients.length === 0 ? (
              <EmptyState icon="receipt" title="Sin ventas registradas" description="Registra tu primer cliente para comenzar a trackear tus comisiones semanales." />
            ) : (
              <ul className="divide-y divide-slate-800/50">
                {myClients.map((client) => {
                  const plan = findPlan(client.planId);
                  const saldo = client.totalPrice - client.totalPaid;
                  const comision = client.totalPrice * COMMISSION_RATE;
                  const progress = (client.totalPaid / client.totalPrice) * 100;
                  return (
                    <li key={client.id} className="px-6 py-4 transition hover:bg-slate-800/30">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 text-xs font-bold text-white">{client.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</div>
                          <div><div className="font-medium text-white">{client.name}</div><div className="text-xs text-slate-500">{plan?.name ?? "Plan"} · {formatDate(client.createdAt)}</div></div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="rounded-md border border-slate-700 bg-slate-800/60 px-2 py-1 text-slate-300">Pagado {formatCurrency(client.totalPaid)} / {formatCurrency(client.totalPrice)}</span>
                          <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-violet-300">Comisión: {formatCurrency(comision)}</span>
                          {client.commissionStatus === "Pagada" ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300"><Icon name="check" className="h-3 w-3" />Comisión Pagada</span> : <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300"><Icon name="clock" className="h-3 w-3" />Pendiente jueves</span>}
                        </div>
                      </div>
                      {saldo > 0 && (
                        <div className="mt-3">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all" style={{ width: `${Math.min(progress, 100)}%` }} /></div>
                          <p className="mt-1 text-xs text-slate-500">Saldo pendiente: <span className="text-amber-300">{formatCurrency(saldo)}</span></p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {activeTab === "planes" && <MarketingPlansSection ctaAction="whatsapp" />}
      </main>
    </div>
  );
}

// ============================================================
// Session Type
// ============================================================
type Session = { role: Role; employeeId: string; name: string };
type DataStore = { clients: Client[] };

// ============================================================
// App Root
// ============================================================
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([{ id: "emp_admin", name: "Manfred (Admin)", phone: "-", pin: ADMIN_PIN, role: "ADMIN", createdAt: new Date().toISOString() }]);
  const [store, setStore] = useState<DataStore>({ clients: [] });

  const registerPayment = useCallback((clientId: string, amount: number, note?: string) => {
    setStore((prev) => ({
      clients: prev.clients.map((c) => {
        if (c.id !== clientId) return c;
        return { ...c, totalPaid: Math.min(c.totalPaid + amount, c.totalPrice), payments: [...c.payments, { id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, amount, date: new Date().toISOString(), note }] };
      }),
    }));
  }, []);

  const registerClient = useCallback((data: { name: string; phone: string; planId: string }) => {
    const plan = findPlan(data.planId);
    if (!plan || !session) return;
    setStore((prev) => ({ clients: [{ id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, name: data.name.trim(), phone: data.phone.trim(), planId: data.planId, totalPrice: plan.price, totalPaid: 0, employeeId: session.employeeId, commissionStatus: "Pendiente" as CommissionStatus, createdAt: new Date().toISOString(), payments: [] }, ...prev.clients] }));
  }, [session]);

  const payrollPaid = useCallback(() => {
    setStore((prev) => ({ clients: prev.clients.map((c) => c.commissionStatus === "Pendiente" ? { ...c, commissionStatus: "Pagada" as CommissionStatus } : c) }));
  }, []);

  const createEmployee = useCallback((data: { name: string; phone: string }): { ok: boolean; pin?: string; error?: string } => {
    try {
      const pin = generateUniquePin(employees.map((e) => e.pin));
      setEmployees((prev) => [...prev, { id: `emp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, name: data.name, phone: data.phone, pin, role: "EMPLOYEE", createdAt: new Date().toISOString() }]);
      return { ok: true, pin };
    } catch (err) { return { ok: false, error: (err as Error).message }; }
  }, [employees]);

  if (!session) return <LoginScreen employees={employees} onLogin={setSession} />;

  if (session.role === "ADMIN") {
    return <AdminPanel session={session} employees={employees} store={store} onRegisterPayment={registerPayment} onPayrollPaid={payrollPaid} onCreateEmployee={createEmployee} onLogout={() => setSession(null)} />;
  }

  return <EmployeePanel session={session} employees={employees} store={store} onRegisterClient={registerClient} onLogout={() => setSession(null)} />;
}
