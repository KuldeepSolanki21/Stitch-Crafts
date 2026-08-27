import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });


const prisma = new PrismaClient();

async function seedDatabase() {
  console.log('🌱 Starting comprehensive database seed for Stitch & Crafts...');

  // 1. Super Admin
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@stitchandcrafts.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@StitchCrafts2026';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.SUPER_ADMIN, isActive: true },
    create: {
      name: 'Super Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });
  console.log('✅ Super Admin account ready:', adminEmail);

  // 2. Clean temporary test dummy categories and products
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.paymentTransaction.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.banner.deleteMany({});

  // 3. Hero Banners
  await prisma.banner.createMany({
    data: [
      {
        title: 'Crafted for Every Journey',
        subtitle: 'Full-grain vegetable tanned luxury leather goods, hand-stitched by generational artisans.',
        imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1800&auto=format&fit=crop',
        targetUrl: '/shop',
        displayOrder: 1,
        isActive: true,
      },
      {
        title: 'The Patina Heritage Collection',
        subtitle: 'Heirloom document briefcases and weekender duffles that mature with age.',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1800&auto=format&fit=crop',
        targetUrl: '/shop',
        displayOrder: 2,
        isActive: true,
      },
    ],
  });

  // 4. Categories
  const catBags = await prisma.category.create({
    data: {
      name: 'Messenger & Laptop Bags',
      slug: 'messenger-and-laptop-bags',
      description: 'Executive document briefcases and daily messenger satchels with brass hardware.',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop',
      isActive: true,
    },
  });

  const catDuffles = await prisma.category.create({
    data: {
      name: 'Travel Duffles & Weekenders',
      slug: 'travel-duffles-and-weekenders',
      description: 'Spacious handcrafted leather travel bags built for weekend voyages.',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop',
      isActive: true,
    },
  });

  const catWallets = await prisma.category.create({
    data: {
      name: 'Bespoke Wallets & Cardholders',
      slug: 'bespoke-wallets-and-cardholders',
      description: 'Slim bifold wallets, card cases, and passport sleeves stitched with waxed linen.',
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200&auto=format&fit=crop',
      isActive: true,
    },
  });

  const catAccessories = await prisma.category.create({
    data: {
      name: 'Artisan Belts & Accessories',
      slug: 'artisan-belts-and-accessories',
      description: 'Full-grain English bridle leather belts and watch straps.',
      image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop',
      isActive: true,
    },
  });

  // 5. Products & Variants
  await prisma.product.create({
    data: {
      title: 'The Sovereign Leather Messenger Bag',
      slug: 'the-sovereign-leather-messenger-bag',
      description: 'Handcrafted from 100% full-grain vegetable-tanned leather, this messenger bag features an internal padded 15-inch laptop compartment, antique brass hardware, and an adjustable shoulder strap.',
      price: 14500,
      discountPrice: 11999,
      stock: 25,
      sku: 'SC-MB-SOV-01',
      images: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop',
      ],
      categoryId: catBags.id,
      featured: true,
      isPublished: true,
      details: {
        material: 'Full-Grain Vegetable Tanned Leather',
        dimensions: '40 x 30 x 10 cm',
        hardware: 'Solid Antique Brass',
        lining: 'Reinforced Cotton Canvas',
      },
      variants: {
        create: [
          {
            colorName: 'Cognac Tan',
            colorHex: '#8B4513',
            size: '15-inch',
            sku: 'SC-MB-SOV-01-COG',
            priceDelta: 0,
            stock: 15,
            images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop'],
          },
          {
            colorName: 'Obsidian Black',
            colorHex: '#1E1E1E',
            size: '15-inch',
            sku: 'SC-MB-SOV-01-BLK',
            priceDelta: 500,
            stock: 10,
            images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop'],
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      title: 'The Voyager Grand Weekender Duffle',
      slug: 'the-voyager-grand-weekender-duffle',
      description: 'The ultimate luxury travel companion. Generously sized to fit 3-5 days of travel essentials with a dedicated shoe compartment and reinforced leather base.',
      price: 22000,
      discountPrice: 18500,
      stock: 18,
      sku: 'SC-DF-VOY-01',
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop',
      ],
      categoryId: catDuffles.id,
      featured: true,
      isPublished: true,
      details: {
        material: 'Heavyweight Full-Grain Oil-Pullup Leather',
        dimensions: '55 x 32 x 28 cm',
        capacity: '48 Litres',
        zippers: 'YKK Excella Heavy Duty Brass',
      },
    },
  });

  await prisma.product.create({
    data: {
      title: 'Minimalist Bifold Full-Grain Wallet',
      slug: 'minimalist-bifold-full-grain-wallet',
      description: 'Ultra-slim profile bifold wallet accommodating 8 cards and flat currency notes without creating pocket bulk.',
      price: 3499,
      discountPrice: 2899,
      stock: 45,
      sku: 'SC-WL-MIN-01',
      images: [
        'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200&auto=format&fit=crop',
      ],
      categoryId: catWallets.id,
      featured: true,
      isPublished: true,
      details: {
        material: 'Italian Badalassi Carlo Pueblo Leather',
        slots: '6 Card Slots + 2 Hidden Compartments',
        dimensions: '10.5 x 8.5 cm',
      },
    },
  });

  await prisma.product.create({
    data: {
      title: 'Artisan Bridle Leather Dress Belt',
      slug: 'artisan-bridle-leather-dress-belt',
      description: 'Solid brass buckle stitched into heavy 9oz English Bridle leather, beveled and burnished with natural beeswax.',
      price: 4200,
      stock: 30,
      sku: 'SC-BL-ART-01',
      images: [
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop',
      ],
      categoryId: catAccessories.id,
      featured: false,
      isPublished: true,
      details: {
        thickness: '3.8 mm Heavyweight Hide',
        width: '35 mm',
        buckle: 'Solid Sandcast Brass',
      },
    },
  });

  // 6. Promotional Coupon
  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discount: 10,
      minOrderValue: 2000,
      maxDiscount: 1500,
      usageLimit: 1000,
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  console.log('✅ Real catalog seed completed successfully!');
}

seedDatabase()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
