import { createServiceClient } from './supabase'

type WebhookEvent =
  | 'customer_signup'
  | 'stamp_added'
  | 'milestone_reached'
  | 'reward_unlocked'
  | 'reward_redeemed'
  | 'customer_lapsed'

type WebhookPayload = Record<string, string | number | boolean>

export async function triggerWebhook(
  shopId: string,
  eventType: WebhookEvent,
  payload: WebhookPayload
): Promise<void> {
  const supabase = createServiceClient()
  const { data: shop } = await supabase
    .from('shops')
    .select('make_webhook_url, name')
    .eq('id', shopId)
    .single()

  if (!shop?.make_webhook_url) return

  try {
    await fetch(shop.make_webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventType,
        shop_name: shop.name,
        timestamp: new Date().toISOString(),
        ...payload,
      }),
    })
  } catch (err) {
    // Log but don't throw — webhook failures should never break the main flow
    console.error(`Webhook failed for shop ${shopId}, event ${eventType}:`, err)
  }
}
