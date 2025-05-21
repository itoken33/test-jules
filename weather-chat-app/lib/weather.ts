import { chromium, Browser, Page } from 'playwright';

/**
 * 指定された場所の天気情報を取得します。
 * このバージョンでは、Playwright の基本的なセットアップを示し、ダミーの天気情報を返します。
 * @param location 天気情報を取得する場所 (例: "東京")
 * @returns 天気情報文字列 (ダミー)
 */
export async function getWeatherInfo(location: string): Promise<string> {
  console.log(`getWeatherInfo called for: ${location}`);
  // let browser: Browser | null = null; // browser 変数を try の外で宣言

  try {
    // 実際のブラウザ操作はまだ実装しないため、以下の行はコメントアウトまたは削除します。
    // console.log('Launching browser...');
    // browser = await chromium.launch();
    // const page: Page = await browser.newPage();
    // console.log('Navigating to weather site...');
    // await page.goto('https://www.tenki.jp/'); // 例としてのURL

    // ダミーの天気情報を生成
    const dummyWeatherInfo = `${location}の天気は晴れ、気温は25度です。 (ダミー情報)`;
    console.log(`Returning dummy weather info: ${dummyWeatherInfo}`);

    return dummyWeatherInfo;
  } catch (error) {
    console.error('Error getting weather info:', error);
    // エラーオブジェクトがmessageプロパティを持つか確認
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `${location}の天気情報の取得に失敗しました。エラー: ${errorMessage}`;
  } finally {
    // 実際のブラウザ操作がないため、閉じる処理もコメントアウトまたは削除
    // if (browser) {
    //   console.log('Closing browser...');
    //   await browser.close();
    // }
  }
}

// ローカルでのテスト用 (本番コードでは不要)
// (async () => {
//   if (require.main === module) {
//     const tokyoWeather = await getWeatherInfo('東京');
//     console.log(tokyoWeather);
//     const osakaWeather = await getWeatherInfo('大阪');
//     console.log(osakaWeather);
//   }
// })();
