import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRICE_MAP: Record<string, number | null> = {
  'Dissertation': 1500,
  'Project Report': 1000,
  'ATS-Friendly Resume': 200,
  'Assignment': 200,
  'Practical File — All Practicals': 1000,
  'Internship Report': 300,
  'Project Presentation PPT': 300,
  'Seminar Report': 300,
  'Website Building': 1000,
  'Others': null,
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const form = await req.formData();
    const name = String(form.get('name') ?? '').trim();
    const whatsapp = String(form.get('whatsapp') ?? '').trim();
    const service = String(form.get('service') ?? '').trim();
    const deadline = String(form.get('deadline') ?? '').trim() || null;
    const requirements = String(form.get('requirements') ?? '').trim() || null;

    if (!name || !whatsapp || !service) {
      return json({ error: 'Name, WhatsApp number and service are required.' }, 400);
    }
    if (!(service in PRICE_MAP)) return json({ error: 'Invalid service.' }, 400);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    );

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: name,
        whatsapp,
        service,
        price_inr: PRICE_MAP[service],
        deadline,
        requirements,
      })
      .select('id,order_code,service,price_inr,deadline')
      .single();

    if (orderError) throw orderError;

    const files = form.getAll('files').filter((value): value is File => value instanceof File && value.size > 0);
    const maxFileSize = 15 * 1024 * 1024;
    const maxFiles = 10;

    if (files.length > maxFiles) return json({ error: `Please upload no more than ${maxFiles} files.` }, 400);

    for (const file of files) {
      if (file.size > maxFileSize) return json({ error: `${file.name} is larger than 15 MB.` }, 400);
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${order.id}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from('order-files').upload(path, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { error: fileError } = await supabase.from('order_files').insert({
        order_id: order.id,
        file_name: file.name,
        storage_path: path,
        mime_type: file.type || null,
        size_bytes: file.size,
      });
      if (fileError) throw fileError;
    }

    return json({ ok: true, order });
  } catch (error) {
    console.error(error);
    return json({ error: 'Unable to create the order right now. Please try again.' }, 500);
  }
});
