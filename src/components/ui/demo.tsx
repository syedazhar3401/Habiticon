import { AchievementList } from "@/src/components/ui/achievement-list"

export default function DemoOne() {
  return (
    <AchievementList
      achievements={[
        {
          id: "list-1",
          name: "10 Day Streak",
          description: "Open app for 10 days",
          trigger: "streak",
          achievedAt: "2024-01-01T00:00:00Z",
          progress: 60,
        },
        {
          id: "list-2",
          name: "5,000 Calorie Burn",
          description: "Burn 5K calories total",
          trigger: "metric",
          achievedAt: "2024-01-01T00:00:00Z",
          progress: 32,
        },
        {
          id: "list-3",
          name: "Weekend Warrior",
          description: "Complete challenges on weekends",
          trigger: "metric",
          achievedAt: null,
        },
      ]}
    />
  )
}
