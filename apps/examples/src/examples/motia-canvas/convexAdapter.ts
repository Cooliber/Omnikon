// Prosty adapter Convex: w prawdziwej aplikacji użyj klienta Convex.
// Tutaj korzystamy z fetch do przykładowych endpointów HTTP skonfigurowanych przez użytkownika.
// Zmienne środowiskowe Vite:
// - VITE_CONVEX_HTTP_URL (np. https://your-deployment.convex.site/api)
// - VITE_CONVEX_FORM_ENDPOINT (np. /forms/submit)
// - VITE_CONVEX_SHAPES_ENDPOINT (np. /shapes/save)

const BASE = (import.meta as any).env?.VITE_CONVEX_HTTP_URL as string | undefined
const FORM_EP = (import.meta as any).env?.VITE_CONVEX_FORM_ENDPOINT as string | undefined
const SHAPE_EP = (import.meta as any).env?.VITE_CONVEX_SHAPES_ENDPOINT as string | undefined

async function post(path: string, body: any) {
  if (!BASE) {
    console.warn('Convex BASE URL nie ustawiony (VITE_CONVEX_HTTP_URL)')
    return { ok: false, message: 'Brak konfiguracji Convex (demo)' }
  }
  const url = BASE.replace(/\/$/, '') + (path.startsWith('/') ? path : '/' + path)
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  let json: any = undefined
  try { json = JSON.parse(text) } catch {}
  return { ok: res.ok, status: res.status, json, text }
}

export async function saveFormData(payload: any) {
  const path = FORM_EP ?? '/forms/submit'
  return post(path, payload)
}

export async function saveShape(payload: any) {
  const path = SHAPE_EP ?? '/shapes/save'
  return post(path, payload)
}
