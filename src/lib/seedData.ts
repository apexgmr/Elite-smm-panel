import { FirestoreService } from './firestore';

const sampleServices = [
  {
    category: 'Instagram',
    name: 'Instagram Followers [High Quality] [Real]',
    description: 'High quality followers with profile pictures and posts.',
    pricePer1000: 2.50,
    min: 100,
    max: 50000,
    status: 'active'
  },
  {
    category: 'Instagram',
    name: 'Instagram Likes [Instant] [Fast]',
    description: 'Super fast likes delivery.',
    pricePer1000: 0.80,
    min: 50,
    max: 100000,
    status: 'active'
  },
  {
    category: 'YouTube',
    name: 'YouTube Views [No Drop] [Life-time Guarantee]',
    description: 'Stable views for your videos.',
    pricePer1000: 4.20,
    min: 1000,
    max: 1000000,
    status: 'active'
  },
  {
    category: 'Telegram',
    name: 'Telegram Members [Safe] [Fast]',
    description: 'New members for your group/channel.',
    pricePer1000: 1.50,
    min: 100,
    max: 200000,
    status: 'active'
  },
  {
    category: 'TikTok',
    name: 'TikTok Followers [Organic Look]',
    description: 'Realistic looking followers.',
    pricePer1000: 1.20,
    min: 100,
    max: 50000,
    status: 'active'
  }
];

export const seedDatabase = async () => {
  const existing = await FirestoreService.getCollection('services');
  if (existing.length === 0) {
    for (const service of sampleServices) {
      await FirestoreService.addDocument('services', service);
    }
    return true;
  }
  return false;
};
