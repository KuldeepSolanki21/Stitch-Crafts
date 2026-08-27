"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
async function seedSuperAdmin() {
    const adminName = process.env.ADMIN_NAME || 'Super Administrator';
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@stitchandcrafts.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@StitchCrafts2026';
    console.log(`🌱 Seeding Super Admin account: ${adminEmail}...`);
    const hashedPassword = await bcryptjs_1.default.hash(adminPassword, 12);
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            name: adminName,
            role: client_1.Role.SUPER_ADMIN,
            isActive: true,
        },
        create: {
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: client_1.Role.SUPER_ADMIN,
            isActive: true,
        },
    });
    console.log(`✅ Super Admin ready: ${admin.name} (${admin.email}) [Role: ${admin.role}]`);
}
async function main() {
    try {
        await seedSuperAdmin();
    }
    catch (error) {
        console.error('❌ Error during seed:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
