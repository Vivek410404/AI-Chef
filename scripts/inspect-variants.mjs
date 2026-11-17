import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.productVariant.findUnique({ where: { id: 'var-mother-paneer-200' }, select: { id: true, inStock: true } });
  const a = await prisma.productVariant.findMany({ where: { title: { contains: 'Atta' } }, select: { id: true, title: true, inStock: true } });
  console.log('Paneer:', p);
  console.log('Atta:', a);
  await prisma.$disconnect();
}
main();
