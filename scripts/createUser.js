import { registerUser } from "../src/services/authService.js";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const result = await registerUser({
    email: "test@example.com",
    password: "password1234",
    displayName: "Test User",
    profile: {
      fullName: "Test User",
      phone: "1234567890",
      address: "123 Test St",
      city: "Cairo",
      country: "Egypt",
      birthYear: 1995,
    },
  });

  console.log("User created:", result.user);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
