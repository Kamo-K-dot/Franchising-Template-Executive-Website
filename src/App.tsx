/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown,
  Users,
  Megaphone,
  Briefcase,
  Settings,
  Database,
  DollarSign,
  FileText,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Data Structure ---

type Status = 'Complete' | 'In Progress' | 'Urgent/At Risk' | 'Waiting/TBD';

interface Task {
  id: string;
  title: string;
  owner: string;
  department: string;
  timeline: string;
  deadline: string;
  status: Status;
  notes?: string;
}

const RAW_DATA: Task[] = [
  // Marketing & Comms
  { id: '1', title: 'Social Media Post - Announce Franchise', owner: 'Fabio De Gouveia', department: 'Marketing', timeline: '1 week', deadline: '3/6/2026', status: 'In Progress' },
  { id: '2', title: 'Social Media Post for Singapore', owner: 'Fabio De Gouveia', department: 'Marketing', timeline: '1 week', deadline: '3/6/2026', status: 'In Progress' },
  { id: '3', title: 'Tyla Activities (Singapore & UK Ads)', owner: 'Fabio, Danielle', department: 'Marketing', timeline: '48-hours', deadline: '3/3/2026', status: 'In Progress' },
  { id: '4', title: 'Yearly Marketing Plan', owner: 'Fabio, Carla', department: 'Marketing', timeline: 'TBD', deadline: '-', status: 'Complete' },
  { id: '5', title: 'Newsletters for Franchisees', owner: 'Carla van Wyk', department: 'Marketing', timeline: '1 week', deadline: '3/6/2026', status: 'In Progress' },
  
  // Sales & Franchise Dev
  { id: '6', title: 'Catch-Up call - sales process', owner: 'Jermi Ramakrishnan', department: 'Sales', timeline: '2-weeks', deadline: 'Always On', status: 'In Progress' },
  { id: '7', title: 'Franchise Planner / Mapping', owner: 'Jermi, Carla, Kamohelo', department: 'Sales', timeline: '2-weeks', deadline: '3/13/2026', status: 'In Progress' },
  { id: '8', title: 'Internal Sales vs Franchise Sales Strategy', owner: 'Kamohelo, Jermi, Sam', department: 'Sales', timeline: '1 week', deadline: '3/5/2026', status: 'In Progress' },
  { id: '9', title: 'Franchise Commission Conversion', owner: 'Samantha Labuschagne', department: 'Sales', timeline: '1 week', deadline: '3/5/2026', status: 'In Progress' },
  { id: '10', title: 'Jono targets for Franchise workflow', owner: 'Joshua Smith', department: 'Sales', timeline: 'Immediate', deadline: '2/5/2026', status: 'Complete' },

  // Product & Training
  { id: '11', title: 'Onboarding <> Product (Account Creation Form)', owner: 'Joshua, Fabio, Lara', department: 'Product', timeline: '1 week', deadline: '3/3/2026', status: 'In Progress' },
  { id: '12', title: 'Update BIAB presentation - Financials', owner: 'Lara, Anthony', department: 'Product', timeline: 'Immediate', deadline: '3/3/2026', status: 'In Progress' },
  { id: '13', title: 'Club presentation from JP - changes', owner: 'JP Human', department: 'Product', timeline: '48-hours', deadline: '-', status: 'Complete' },
  { id: '14', title: 'Training Session with Aarti', owner: 'Paul', department: 'Product', timeline: '48-hours', deadline: '2/5/2026', status: 'Complete' },
  { id: '15', title: 'Diagnostic Test (Free Play Session)', owner: 'Anya, Joshua', department: 'Product', timeline: '1-month', deadline: '-', status: 'Urgent/At Risk', notes: 'Urgent for Besnik' },
  { id: '16', title: 'Play Focussed Curriculum (8 Lessons)', owner: 'Anya, Joshua', department: 'Product', timeline: '1-month', deadline: 'March', status: 'In Progress' },

  // Operations & Manuals
  { id: '17', title: 'Franchisee Ops Manual', owner: 'Fabio De Gouveia', department: 'Operations', timeline: '2-months', deadline: '-', status: 'In Progress' },
  { id: '18', title: 'Parent Presentation - add advanced', owner: 'Fabio, JP', department: 'Operations', timeline: 'Immediate', deadline: '-', status: 'Complete' },
  { id: '19', title: 'Singapore Lead Board Automations', owner: 'Fabio De Gouveia', department: 'Operations', timeline: '1 week', deadline: '3/6/2026', status: 'In Progress' },
  { id: '20', title: 'Master/Internal Ops Manual vs External', owner: 'Carla van Wyk', department: 'Operations', timeline: '48-hours', deadline: '2/23/2026', status: 'Complete' },
  { id: '21', title: 'Ops manual & what it consists off meeting', owner: 'Carla, Josh, Lara, Jermi', department: 'Operations', timeline: '1 week', deadline: '2/27/2026', status: 'Complete' },

  // IT & Systems
  { id: '22', title: 'Email setup + LMS Setup', owner: 'Joshua, Carla', department: 'IT', timeline: '1 week', deadline: '3/6/2026', status: 'In Progress' },
  { id: '23', title: 'Website (Design Phase)', owner: 'Joshua Smith', department: 'IT', timeline: '1 week', deadline: '3/6/2026', status: 'In Progress' },
  { id: '24', title: 'Monday Setup for onboarding', owner: 'Sam, Jermi', department: 'IT', timeline: '2-weeks', deadline: '2/3/2026', status: 'In Progress' },
  { id: '25', title: 'Monday Pipeline Setup', owner: 'Sam, Jermi', department: 'IT', timeline: '2-weeks', deadline: '2/3/2026', status: 'In Progress' },

  // Finance & Legal
  { id: '26', title: 'Governmental Funding - Review', owner: 'Carla, Sam', department: 'Finance', timeline: 'Immediate', deadline: '-', status: 'Complete' },
  { id: '27', title: 'BIAB - 2 Cases', owner: 'Joshua, Anthony', department: 'Finance', timeline: 'Immediate', deadline: '2/23/2026', status: 'Complete' },
  { id: '28', title: 'SP Invoice', owner: 'Sam, Francois, Jermi', department: 'Finance', timeline: 'Immediate', deadline: '2/23/2026', status: 'Complete' },
  { id: '29', title: 'Franchise Agreement finalisation', owner: 'Carla van Wyk', department: 'Finance', timeline: 'Immediate', deadline: '-', status: 'Urgent/At Risk' },
  { id: '30', title: 'BIAB Agreement', owner: 'Carla van Wyk', department: 'Finance', timeline: 'Immediate', deadline: '-', status: 'Urgent/At Risk' },
  { id: '31', title: 'Franchise x Parents Agreements', owner: 'Carla van Wyk', department: 'Finance', timeline: 'Immediate', deadline: '-', status: 'Urgent/At Risk' },
  { id: '32', title: 'Namibia Invoice', owner: 'Francois Labuschagne', department: 'Finance', timeline: '48-hours', deadline: '-', status: 'Complete' },
  { id: '33', title: 'UAE - Meta Adds to Resolute', owner: 'Lara, Carla', department: 'Product', timeline: '1 week', deadline: '3/2/2026', status: 'Waiting/TBD', notes: 'Waiting on Mark' },
  { id: '34', title: 'Software allocation to IT costs', owner: 'Joshua, Emad', department: 'IT', timeline: '1-year', deadline: '12/1/2026', status: 'In Progress' },
  { id: '35', title: 'Cash outflows before inflow for Stock', owner: 'Francois Labuschagne', department: 'Finance', timeline: '2-weeks', deadline: '12/3/2026', status: 'In Progress' },
  { id: '36', title: 'Finance Model Revision (Ashleigh 2yr)', owner: 'Jermi, Sam', department: 'Finance', timeline: '48-hours', deadline: '-', status: 'In Progress' },
  { id: '37', title: 'EL Invoice', owner: 'Francois Labuschagne', department: 'Finance', timeline: '48-hours', deadline: '-', status: 'Complete' },
];

const DEPARTMENTS = [
  { name: 'Marketing', icon: Megaphone, color: 'bg-indigo-500' },
  { name: 'Sales', icon: Briefcase, color: 'bg-emerald-500' },
  { name: 'Product', icon: LayoutDashboard, color: 'bg-violet-500' },
  { name: 'Operations', icon: Settings, color: 'bg-amber-500' },
  { name: 'IT', icon: Database, color: 'bg-blue-500' },
  { name: 'Finance', icon: DollarSign, color: 'bg-rose-500' },
];

const STATUS_COLORS: Record<Status, string> = {
  'Complete': '#10b981', // emerald-500
  'In Progress': '#3b82f6', // blue-500
  'Urgent/At Risk': '#ef4444', // red-500
  'Waiting/TBD': '#f59e0b', // amber-500
};

// --- Components ---

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      {trend && (
        <p className={`text-xs mt-2 font-medium ${trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend} from last week
        </p>
      )}
    </div>
    <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
      <Icon size={24} className={color.replace('bg-', 'text-')} />
    </div>
  </div>
);

interface DepartmentSectionProps {
  dept: {
    name: string;
    icon: any;
    color: string;
  };
  tasks: Task[];
}

const DepartmentSection = ({ dept, tasks }: DepartmentSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);
  
  const stats = useMemo(() => {
    const total = tasks.length;
    const complete = tasks.filter(t => t.status === 'Complete').length;
    const urgent = tasks.filter(t => t.status === 'Urgent/At Risk').length;
    return { total, complete, urgent, percent: total > 0 ? Math.round((complete / total) * 100) : 0 };
  }, [tasks]);

  // Dynamic Manager Action Logic
  const managerAction = useMemo(() => {
    if (stats.urgent > 0) return { label: 'Full Strategy Meeting', color: 'text-rose-600', bg: 'bg-rose-50', icon: AlertCircle };
    if (stats.percent < 50) return { label: '15min Touch Base', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock };
    if (stats.percent < 90) return { label: 'Email Status Check', color: 'text-blue-600', bg: 'bg-blue-50', icon: Megaphone };
    return { label: 'Final Review / Sign-off', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 };
  }, [stats]);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <managerAction.icon size={14} className={managerAction.color} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${managerAction.color}`}>
            Manager Action: {managerAction.label}
          </span>
        </div>
      </div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${dept.color}`}>
            <dept.icon size={20} className="text-white" />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-slate-900">{dept.name}</h4>
            <p className="text-xs text-slate-500">{stats.total} Active Tasks • {stats.percent}% Complete</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {stats.urgent > 0 && (
            <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
              <AlertCircle size={12} /> {stats.urgent} Urgent
            </span>
          )}
          {isOpen ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2 pl-4 border-l-2 border-slate-100 ml-6">
              {tasks.map(task => (
                <div key={task.id} className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between group hover:border-slate-300 transition-all">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="text-sm font-medium text-slate-900 truncate">{task.title}</h5>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider
                        ${task.status === 'Complete' ? 'bg-emerald-50 text-emerald-700' : 
                          task.status === 'Urgent/At Risk' ? 'bg-rose-50 text-rose-700 animate-pulse' : 
                          task.status === 'Waiting/TBD' ? 'bg-amber-50 text-amber-700' :
                          'bg-blue-50 text-blue-700'}`}
                      >
                        {task.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><Users size={12} /> {task.owner}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {task.deadline}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">{task.timeline}</p>
                    {task.notes && <p className="text-[10px] text-rose-500 font-medium italic mt-1">{task.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SupportManagerSection = ({ departments, tasks }: { departments: any[], tasks: Task[] }) => {
  const getAction = (deptName: string) => {
    const deptTasks = tasks.filter(t => t.department === deptName);
    const total = deptTasks.length;
    const complete = deptTasks.filter(t => t.status === 'Complete').length;
    const urgent = deptTasks.filter(t => t.status === 'Urgent/At Risk').length;
    const percent = total > 0 ? (complete / total) * 100 : 0;

    if (urgent > 0) {
      return {
        action: 'Urgent Strategy Meeting & Risk Mitigation',
        timeline: 'Next 48 Hours (Critical)',
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-200'
      };
    }
    if (percent < 40) {
      return {
        action: '15min Operational Alignment Call',
        timeline: 'Next 5 Days',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200'
      };
    }
    if (percent < 80) {
      return {
        action: 'Email Status Update & Milestone Verification',
        timeline: 'Next 2 Weeks',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200'
      };
    }
    return {
      action: 'Final Quality Audit & COO Handover Prep',
      timeline: 'General Check-in',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200'
    };
  };

  return (
    <div className="mb-8 print:break-before-page">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-indigo-600 rounded-lg text-white print:bg-black">
          <Users size={18} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Kamo's Support Manager Action Plan</h3>
          <p className="text-xs text-slate-500">Internal operational roadmap for the next 14 days</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map(dept => {
          const actionInfo = getAction(dept.name);
          return (
            <div key={dept.name} className={`p-4 rounded-2xl border ${actionInfo.border} ${actionInfo.bg} transition-all hover:shadow-md print:shadow-none print:bg-white`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${dept.color} bg-opacity-20 print:bg-slate-100`}>
                  <dept.icon size={16} className={dept.color.replace('bg-', 'text-')} />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{dept.name}</h4>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Recommended Action</p>
                  <p className={`text-xs font-bold ${actionInfo.color} print:text-black`}>{actionInfo.action}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Timeline</p>
                  <p className="text-xs font-medium text-slate-700">{actionInfo.timeline}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CoverPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white p-12 text-center print:h-screen print:p-0">
    <div className="mb-12">
      {/* Logo Placeholder - Using a clean text-based logo or generic image since we can't host the specific uploaded one easily without a URL */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center text-white text-4xl font-black">R</div>
        <h2 className="text-6xl font-black tracking-tighter text-black">resolute.</h2>
      </div>
      <div className="h-1 w-24 bg-indigo-600 mx-auto mb-8"></div>
    </div>
    
    <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight max-w-2xl">
      Resolute Franchise Weekly Operations Snapshot
    </h1>
    
    <div className="space-y-6 mt-12">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Created By</p>
        <p className="text-xl font-bold text-slate-900">Kamo Makwela</p>
        <p className="text-sm text-slate-500">Support Manager</p>
      </div>
      
      <div className="w-12 h-px bg-slate-200 mx-auto"></div>
      
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Prepared For</p>
        <p className="text-xl font-bold text-slate-900">Carla Van Wyk</p>
        <p className="text-sm text-slate-500">Franchising COO</p>
      </div>
    </div>
    
    <div className="mt-24 text-slate-400 text-xs font-medium">
      {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
    </div>
  </div>
);

const OwnerSection = ({ owner, tasks }: { owner: string, tasks: Task[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const stats = useMemo(() => {
    const total = tasks.length;
    const complete = tasks.filter(t => t.status === 'Complete').length;
    const urgent = tasks.filter(t => t.status === 'Urgent/At Risk').length;
    return { total, complete, urgent, percent: total > 0 ? Math.round((complete / total) * 100) : 0 };
  }, [tasks]);

  return (
    <div className="mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-slate-400 rounded-xl transition-all group shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
            <Users size={16} />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold text-slate-900">{owner}</h4>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{stats.total} Tasks • {stats.percent}% Complete</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {stats.urgent > 0 && (
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
              {stats.urgent} Urgent
            </span>
          )}
          {isOpen ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2 pl-4 border-l-2 border-slate-100 ml-4">
              {tasks.map(task => (
                <div key={task.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <h5 className="text-xs font-bold text-slate-900 truncate mb-1">{task.title}</h5>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{task.department}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase
                        ${task.status === 'Complete' ? 'bg-emerald-100 text-emerald-700' : 
                          task.status === 'Urgent/At Risk' ? 'bg-rose-100 text-rose-700' : 
                          'bg-blue-100 text-blue-700'}`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-mono text-slate-500">{task.deadline}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [showRisks, setShowRisks] = useState(false);
  const [groupBy, setGroupBy] = useState<'dept' | 'owner'>('dept');
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    const total = RAW_DATA.length;
    const complete = RAW_DATA.filter(t => t.status === 'Complete').length;
    const urgent = RAW_DATA.filter(t => t.status === 'Urgent/At Risk').length;
    const inProgress = RAW_DATA.filter(t => t.status === 'In Progress').length;
    const waiting = RAW_DATA.filter(t => t.status === 'Waiting/TBD').length;
    
    const statusData = [
      { name: 'Complete', value: complete, color: STATUS_COLORS['Complete'] },
      { name: 'In Progress', value: inProgress, color: STATUS_COLORS['In Progress'] },
      { name: 'Urgent', value: urgent, color: STATUS_COLORS['Urgent/At Risk'] },
      { name: 'Waiting', value: waiting, color: STATUS_COLORS['Waiting/TBD'] },
    ];

    const deptData = DEPARTMENTS.map(d => ({
      name: d.name,
      total: RAW_DATA.filter(t => t.department === d.name).length,
      complete: RAW_DATA.filter(t => t.department === d.name && t.status === 'Complete').length,
    }));

    const uniqueOwners: string[] = Array.from(new Set(RAW_DATA.map(t => t.owner))).sort();

    return { total, complete, urgent, inProgress, statusData, deptData, uniqueOwners };
  }, []);

  const handleExport = async () => {
    if (!dashboardRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const el = dashboardRef.current;
      const dataUrl = await toPng(el, {
        quality: 1,
        pixelRatio: 2,
      });
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      const pdf = new jsPDF({
        orientation: height > width ? 'p' : 'l',
        unit: 'px',
        format: [width, height]
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
      const dateString = new Date().toISOString().split('T')[0];
      pdf.save(`franchise-ops-dashboard-${dateString}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF', err);
    } finally {
      setIsExporting(false);
    }
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show labels for tiny slices

    return (
      <text x={x} y={y} fill="#1e293b" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {/* Cover Page (Only visible in print or if we add a toggle) */}
      <div className="hidden print:block">
        <CoverPage />
      </div>

      {/* Main App Content */}
      <div className="print:hidden" ref={dashboardRef}>
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <LayoutDashboard size={24} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Franchise Ops Dashboard</h1>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Executive Report • COO View</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-xs font-semibold text-slate-900">Support Manager</p>
                <p className="text-[10px] text-slate-500">Reporting to COO</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center">
                <Users size={16} className="text-slate-600" />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Executive Header Section */}
          <div className="mb-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Resolute Franchise Weekly Operations Snapshot</h2>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Created By:</span>
                    <span className="font-bold text-slate-700">Kamo Makwela</span>
                  </div>
                  <div className="w-px h-4 bg-slate-200 hidden sm:block"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Prepared For:</span>
                    <span className="font-bold text-indigo-600">Carla Van Wyk</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 group active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <FileText size={18} className="group-hover:scale-110 transition-transform" />
                    Download PDF Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Deliverables" 
              value={stats.total} 
              icon={FileText} 
              color="bg-indigo-500" 
              trend="+4"
            />
            <StatCard 
              title="Completed" 
              value={stats.complete} 
              icon={CheckCircle2} 
              color="bg-emerald-500" 
              trend="+12%"
            />
            <StatCard 
              title="In Progress" 
              value={stats.inProgress} 
              icon={Clock} 
              color="bg-blue-500" 
            />
            <StatCard 
              title="Urgent / At Risk" 
              value={stats.urgent} 
              icon={AlertCircle} 
              color="bg-rose-500" 
            />
          </div>

          {/* Support Manager Action Plan */}
          <SupportManagerSection departments={DEPARTMENTS} tasks={RAW_DATA} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Charts & Urgent */}
            <div className="lg:col-span-1 space-y-8">
              {/* Status Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
                <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-indigo-600" />
                  Overall Health (%)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        labelLine={false}
                        label={renderCustomizedLabel}
                      >
                        {stats.statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {stats.statusData.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-slate-600 font-medium">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[10px]">({Math.round((s.value / stats.total) * 100)}%)</span>
                        <span className="text-slate-900 font-bold">{s.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Urgent Items */}
              <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                <h3 className="text-sm font-bold text-rose-900 mb-4 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Critical Attention Required
                </h3>
                <div className="space-y-3">
                  {RAW_DATA.filter(t => t.status === 'Urgent/At Risk').slice(0, 3).map(task => (
                    <div key={task.id} className="bg-white p-3 rounded-xl border border-rose-200 shadow-sm">
                      <p className="text-xs font-bold text-slate-900 mb-1">{task.title}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">{task.owner}</span>
                        <span className="text-[10px] font-bold text-rose-600 uppercase">Action Needed</span>
                      </div>
                    </div>
                  ))}
                  
                  <AnimatePresence>
                    {showRisks && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-3 overflow-hidden"
                      >
                        {RAW_DATA.filter(t => t.status === 'Urgent/At Risk').slice(3).map(task => (
                          <div key={task.id} className="bg-white p-3 rounded-xl border border-rose-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-900 mb-1">{task.title}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-500">{task.owner}</span>
                              <span className="text-[10px] font-bold text-rose-600 uppercase">Action Needed</span>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button 
                  onClick={() => setShowRisks(!showRisks)}
                  className="w-full mt-4 py-2 text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center justify-center gap-1"
                >
                  {showRisks ? 'Hide Risks' : 'View All Risks'} <ChevronDown size={14} className={showRisks ? 'rotate-180' : ''} />
                </button>
              </div>
            </div>

            {/* Right Column: Departmental Breakdown */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 min-h-[600px]">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Departmental Line of Sight</h3>
                    <p className="text-xs text-slate-500">Live operational status across all franchise functions</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                    <button 
                      onClick={() => setGroupBy('dept')}
                      className={`px-3 py-1 text-[10px] font-bold rounded-md shadow-sm transition-all ${groupBy === 'dept' ? 'bg-white text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      By Dept
                    </button>
                    <button 
                      onClick={() => setGroupBy('owner')}
                      className={`px-3 py-1 text-[10px] font-bold rounded-md shadow-sm transition-all ${groupBy === 'owner' ? 'bg-white text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      By Owner
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {groupBy === 'dept' ? (
                    DEPARTMENTS.map(dept => (
                      <div key={dept.name}>
                        <DepartmentSection 
                          dept={dept} 
                          tasks={RAW_DATA.filter(t => t.department === dept.name)} 
                        />
                      </div>
                    ))
                  ) : (
                    stats.uniqueOwners.map(owner => (
                      <div key={owner}>
                        <OwnerSection 
                          owner={owner}
                          tasks={RAW_DATA.filter(t => t.owner === owner)}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Generated on {new Date().toLocaleDateString()} • Data synced from Master Franchise Tracker
            </p>
            <div className="flex items-center gap-6">
              <button 
                onClick={handleExport} 
                disabled={isExporting}
                className={`text-xs font-medium transition-colors ${isExporting ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-indigo-600'}`}
              >
                {isExporting ? 'Generating PDF...' : 'Export PDF'}
              </button>
              <a href="#" className="text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors">Share Report</a>
              <a href="#" className="text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors">Archive</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Print-only Report Layout (Full Document) */}
      <div className="hidden print:block bg-white text-black p-0">
        <div className="max-w-4xl mx-auto">
          {/* We already have the CoverPage at the top of the return, but let's ensure the rest of the content follows it correctly in print */}
          <div className="page-break-after-always"></div>
          
          <div className="py-12 px-8">
            <div className="flex items-center justify-between mb-12 border-b-2 border-slate-900 pb-6">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Weekly Operations Snapshot</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Franchise Operations • {new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">Resolute Franchise</p>
                <p className="text-[10px] text-slate-500">Master Tracker Sync</p>
              </div>
            </div>

            {/* Print Stats */}
            <div className="grid grid-cols-4 gap-4 mb-12">
              <div className="border border-slate-200 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Tasks</p>
                <p className="text-2xl font-black">{stats.total}</p>
              </div>
              <div className="border border-slate-200 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Completed</p>
                <p className="text-2xl font-black text-emerald-600">{stats.complete}</p>
              </div>
              <div className="border border-slate-200 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">In Progress</p>
                <p className="text-2xl font-black text-blue-600">{stats.inProgress}</p>
              </div>
              <div className="border border-slate-200 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Urgent</p>
                <p className="text-2xl font-black text-rose-600">{stats.urgent}</p>
              </div>
            </div>

            {/* Support Manager Plan in Print */}
            <SupportManagerSection departments={DEPARTMENTS} tasks={RAW_DATA} />

            {/* Dynamic Breakdown in Print */}
            <div className="mt-12">
              <h3 className="text-xl font-black uppercase tracking-tight mb-6 border-b border-slate-200 pb-2">
                {groupBy === 'dept' ? 'Departmental Breakdown' : 'Breakdown By Owner'}
              </h3>
              {groupBy === 'dept' ? (
                DEPARTMENTS.map(dept => {
                  const deptTasks = RAW_DATA.filter(t => t.department === dept.name);
                  return (
                    <div key={dept.name} className="mb-8 break-inside-avoid">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${dept.color}`}></span>
                          {dept.name}
                        </h4>
                        <span className="text-xs font-bold text-slate-500">
                          {deptTasks.filter(t => t.status === 'Complete').length} / {deptTasks.length} Tasks Complete
                        </span>
                      </div>
                      <div className="space-y-2">
                        {deptTasks.map(task => (
                          <div key={task.id} className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                            <div className="flex-1">
                              <p className="font-bold">{task.title}</p>
                              <p className="text-[10px] text-slate-500">{task.owner} • {task.deadline}</p>
                            </div>
                            <div className="text-right">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border 
                                ${task.status === 'Complete' ? 'border-emerald-200 text-emerald-700' : 
                                  task.status === 'Urgent/At Risk' ? 'border-rose-200 text-rose-700' : 
                                  'border-blue-200 text-blue-700'}`}>
                                {task.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                stats.uniqueOwners.map(owner => {
                  const ownerTasks = RAW_DATA.filter(t => t.owner === owner);
                  return (
                    <div key={owner} className="mb-8 break-inside-avoid">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold flex items-center gap-2">
                          <Users size={18} className="text-slate-400" />
                          {owner}
                        </h4>
                        <span className="text-xs font-bold text-slate-500">
                          {ownerTasks.filter(t => t.status === 'Complete').length} / {ownerTasks.length} Tasks Complete
                        </span>
                      </div>
                      <div className="space-y-2">
                        {ownerTasks.map(task => (
                          <div key={task.id} className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                            <div className="flex-1">
                              <p className="font-bold">{task.title}</p>
                              <p className="text-[10px] text-slate-500">{task.department} • {task.deadline}</p>
                            </div>
                            <div className="text-right">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border 
                                ${task.status === 'Complete' ? 'border-emerald-200 text-emerald-700' : 
                                  task.status === 'Urgent/At Risk' ? 'border-rose-200 text-rose-700' : 
                                  'border-blue-200 text-blue-700'}`}>
                                {task.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
