import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  CandlestickChart,
  CarFront,
  Clapperboard,
  Coins,
  CopyPlus,
  Drama,
  Dumbbell,
  Flame,
  Gem,
  Handshake,
  LaptopMinimalCheck,
  Leaf,
  MoonStar,
  MonitorSmartphone,
  NotebookTabs,
  PackageCheck,
  PackagePlus,
  Rocket,
  Sparkles,
  Siren,
  ShoppingBag,
  Store,
  Sunrise,
  Swords,
  UtensilsCrossed,
  WalletCards,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  CandlestickChart,
  CarFront,
  Clapperboard,
  Coins,
  CopyPlus,
  Drama,
  Dumbbell,
  Flame,
  Gem,
  Handshake,
  LaptopMinimalCheck,
  Leaf,
  MoonStar,
  MonitorSmartphone,
  NotebookTabs,
  PackageCheck,
  PackagePlus,
  Rocket,
  ShoppingBag,
  Sparkles,
  Siren,
  Store,
  Sunrise,
  Swords,
  UtensilsCrossed,
  WalletCards,
  Wrench,
};

export function IconGlyph({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = icons[name] ?? Sparkles;
  return <Icon className={cn(className)} />;
}

export function IconBadge({
  name,
  className,
  iconClassName,
}: {
  name: string;
  className?: string;
  iconClassName?: string;
}) {
  const Icon = icons[name] ?? Sparkles;
  return (
    <span
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        className
      )}
    >
      <Icon className={cn("h-5 w-5", iconClassName)} />
    </span>
  );
}
