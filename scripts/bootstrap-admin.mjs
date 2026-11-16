#!/usr/bin/env node
/**
 * RasoiIQ - Secure One-Time Administrator Bootstrap Script
 *
 * Runs exclusively in controlled CLI/server environment.
 * Never exposed via public HTTP endpoints.
 * Uses Argon2id for secure password hashing.
 *
 * Usage:
 *   node scripts/bootstrap-admin.mjs --email ops@rasoiiq.in --password StrongAdminPassphrase@2026 --name "Platform Lead"
 */

import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { execSync } from 'child_process';

let host = '127.0.0.1';
try {
  const wslIp = execSync('wsl -d Ubuntu hostname -I').toString().trim().split(' ')[0];
  if (wslIp) host = wslIp;
} catch {}

const dbUrl = process.env.DATABASE_URL || `postgresql://postgres:postgres@${host}:5432/rasoi_iq?schema=public`;

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } }
});

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].replace(/^--/, '');
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
      parsed[key] = val;
    }
  }
  return parsed;
}

async function bootstrap() {
  const args = parseArgs();
  const email = (args.email || process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@rasoiiq.in').toLowerCase().trim();
  const password = args.password || process.env.ADMIN_BOOTSTRAP_PASSWORD || 'RasoiAdminSecretPassphrase@2026';
  const fullName = args.name || args.fullName || 'Platform Administrator';
  const force = Boolean(args.force);

  console.log('========================================================================');
  console.log('       RASOIIQ SECURE ADMINISTRATOR PROVISIONING TOOL                   ');
  console.log('========================================================================');

  if (password.length < 12) {
    console.error('❌ ERROR: Administrator password must be at least 12 characters.');
    process.exit(1);
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { normalizedEmail: email }]
    }
  });

  if (existing && existing.role === 'ADMIN' && !force) {
    console.log(`ℹ️  Administrator account for "${email}" already exists with role ADMIN.`);
    console.log('   Pass --force to reset the password of this existing administrator.');
    await prisma.$disconnect();
    return;
  }

  console.log(`🔒 Hashing administrator password with Argon2id...`);
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1
  });

  let adminUser;
  if (existing) {
    adminUser = await prisma.user.update({
      where: { id: existing.id },
      data: {
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerifiedAt: existing.emailVerifiedAt || new Date(),
        passwordHash,
        fullName
      }
    });
    console.log(`✅ Existing user "${email}" elevated to platform ADMIN.`);
  } else {
    adminUser = await prisma.user.create({
      data: {
        email,
        normalizedEmail: email,
        fullName,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerifiedAt: new Date()
      }
    });
    console.log(`✅ New platform administrator created for "${email}".`);
  }

  // Record audit log entry
  await prisma.auditLog.create({
    data: {
      action: 'ADMIN_BOOTSTRAP',
      userId: adminUser.id,
      entityType: 'User',
      entityId: adminUser.id,
      metadata: { email, role: 'ADMIN', source: 'CLI' }
    }
  });

  console.log('📋 Audit log entry recorded.');
  console.log(`🎉 Administrator provisioning complete for: ${email}`);
  console.log('========================================================================');

  await prisma.$disconnect();
}

bootstrap().catch(async (e) => {
  console.error('❌ Bootstrap failed:', e.message);
  await prisma.$disconnect();
  process.exit(1);
});
