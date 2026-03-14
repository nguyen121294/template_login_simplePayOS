import { db } from './index';
import { plans } from './schema';

const INITIAL_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    days: 0,
    description: 'Dùng thử miễn phí',
    features: ['Truy cập cơ bản', '1 dự án', 'Hỗ trợ cộng đồng'],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 1000,
    days: 30,
    description: '30 ngày trải nghiệm',
    features: ['Tất cả tính năng Free', '5 dự án', 'Hỗ trợ qua email', 'API access'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 2000,
    days: 180,
    description: '180 ngày sử dụng toàn diện',
    features: ['Tất cả tính năng Plus', 'Dự án không giới hạn', 'Hỗ trợ ưu tiên', 'Analytics nâng cao', 'Custom domain'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 4000,
    days: 365,
    description: '365 ngày – trọn vẹn 1 năm',
    features: ['Tất cả tính năng Pro', 'Hỗ trợ 24/7', 'Dedicated server', 'SLA cam kết 99.9%', 'Tư vấn chiến lược riêng'],
  },
];

async function main() {
  console.log('Seeding plans...');

  try {
    for (const plan of INITIAL_PLANS) {
      await db.insert(plans)
        .values(plan)
        .onConflictDoUpdate({
          target: plans.id,
          set: {
            name: plan.name,
            price: plan.price,
            days: plan.days,
            description: plan.description,
            features: plan.features,
            updatedAt: new Date(),
          }
        });
      console.log(`- Upserted plan: ${plan.id}`);
    }
    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding plans:', error);
    process.exit(1);
  }
}

main();
