'use client';

import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import {
  Banknote,
  Boxes,
  Building2,
  Factory,
  HeartPulse,
  LaptopMinimal,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  UtensilsCrossed,
} from 'lucide-react';
import {
  defaultTrustedMarqueeContent,
  fetchPublicCmsSection,
  resolveCmsAssetUrl,
  type TrustedMarqueeCmsContent,
} from '@/services/cmsService';

const iconMap = {
  banknote: Banknote,
  boxes: Boxes,
  building: Building2,
  factory: Factory,
  heart: HeartPulse,
  laptop: LaptopMinimal,
  receipt: ReceiptText,
  shield: ShieldCheck,
  shopping: ShoppingBag,
  store: Store,
  truck: Truck,
  utensils: UtensilsCrossed,
} as const;

type CmsMarqueeItem = {
  label: string;
  iconKey: string;
  iconUrl: string;
  sublabel: string;
};

export default function TrustedMarquee() {
  const [content, setContent] = useState<TrustedMarqueeCmsContent>(
    defaultTrustedMarqueeContent
  );

  useEffect(() => {
    fetchPublicCmsSection<TrustedMarqueeCmsContent>(
      'trustedMarquee',
      defaultTrustedMarqueeContent
    ).then(setContent);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white py-14 lg:py-16">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f7fbff] to-transparent" />
      <div className="absolute left-[-8rem] top-10 h-56 w-56 rounded-full bg-[#0aa6c9]/10 blur-3xl" />
      <div className="absolute right-[-8rem] bottom-0 h-56 w-56 rounded-full bg-[#0f2344]/8 blur-3xl" />

      <div className="relative mx-auto max-w-[1500px] px-4 md:px-8 lg:px-10">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#0aa6c9]">
            {content.eyebrow}
          </p>
          <h2 className="mt-4 text-4xl font-bold leading-tight text-[#0f2344] sm:text-5xl">
            {content.title}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            {content.description}
          </p>
        </div>

        <div className="mt-10 space-y-4">
          <MarqueeRow items={content.topRow} direction="left" />
          <MarqueeRow items={content.bottomRow} direction="right" />
        </div>
      </div>
    </section>
  );
}

type MarqueeRowProps = {
  items: CmsMarqueeItem[];
  direction: 'left' | 'right';
};

function MarqueeRow({ items, direction }: MarqueeRowProps) {
  const loopItems = [...items, ...items];

  return (
    <div className="overflow-hidden">
      <div
        className={`flex min-w-max gap-4 ${
          direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
        }`}
      >
        {loopItems.map(({ label, iconKey, iconUrl, sublabel }, index) => {
          const Icon =
            iconMap[iconKey as keyof typeof iconMap] ||
            (Store as ComponentType<{ size?: number; className?: string }>);

          return (
            <div
              key={`${label}-${index}`}
              className="flex min-w-[220px] items-center gap-4 rounded-[24px] border border-[#d9e7f2] bg-[#f8fbff] px-6 py-5 shadow-[0_16px_40px_rgba(15,35,68,0.07)]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f2344] text-cyan-200">
                {iconUrl ? (
                  <img
                    src={resolveCmsAssetUrl(iconUrl)}
                    alt={label}
                    className="h-7 w-7 object-contain"
                  />
                ) : (
                  <Icon size={28} />
                )}
              </div>
              <div>
                <p className="text-lg font-semibold text-[#0f2344]">{label}</p>
                <p className="text-sm text-slate-500">{sublabel}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
