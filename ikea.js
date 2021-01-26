const fs = require("fs");
const puppeteer = require("puppeteer");

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  // 웹사이트 로딩
  await page.goto("https://www.ikea.com/kr/ko/", {
    timeout: 000,
    waitUntil: "domcontentloaded",
  });
  await page.setViewport({
    width: 1200,
    height: 800,
  });

  await autoScroll(page);
  await page.waitForSelector(".ofeed-organic-feed__button-wrapper button");
  console.log("버튼떴다");
  //await page.click(".ofeed-organic-feed__button-wrapper button");
  await autoClick(page);
  await page.waitForSelector(
    ".ofeed-intersection-area .ofeed-thumbnail-grid__item img"
  );
  console.log(1);

  await page.$eval(
    ".ofeed-intersection-area .ofeed-thumbnail-grid__item img",
    (th) => console.log(th)
  );

  const arr = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(
        ".ofeed-intersection-area .ofeed-thumbnail-grid__item"
      )
    ).map((div) => {
      const divLink = div.querySelector(".ofeed-shoppable-image__category-link")
        .href;
      const img = div.querySelector("img");
      const imgData = {
        name: img.alt,
        src: img.src,
        srcset: img.srcset,
        sizes: img.sizes,
      };

      return {imgData, link: divLink};
    }); // h3태그 의 text 가져옴 });
  });
  //상단 테이블의 th 제목을 가져오고 싶은경우
  console.log(arr.length);
  const path = "123.json";
  fs.writeFileSync(path, JSON.stringify(arr));
  // 브라우저 닫기
  await browser.close();
}

run();

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function autoClick(page) {
  console.log("버튼클릭 1단계");
  await page.evaluate(async () => {
    console.log("버튼클릭 2단계");
    await new Promise((resolve, reject) => {
      console.log("버튼클릭 3단계");
      var timer = setInterval(() => {
        console.log("인터벌 시작");
        if (
          document.querySelectorAll(
            ".ofeed-intersection-area .ofeed-thumbnail-grid__item"
          ).length > 200
        ) {
          console.log(
            document.querySelectorAll(
              ".ofeed-intersection-area .ofeed-thumbnail-grid__item"
            ).length
          );
          clearInterval(timer);
          resolve();
        }
        document
          .querySelector(".ofeed-organic-feed__button-wrapper button")
          .click();
      }, 1000);
    });
  });
}
