const fetch = require('node-fetch');

const URL1 = 'https://www.adobe.com';
const URL2 = 'https://www.adobe.com?useAlternateImsDomain=true';
const PSI_API =
  'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=';
const ITERATIONS = 100;

async function getPSIScore(url) {
  const response = await fetch(`${PSI_API}${encodeURIComponent(url)}`);
  const data = await response.json();
  return data.lighthouseResult.categories.performance.score;
}

async function getAveragePSIScore(url) {
  let iterations = ITERATIONS;
  let totalScore = 0;
  for (let i = 0; i < ITERATIONS; i++) {
    try {
      totalScore += await getPSIScore(url);
    } catch (error) {
      console.log(error);
      iterations--;
    }
  }
  return totalScore / iterations;
}

async function compareSites() {
  const [averageScore1, averageScore2] = await Promise.all([
    getAveragePSIScore(URL1),
    getAveragePSIScore(URL2),
  ]);

  console.log(`Average PSI score for ${URL1}: ${averageScore1}`);
  console.log(`Average PSI score for ${URL2}: ${averageScore2}`);
}

compareSites();
