/* ===========================================================================
   Elohim SGE — Icon set
   Port de design/ui_kits/sge/icons.jsx (36 iconos registrados en window.SGEIcons).
   Cada icono re-exporta el equivalente de lucide-react con los defaults del
   design system: stroke 1.8px y tamaño 1em (escala con el font-size del contexto).
   Nombres SGE en español-friendly; el mapeo a lucide se documenta abajo.
   =========================================================================== */
import * as React from 'react';
import * as L from 'lucide-react';
import type { LucideProps } from 'lucide-react';

function withDefaults(Icon: React.ComponentType<LucideProps>) {
  return function SgeIcon(props: LucideProps) {
    return <Icon strokeWidth={1.8} width="1em" height="1em" {...props} />;
  };
}

export const Dashboard = withDefaults(L.LayoutDashboard);
export const Users = withDefaults(L.Users);
export const Teacher = withDefaults(L.GraduationCap);
export const Book = withDefaults(L.Book);
export const Cash = withDefaults(L.Banknote);
export const Calendar = withDefaults(L.Calendar);
export const Clipboard = withDefaults(L.ClipboardCheck);
export const Chart = withDefaults(L.BarChart3);
export const Settings = withDefaults(L.Settings);
export const Bell = withDefaults(L.Bell);
export const Search = withDefaults(L.Search);
export const Plus = withDefaults(L.Plus);
export const Filter = withDefaults(L.Filter);
export const Download = withDefaults(L.Download);
export const Pencil = withDefaults(L.Pencil);
export const Trash = withDefaults(L.Trash2);
export const Eye = withDefaults(L.Eye);
export const Mail = withDefaults(L.Mail);
export const Lock = withDefaults(L.Lock);
export const User = withDefaults(L.User);
export const Check = withDefaults(L.Check);
export const ChevronRight = withDefaults(L.ChevronRight);
export const Home = withDefaults(L.Home);
export const Logout = withDefaults(L.LogOut);
export const Phone = withDefaults(L.Phone);
export const Building = withDefaults(L.Building2);
export const Layers = withDefaults(L.Layers);
export const ChevronDown = withDefaults(L.ChevronDown);
export const Copy = withDefaults(L.Copy);
export const Receipt = withDefaults(L.Receipt);
export const Printer = withDefaults(L.Printer);
export const Send = withDefaults(L.Send);
export const Megaphone = withDefaults(L.Megaphone);
export const Box = withDefaults(L.Package);
export const ArrowRight = withDefaults(L.ArrowRight);
export const Clock = withDefaults(L.Clock);
