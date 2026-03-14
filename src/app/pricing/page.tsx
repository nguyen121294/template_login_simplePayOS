import Link from 'next/link';
import { Check, Sparkles, Zap, Shield, Star } from 'lucide-react';
import { getPlans } from '@/lib/plans';

const planIcons = {
  free: Shield,
  plus: Zap,
  pro: Sparkles,
  premium: Star,
};

const planGradients = {
  free: 'from-zinc-500 to-zinc-400',
  plus: 'from-blue-500 to-blue-400',
  pro: 'from-indigo-500 to-purple-500',
  premium: 'from-amber-400 to-orange-500',
};

const planBorderColors = {
  free: 'border-zinc-700',
  plus: 'border-blue-500/40',
  pro: 'border-indigo-500/60',
  premium: 'border-amber-500/40',
};

const planBgColors = {
  free: 'bg-zinc-900/50',
  plus: 'bg-zinc-900/50',
  pro: 'bg-gradient-to-b from-indigo-950/60 to-zinc-900/50',
  premium: 'bg-zinc-900/50',
};

function formatPrice(price: number) {
  if (price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDuration(days: number) {
  if (days === 0) return '';
  if (days < 30) return `${days} ngày`;
  if (days === 30) return '/ 30 ngày';
  if (days === 180) return '/ 6 tháng';
  if (days === 365) return '/ 1 năm';
  return `/ ${days} ngày`;
}

export default async function PricingPage() {
  const plans = await getPlans();

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-full -translate-x-1/2 [background:radial-gradient(50%_50%_at_50%_0%,rgba(99,102,241,0.12)_0%,rgba(9,9,11,0)_100%)]" />

      {/* Header */}
      <header className="pt-20 pb-16 text-center px-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-400 mb-6">
          <Sparkles className="h-4 w-4" />
          <span>Bảng giá đơn giản, minh bạch</span>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          Chọn gói{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            phù hợp
          </span>
        </h1>
        <p className="mt-5 text-lg text-zinc-400 max-w-xl mx-auto">
          Bắt đầu miễn phí, nâng cấp bất cứ lúc nào. Không ràng buộc, không phí ẩn.
        </p>
      </header>

      {/* Pricing Cards */}
      <main className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const Icon = planIcons[plan.id as keyof typeof planIcons] || Shield;
            const gradient = planGradients[plan.id as keyof typeof planGradients] || planGradients.free;
            const border = planBorderColors[plan.id as keyof typeof planBorderColors] || planBorderColors.free;
            const bg = planBgColors[plan.id as keyof typeof planBgColors] || planBgColors.free;
            const isPro = plan.id === 'pro';

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border ${border} ${bg} p-6 shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                  isPro ? 'ring-2 ring-indigo-500/50 ring-offset-2 ring-offset-zinc-950' : ''
                }`}
              >
                {/* Popular badge */}
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1 text-xs font-bold text-white shadow-lg">
                      PHỔ BIẾN NHẤT
                    </span>
                  </div>
                )}

                {/* Plan icon */}
                <div
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} p-0.5 shadow-lg`}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
                    <Icon className={`h-5 w-5 bg-gradient-to-br ${gradient} bg-clip-text`} style={{ color: 'transparent', filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.3))' }} />
                  </div>
                </div>

                {/* Name & desc */}
                <h2 className="text-xl font-bold">{plan.name}</h2>
                <p className="mt-1 text-xs text-zinc-400">{plan.description}</p>

                {/* Price */}
                <div className="mt-5 mb-6">
                  <div className="flex items-end gap-1">
                    <span
                      className={`text-3xl font-extrabold tracking-tight bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
                    >
                      {formatPrice(plan.price)}
                    </span>
                    {plan.days > 0 && (
                      <span className="mb-0.5 text-sm text-zinc-500">
                        {formatDuration(plan.days)}
                      </span>
                    )}
                  </div>
                  {plan.days > 0 && (
                    <p className="mt-1 text-xs text-zinc-500">
                      Hiệu lực {plan.days} ngày
                    </p>
                  )}
                </div>

                {/* CTA */}
                {plan.id === 'free' ? (
                  <Link
                    href="/login"
                    className="mb-6 block rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-3 text-center text-sm font-semibold text-zinc-300 transition hover:bg-zinc-700 active:scale-[0.98]"
                  >
                    Bắt đầu miễn phí
                  </Link>
                ) : (
                  <Link
                    href={`/checkout?plan=${plan.id}`}
                    className={`mb-6 block rounded-xl bg-gradient-to-r ${gradient} px-4 py-3 text-center text-sm font-bold text-white shadow-lg transition hover:opacity-90 active:scale-[0.98] ${
                      isPro ? 'shadow-indigo-500/30' : ''
                    }`}
                  >
                    Nâng cấp ngay
                  </Link>
                )}

                {/* Divider */}
                <div className="mb-5 h-px bg-zinc-800" />

                {/* Features */}
                <ul className="flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-zinc-300">
                      <Check className={`mt-0.5 h-4 w-4 flex-shrink-0 bg-gradient-to-br ${gradient} bg-clip-text`}
                        style={{ color: 'transparent', filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.2))' }}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="mt-12 text-center text-sm text-zinc-500">
          Tất cả gói hỗ trợ thanh toán qua <span className="font-semibold text-zinc-400">PayOS</span> — nhanh chóng &amp; bảo mật.
          Cần hỗ trợ?{' '}
          <a href="mailto:support@example.com" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">
            Liên hệ chúng tôi
          </a>
        </p>
      </main>
    </div>
  );
}
