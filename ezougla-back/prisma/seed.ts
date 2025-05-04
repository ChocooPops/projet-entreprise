import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function main() {
    const hashedPassword = await bcrypt.hash('password1234', 10);

    await prisma.user.create({
        data: {
            email: 'rahmaninahil@gmail.com',
            lastName: 'Nahil',
            firstName: 'RAHMANI',
            password: hashedPassword,
            role: 'DIRECTOR',
        },
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
