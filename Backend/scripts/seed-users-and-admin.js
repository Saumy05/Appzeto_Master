import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { FoodAdmin } from '../src/core/admin/admin.model.js';
import { ADMIN_LEVELS, ALL_ADMIN_MODULES } from '../src/core/admin/adminHierarchy.constants.js';
import { FoodUser } from '../src/core/users/user.model.js';
import { Driver } from '../src/modules/taxi/driver/models/Driver.js';
import Partner from '../src/modules/hotel/models/Partner.js';

dotenv.config();

const USERS = [
  { phone: '9876543210', index: 1 },
  { phone: '9876543211', index: 2 },
  { phone: '9876543212', index: 3 },
  { phone: '9876543213', index: 4 },
];

const DEFAULT_PASSWORD = '123456';
const COUNTRY_CODE = '+91';
const CITY = 'Haflong';
const STATE = 'Assam';

const ADMINS = [
  {
    email: 'admin@gmail.com',
    name: 'Dima Hasao Super Admin',
    password: DEFAULT_PASSWORD,
  },
  {
    email: 'admin@dimahasao.com',
    name: 'Dima Hasao Platform Admin',
    password: DEFAULT_PASSWORD,
  },
];

const connect = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('Missing MONGODB_URI / MONGO_URI in environment.');
  const dbName = process.env.MONGODB_DB_NAME || undefined;
  await mongoose.connect(uri, dbName ? { dbName } : undefined);
  console.log(`Connected to database: ${mongoose.connection.name}`);
};

const hashPassword = async (pwd) => {
  return bcrypt.hash(pwd, 10);
};

const seedUsers = async () => {
  const hashedPassword = await hashPassword(DEFAULT_PASSWORD);
  const now = new Date();

  console.log('\n--- Seeding Users Across All Apps ---');

  for (const { phone, index } of USERS) {
    console.log(`\n[Processing Phone: ${phone}]`);

    // 1. Consumer User (users collection)
    let user = await FoodUser.findOne({ phone });
    if (!user) user = new FoodUser({ phone });
    user.phone = phone;
    user.countryCode = COUNTRY_CODE;
    user.name = `Dima Hasao User ${index}`;
    user.password = hashedPassword;
    user.isVerified = true;
    user.isActive = true;
    user.active = true;
    user.isBlocked = false;
    user.role = 'USER';
    await user.save();
    console.log(`  ✓ Consumer User: ${user.name} (_id: ${user._id})`);

    // 2. Restaurant Owner (food_restaurants collection)
    const restaurantCol = mongoose.connection.collection('food_restaurants');
    await restaurantCol.updateOne(
      { $or: [{ ownerPhone: phone }, { primaryContactNumber: phone }] },
      {
        $set: {
          restaurantName: `Dima Hasao Restaurant ${index}`,
          ownerName: `Restaurant Owner ${index}`,
          ownerEmail: `restaurant${index}@dimahasao.com`,
          ownerPhone: phone,
          primaryContactNumber: phone,
          countryCode: COUNTRY_CODE,
          city: CITY,
          state: STATE,
          status: 'approved',
          password: hashedPassword,
          approvedAt: now,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
    console.log(`  ✓ Restaurant: Dima Hasao Restaurant ${index}`);

    // 3. Delivery Partner (food_delivery_partners collection)
    const deliveryCol = mongoose.connection.collection('food_delivery_partners');
    await deliveryCol.updateOne(
      { phone },
      {
        $set: {
          name: `Delivery Partner ${index}`,
          phone,
          countryCode: COUNTRY_CODE,
          city: CITY,
          state: STATE,
          vehicleType: 'bike',
          status: 'approved',
          isActive: true,
          isBlocked: false,
          password: hashedPassword,
          approvedAt: now,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
    console.log(`  ✓ Delivery Partner: Delivery Partner ${index}`);

    // 4. Taxi Driver (drivers collection)
    let driver = await Driver.findOne({ phone });
    if (!driver) driver = new Driver({ phone });
    driver.phone = phone;
    driver.name = `Taxi Driver ${index}`;
    driver.vehicleType = 'car';
    driver.password = hashedPassword;
    driver.approve = true;
    driver.status = 'approved';
    driver.active = true;
    driver.isBlocked = false;
    driver.city = CITY;
    await driver.save();
    console.log(`  ✓ Taxi Driver: ${driver.name} (_id: ${driver._id})`);

    // 5. Hotel Partner (partners collection)
    let partner = await Partner.findOne({ phone });
    if (!partner) partner = new Partner({ phone });
    partner.phone = phone;
    partner.name = `Hotel Partner ${index}`;
    partner.role = 'partner';
    partner.isPartner = true;
    partner.isVerified = true;
    partner.isBlocked = false;
    partner.partnerApprovalStatus = 'approved';
    partner.password = hashedPassword;
    await partner.save();
    console.log(`  ✓ Hotel Partner: ${partner.name} (_id: ${partner._id})`);
  }
};

const seedAdmins = async () => {
  console.log('\n--- Seeding Super Admins ---');

  for (const { email, name, password } of ADMINS) {
    const cleanEmail = email.toLowerCase().trim();
    let admin = await FoodAdmin.findOne({ email: cleanEmail });
    const existed = Boolean(admin);
    if (!admin) admin = new FoodAdmin({ email: cleanEmail });

    admin.email = cleanEmail;
    admin.name = name;
    admin.password = password; // Will be hashed by FoodAdmin pre-save hook
    admin.adminLevel = ADMIN_LEVELS.PLATFORM_SUPERADMIN;
    admin.admin_type = 'superadmin';
    admin.role = 'ADMIN';
    admin.module = null;
    admin.parentAdminId = null;
    admin.servicesAccess = ALL_ADMIN_MODULES;
    admin.isActive = true;
    admin.active = true;
    admin.status = 'active';

    await admin.save();

    console.log(`  ✓ ${existed ? 'Updated' : 'Created'} Super Admin: ${admin.email} (Password: ${password})`);
  }
};

const run = async () => {
  try {
    await connect();
    await seedUsers();
    await seedAdmins();

    console.log('\n========================================');
    console.log('✅ SEEDING COMPLETE SUCCESSFULLY!');
    console.log('========================================');
    console.log('\nCredentials Summary:');
    console.log('----------------------------------------');
    console.log('Super Admin Login (/admin/login):');
    console.log('  Email:    admin@gmail.com (or admin@dimahasao.com)');
    console.log('  Password: 123456');
    console.log('----------------------------------------');
    console.log('Test User Phones (Consumer, Restaurant, Delivery, Taxi, Hotel):');
    console.log('  1) 9876543210 (Password/OTP: 123456)');
    console.log('  2) 9876543211 (Password/OTP: 123456)');
    console.log('  3) 9876543212 (Password/OTP: 123456)');
    console.log('  4) 9876543213 (Password/OTP: 123456)');
    console.log('========================================\n');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

run();
