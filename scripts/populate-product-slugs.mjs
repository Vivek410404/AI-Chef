import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products to check for slugs.`);

  for (const p of products) {
    if (!p.slug) {
      const baseSlug = slugify(`${p.brand}-${p.title}`);
      let slug = baseSlug;
      let counter = 1;
      while (await prisma.product.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter++}`;
      }
      await prisma.product.update({
        where: { id: p.id },
        data: { slug }
      });
      console.log(`Assigned slug "${slug}" to product "${p.title}"`);
    }
  }
  console.log('Product slug population complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
