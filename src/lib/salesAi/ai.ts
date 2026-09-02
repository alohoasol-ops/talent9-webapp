// Anthropic(Claude) API を使った文章生成の薄いラッパー。
// ANTHROPIC_API_KEY が未設定、またはAPI呼び出しに失敗した場合は必ず null を返す。
// 呼び出し側は null のときルールベース(./scoring.ts)の結果にフォールバックすること。
// → APIキーがない環境でもMVPが完全にローカルで動作することを保証するための設計。

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

async function callClaude(system: string, user: string, maxTokens = 1024): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.content?.[0]?.text;
    return typeof text === "string" && text.trim() ? text.trim() : null;
  } catch {
    return null;
  }
}

function tryParseJson<T>(text: string): T | null {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : text) as T;
  } catch {
    return null;
  }
}

const DIAGNOSIS_SYSTEM =
  "あなたは中小企業の営業・マーケティング診断を行うコンサルタントです。専門用語を避け、経営者にも分かる平易な日本語で、断定的かつ簡潔に回答してください。";

export async function enhanceBottleneckSummary(
  profileSummary: string,
  ruleBasedSummary: string
): Promise<string> {
  const text = await callClaude(
    DIAGNOSIS_SYSTEM,
    `以下は、ある中小企業の営業・集客状況の要約と、ルールベースで算出したボトルネック診断です。\n\n【企業状況】\n${profileSummary}\n\n【ルールベース診断】\n${ruleBasedSummary}\n\nこの診断結果を踏まえ、「御社の最大のボトルネックは○○です」という一文から始まる2〜3文の診断コメントを、経営者向けに書き直してください。数値や事実と矛盾する内容は書かないでください。本文のみ出力してください。`
  );
  return text || ruleBasedSummary;
}

export async function enhanceIcpReasoning(profileSummary: string, ruleBasedReasoning: string): Promise<string> {
  const text = await callClaude(
    DIAGNOSIS_SYSTEM,
    `以下は、ある中小企業の情報と、ルールベースで作成した理想顧客像(ICP)の適合理由です。\n\n【企業情報】\n${profileSummary}\n\n【ルールベースの適合理由】\n${ruleBasedReasoning}\n\nこの内容を踏まえ、「なぜこの企業が見込み客なのか」を2〜3文で、経営者にも分かる言葉で説明し直してください。本文のみ出力してください。`
  );
  return text || ruleBasedReasoning;
}

export async function enhanceLeadReason(leadSummary: string, ruleBasedReason: string): Promise<string> {
  const text = await callClaude(
    DIAGNOSIS_SYSTEM,
    `以下は、ある見込み企業(リード)の情報と、ルールベースで算出した見込み度の根拠です。\n\n【リード情報】\n${leadSummary}\n\n【ルールベースの根拠(箇条書き)】\n${ruleBasedReason}\n\nこの根拠を、"AならばB、BならばC"という因果の連鎖が伝わる3〜5行の箇条書きに整えてください。事実にない情報を付け加えないでください。箇条書きのみ出力してください。`
  );
  return text || ruleBasedReason;
}

interface ApproachTextsJson {
  email_subject: string;
  email_body: string;
  form_message: string;
  phone_script: string;
  first_meeting_script: string;
}

export async function enhanceApproachTexts(
  context: string,
  ruleBased: {
    emailSubject: string;
    emailBody: string;
    formMessage: string;
    phoneScript: string;
    firstMeetingScript: string;
  }
): Promise<typeof ruleBased> {
  const text = await callClaude(
    "あなたはBtoB営業のアプローチ文を作成するプロのコピーライターです。丁寧で誠実な日本語のビジネス文書を作成してください。誇張や虚偽の実績は書かないでください。",
    `以下の情報をもとに、見込み企業へのアプローチ文一式をJSON形式で作成してください。\n\n${context}\n\n出力は以下のキーを持つJSONオブジェクトのみとしてください(説明文やコードブロックは不要):\n{"email_subject": "メール件名", "email_body": "メール本文", "form_message": "問い合わせフォーム用の短い文章", "phone_script": "電話トークの冒頭スクリプト", "first_meeting_script": "初回商談冒頭トークスクリプト"}`,
    1500
  );

  if (!text) return ruleBased;
  const parsed = tryParseJson<ApproachTextsJson>(text);
  if (!parsed) return ruleBased;

  return {
    emailSubject: parsed.email_subject || ruleBased.emailSubject,
    emailBody: parsed.email_body || ruleBased.emailBody,
    formMessage: parsed.form_message || ruleBased.formMessage,
    phoneScript: parsed.phone_script || ruleBased.phoneScript,
    firstMeetingScript: parsed.first_meeting_script || ruleBased.firstMeetingScript,
  };
}

export function isAiConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}
