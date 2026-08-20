import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function test() {
  console.log("Testing DB connection...");
  const users = await prisma.user.findMany();
  console.log("Users in DB:", users.length);
  
  console.log("Creating test user...");
  const passwordHash = await bcrypt.hash("password123", 10);
  const newUser = await prisma.user.create({
    data: {
      email: "agent@test.com",
      username: "AgentTest",
      passwordHash,
    }
  });
  console.log("Created user:", newUser.email);
  
  console.log("Finding user...");
  const found = await prisma.user.findFirst({
    where: { email: "agent@test.com" }
  });
  console.log("Found user successfully:", found?.email);
}

test().catch(console.error).finally(() => process.exit(0));
