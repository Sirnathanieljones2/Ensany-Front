import { prisma } from "../src/lib/prisma.js";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error("Usage: npm.cmd run admin:promote -- user@example.com");
  process.exit(1);
}

async function main() {
  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
    },
  });

  console.log("Promoted user:", user);
}

main()
  .catch((error) => {
    if (error.code === "P2025") {
      console.error(`No user found for email: ${email}`);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
