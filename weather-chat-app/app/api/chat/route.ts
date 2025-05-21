import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { getWeatherInfo } from '../../../lib/weather'; // Adjusted path

export async function POST(req: NextRequest) {
  try {
    // 1. APIキーのチェックとGeminiクライアントの初期化
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Error: GOOGLE_GEMINI_API_KEY is not set.');
      return NextResponse.json({ error: 'API key not configured. Please set GOOGLE_GEMINI_API_KEY.' }, { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest', // Or another suitable model
      // Adjust safety settings as needed, or remove if defaults are acceptable
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ]
    });

    // 2. リクエストボディからユーザーメッセージを取得
    const body = await req.json();
    const userMessage = body.message;

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json({ error: 'Invalid message format. "message" string is required.' }, { status: 400 });
    }
    console.log('Received message:', userMessage);

    // 3. 天気情報の取得 (ユーザーメッセージ全体を場所として扱う)
    let weatherInfo: string;
    try {
      // For now, assume userMessage is the location.
      // In a real app, you'd parse the location from userMessage.
      const location = userMessage; // Simplified assumption
      weatherInfo = await getWeatherInfo(location);
      console.log('Weather info received:', weatherInfo);
      if (weatherInfo.includes("失敗しました")) { // Check if getWeatherInfo returned an error message
        // Optionally, return a specific error or try to proceed without weather info
        // For now, we'll proceed but log it. The LLM might handle the error string.
        console.warn(`getWeatherInfo indicated an error: ${weatherInfo}`);
      }
    } catch (error) {
      console.error('Error getting weather info:', error);
      // Decide if you want to fail the request or proceed without weather info
      // For now, let's try to proceed, the LLM might be able to respond based on the user message alone
      // or inform the user that weather data couldn't be retrieved.
      weatherInfo = "天気情報の取得に失敗しました。"; // Fallback weather info
    }

    // 4. プロンプトの作成
    const prompt = `ユーザーは「${userMessage}」と尋ねています。現在の天気は「${weatherInfo}」です。この情報を元に、ユーザーへのフレンドリーな応答を生成してください。天気情報が取得失敗となっている場合は、その旨を伝え、一般的な応答を試みてください。`;
    console.log('Generated prompt for Gemini:', prompt);

    // 5. Gemini API との通信
    let agentResponse: string;
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      agentResponse = response.text();
      if (!agentResponse) {
        // Fallback if response.text() is empty or undefined
        console.warn('Gemini API returned an empty text response.');
        // Check for blocked prompt or other issues
        if (response.promptFeedback?.blockReason) {
            agentResponse = `コンテンツ生成がブロックされました。理由: ${response.promptFeedback.blockReason}`;
        } else {
            agentResponse = "申し訳ありませんが、応答を生成できませんでした。";
        }
      }
      console.log('Response from Gemini:', agentResponse);
    } catch (error) {
      console.error('Error generating content with Gemini API:', error);
      // Check if the error is an instance of Error to access message property
      const errorMessage = error instanceof Error ? error.message : String(error);
      return NextResponse.json({ error: `Gemini API communication failed: ${errorMessage}` }, { status: 500 });
    }

    // 6. 応答の返却
    return NextResponse.json({ reply: agentResponse });

  } catch (error) {
    console.error('General error in chat API:', error);
    // Check if the error is an instance of Error to access message property
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    // Avoid sending sensitive error details to the client in a production environment
    // For debugging, this is fine.
    return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}
