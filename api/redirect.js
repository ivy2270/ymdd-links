export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);
  const gasUrl = "https://script.google.com/macros/s/AKfycbxuEjldmTmr6PbpiAdvjSTxaB0ldKJEeatkn0cI_Zc7tkMMyQjWD8ncv3-TY0WbF3fz/exec";

  // 1. 強制過濾：如果是管理 API 請求
  if (url.pathname.includes('/api/manage') || url.searchParams.has("action") || req.method === "POST") {
    let target = gasUrl;
    let options = { 
      method: req.method,
      headers: { "Accept": "application/json" }
    };

    if (req.method === "POST") {
      options.body = await req.text();
      options.headers["Content-Type"] = "application/json";
    } else {
      // 確保將前端傳來的 action, id_token 等參數全部帶上
      const params = url.searchParams.toString();
      target = `${gasUrl}?${params}`;
    }

    const res = await fetch(target, options);
    const data = await res.text();
    return new Response(data, {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  // 2. 轉址邏輯 (排除 API 路徑)
  const slug = url.pathname.split('/').filter(Boolean).pop();
  if (slug && slug !== 'api' && slug !== 'manage') {
    const res = await fetch(`${gasUrl}?slug=${slug}`);
    const data = await res.json();
    if (data.status === "success") {
      return Response.redirect(data.url, 302);
    }
  }

  // 3. 預設回傳 (或導向首頁)
  return new Response("Not Found", { status: 404 });
}
