import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChannelHome } from "@/components/channel-home";
import { channelConfig, channels, isChannel } from "@/lib/channels";

type ChannelPageProps = {
  params: Promise<{ channel: string }>;
};

export function generateStaticParams() {
  return channels.map((channel) => ({ channel }));
}

export async function generateMetadata({ params }: ChannelPageProps): Promise<Metadata> {
  const { channel } = await params;

  if (!isChannel(channel)) {
    return {};
  }

  return {
    title: channelConfig[channel].label,
    description: channelConfig[channel].description,
    alternates: { canonical: `/${channel}` },
  };
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { channel } = await params;

  if (!isChannel(channel)) {
    notFound();
  }

  return <ChannelHome channel={channel} />;
}
