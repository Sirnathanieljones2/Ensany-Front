import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "../src/config/env.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const brokers = [
    {
      name: "Whitepages",
      legalName: "Whitepages Inc.",
      privacyEmail: "privacy@whitepages.com",
      website: "https://www.whitepages.com",
      country: "United States",
      region: "North America",
      category: "People search",
      removalMethod: "EMAIL_AND_FORM",
      removalFormUrl: "https://www.whitepages.com/suppression_requests",
      expectedResponseDays: 14,
      riskLevel: "HIGH",
      requiredData: ["Full legal name", "Email", "Current or previous address", "Profile URL if known"],
      removalInstructions:
        "Use the suppression form first. If no confirmation arrives within 14 days, send an escalation email with the request id and the user's identifying fields.",
    },
    {
      name: "Spokeo",
      legalName: "Spokeo Inc.",
      privacyEmail: "privacy@spokeo.com",
      website: "https://www.spokeo.com",
      country: "United States",
      region: "North America",
      category: "People search",
      removalMethod: "EMAIL_AND_FORM",
      expectedResponseDays: 14,
      riskLevel: "HIGH",
      requiredData: ["Full legal name", "Email", "Phone", "City", "Profile URL if known"],
      removalInstructions:
        "Submit by email and capture the provider message id. If the broker asks for verification, move the request to NEEDS_USER_INFO and write a note.",
    },
    {
      name: "YallaCompare",
      privacyEmail: "privacy@example.com",
      website: "https://example.com",
      country: "United Arab Emirates",
      region: "Middle East",
      category: "Lead generation",
      removalMethod: "EMAIL",
      expectedResponseDays: 10,
      riskLevel: "MEDIUM",
      requiredData: ["Full legal name", "Email", "Phone"],
      removalInstructions:
        "Send the standard removal email. If the company replies with a form link, update the broker method to EMAIL_AND_FORM.",
    },
    {
      name: "Regional Data Directory",
      privacyEmail: "privacy@example.com",
      website: "https://example.com",
      country: "Egypt",
      region: "Middle East",
      category: "Directory",
      removalMethod: "EMAIL",
      expectedResponseDays: 10,
      riskLevel: "MEDIUM",
      requiredData: ["Full legal name", "Email", "Address"],
      removalInstructions:
        "Send the standard deletion request. If no response arrives within 10 days, use the escalation template once an escalation contact is found.",
    },
  ];

  for (const broker of brokers) {
    await prisma.broker.upsert({
      where: {
        name_country: {
          name: broker.name,
          country: broker.country,
        },
      },
      update: broker,
      create: broker,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
