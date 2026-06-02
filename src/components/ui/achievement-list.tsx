"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Trophy } from "lucide-react"

import { cn } from "@/src/lib/utils"

interface Achievement {
  id: string
  name: string
  description?: string | null
  trigger: "metric" | "api" | "streak"
  badgeUrl?: string | null
  progress?: number
  rarity?: number
}

interface UserAchievement extends Achievement {
  achievedAt: string | null
}

const achievementListVariants = cva("flex flex-col", {
  variants: {
    columns: {
      2: "grid grid-cols-1 md:grid-cols-2",
      3: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
      4: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
      auto: "w-full",
    },
    gap: {
      sm: "gap-2",
      default: "gap-3.5",
      lg: "gap-5",
    },
  },
  defaultVariants: {
    columns: "auto",
    gap: "default",
  },
})

interface AchievementListProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementListVariants> {
  achievements: UserAchievement[]
  badgeSize?: "sm" | "default" | "lg"
  lockedStyle?: "grayscale" | "silhouette" | "hidden"
  onAchievementClick?: (achievement: UserAchievement) => void
}

const badgeSizeMap = {
  sm: "h-10 w-10",
  default: "h-12 w-12",
  lg: "h-14 w-14",
} as const

const iconSizeMap = {
  sm: "h-5 w-5",
  default: "h-6 w-6",
  lg: "h-7 w-7",
} as const

const progressSizeMap = {
  sm: 42,
  default: 48,
  lg: 56,
} as const

const AchievementList = React.forwardRef<HTMLDivElement, AchievementListProps>(
  (
    {
      className,
      columns,
      gap,
      achievements,
      badgeSize = "default",
      lockedStyle = "grayscale",
      onAchievementClick,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn("w-full select-none", className)} {...props}>
        <div
          role="list"
          aria-label="Achievements"
          className={achievementListVariants({ columns, gap })}
        >
          {achievements.map((achievement) => {
            const isUnlocked = achievement.achievedAt !== null
            const hasProgress =
              !isUnlocked && typeof achievement.progress === "number"

            if (!isUnlocked && lockedStyle === "hidden") {
              return null
            }

            const progress = hasProgress
              ? Math.min(100, Math.max(0, achievement.progress ?? 0))
              : 0
            const progressSize = progressSizeMap[badgeSize]
            const progressStroke = 3.5
            const progressRadius = (progressSize - progressStroke) / 2
            const circumference = 2 * Math.PI * progressRadius
            const dashOffset = circumference - (progress / 100) * circumference

            return (
              <div
                key={achievement.id}
                role={onAchievementClick ? "button" : "listitem"}
                tabIndex={onAchievementClick ? 0 : undefined}
                onClick={() => onAchievementClick?.(achievement)}
                onKeyDown={
                  onAchievementClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          onAchievementClick(achievement)
                        }
                      }
                    : undefined
                }
                className={cn(
                  "bg-white flex items-center gap-4 rounded-none border-2 border-black px-4 py-3 shadow-[3px_3px_0px_#000000] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-[2px_2px_0px_#000000] transition-all",
                  onAchievementClick && "cursor-pointer"
                )}
              >
                {achievement.badgeUrl ? (
                  <img
                    src={achievement.badgeUrl}
                    alt={achievement.name}
                    className={cn(
                      badgeSizeMap[badgeSize],
                      "shrink-0 rounded-none border-2 border-black object-cover",
                      !isUnlocked && lockedStyle === "grayscale" && "grayscale opacity-50",
                      !isUnlocked &&
                        lockedStyle === "silhouette" &&
                        "opacity-30 brightness-0"
                    )}
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className={cn(
                      badgeSizeMap[badgeSize],
                      "flex shrink-0 items-center justify-center rounded-none border-2 border-black",
                      isUnlocked
                        ? "bg-[#E85002] text-black"
                        : "bg-[#A7A7A7]/25 text-[#333333] opacity-60"
                    )}
                  >
                    <Trophy className={iconSizeMap[badgeSize]} />
                  </div>
                )}

                <div className="min-w-0 flex-1 text-left">
                  <p
                    className={cn(
                      "truncate text-xs font-black uppercase tracking-tight text-black",
                      !isUnlocked && "text-[#A7A7A7] line-through"
                    )}
                  >
                    {achievement.name}
                  </p>
                  <p className="text-[#646464] truncate text-[10px] font-mono font-bold uppercase mt-0.5">
                    {achievement.description ?? "Complete the required steps"}
                  </p>
                </div>

                {hasProgress && progress > 0 ? (
                  <div
                    className="relative shrink-0"
                    style={{ width: progressSize, height: progressSize }}
                  >
                    <svg
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full"
                      viewBox={`0 0 ${progressSize} ${progressSize}`}
                    >
                      <circle
                        cx={progressSize / 2}
                        cy={progressSize / 2}
                        r={progressRadius}
                        fill="none"
                        stroke="#A7A7A7"
                        strokeOpacity={0.25}
                        strokeWidth={progressStroke}
                      />
                      <circle
                        cx={progressSize / 2}
                        cy={progressSize / 2}
                        r={progressRadius}
                        fill="none"
                        stroke="#E85002"
                        strokeLinecap="square"
                        strokeWidth={progressStroke}
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        transform={`rotate(-90 ${progressSize / 2} ${progressSize / 2})`}
                      />
                    </svg>
                    <div className="text-black absolute inset-0 grid place-items-center text-[10px] font-black font-mono leading-none">
                      {Math.round(progress)}%
                    </div>
                  </div>
                ) : null}

                {isUnlocked && (
                  <span className="text-[8px] bg-black text-[#E85002] border border-black font-mono font-bold uppercase px-1.5 py-0.5 rounded-none tracking-wider shrink-0 select-none">
                    Cleared
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
AchievementList.displayName = "AchievementList"

export { AchievementList, achievementListVariants }
export type { AchievementListProps, Achievement, UserAchievement }
