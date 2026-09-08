/** رابط استاندارد مدل — سازگار با OpenAI. عوض کردن مدل یک تغییر پیکربندی است. */
export interface Provider { baseUrl: string; apiKey: string; model: string; source: 'platform' | 'byok' }
export interface ToolDef { type: 'function'; function: { name: string; description: string; parameters: any } }
export interface ChatMessage { role: 'system' | 'user' | 'assistant' | 'tool'; content: string | null; tool_calls?: ToolCall[]; tool_call_id?: string; name?: string }
export interface ToolCall { id: string; type: 'function'; function: { name: string; arguments: string } }

export async function chat(p: Provider, messages: ChatMessage[], tools: ToolDef[], onToken?: (t: string) => void, signal?: AbortSignal): Promise<{ content: string; tool_calls: ToolCall[]; usage?: any }> {
  const res = await fetch(`${p.baseUrl}/chat/completions`, {
    method: 'POST', signal,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${p.apiKey}` },
    body: JSON.stringify({ model: p.model, messages, tools: tools.length ? tools : undefined, tool_choice: tools.length ? 'auto' : undefined, stream: true, temperature: 0.3 }),
  });
  if (!res.ok || !res.body) {
    const txt = await res.text().catch(() => '');
    throw new Error(`مدل پاسخ نداد (${res.status}) ${txt.slice(0, 200)}`);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '', content = '';
  const calls: Record<number, ToolCall> = {};
  let usage: any;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data === '[DONE]') continue;
      let j: any; try { j = JSON.parse(data); } catch { continue; }
      if (j.usage) usage = j.usage;
      const d = j.choices?.[0]?.delta;
      if (!d) continue;
      if (typeof d.content === 'string' && d.content) { content += d.content; onToken?.(d.content); }
      for (const tc of d.tool_calls ?? []) {
        const i = tc.index ?? 0;
        if (!calls[i]) calls[i] = { id: tc.id ?? `call_${i}`, type: 'function', function: { name: '', arguments: '' } };
        if (tc.id) calls[i].id = tc.id;
        if (tc.function?.name) calls[i].function.name += tc.function.name;
        if (tc.function?.arguments) calls[i].function.arguments += tc.function.arguments;
      }
    }
  }
  return { content, tool_calls: Object.values(calls), usage };
}
