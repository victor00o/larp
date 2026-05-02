import { IconGlyph } from "@/components/game/icon-map";
import { getPersonaVisual } from "@/lib/personas";
import { cn } from "@/lib/utils";
import type { GameProfile } from "@/lib/types";

interface ProfileAvatarProps {
  profile: GameProfile | null;
  accent: "player" | "rival";
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: {
    shell: "h-10 w-10 rounded-xl",
    inner: "h-8 w-8 rounded-lg",
    icon: "h-4 w-4",
    emoji: "text-base",
  },
  md: {
    shell: "h-14 w-14 rounded-2xl",
    inner: "h-11 w-11 rounded-xl",
    icon: "h-5 w-5",
    emoji: "text-xl",
  },
  lg: {
    shell: "h-20 w-20 rounded-3xl",
    inner: "h-16 w-16 rounded-2xl",
    icon: "h-7 w-7",
    emoji: "text-3xl",
  },
} as const;

export function ProfileAvatar({
  profile,
  accent,
  size = "md",
}: ProfileAvatarProps) {
  const visual = getPersonaVisual(profile?.personaId, profile?.categoryId);
  const styles = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex items-center justify-center border shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        styles.shell,
        accent === "player" ? "border-player/25 bg-player/12 text-player" : "border-rival/25 bg-rival/12 text-rival"
      )}
      aria-hidden="true"
    >
      <div
        className={cn(
          "flex items-center justify-center border",
          styles.inner,
          accent === "player" ? "border-player/20 bg-[#07130d]" : "border-rival/20 bg-[#17090b]"
        )}
      >
        {visual.icon ? (
          <IconGlyph name={visual.icon} className={cn(styles.icon)} />
        ) : (
          <span className={cn(styles.emoji)}>{visual.emoji}</span>
        )}
      </div>
    </div>
  );
}
