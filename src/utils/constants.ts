import { AppSettings } from '../types/settings';
import { PostTemplate } from '../types/post';
import { Group } from '../types/group';
import { Post } from '../types/post';

export const DEFAULT_SETTINGS: AppSettings = {
  general: {
    extensionName: 'AI Group Poster',
    theme: 'dark',
    notificationsEnabled: true,
    defaultLanguage: 'Bangla',
  },
  queue: {
    autoOpenNextGroup: true,
    requireConfirmation: true,
    delayBetweenItemsSec: 0,
    maxItemsPerSession: 50,
  },
  ai: {
    provider: 'openai',
    endpoint: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    defaultLanguage: 'Bangla',
    defaultStyle: 'Marketplace',
  },
  facebook: {
    supportedDomains: ['facebook.com', 'web.facebook.com', 'm.facebook.com'],
    pageDetectionIntervalMs: 1500,
    helperDockEnabled: true,
    helperDockCollapsedDefault: false,
  },
  webhook: {
    enabled: false,
    endpoint: '',
    secret: '',
  },
  hasCompletedOnboarding: false,
};

export const DEFAULT_TEMPLATES: PostTemplate[] = [
  {
    id: 'tpl_marketplace_sale',
    name: 'Standard Marketplace Sale',
    content: `🔥 {product_name} 🔥\n\n💰 Price: {price} {old_price_tag}\n\n📝 Details:\n{description}\n\n✨ Key Features:\n{features}\n\n📍 Location: {location}\n🚚 Delivery: {delivery_info}\n📞 Contact: {contact_info}\n\n👉 {call_to_action}`,
    variables: ['product_name', 'price', 'old_price', 'description', 'features', 'location', 'delivery_info', 'contact_info', 'call_to_action'],
    isDefault: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'tpl_bike_vehicle',
    name: 'Bike & Vehicle Sale',
    content: `🏍️ {product_name} For Sale\n\n💵 Asking Price: {price}\n📍 Location: {location}\n\n📋 Condition & Description:\n{description}\n\n⚙️ Specifications:\n{features}\n\n📦 Delivery / Hand-to-Hand: {delivery_info}\n📱 Call/WhatsApp: {contact_info}\n\n{call_to_action}`,
    variables: ['product_name', 'price', 'description', 'features', 'location', 'delivery_info', 'contact_info', 'call_to_action'],
    isDefault: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'tpl_minimal_quick',
    name: 'Minimalist Quick Post',
    content: `{product_name}\n\nPrice: {price}\nLocation: {location}\n\n{description}\n\nInbox for direct order!`,
    variables: ['product_name', 'price', 'location', 'description'],
    isDefault: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export const INITIAL_GROUPS: Group[] = [];

export const DEMO_POSTS: Post[] = [
  {
    id: 'demo_post_1',
    title: 'Yamaha FZS V3 (Matte Black) - Mint Condition',
    productName: 'Yamaha FZS V3 FI ABS (Matte Black)',
    price: '2,15,000 BDT',
    oldPrice: '2,40,000 BDT',
    description: 'First owner bike, carefully used for personal commute only. 100% genuine papers updated till 2026. Digital number plate, smart card available. Not a single scratch or accident history. Full service record from authorized Yamaha service center.',
    features: '- 149cc Fuel Injection Engine\n- Single Channel ABS\n- Mileage: 42 km/l\n- Driven: 14,200 km\n- New Pirelli rear tyre fitted recently\n- LED headlight with daylight running lamps',
    location: 'Mirpur DOHS, Dhaka',
    deliveryInfo: 'In-person inspection & test drive welcome. Name transfer anytime.',
    contactInfo: '01700-000000 (WhatsApp/Call)',
    callToAction: 'Urgent sale! Genuine buyers please inbox or call for visit.',
    images: [],
    templateId: 'tpl_bike_vehicle',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
  },
  {
    id: 'demo_post_2',
    title: 'Apple MacBook Air M2 (16GB / 512GB) Space Gray',
    productName: 'MacBook Air M2 16GB / 512GB SSD',
    price: '1,12,000 BDT',
    oldPrice: '1,25,000 BDT',
    description: 'Brought from USA. Battery health 98%, cycle count only 45. Includes original MagSafe charger, box, and invoice. Absolutely flawless condition.',
    features: '- Apple M2 8-core CPU, 10-core GPU\n- 16GB Unified Memory\n- 512GB High-speed SSD\n- Liquid Retina Display with True Tone\n- Touch ID sensor',
    location: 'Agrabad, Chattogram',
    deliveryInfo: 'Hand-to-hand delivery in CTG or courier all over Bangladesh with advance.',
    contactInfo: '01800-111222 (Call/WhatsApp)',
    callToAction: 'Inbox now for live photos and video test!',
    images: [],
    templateId: 'tpl_marketplace_sale',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
];
