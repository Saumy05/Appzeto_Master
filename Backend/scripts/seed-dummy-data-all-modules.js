import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Models
import { FoodUser } from '../src/core/users/user.model.js';
import { FoodAdmin } from '../src/core/admin/admin.model.js';
import { FoodItem } from '../src/modules/food/admin/models/food.model.js';
import { FoodCategory } from '../src/modules/food/admin/models/category.model.js';
import { FoodRestaurantMenu } from '../src/modules/food/restaurant/models/restaurantMenu.model.js';
import { FoodOrder } from '../src/modules/food/orders/models/order.model.js';
import { FoodDiningBooking } from '../src/modules/food/dining/models/diningBooking.model.js';
import { FoodZone } from '../src/modules/food/admin/models/zone.model.js';
import { FoodDiningCategory } from '../src/modules/food/dining/models/diningCategory.model.js';
import { FoodDiningRestaurant } from '../src/modules/food/dining/models/diningRestaurant.model.js';
import { FoodHeroBanner } from '../src/modules/food/landing/models/heroBanner.model.js';
import { FoodDiningBanner } from '../src/modules/food/landing/models/diningBanner.model.js';
import { FoodUnder250Banner } from '../src/modules/food/landing/models/under250Banner.model.js';
import Property from '../src/modules/hotel/models/Property.js';
import RoomType from '../src/modules/hotel/models/RoomType.js';
import Partner from '../src/modules/hotel/models/Partner.js';
import Booking from '../src/modules/hotel/models/Booking.js';
import { Driver } from '../src/modules/taxi/driver/models/Driver.js';
import { Vehicle } from '../src/modules/taxi/admin/models/Vehicle.js';
import { Ride } from '../src/modules/taxi/user/models/Ride.js';
import TourismDestination from '../src/modules/tours/models/Destination.js';
import TourPackage from '../src/modules/tours/models/TourPackage.js';
import TourBooking from '../src/modules/tours/models/TourBooking.js';
import Festival from '../src/modules/festivals/models/Festival.js';
import FestivalBooking from '../src/modules/festivals/models/FestivalBooking.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PHONES = ['9876543210', '9876543211', '9876543212', '9876543213'];
const CITY = 'Haflong';
const STATE = 'Assam';
const COUNTRY_CODE = '+91';

const IMAGES = {
  thali: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
  biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  curry: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
  momos: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  chai: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
  jalebi: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
  restaurant1: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  restaurant2: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  restaurant3: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80',
  restaurant4: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
  resort1: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  homestay: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
  hotel: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  lodge: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
  room1: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
  room2: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
  tour1: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  tour2: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
  tour3: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
  tour4: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
};

const connect = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('Missing MONGODB_URI / MONGO_URI in environment.');
  await mongoose.connect(uri);
  console.log(`Connected to database: ${mongoose.connection.name}`);
};

const seedFoodModule = async (users, deliveryPartners) => {
  console.log('\n--- 1. Seeding Food Module (Categories, Dishes, Menus, Orders, Dining) ---');
  const now = new Date();

  // A. Categories
  const CATEGORIES = [
    { name: 'Traditional Assamese & Dimasa', image: IMAGES.thali, foodTypeScope: 'Both' },
    { name: 'Biryani & North Indian', image: IMAGES.biryani, foodTypeScope: 'Both' },
    { name: 'Hills Street Food & Chaat', image: IMAGES.jalebi, foodTypeScope: 'Veg' },
    { name: 'Momos, Rolls & Fast Food', image: IMAGES.momos, foodTypeScope: 'Both' },
    { name: 'Tea & Beverage Lounge', image: IMAGES.chai, foodTypeScope: 'Veg' },
  ];

  const categoryMap = {};
  for (let i = 0; i < CATEGORIES.length; i++) {
    const catData = CATEGORIES[i];
    let cat = await FoodCategory.findOne({ name: catData.name });
    if (!cat) {
      cat = await FoodCategory.create({
        ...catData,
        isApproved: true,
        approvalStatus: 'approved',
        isActive: true,
        sortOrder: i,
      });
    }
    categoryMap[catData.name] = cat;
  }
  console.log(`  ✓ Created/Verified ${CATEGORIES.length} Food Categories`);

  // 0. Food Zone
  let foodZone = await FoodZone.findOne({ name: 'Haflong & Appzeto Central Zone' });
  if (!foodZone) {
    foodZone = await FoodZone.create({
      name: 'Haflong & Appzeto Central Zone',
      zoneName: 'Haflong & Appzeto Central Zone',
      country: 'India',
      serviceLocation: 'Haflong',
      unit: 'kilometer',
      coordinates: [
        { latitude: 25.00, longitude: 92.80 },
        { latitude: 25.35, longitude: 92.80 },
        { latitude: 25.35, longitude: 93.30 },
        { latitude: 25.00, longitude: 93.30 },
        { latitude: 25.00, longitude: 92.80 },
      ],
      isActive: true,
    });
  }
  console.log(`  ✓ Created/Verified Food Zone: "${foodZone.name}"`);

  // B. Restaurant Details
  const RESTAURANT_DATA = [
    {
      name: 'Heritage Dimasa & Assam Dine',
      cuisine: ['Dimasa', 'Assamese', 'Tribal Delicacies'],
      area: 'Haflong Lake Road',
      profileImg: IMAGES.restaurant1,
      coverImg: IMAGES.restaurant1,
      rating: 4.9,
      dishes: [
        { name: 'Dimasa Smoked Pork with Bamboo Shoot', price: 320, foodType: 'Non-Veg', cat: 'Traditional Assamese & Dimasa', desc: 'Authentic local pork slow-smoked over bamboo wood.', isRecommended: true },
        { name: 'Borail Mountain Fish Curry', price: 280, foodType: 'Non-Veg', cat: 'Traditional Assamese & Dimasa', desc: 'Fresh river fish cooked with wild indigenous herbs.', isRecommended: true },
        { name: 'Wild Herb Lentil & Rice Platter', price: 180, foodType: 'Veg', cat: 'Traditional Assamese & Dimasa', desc: 'Wholesome indigenous herbal dal served with fragrant Joha rice.' },
        { name: 'Steamed Pork Momos (6 pcs)', price: 160, foodType: 'Non-Veg', cat: 'Momos, Rolls & Fast Food', desc: 'Juicy handmade momos served with fiery hill-chilli chutney.' },
        { name: 'Authentic Assam CTC Cardamom Tea', price: 40, foodType: 'Veg', cat: 'Tea & Beverage Lounge', desc: 'Freshly brewed strong hill garden tea.' },
      ]
    },
    {
      name: 'Haflong Royal Biryani & Grill',
      cuisine: ['Biryani', 'Mughlai', 'Tandoor'],
      area: 'Upper Bagetar',
      profileImg: IMAGES.restaurant2,
      coverImg: IMAGES.restaurant2,
      rating: 4.8,
      dishes: [
        { name: 'Special Hill Dum Chicken Biryani', price: 290, foodType: 'Non-Veg', cat: 'Biryani & North Indian', desc: 'Aromatic basmati layered with tender farm chicken & saffron.', isRecommended: true },
        { name: 'Paneer Tikka Butter Masala', price: 240, foodType: 'Veg', cat: 'Biryani & North Indian', desc: 'Charcoal-grilled cottage cheese in a velvety tomato gravy.', isRecommended: true },
        { name: 'Butter Garlic Naan (2 pcs)', price: 90, foodType: 'Veg', cat: 'Biryani & North Indian', desc: 'Crisp clay-oven naan brushed with rich local butter.' },
        { name: 'Tandoori Murgh (Half)', price: 260, foodType: 'Non-Veg', cat: 'Biryani & North Indian', desc: 'Marinated in fresh yogurt and hill spices, roasted to perfection.' },
        { name: 'Gulab Jamun with Rabdi (2 pcs)', price: 110, foodType: 'Veg', cat: 'Traditional Assamese & Dimasa', desc: 'Hot melt-in-mouth milk sweets soaked in rose syrup.' },
      ]
    },
    {
      name: 'Borail Valley Street Chaat Corner',
      cuisine: ['Street Food', 'Snacks', 'Chaat'],
      area: 'Main Bazar Haflong',
      profileImg: IMAGES.restaurant3,
      coverImg: IMAGES.restaurant3,
      rating: 4.7,
      dishes: [
        { name: 'Dahi Bhalla Papri Chaat', price: 90, foodType: 'Veg', cat: 'Hills Street Food & Chaat', desc: 'Lentil fritters soaked in sweet yogurt with tamarind glaze.', isRecommended: true },
        { name: 'Crispy Aloo Tikki Chole', price: 80, foodType: 'Veg', cat: 'Hills Street Food & Chaat', desc: 'Golden griddled potato cutlets served with spiced chickpea curry.' },
        { name: 'Pani Puri / Golgappe (8 pcs)', price: 60, foodType: 'Veg', cat: 'Hills Street Food & Chaat', desc: 'Crisp semolina hollows filled with spiced mint-coriander water.' },
        { name: 'Hot Saffron Jalebi (100g)', price: 70, foodType: 'Veg', cat: 'Hills Street Food & Chaat', desc: 'Crispy fried swirls dripping in pure saffron syrup.', isRecommended: true },
        { name: 'Kulhad Sweet Malai Lassi', price: 75, foodType: 'Veg', cat: 'Tea & Beverage Lounge', desc: 'Thick churned creamy curd served in terracotta kulhad.' },
      ]
    },
    {
      name: 'Green Valley Bakery & Cafe',
      cuisine: ['Cafe', 'Burgers', 'Coffee', 'Desserts'],
      area: 'Circuit House Road',
      profileImg: IMAGES.restaurant4,
      coverImg: IMAGES.restaurant4,
      rating: 4.85,
      dishes: [
        { name: 'Crispy Chicken Zinger Burger', price: 180, foodType: 'Non-Veg', cat: 'Momos, Rolls & Fast Food', desc: 'Buttermilk fried chicken fillet with house slaw and melted cheddar.', isRecommended: true },
        { name: 'Veggie Supreme Farmhouse Pizza', price: 260, foodType: 'Veg', cat: 'Momos, Rolls & Fast Food', desc: 'Thin crust pizza loaded with bell peppers, olives & mozzarella.', isRecommended: true },
        { name: 'Belgian Chocolate Brownie with Fudge', price: 140, foodType: 'Veg', cat: 'Momos, Rolls & Fast Food', desc: 'Warm dense chocolate brownie with hot chocolate drizzle.' },
        { name: 'Espresso Cappuccino', price: 95, foodType: 'Veg', cat: 'Tea & Beverage Lounge', desc: 'Fresh roasted arabica coffee with velvety milk foam.' },
      ]
    }
  ];

  const restCol = mongoose.connection.collection('food_restaurants');
  const restaurantDocs = [];
  const seededDishes = [];

  for (let i = 0; i < PHONES.length; i++) {
    const phone = PHONES[i];
    const spec = RESTAURANT_DATA[i];

    await restCol.updateOne(
      { ownerPhone: phone },
      {
        $set: {
          restaurantName: spec.name,
          ownerName: `Owner ${i + 1}`,
          ownerPhone: phone,
          primaryContactNumber: phone,
          cuisines: spec.cuisine,
          profileImage: spec.profileImg,
          coverImages: [spec.coverImg],
          rating: spec.rating,
          totalRatings: 145 + i * 25,
          deliveryMinutes: 25 + i * 5,
          estimatedDeliveryTimeMinutes: 25 + i * 5,
          estimatedDeliveryTime: `${25 + i * 5}-${35 + i * 5} min`,
          featuredDish: spec.dishes[0].name,
          featuredPrice: spec.dishes[0].price,
          area: spec.area,
          city: CITY,
          state: STATE,
          status: 'approved',
          isActive: true,
          isAcceptingOrders: true,
          location: {
            type: 'Point',
            coordinates: [93.0186 + (i * 0.005), 25.1644 + (i * 0.004)],
            city: CITY,
            state: STATE,
            area: spec.area,
            address: `${spec.area}, Haflong`,
            formattedAddress: `${spec.area}, Haflong, Assam 788819`
          },
          openingTime: '08:00',
          closingTime: '23:00',
          openDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          zoneId: foodZone._id,
          diningSettings: {
            isEnabled: true,
            maxGuests: 8,
            diningType: [spec.cuisine[0]?.toLowerCase()?.replace(/\s+/g, '-') || 'family-dining'],
            pureVegRestaurant: i === 2,
          },
          pureVegRestaurant: i === 2,
          updatedAt: now,
        }
      }
    );

    const doc = await restCol.findOne({ ownerPhone: phone });
    restaurantDocs.push(doc);

    // Dishes for this restaurant
    await FoodItem.deleteMany({ restaurantId: doc._id });
    const dishDocs = [];
    for (const d of spec.dishes) {
      const cat = categoryMap[d.cat] || Object.values(categoryMap)[0];
      const createdDish = await FoodItem.create({
        restaurantId: doc._id,
        categoryId: cat?._id,
        categoryName: cat?.name || d.cat,
        name: d.name,
        description: d.desc,
        price: d.price,
        foodType: d.foodType,
        image: d.name.includes('Pork') || d.name.includes('Curry') ? IMAGES.curry : d.name.includes('Biryani') ? IMAGES.biryani : d.name.includes('Momo') ? IMAGES.momos : d.name.includes('Tea') ? IMAGES.chai : d.name.includes('Chaat') || d.name.includes('Jalebi') ? IMAGES.jalebi : IMAGES.burger,
        isAvailable: true,
        isRecommended: Boolean(d.isRecommended),
        approvalStatus: 'approved',
        approvedAt: now,
        actionType: 'NEW',
      });
      dishDocs.push(createdDish);
      seededDishes.push(createdDish);
    }

    // Save menu sections for Restaurant Portal
    await FoodRestaurantMenu.findOneAndUpdate(
      { restaurantId: doc._id },
      {
        restaurantId: doc._id,
        sections: [
          {
            name: 'Chef Recommendations',
            items: dishDocs.filter(d => d.isRecommended).map(d => String(d._id))
          },
          {
            name: 'Full Menu',
            items: dishDocs.map(d => String(d._id))
          }
        ]
      },
      { upsert: true, new: true }
    );

    console.log(`  ✓ Seeded Restaurant: "${spec.name}" with ${dishDocs.length} dishes`);
  }

  // B2. Food Dining Categories & Storefront Setup
  const DINING_CATEGORIES = [
    { name: 'Fine Dining & Scenic Views', slug: 'fine-dining', imageUrl: IMAGES.restaurant1, sortOrder: 1 },
    { name: 'Authentic Assamese & Dimasa', slug: 'traditional-assamese', imageUrl: IMAGES.thali, sortOrder: 2 },
    { name: 'Barbecue, Tandoor & Grill', slug: 'barbecue-and-grill', imageUrl: IMAGES.biryani, sortOrder: 3 },
    { name: 'Hill Cafes & Artisan Bakeries', slug: 'cafes-and-bakeries', imageUrl: IMAGES.restaurant4, sortOrder: 4 },
    { name: 'Family Buffets & Banquets', slug: 'family-buffets', imageUrl: IMAGES.restaurant3, sortOrder: 5 },
  ];

  const diningCatDocs = [];
  for (const dc of DINING_CATEGORIES) {
    let doc = await FoodDiningCategory.findOne({ slug: dc.slug });
    if (!doc) {
      doc = await FoodDiningCategory.create({
        ...dc,
        isActive: true,
      });
    } else {
      doc.imageUrl = dc.imageUrl;
      doc.isActive = true;
      await doc.save();
    }
    diningCatDocs.push(doc);
  }
  console.log(`  ✓ Seeded ${diningCatDocs.length} Dining Categories`);

  // Link each restaurant to dining categories
  for (let i = 0; i < restaurantDocs.length; i++) {
    const rest = restaurantDocs[i];
    const cat = diningCatDocs[i % diningCatDocs.length];
    const allCatIds = diningCatDocs.map(c => c._id);
    await FoodDiningRestaurant.findOneAndUpdate(
      { restaurantId: rest._id },
      {
        restaurantId: rest._id,
        categoryIds: allCatIds,
        primaryCategoryId: cat._id,
        isEnabled: true,
        maxGuests: 8,
        pureVegRestaurant: i === 2,
      },
      { upsert: true, new: true }
    );
    await FoodDiningCategory.updateMany(
      { _id: { $in: allCatIds } },
      { $addToSet: { restaurantIds: rest._id } }
    );
  }
  console.log(`  ✓ Linked ${restaurantDocs.length} Restaurants to Dining Reservations`);

  // Storefront Hero Banners
  await FoodHeroBanner.deleteMany({});
  await FoodHeroBanner.create([
    {
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80',
      publicId: 'hero_banner_1',
      title: 'Experience The Authentic Flavors of Appzeto',
      ctaText: 'Order Food Now',
      ctaLink: '/food/user/categories',
      linkedRestaurantIds: restaurantDocs.map(r => r._id),
      sortOrder: 1,
      isActive: true,
      zoneId: foodZone._id,
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80',
      publicId: 'hero_banner_2',
      title: 'Royal Mughlai Biryani & Clay Oven Tandoor',
      ctaText: 'Explore Menu',
      ctaLink: '/food/user/categories',
      linkedRestaurantIds: [restaurantDocs[1]._id],
      sortOrder: 2,
      isActive: true,
      zoneId: foodZone._id,
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80',
      publicId: 'hero_banner_3',
      title: 'Freshly Brewed Hill Coffee & Artisan Treats',
      ctaText: 'Visit Cafes',
      ctaLink: '/food/user/categories',
      linkedRestaurantIds: [restaurantDocs[3]._id],
      sortOrder: 3,
      isActive: true,
      zoneId: foodZone._id,
    }
  ]);

  // Dining Banners
  await FoodDiningBanner.deleteMany({});
  await FoodDiningBanner.create([
    {
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80',
      publicId: 'dining_banner_1',
      title: 'Reserve Scenic Hilltop & Valley View Tables',
      ctaText: 'Book Table',
      ctaLink: '/food/user/dining',
      diningType: 'fine-dining',
      sortOrder: 1,
      isActive: true,
      zoneId: foodZone._id,
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80',
      publicId: 'dining_banner_2',
      title: 'Authentic Dimasa Heritage Feasts',
      ctaText: 'Reserve Now',
      ctaLink: '/food/user/dining',
      diningType: 'traditional-assamese',
      sortOrder: 2,
      isActive: true,
      zoneId: foodZone._id,
    }
  ]);

  // Under 250 Banners
  await FoodUnder250Banner.deleteMany({});
  await FoodUnder250Banner.create([
    {
      imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1400&q=80',
      publicId: 'under250_banner_1',
      title: 'Himalayan Street Bites Under ₹250',
      ctaText: 'Order Under ₹250',
      ctaLink: '/food/user/under-250',
      zoneId: foodZone._id,
      sortOrder: 1,
      isActive: true,
    }
  ]);
  console.log(`  ✓ Seeded Storefront & Dining Hero Banners for Zone: "${foodZone.name}"`);

  // C. Consumer Food Orders (Past & Live Orders for all 4 dummy accounts)
  console.log('\n  -> Seeding Consumer Food Orders...');
  for (let u = 0; u < users.length; u++) {
    const user = users[u];
    const targetRest = restaurantDocs[u % restaurantDocs.length];
    const targetDriver = deliveryPartners[u % deliveryPartners.length];
    const userDishes = seededDishes.filter(d => String(d.restaurantId) === String(targetRest._id));
    const dish1 = userDishes[0] || seededDishes[0];
    const dish2 = userDishes[1] || seededDishes[1];

    const orderId1 = `ORD-${Date.now().toString().slice(-6)}-${u + 1}A`;
    const orderId2 = `ORD-${Date.now().toString().slice(-6)}-${u + 1}B`;

    // Order 1: Delivered past order
    await FoodOrder.findOneAndUpdate(
      { order_id: orderId1 },
      {
        order_id: orderId1,
        orderId: orderId1,
        orderType: 'delivery',
        userId: user._id,
        restaurantId: targetRest._id,
        customerName: user.name,
        customerPhone: user.phone,
        items: [
          {
            itemId: String(dish1._id),
            name: dish1.name,
            price: dish1.price,
            quantity: 2,
            isVeg: dish1.foodType === 'Veg',
            image: dish1.image,
          },
          {
            itemId: String(dish2._id),
            name: dish2.name,
            price: dish2.price,
            quantity: 1,
            isVeg: dish2.foodType === 'Veg',
            image: dish2.image,
          }
        ],
        pricing: {
          subtotal: (dish1.price * 2) + dish2.price,
          deliveryFee: 35,
          tax: 24,
          total: (dish1.price * 2) + dish2.price + 59,
        },
        payment: {
          method: 'razorpay',
          status: 'paid',
        },
        deliveryAddress: {
          street: 'Hill View Colony, Upper Bagetar',
          city: CITY,
          state: STATE,
          zipCode: '788819',
          phone: user.phone,
          location: {
            type: 'Point',
            coordinates: [93.0186, 25.1644]
          }
        },
        lastRiderLocation: {
          type: 'Point',
          coordinates: [93.0186, 25.1644]
        },
        dispatch: {
          status: 'accepted',
          deliveryPartnerId: targetDriver._id,
          assignedAt: new Date(now.getTime() - 86400000),
          acceptedAt: new Date(now.getTime() - 86300000),
        },
        deliveryState: {
          currentPhase: 'delivered',
          status: 'Delivered',
          deliveredAt: new Date(now.getTime() - 85000000),
        },
        orderStatus: 'delivered',
        createdAt: new Date(now.getTime() - 86400000),
      },
      { upsert: true }
    );

    // Order 2: Live order (picked_up / on the way)
    await FoodOrder.findOneAndUpdate(
      { order_id: orderId2 },
      {
        order_id: orderId2,
        orderId: orderId2,
        orderType: 'delivery',
        userId: user._id,
        restaurantId: targetRest._id,
        customerName: user.name,
        customerPhone: user.phone,
        items: [
          {
            itemId: String(dish1._id),
            name: dish1.name,
            price: dish1.price,
            quantity: 1,
            isVeg: dish1.foodType === 'Veg',
            image: dish1.image,
          }
        ],
        pricing: {
          subtotal: dish1.price,
          deliveryFee: 30,
          tax: 15,
          total: dish1.price + 45,
        },
        payment: {
          method: 'cash',
          status: 'cod_pending',
        },
        deliveryAddress: {
          street: 'Main Bazaar Road, Near Post Office',
          city: CITY,
          state: STATE,
          zipCode: '788819',
          phone: user.phone,
          location: {
            type: 'Point',
            coordinates: [93.0200, 25.1660]
          }
        },
        lastRiderLocation: {
          type: 'Point',
          coordinates: [93.0200, 25.1660]
        },
        dispatch: {
          status: 'accepted',
          deliveryPartnerId: targetDriver._id,
          assignedAt: new Date(now.getTime() - 1200000),
          acceptedAt: new Date(now.getTime() - 1100000),
        },
        deliveryState: {
          currentPhase: 'en_route_to_delivery',
          status: 'Rider is on the way',
          pickedUpAt: new Date(now.getTime() - 600000),
        },
        orderStatus: 'picked_up',
        createdAt: new Date(now.getTime() - 1800000),
      },
      { upsert: true }
    );

    // D. Table Dining Booking
    const diningBookingId = `DINE-APPZ-${u + 101}`;
    await FoodDiningBooking.findOneAndUpdate(
      { bookingId: diningBookingId },
      {
        bookingId: diningBookingId,
        restaurantId: targetRest._id,
        userId: user._id,
        guests: 2,
        date: new Date(now.getTime() + 86400000),
        timeSlot: '07:30 PM',
        specialRequest: 'Window seat with mountain view please',
        status: 'confirmed',
      },
      { upsert: true }
    );
  }
  console.log(`  ✓ Seeded 8 Food Orders & 4 Dining Reservations for Dummy Users`);
  return { restaurantDocs };
};

const seedHotelModule = async (users, partners) => {
  console.log('\n--- 2. Seeding Hotel Module (Properties, Rooms, Bookings) ---');
  const now = new Date();

  const HOTEL_DATA = [
    {
      name: 'Haflong Hills Luxury Resort & Spa',
      type: 'resort',
      desc: 'Perched on the highest ridge of Haflong with panoramic views of the Borail range. Fine dining, heated infinity showers and tranquil gardens.',
      address: 'Near Circuit House, Upper Bagetar, Haflong, Assam 788819',
      cover: IMAGES.resort1,
      rating: 4.9,
      rooms: [
        { name: 'Valley View Deluxe Room', category: 'double', maxAdults: 2, price: 3400, total: 6 },
        { name: 'Presidential Royal Suite', category: 'entire', maxAdults: 4, price: 5800, total: 3 },
      ]
    },
    {
      name: 'Jatinga Mist Valley Heritage Homestay',
      type: 'homestay',
      desc: 'Warm family-run homestay in Jatinga village with authentic homemade Dimasa food and tea garden views.',
      address: 'Jatinga Village Road, Jatinga, Assam 788819',
      cover: IMAGES.homestay,
      rating: 4.75,
      rooms: [
        { name: 'Traditional Wooden Cottage', category: 'double', maxAdults: 2, price: 2100, total: 4 },
        { name: 'Family Garden Suite', category: 'triple', maxAdults: 4, price: 3600, total: 2 },
      ]
    },
    {
      name: 'Borail Peak Mountain View Hotel',
      type: 'hotel',
      desc: 'Contemporary comfort in central Haflong. High-speed Wi-Fi, 24/7 dining, rooftop terrace and private balcony rooms.',
      address: 'Station Road, Near Lake View, Haflong, Assam 788819',
      cover: IMAGES.hotel,
      rating: 4.6,
      rooms: [
        { name: 'Executive Balcony Room', category: 'double', maxAdults: 2, price: 2600, total: 8 },
        { name: 'Deluxe Twin Bed Room', category: 'double', maxAdults: 2, price: 2200, total: 6 },
      ]
    },
    {
      name: 'Maibang Riverside Eco Retreat Lodge',
      type: 'lodge',
      desc: 'Peaceful riverside wooden cottages close to the Mahur river and historic royal monolithic rock temples.',
      address: 'Riverside Road, Maibang, Assam 788831',
      cover: IMAGES.lodge,
      rating: 4.8,
      rooms: [
        { name: 'Riverside Bamboo Cottage', category: 'double', maxAdults: 2, price: 2800, total: 5 },
        { name: 'Backpacker Eco Dorm', category: 'private', maxAdults: 1, price: 950, total: 10 },
      ]
    }
  ];

  const seededProperties = [];
  const seededRooms = [];

  for (let i = 0; i < partners.length; i++) {
    const partner = partners[i];
    const spec = HOTEL_DATA[i];

    const prop = await Property.findOneAndUpdate(
      { propertyName: spec.name },
      {
        partnerId: partner._id,
        propertyName: spec.name,
        propertyType: spec.type,
        description: spec.desc,
        address: {
          country: 'India',
          state: STATE,
          city: CITY,
          area: 'Central',
          fullAddress: spec.address,
          pincode: '788819',
        },
        location: { type: 'Point', coordinates: [93.0186 + (i * 0.006), 25.1644 + (i * 0.005)] },
        coverImage: spec.cover,
        propertyImages: [spec.cover, IMAGES.room1, IMAGES.room2],
        amenities: ['wifi', 'parking', 'restaurant', 'hot water', 'view', 'bonfire', 'power backup'],
        checkInTime: '12:00 PM',
        checkOutTime: '11:00 AM',
        cancellationPolicy: 'Free cancellation up to 24 hours prior to check-in.',
        houseRules: ['Government ID required at check-in', 'No smoking in rooms'],
        status: 'approved',
        isLive: true,
        isFeatured: true,
        avgRating: spec.rating,
        totalReviews: 88 + (i * 15),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    seededProperties.push(prop);

    await RoomType.deleteMany({ propertyId: prop._id });
    for (const r of spec.rooms) {
      const room = await RoomType.create({
        propertyId: prop._id,
        name: r.name,
        inventoryType: 'room',
        roomCategory: r.category,
        maxAdults: r.maxAdults,
        maxChildren: 1,
        totalInventory: r.total,
        pricePerNight: r.price,
        amenities: ['wifi', 'hot water', 'tv', 'ac'],
        images: [IMAGES.room1, IMAGES.room2],
        isActive: true,
      });
      seededRooms.push(room);
    }
    console.log(`  ✓ Seeded Property: "${spec.name}" with ${spec.rooms.length} room types for Partner ${partner.name}`);
  }

  // Seed Hotel Bookings for Users
  for (let u = 0; u < users.length; u++) {
    const user = users[u];
    const prop = seededProperties[u % seededProperties.length];
    const room = seededRooms.find(r => String(r.propertyId) === String(prop._id)) || seededRooms[0];
    const bookingId = `HTL-APPZ-${u + 1001}`;

    const checkIn = new Date(now.getTime() + (86400000 * (u + 2)));
    const checkOut = new Date(checkIn.getTime() + (86400000 * 2));

    await Booking.findOneAndUpdate(
      { bookingId },
      {
        bookingId,
        userModel: 'User',
        userId: user._id,
        propertyId: prop._id,
        propertyType: prop.propertyType,
        roomTypeId: room._id,
        bookingUnit: 'room',
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalNights: 2,
        guests: { adults: 2, children: 0 },
        pricePerNight: room.pricePerNight,
        baseAmount: room.pricePerNight * 2,
        taxes: Math.round(room.pricePerNight * 2 * 0.12),
        totalAmount: (room.pricePerNight * 2) + Math.round(room.pricePerNight * 2 * 0.12),
        paymentStatus: 'paid',
        paymentMethod: 'UPI',
        bookingStatus: 'confirmed',
        createdBy: 'user',
      },
      { upsert: true }
    );
  }
  console.log(`  ✓ Seeded Confirmed Hotel Bookings for all 4 Dummy Users`);
};

const seedTaxiModule = async (users, drivers) => {
  console.log('\n--- 3. Seeding Taxi Module (Fleet Vehicles, Driver Profiles & Rides) ---');
  const now = new Date();

  // Fleet Vehicles
  const VEHICLES = [
    { name: 'Appzeto Bike Lite', transport_type: 'taxi', icon_types: 'bike', capacity: 1, base: 30 },
    { name: 'Appzeto Auto Local', transport_type: 'taxi', icon_types: 'auto', capacity: 3, base: 50 },
    { name: 'Appzeto Mini Hatchback', transport_type: 'taxi', icon_types: 'car', capacity: 4, base: 120 },
    { name: 'Appzeto Prime Sedan', transport_type: 'taxi', icon_types: 'car', capacity: 4, base: 180 },
    { name: 'Appzeto Borail SUV 4x4', transport_type: 'taxi', icon_types: 'suv', capacity: 6, base: 260 },
  ];

  const vehicleDocs = [];
  for (const v of VEHICLES) {
    let vehicle = await Vehicle.findOne({ name: v.name });
    if (!vehicle) {
      vehicle = await Vehicle.create({
        name: v.name,
        short_description: `${v.capacity} Seater Mobility`,
        transport_type: v.transport_type,
        icon_types: v.icon_types,
        capacity: v.capacity,
        is_taxi: 'taxi',
      });
    }
    vehicleDocs.push(vehicle);
  }
  console.log(`  ✓ Seeded ${vehicleDocs.length} Taxi Vehicle Types`);

  // Update Drivers
  for (let i = 0; i < drivers.length; i++) {
    const driver = drivers[i];
    const assignedVeh = vehicleDocs[i % vehicleDocs.length];
    driver.approve = true;
    driver.status = 'approved';
    driver.active = true;
    driver.vehicleTypeId = assignedVeh._id;
    driver.vehicleName = assignedVeh.name;
    driver.vehicleNumber = `AS-08-C-200${i + 1}`;
    driver.licenseNumber = `AS08-2024-000${i + 1}`;
    driver.location = { type: 'Point', coordinates: [93.0186 + (i * 0.003), 25.1644 + (i * 0.003)] };
    await driver.save();
    console.log(`  ✓ Updated Taxi Driver ${driver.name} with vehicle: ${assignedVeh.name}`);
  }

  // Seed Rides for Dummy Users
  for (let u = 0; u < users.length; u++) {
    const user = users[u];
    const driver = drivers[u % drivers.length];
    const vehicle = vehicleDocs[u % vehicleDocs.length];

    // Ride 1: Completed past ride
    await Ride.create({
      userId: user._id,
      driverId: driver._id,
      vehicleTypeId: vehicle._id,
      serviceType: 'ride',
      pickupAddress: 'Haflong Railway Station (HFL), Lower Bagetar',
      pickupLocation: { type: 'Point', coordinates: [93.0180, 25.1620] },
      dropAddress: 'Haflong Lake Promenade & Park',
      dropLocation: { type: 'Point', coordinates: [93.0240, 25.1690] },
      fare: 180,
      baseFare: 120,
      estimatedDistanceMeters: 4200,
      estimatedDurationMinutes: 14,
      status: 'completed',
      liveStatus: 'completed',
      paymentMethod: 'cash',
      otp: '4321',
      createdAt: new Date(now.getTime() - (86400000 * (u + 1))),
    });

    // Ride 2: Active / live ride
    await Ride.create({
      userId: user._id,
      driverId: driver._id,
      vehicleTypeId: vehicle._id,
      serviceType: 'ride',
      pickupAddress: 'Circuit House, Upper Bagetar',
      pickupLocation: { type: 'Point', coordinates: [93.0190, 25.1650] },
      dropAddress: 'Jatinga Bird Observatory Point',
      dropLocation: { type: 'Point', coordinates: [93.0119, 25.0997] },
      fare: 340,
      baseFare: 220,
      estimatedDistanceMeters: 8500,
      estimatedDurationMinutes: 24,
      status: 'ongoing',
      liveStatus: 'started',
      paymentMethod: 'online',
      otp: '1234',
      createdAt: new Date(now.getTime() - 600000),
    });
  }
  console.log(`  ✓ Seeded Completed & Live Taxi Rides for all 4 Users`);
};

const seedToursAndDestinations = async (users) => {
  console.log('\n--- 4. Seeding Tours Module (Destinations, Packages, Bookings) ---');
  const now = new Date();

  // A. Destinations from JSON
  const destPath = path.join(__dirname, 'data', 'seed-destinations.json');
  if (fs.existsSync(destPath)) {
    const destinations = JSON.parse(fs.readFileSync(destPath, 'utf8'));
    for (const d of destinations) {
      const slug = d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      await TourismDestination.findOneAndUpdate(
        { slug },
        { ...d, slug, isActive: true },
        { upsert: true }
      );
    }
    console.log(`  ✓ Seeded ${destinations.length} Tourist Destinations`);
  }

  // B. Tour Packages
  const PACKAGES = [
    {
      title: '3D2N Haflong Lake & Borail Hills Experience',
      slug: '3d2n-haflong-lake-borail-hills',
      subtitle: 'Scenic lake boat ride, colonial viewpoint & Dimasa heritage dinner',
      description: 'Explore Assam’s only hill station with local guided tours, lake boating, bird watching in Jatinga, and warm hospitality.',
      durationDays: 3,
      durationNights: 2,
      category: 'sightseeing',
      difficulty: 'Easy',
      pricePerPerson: 4999,
      originalPrice: 6500,
      image: IMAGES.tour1,
      itinerary: [
        { day: 1, title: 'Arrival & Haflong Lake Sunset', activities: ['Hotel check-in', 'Evening boat ride at Haflong lake', 'Local traditional dinner'] },
        { day: 2, title: 'Jatinga Valley & Bird Observatory', activities: ['Sunrise viewpoint trek', 'Visit Jatinga village museum', 'Dimasa weaving experience'] },
        { day: 3, title: 'Heritage Walk & Departure', activities: ['Colonial church visit', 'Handicraft market shopping', 'Departure transfer'] },
      ],
      includes: [
        { id: 'inc-1', label: 'Hotel accommodation with breakfast', included: true },
        { id: 'inc-2', label: 'Private cab for all transfers', included: true },
        { id: 'inc-3', label: 'Local certified guide', included: true },
        { id: 'inc-4', label: 'Airfare / Train tickets', included: false },
      ]
    },
    {
      title: '4D3N Panimoor Falls & Borail Trekking Adventure',
      slug: '4d3n-panimoor-falls-borail-trekking',
      subtitle: 'Roaring waterfalls, dense pine forest trails and summit camp',
      description: 'An exhilarating wilderness journey through the lush Borail Wildlife Sanctuary and the majestic cascading Panimoor Waterfalls.',
      durationDays: 4,
      durationNights: 3,
      category: 'adventure',
      difficulty: 'Moderate',
      pricePerPerson: 7999,
      originalPrice: 9999,
      image: IMAGES.tour2,
      itinerary: [
        { day: 1, title: 'Base Camp Arrival', activities: ['Arrival in Haflong', 'Trek briefing', 'Campfire dinner under stars'] },
        { day: 2, title: 'Borail Wildlife Sanctuary Trek', activities: ['Guided forest trek', 'Rare flora & fauna spotting', 'Wilderness camping'] },
        { day: 3, title: 'Panimoor Waterfalls Expedition', activities: ['Full day visit to Panimoor Falls', 'Riverbank picnic lunch', 'Sunset photography'] },
        { day: 4, title: 'Return & Farewell', activities: ['Morning breakfast', 'Souvenir shopping', 'Departure transfer'] },
      ],
      includes: [
        { id: 'inc-1', label: 'Camping gear & eco-stay', included: true },
        { id: 'inc-2', label: 'All meals & refreshments', included: true },
        { id: 'inc-3', label: 'Expert trek leaders & first aid', included: true },
      ]
    },
    {
      title: '2D1N Jatinga Birds & Tribal Heritage Trail',
      slug: '2d1n-jatinga-birds-tribal-heritage',
      subtitle: 'Mystic hill phenomena, tea gardens & royal architecture',
      description: 'Discover the world-famous bird migratory phenomenon, lush organic tea gardens, and the royal stone temple ruins of Maibang.',
      durationDays: 2,
      durationNights: 1,
      category: 'cultural',
      difficulty: 'Easy',
      pricePerPerson: 3499,
      originalPrice: 4200,
      image: IMAGES.tour3,
      itinerary: [
        { day: 1, title: 'Maibang Royal Stone Temples', activities: ['Explore 16th century monolithic ruins', 'Traditional lunch', 'Check-in to eco lodge'] },
        { day: 2, title: 'Jatinga Observation & Tea Gardens', activities: ['Early morning bird watching', 'Tea garden stroll', 'Departure'] },
      ],
      includes: [
        { id: 'inc-1', label: 'Homestay with organic food', included: true },
        { id: 'inc-2', label: 'All entry permits and tickets', included: true },
      ]
    }
  ];

  const seededPackages = [];
  for (const p of PACKAGES) {
    const pkg = await TourPackage.findOneAndUpdate(
      { slug: p.slug },
      {
        ...p,
        images: [p.image, IMAGES.tour4],
        featuredImage: p.image,
        isActive: true,
        isFeatured: true,
        rating: 4.85,
        totalReviews: 64,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    seededPackages.push(pkg);
    console.log(`  ✓ Seeded Tour Package: "${p.title}"`);
  }

  // Seed Tour Bookings for Users
  for (let u = 0; u < users.length; u++) {
    const user = users[u];
    const pkg = seededPackages[u % seededPackages.length];
    const bookingId = `TOUR-APPZ-${u + 101}`;

    await TourBooking.findOneAndUpdate(
      { bookingId },
      {
        bookingId,
        userModel: 'User',
        userId: user._id,
        packageId: pkg._id,
        travelDate: new Date(now.getTime() + (86400000 * (u + 7))),
        travellers: { adults: 2, children: 0 },
        totalTravellers: 2,
        pickupPoint: 'Haflong Town Centre',
        travellerContact: {
          name: user.name,
          phone: user.phone,
          email: `${user.phone}@appzeto.local`,
        },
        pricePerPerson: pkg.pricePerPerson,
        baseAmount: pkg.pricePerPerson * 2,
        totalAmount: pkg.pricePerPerson * 2,
        amountPaid: pkg.pricePerPerson * 2,
        paymentStatus: 'paid',
        paymentMethod: 'UPI',
        bookingStatus: 'confirmed',
        createdBy: 'user',
      },
      { upsert: true }
    );
  }
  console.log(`  ✓ Seeded Confirmed Tour Bookings for all 4 Users`);
};

const seedFestivalsAndPasses = async (users) => {
  console.log('\n--- 5. Seeding Festivals & Passes Module ---');
  const now = new Date();

  const festPath = path.join(__dirname, 'data', 'seed-festivals.json');
  if (fs.existsSync(festPath)) {
    const festivals = JSON.parse(fs.readFileSync(festPath, 'utf8'));
    const seededFests = [];

    for (const f of festivals) {
      const slug = f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const fest = await Festival.findOneAndUpdate(
        { slug },
        { ...f, slug, isActive: true },
        { upsert: true, new: true }
      );
      seededFests.push(fest);
    }
    console.log(`  ✓ Seeded ${festivals.length} Cultural Festivals`);

    // Seed passes for users
    for (let u = 0; u < users.length; u++) {
      const user = users[u];
      const fest = seededFests[u % seededFests.length];
      const cat = fest.ticketCategories?.[0] || { _id: new mongoose.Types.ObjectId(), name: 'Standard Pass', price: 299 };
      const bookingId = `PASS-APPZ-${u + 101}`;

      await FestivalBooking.findOneAndUpdate(
        { bookingId },
        {
          bookingId,
          userId: user._id,
          userModel: 'FoodUser',
          festivalId: fest._id,
          ticketCategoryId: cat._id,
          ticketCategoryName: cat.name,
          festivalName: fest.name,
          festivalDates: fest.dates || 'Nov 20 - Nov 22',
          ticketCount: 2,
          pricePerTicket: cat.price || 299,
          baseAmount: (cat.price || 299) * 2,
          totalAmount: (cat.price || 299) * 2,
          amountPaid: (cat.price || 299) * 2,
          attendee: {
            name: user.name,
            phone: user.phone,
            email: `${user.phone}@appzeto.local`,
          },
          paymentStatus: 'paid',
          bookingStatus: 'confirmed',
          qrCode: `APPZ-FEST-${fest._id}-${u}`,
        },
        { upsert: true }
      );
    }
    console.log(`  ✓ Seeded Confirmed Festival Passes for all 4 Users`);
  }
};

const run = async () => {
  try {
    await connect();

    // Fetch existing seeded users, partners, drivers, delivery
    const users = await FoodUser.find({ phone: { $in: PHONES } });
    const partners = await Partner.find({ phone: { $in: PHONES } });
    const drivers = await Driver.find({ phone: { $in: PHONES } });
    const deliveryPartners = await mongoose.connection.collection('food_delivery_partners').find({ phone: { $in: PHONES } }).toArray();

    if (users.length === 0) {
      throw new Error('Seed accounts not found. Please run seed-users-and-admin.js first.');
    }

    console.log(`Found ${users.length} users, ${partners.length} hotel partners, ${drivers.length} taxi drivers, and ${deliveryPartners.length} delivery partners.`);

    await seedFoodModule(users, deliveryPartners);
    await seedHotelModule(users, partners);
    await seedTaxiModule(users, drivers);
    await seedToursAndDestinations(users);
    await seedFestivalsAndPasses(users);

    console.log('\n======================================================');
    console.log('🎉 ALL DUMMY DATA SEEDED SUCCESSFULLY ACROSS ALL MODULES!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Error seeding dummy data:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

run();
