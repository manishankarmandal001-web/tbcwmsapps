import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { INITIAL_PRODUCTS } from '../src/data/initialData';
import type { Claim, ClaimStatus, Product } from '../src/types';

type Operation =
  | 'add-product'
  | 'update-product'
  | 'toggle-product'
  | 'delete-product'
  | 'add-claim'
  | 'update-claim-status'
  | 'reset';

type OperationBody = {
  operation?: Operation;
  product?: Product;
  productId?: string | number;
  claim?: Claim;
  claimId?: string | number;
  status?: ClaimStatus;
  adminNote?: string;
};

let schemaPromise: Promise<void> | null = null;

const sql = neon(
  process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    'postgresql://user:password@example.com:5432/wms?sslmode=require'
);

const hasDatabase = () => Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);

const productFromRow = (row: Record<string, unknown>): Product => ({
  id: String(row.id),
  title: String(row.title),
  platform: row.platform as Product['platform'],
  image: String(row.image),
  link: String(row.link),
  code: String(row.code),
  cashbackAmount: row.cashback_amount == null ? undefined : Number(row.cashback_amount),
  price: row.price == null ? undefined : Number(row.price),
  description: row.description == null ? undefined : String(row.description),
  createdAt: String(row.created_at),
  isActive: Boolean(row.is_active)
});

const claimFromRow = (row: Record<string, unknown>): Claim => ({
  id: String(row.id),
  productId: String(row.product_id),
  productTitle: String(row.product_title),
  platform: row.platform as Claim['platform'],
  systemCode: String(row.system_code),
  specialCode: String(row.special_code),
  customerName: String(row.customer_name),
  customerMobile: String(row.customer_mobile),
  customerEmail: String(row.customer_email),
  orderImgData: String(row.order_img_data),
  paymentImgData: String(row.payment_img_data),
  ratingImgData: String(row.rating_img_data),
  upiId: String(row.upi_id),
  status: row.status as ClaimStatus,
  submittedAt: String(row.submitted_at),
  cashbackAmount: row.cashback_amount == null ? undefined : Number(row.cashback_amount),
  adminNote: row.admin_note == null ? undefined : String(row.admin_note),
  processedAt: row.processed_at == null ? undefined : String(row.processed_at)
});

const ensureSchema = async (): Promise<void> => {
  if (schemaPromise) return schemaPromise;

  schemaPromise = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS wms_products (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        platform TEXT NOT NULL,
        image TEXT NOT NULL,
        link TEXT NOT NULL,
        code TEXT NOT NULL,
        cashback_amount NUMERIC,
        price NUMERIC,
        description TEXT,
        created_at TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS wms_claims (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        product_title TEXT NOT NULL,
        platform TEXT NOT NULL,
        system_code TEXT NOT NULL,
        special_code TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        customer_mobile TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        order_img_data TEXT NOT NULL,
        payment_img_data TEXT NOT NULL,
        rating_img_data TEXT NOT NULL,
        upi_id TEXT NOT NULL,
        status TEXT NOT NULL,
        submitted_at TEXT NOT NULL,
        cashback_amount NUMERIC,
        admin_note TEXT,
        processed_at TEXT
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS wms_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `;

    // Seed only once. The marker prevents deleted products from reappearing
    // every time the catalog becomes empty.
    const seeded = await sql`
      SELECT value FROM wms_settings WHERE key = 'initial_products_seeded' LIMIT 1
    `;

    if (seeded.length === 0) {
      for (const product of INITIAL_PRODUCTS) {
        await sql`
          INSERT INTO wms_products (
            id, title, platform, image, link, code, cashback_amount,
            price, description, created_at, is_active
          )
          VALUES (
            ${String(product.id)},
            ${product.title},
            ${product.platform},
            ${product.image},
            ${product.link},
            ${product.code},
            ${product.cashbackAmount ?? null},
            ${product.price ?? null},
            ${product.description ?? null},
            ${product.createdAt},
            ${product.isActive !== false}
          )
          ON CONFLICT (id) DO NOTHING
        `;
      }

      await sql`
        INSERT INTO wms_settings (key, value)
        VALUES ('initial_products_seeded', 'true')
        ON CONFLICT (key) DO NOTHING
      `;
    }
  })().catch((error) => {
    schemaPromise = null;
    throw error;
  });

  return schemaPromise;
};

const readState = async () => {
  const [productsResult, claimsResult] = await Promise.all([
    sql`SELECT * FROM wms_products ORDER BY created_at DESC, id DESC`,
    sql`SELECT * FROM wms_claims ORDER BY submitted_at DESC, id DESC`
  ]);

  return {
    products: productsResult.map(productFromRow),
    claims: claimsResult.map(claimFromRow)
  };
};

const sendState = async (res: VercelResponse) => {
  const state = await readState();
  return res.status(200).json({ ...state, source: 'database' });
};

const requireProduct = (product?: Product): Product => {
  if (!product?.title?.trim() || !product.platform || !product.code?.trim()) {
    throw new Error('A valid product is required.');
  }
  return product;
};

const requireClaim = (claim?: Claim): Claim => {
  if (!claim?.productTitle?.trim() || !claim.customerMobile?.trim() || !claim.specialCode?.trim()) {
    throw new Error('A valid claim is required.');
  }
  return claim;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!hasDatabase()) {
    return res.status(503).json({
      error: 'Database is not configured.',
      code: 'DATABASE_NOT_CONFIGURED'
    });
  }

  try {
    await ensureSchema();

    if (req.method === 'GET') {
      return sendState(res);
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'Method not allowed.' });
    }

    const body = (req.body || {}) as OperationBody;

    switch (body.operation) {
      case 'add-product': {
        const product = requireProduct(body.product);
        await sql`
          INSERT INTO wms_products (
            id, title, platform, image, link, code, cashback_amount,
            price, description, created_at, is_active
          )
          VALUES (
            ${String(product.id)},
            ${product.title.trim()},
            ${product.platform},
            ${product.image || ''},
            ${product.link || ''},
            ${product.code.trim()},
            ${product.cashbackAmount ?? null},
            ${product.price ?? null},
            ${product.description ?? null},
            ${product.createdAt},
            ${product.isActive !== false}
          )
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            platform = EXCLUDED.platform,
            image = EXCLUDED.image,
            link = EXCLUDED.link,
            code = EXCLUDED.code,
            cashback_amount = EXCLUDED.cashback_amount,
            price = EXCLUDED.price,
            description = EXCLUDED.description,
            created_at = EXCLUDED.created_at,
            is_active = EXCLUDED.is_active
        `;
        break;
      }

      case 'update-product': {
        const product = requireProduct(body.product);
        await sql`
          UPDATE wms_products
          SET
            title = ${product.title.trim()},
            platform = ${product.platform},
            image = ${product.image || ''},
            link = ${product.link || ''},
            code = ${product.code.trim()},
            cashback_amount = ${product.cashbackAmount ?? null},
            price = ${product.price ?? null},
            description = ${product.description ?? null},
            created_at = ${product.createdAt},
            is_active = ${product.isActive !== false}
          WHERE id = ${String(product.id)}
        `;
        break;
      }

      case 'toggle-product': {
        await sql`
          UPDATE wms_products
          SET is_active = NOT is_active
          WHERE id = ${String(body.productId)}
        `;
        break;
      }

      case 'delete-product': {
        await sql`DELETE FROM wms_products WHERE id = ${String(body.productId)}`;
        break;
      }

      case 'add-claim': {
        const claim = requireClaim(body.claim);
        await sql`
          INSERT INTO wms_claims (
            id, product_id, product_title, platform, system_code, special_code,
            customer_name, customer_mobile, customer_email, order_img_data,
            payment_img_data, rating_img_data, upi_id, status, submitted_at,
            cashback_amount, admin_note, processed_at
          )
          VALUES (
            ${String(claim.id)},
            ${String(claim.productId)},
            ${claim.productTitle},
            ${claim.platform},
            ${claim.systemCode},
            ${claim.specialCode},
            ${claim.customerName},
            ${claim.customerMobile},
            ${claim.customerEmail},
            ${claim.orderImgData},
            ${claim.paymentImgData},
            ${claim.ratingImgData},
            ${claim.upiId},
            ${claim.status},
            ${claim.submittedAt},
            ${claim.cashbackAmount ?? null},
            ${claim.adminNote ?? null},
            ${claim.processedAt ?? null}
          )
          ON CONFLICT (id) DO NOTHING
        `;
        break;
      }

      case 'update-claim-status': {
        if (!body.status || !['Pending', 'Approved', 'Rejected'].includes(body.status)) {
          throw new Error('A valid claim status is required.');
        }

        await sql`
          UPDATE wms_claims
          SET
            status = ${body.status},
            admin_note = COALESCE(${body.adminNote ?? null}, admin_note),
            processed_at = ${new Date().toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          WHERE id = ${String(body.claimId)}
        `;
        break;
      }

      case 'reset': {
        await sql`DELETE FROM wms_products`;
        await sql`DELETE FROM wms_claims`;
        break;
      }

      default:
        return res.status(400).json({ error: 'Unknown data operation.' });
    }

    return sendState(res);
  } catch (error) {
    console.error('WMS data API error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unexpected database error.'
    });
  }
}