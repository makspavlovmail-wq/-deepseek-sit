
export default async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { message } = await request.json();

    if (typeof message !== "string" || !message.trim()) {
      return Response.json({ error: "Введите вопрос" }, { status: 400 });
    }

    if (message.length > 4000) {
      return Response.json({ error: "Слишком длинный вопрос" }, { status: 400 });
    }

    const key = process.env.DEEPSEEK_API_KEY;

    if (!key) {
      return Response.json({ error: "API-ключ не настроен" }, { status: 500 });
    }

    const r = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-flash",
        messages: [{ role: "user", content: message }],
        max_tokens: 1000
      })
    });

    const data = await r.json();

    if (!r.ok) {
      return Response.json(
        { error: r.status === 402
          ? "Недостаточно средств на балансе DeepSeek API"
          : "Ошибка DeepSeek API: " + r.status },
        { status: 502 }
      );
    }

    return Response.json({
      reply: data.choices?.[0]?.message?.content ?? "Нет ответа"
    });
  } catch {
    return Response.json({ error: "Не удалось обработать запрос" }, { status: 500 });
  }
};
