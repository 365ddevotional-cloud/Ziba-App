import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.payment.deleteMany();
  await prisma.incentive.deleteMany();
  await prisma.ride.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.user.deleteMany();

  const users = await Promise.all([
    prisma.user.create({
      data: {
        fullName: 'Amara Okonkwo',
        email: 'amara@example.com',
        phone: '+234 801 234 5678',
        city: 'Lagos',
        status: 'ACTIVE',
      },
    }),
    prisma.user.create({
      data: {
        fullName: 'Chidi Eze',
        email: 'chidi@example.com',
        phone: '+234 802 345 6789',
        city: 'Abuja',
        status: 'ACTIVE',
      },
    }),
    prisma.user.create({
      data: {
        fullName: 'Fatima Bello',
        email: 'fatima@example.com',
        phone: '+234 803 456 7890',
        city: 'Kano',
        status: 'ACTIVE',
      },
    }),
    prisma.user.create({
      data: {
        fullName: 'Emeka Nwosu',
        email: 'emeka@example.com',
        phone: '+234 804 567 8901',
        city: 'Port Harcourt',
        status: 'SUSPENDED',
      },
    }),
    prisma.user.create({
      data: {
        fullName: 'Ngozi Adeyemi',
        email: 'ngozi@example.com',
        phone: '+234 805 678 9012',
        city: 'Ibadan',
        status: 'ACTIVE',
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  const drivers = await Promise.all([
    prisma.driver.create({
      data: {
        fullName: 'Tunde Bakare',
        phone: '+234 806 111 2222',
        vehicleType: 'CAR',
        vehiclePlate: 'LAG-123-AB',
        status: 'APPROVED',
      },
    }),
    prisma.driver.create({
      data: {
        fullName: 'Yusuf Mohammed',
        phone: '+234 807 222 3333',
        vehicleType: 'BIKE',
        vehiclePlate: 'ABJ-456-CD',
        status: 'PENDING',
      },
    }),
    prisma.driver.create({
      data: {
        fullName: 'Kunle Ajayi',
        phone: '+234 808 333 4444',
        vehicleType: 'VAN',
        vehiclePlate: 'KAN-789-EF',
        status: 'SUSPENDED',
      },
    }),
  ]);

  console.log(`Created ${drivers.length} drivers`);

  const approvedDriver = drivers[0];

  const rides = await Promise.all([
    prisma.ride.create({
      data: {
        pickupLocation: 'Victoria Island, Lagos',
        dropoffLocation: 'Lekki Phase 1, Lagos',
        fareEstimate: 2500,
        status: 'COMPLETED',
        userId: users[0].id,
        driverId: approvedDriver.id,
      },
    }),
    prisma.ride.create({
      data: {
        pickupLocation: 'Ikeja GRA, Lagos',
        dropoffLocation: 'Yaba, Lagos',
        fareEstimate: 1800,
        status: 'COMPLETED',
        userId: users[1].id,
        driverId: approvedDriver.id,
      },
    }),
    prisma.ride.create({
      data: {
        pickupLocation: 'Wuse 2, Abuja',
        dropoffLocation: 'Garki, Abuja',
        fareEstimate: 1500,
        status: 'COMPLETED',
        userId: users[2].id,
        driverId: approvedDriver.id,
      },
    }),
    prisma.ride.create({
      data: {
        pickupLocation: 'Surulere, Lagos',
        dropoffLocation: 'Ajah, Lagos',
        fareEstimate: 3500,
        status: 'ACCEPTED',
        userId: users[0].id,
        driverId: approvedDriver.id,
      },
    }),
    prisma.ride.create({
      data: {
        pickupLocation: 'Maitama, Abuja',
        dropoffLocation: 'Asokoro, Abuja',
        fareEstimate: 2000,
        status: 'ACCEPTED',
        userId: users[4].id,
        driverId: approvedDriver.id,
      },
    }),
    prisma.ride.create({
      data: {
        pickupLocation: 'Apapa, Lagos',
        dropoffLocation: 'Marina, Lagos',
        fareEstimate: 1200,
        status: 'REQUESTED',
        userId: users[1].id,
        driverId: null,
      },
    }),
    prisma.ride.create({
      data: {
        pickupLocation: 'Festac Town, Lagos',
        dropoffLocation: 'Oshodi, Lagos',
        fareEstimate: 1600,
        status: 'REQUESTED',
        userId: users[2].id,
        driverId: null,
      },
    }),
    prisma.ride.create({
      data: {
        pickupLocation: 'Ikoyi, Lagos',
        dropoffLocation: 'Obalende, Lagos',
        fareEstimate: 900,
        status: 'CANCELLED',
        userId: users[0].id,
        driverId: null,
      },
    }),
    prisma.ride.create({
      data: {
        pickupLocation: 'GRA Ikeja, Lagos',
        dropoffLocation: 'Maryland, Lagos',
        fareEstimate: 1100,
        status: 'CANCELLED',
        userId: users[4].id,
        driverId: null,
      },
    }),
    prisma.ride.create({
      data: {
        pickupLocation: 'Central Area, Abuja',
        dropoffLocation: 'Jabi, Abuja',
        fareEstimate: 1400,
        status: 'COMPLETED',
        userId: users[2].id,
        driverId: approvedDriver.id,
      },
    }),
  ]);

  console.log(`Created ${rides.length} rides`);

  const completedRides = rides.filter((r) => r.status === 'COMPLETED');
  const payments = await Promise.all(
    completedRides.map((ride) =>
      prisma.payment.create({
        data: {
          amount: ride.fareEstimate || 0,
          status: 'PAID',
          rideId: ride.id,
        },
      })
    )
  );

  console.log(`Created ${payments.length} payments`);

  const incentives = await Promise.all([
    prisma.incentive.create({
      data: {
        amount: 500,
        reason: 'Weekly bonus for high ratings',
        driverId: approvedDriver.id,
      },
    }),
    prisma.incentive.create({
      data: {
        amount: 1000,
        reason: 'Completed 50 rides milestone',
        driverId: approvedDriver.id,
      },
    }),
  ]);

  console.log(`Created ${incentives.length} incentives`);

  await prisma.director.deleteMany();
  const directors = await Promise.all([
    prisma.director.create({
      data: {
        fullName: 'Oluwaseun Adebayo',
        email: 'operations@ziba.com',
        role: 'OPERATIONS',
        region: 'Lagos',
      },
    }),
    prisma.director.create({
      data: {
        fullName: 'Aisha Abdullahi',
        email: 'finance@ziba.com',
        role: 'FINANCE',
        region: 'National',
      },
    }),
    prisma.director.create({
      data: {
        fullName: 'Ibrahim Musa',
        email: 'compliance@ziba.com',
        role: 'COMPLIANCE',
        region: 'Abuja',
      },
    }),
  ]);

  console.log(`Created ${directors.length} directors`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
