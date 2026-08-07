export const channels = ["life", "tech"] as const;

export type Channel = (typeof channels)[number];

export const channelConfig = {
  life: {
    label: "LIFE LOG",
    shortLabel: "LIFE",
    description: "일상과 취미, 사진으로 남기는 개인 기록",
  },
  tech: {
    label: "TECH LOG",
    shortLabel: "TECH",
    description: "만들고 배포하고 관찰하며 남기는 기술 기록",
  },
} as const satisfies Record<Channel, { label: string; shortLabel: string; description: string }>;

export function isChannel(value: string): value is Channel {
  return channels.includes(value as Channel);
}
