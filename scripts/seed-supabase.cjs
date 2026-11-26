#!/usr/bin/env node
/**
 * Alinea Supabase con el dataset canónico de la demo (18 lotes).
 *
 * Uso:
 *   SUPABASE_URL="https://....supabase.co" \
 *   SUPABASE_SECRET_KEY="sb_secret_..." \
 *   node scripts/seed-supabase.cjs
 *
 * La secret key es SOLO para este script de administración. Nunca va en la app,
 * en .env ni en EXPO_PUBLIC_*. La app usa la publishable key.
 *
 * Es idempotente: si lo corrés dos veces, actualiza los mismos productos/lotes
 * en vez de duplicarlos. No borra ventas, descartes ni movimientos.
 *
 * Usa fetch (Node 20) en vez del cliente de Supabase para no exigir WebSocket.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const DATA = require('./canonical-demo.json');

function readEnvFile() {
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    out[trimmed.slice(0, index)] = trimmed.slice(index + 1);
  }
  return out;
}

const envFile = readEnvFile();
const url =
  process.env.SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  envFile.EXPO_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

if (!url || !secret) {
  console.error(
    'Faltan credenciales.\n' +
      '  SUPABASE_URL: usá EXPO_PUBLIC_SUPABASE_URL del .env o pasala por env.\n' +
      '  SUPABASE_SECRET_KEY: pasala por env (nunca la pongas en .env).\n'
  );
  process.exit(1);
}

const now = new Date().toISOString();

function isoDaysFromToday(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

async function api(pathname, { method = 'GET', body, prefer } = {}) {
  const headers = {
    apikey: secret,
    Authorization: `Bearer ${secret}`,
    Accept: 'application/json',
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (prefer) headers.Prefer = prefer;

  const response = await fetch(`${url}/rest/v1/${pathname}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${method} ${pathname} -> ${response.status} ${text.slice(0, 400)}`);
  }
  return text ? JSON.parse(text) : null;
}

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const PRODUCT_ALIASES = {
  // El nombre remoto existente no coincide exactamente con el canónico.
  [normalize('Amoxicilina 250 mg / 5 ml')]: ['amoxicilina 250 mg 5ml'],
  [normalize('Amoxicilina + Ác. Clavulánico 875/125')]: [
    'amoxicilina ac clavulanico',
  ],
};

// Códigos de lote que ya existían en Supabase con otro nombre.
// No usar el producto como fallback: dos lotes del mismo producto deben
// convivir (AMX-12 y AMX-22 comparten "Amoxicilina 250 mg / 5 ml").
const BATCH_ALIASES = {
  'IB-449': ['#IB-4492-B0'],
};

function findLocation(locations, shelf) {
  const wanted = normalize(shelf);
  return (
    locations.find((item) => normalize(item.name) === wanted) ||
    locations.find((item) => normalize(item.name).startsWith(wanted)) ||
    null
  );
}

async function main() {
  console.log(`Sembrando ${DATA.lots.length} lotes en ${url}`);

  const [pharmacies, locations, products, batches] = await Promise.all([
    api('pharmacies?select=id,name&limit=1'),
    api('storage_locations?select=id,name&order=name'),
    api('products?select=id,commercial_name,generic_name&order=commercial_name'),
    api(
      'batches?select=id,product_id,batch_code,current_stock,unit_price,unit_measure&order=batch_code'
    ),
  ]);

  if (!pharmacies?.length) throw new Error('No hay farmacia en Supabase');
  if (!locations?.length) throw new Error('No hay storage_locations en Supabase');

  const pharmacyId = pharmacies[0].id;
  const productList = [...(products ?? [])];
  const batchList = [...(batches ?? [])];
  let createdProducts = 0;
  let updatedProducts = 0;
  let createdBatches = 0;
  let updatedBatches = 0;
  const missingLocations = new Set();

  for (const lot of DATA.lots) {
    const key = normalize(lot.name);
    const aliases = PRODUCT_ALIASES[key] ?? [];
    let product =
      productList.find((item) => normalize(item.commercial_name) === key) ||
      productList.find((item) => aliases.includes(normalize(item.commercial_name)));

    if (!product) {
      const [created] = await api('products?select=id,commercial_name', {
        method: 'POST',
        prefer: 'return=representation',
        body: {
          id: crypto.randomUUID(),
          pharmacy_id: pharmacyId,
          barcode: null,
          commercial_name: lot.name,
          generic_name: lot.description,
          concentration: null,
          dosage_form: lot.form,
          presentation: lot.presentation,
          laboratory: lot.laboratory,
          min_stock_alert: 5,
          is_active: true,
          created_at: now,
          updated_at: now,
        },
      });
      product = created;
      productList.push(created);
      createdProducts += 1;
    } else {
      await api(`products?id=eq.${encodeURIComponent(product.id)}`, {
        method: 'PATCH',
        prefer: 'return=minimal',
        body: {
          commercial_name: lot.name,
          dosage_form: lot.form,
          presentation: lot.presentation,
          laboratory: lot.laboratory,
          min_stock_alert: 5,
          is_active: true,
          updated_at: now,
        },
      });
      updatedProducts += 1;
    }

    const location = findLocation(locations, lot.shelf);
    if (!location) missingLocations.add(lot.shelf);

    const batchPayload = {
      product_id: product.id,
      storage_location_id: location?.id ?? null,
      batch_code: lot.lot,
      expiration_date: isoDaysFromToday(lot.daysToExpire),
      current_stock: lot.stock,
      unit_price: lot.price,
      unit_measure: lot.unit,
      status: lot.daysToExpire < 0 ? 'EXPIRED' : 'ACTIVE',
      updated_at: now,
    };

    const aliasesForBatch = BATCH_ALIASES[lot.lot] ?? [];
    const batch =
      batchList.find((item) => item.batch_code === lot.lot) ||
      batchList.find((item) => aliasesForBatch.includes(item.batch_code));

    if (!batch) {
      const [created] = await api('batches?select=id,batch_code', {
        method: 'POST',
        prefer: 'return=representation',
        body: { id: crypto.randomUUID(), ...batchPayload, created_at: now },
      });
      batchList.push(created);
      createdBatches += 1;
    } else {
      await api(`batches?id=eq.${encodeURIComponent(batch.id)}`, {
        method: 'PATCH',
        prefer: 'return=minimal',
        body: batchPayload,
      });
      Object.assign(batch, batchPayload);
      updatedBatches += 1;
    }
  }

  console.log('Listo:');
  console.log(`  productos: ${createdProducts} creados, ${updatedProducts} actualizados`);
  console.log(`  lotes:     ${createdBatches} creados, ${updatedBatches} actualizados`);
  if (missingLocations.size) {
    console.warn(`  ⚠️ ubicaciones no encontradas: ${[...missingLocations].join(', ')}`);
  }

  const codes = DATA.lots.map((lot) => lot.lot).join(',');
  const check = await api(
    `batches?batch_code=in.(${encodeURIComponent(codes)})&select=batch_code,current_stock,unit_measure,status&order=batch_code`
  );
  console.log(`  verificación: ${check?.length ?? 0}/${DATA.lots.length} lotes remotos`);
  for (const row of check ?? []) {
    console.log(
      `    ${row.batch_code.padEnd(10)} stock=${String(row.current_stock).padStart(4)} ${row.unit_measure.padEnd(12)} ${row.status}`
    );
  }
}

main().catch((error) => {
  console.error('\nERROR:', error.message ?? error);
  process.exit(1);
});
