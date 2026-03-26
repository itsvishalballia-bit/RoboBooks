'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  BadgeIndianRupee,
  BookOpenText,
  Building2,
  Car,
  Cpu,
  Factory,
  Fuel,
  Gem,
  Globe2,
  GraduationCap,
  HeartPulse,
  Hotel,
  House,
  Monitor,
  MonitorPlay,
  Pill,
  Plane,
  PlugZap,
  Receipt,
  Recycle,
  Shirt,
  ShoppingBag,
  Sofa,
  Sparkles,
  TrainFront,
  Truck,
  University,
  UtensilsCrossed,
  Wifi,
} from 'lucide-react';
import {
  defaultIndustriesContent,
  fetchPublicCmsSection,
  resolveCmsAssetUrl,
  type IndustriesCmsContent,
} from '@/services/cmsService';

const industryIcons = {
  hotel: Hotel,
  'export-import': Plane,
  recycling: Recycle,
  telecom: Wifi,
  'it-sector': Monitor,
  beverages: Receipt,
  'oil-gas': Fuel,
  apparels: Shirt,
  entertainment: MonitorPlay,
  manufacturing: Factory,
  retail: ShoppingBag,
  banks: University,
  finance: BadgeIndianRupee,
  bpo: Globe2,
  furniture: Sofa,
  'real-estate': House,
  healthcare: HeartPulse,
  railways: TrainFront,
  gems: Gem,
  automobile: Car,
  iot: Cpu,
  electrical: PlugZap,
  hardware: Cpu,
  saas: Building2,
  restaurant: UtensilsCrossed,
  salon: Sparkles,
  'cloud-kitchen': UtensilsCrossed,
  pharma: Pill,
  books: BookOpenText,
  education: GraduationCap,
  logistics: Truck,
  consulting: Building2,
} as const;

const industryLayoutSpans: Record<string, string> = {
  hotel: 'xl:col-span-1',
  'export-import': 'xl:col-span-2',
  recycling: 'xl:col-span-1',
  telecom: 'xl:col-span-3',
  'it-sector': 'xl:col-span-1',
  beverages: 'xl:col-span-3',
  'oil-gas': 'xl:col-span-1',
  apparels: 'xl:col-span-3',
  entertainment: 'xl:col-span-1',
  manufacturing: 'xl:col-span-4',
  retail: 'xl:col-span-1',
  banks: 'xl:col-span-2',
  finance: 'xl:col-span-1',
  bpo: 'xl:col-span-2',
  furniture: 'xl:col-span-1',
  'real-estate': 'xl:col-span-3',
  healthcare: 'xl:col-span-1',
  railways: 'xl:col-span-2',
  gems: 'xl:col-span-1',
  automobile: 'xl:col-span-2',
  iot: 'xl:col-span-1',
  electrical: 'xl:col-span-2',
  hardware: 'xl:col-span-1',
  saas: 'xl:col-span-3',
  restaurant: 'xl:col-span-1',
  salon: 'xl:col-span-1',
  'cloud-kitchen': 'xl:col-span-2',
  pharma: 'xl:col-span-1',
  books: 'xl:col-span-3',
  education: 'xl:col-span-3',
  logistics: 'xl:col-span-3',
  consulting: 'xl:col-span-3',
};

export default function IndustriesSection() {
  const [content, setContent] = useState<IndustriesCmsContent>(defaultIndustriesContent);

  useEffect(() => {
    fetchPublicCmsSection<IndustriesCmsContent>('industries', defaultIndustriesContent).then(
      (response) => {
        setContent(response);
      }
    );
  }, []);

  return (
    <section className="relative overflow-hidden bg-white py-16 lg:py-20">
      <div className="absolute left-[-8rem] top-20 h-72 w-72 rounded-full bg-[#0aa6c9]/10 blur-3xl" />
      <div className="absolute bottom-0 right-[-7rem] h-80 w-80 rounded-full bg-[#0f2344]/8 blur-3xl" />

      <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-10">
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#0aa6c9]">
            {content.eyebrow}
          </p>
          <h2 className="mt-4 text-4xl font-bold leading-tight text-[#0f4f78] sm:text-5xl">
            {content.title}
          </h2>
          <div className="mx-auto mt-4 h-[6px] w-20 rounded-full bg-[#0aa6c9]" />
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            {content.description}
          </p>
        </div>

        <div className="relative mt-12 grid auto-rows-[136px] grid-cols-2 gap-[6px] md:grid-cols-4 xl:grid-cols-12">
          {content.items.map((industry) => {
            const Icon = industryIcons[industry.slug as keyof typeof industryIcons] || Building2;
            const tileSpan = industryLayoutSpans[industry.slug] ?? industry.span ?? 'xl:col-span-1';

            return (
              <Link
                key={industry.slug}
                href={`/industries/${industry.slug}`}
                className={`group col-span-1 flex h-full min-h-[136px] flex-col items-center justify-center rounded-[16px] border border-[#d6e6f2] bg-[#0f2344] px-4 py-5 text-center text-white shadow-[0_18px_45px_rgba(15,35,68,0.12)] transition duration-300 hover:-translate-y-1 hover:border-[#0aa6c9]/40 hover:bg-[#12305c] ${tileSpan}`}
              >
                <div className="flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-[#0aa6c9]/18 text-[#8ee7fb] ring-1 ring-white/10 transition duration-300 group-hover:bg-[#0aa6c9]/22">
                  {industry.iconUrl.trim() ? (
                    <img
                      src={resolveCmsAssetUrl(industry.iconUrl)}
                      alt={industry.title}
                      className="h-9 w-9 object-contain"
                    />
                  ) : (
                    <Icon size={34} strokeWidth={2.1} />
                  )}
                </div>
                <h3 className="mt-4 text-[17px] font-semibold leading-tight text-white sm:text-[19px]">
                  {industry.title}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
