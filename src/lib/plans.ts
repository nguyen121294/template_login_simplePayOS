export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    days: 0,
    description: 'Dùng thử miễn phí',
    features: [
      'Truy cập cơ bản',
      '1 dự án',
      'Hỗ trợ cộng đồng',
    ],
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    price: 1000,
    days: 30,
    description: '30 ngày trải nghiệm',
    features: [
      'Tất cả tính năng Free',
      '5 dự án',
      'Hỗ trợ qua email',
      'API access',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 2000,
    days: 180,
    description: '180 ngày sử dụng toàn diện',
    features: [
      'Tất cả tính năng Plus',
      'Dự án không giới hạn',
      'Hỗ trợ ưu tiên',
      'Analytics nâng cao',
      'Custom domain',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 4000,
    days: 365,
    description: '365 ngày – trọn vẹn 1 năm',
    features: [
      'Tất cả tính năng Pro',
      'Hỗ trợ 24/7',
      'Dedicated server',
      'SLA cam kết 99.9%',
      'Tư vấn chiến lược riêng',
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type Plan = (typeof PLANS)[PlanId];

export function getPlan(planId: string): Plan | null {
  if (planId in PLANS) {
    return PLANS[planId as PlanId];
  }
  return null;
}
