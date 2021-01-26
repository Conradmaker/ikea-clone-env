const fs = require("fs");
const puppeteer = require("puppeteer");

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
          ).length > 100
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

function makeCateName(cateIndex) {
  switch (cateIndex) {
    case 0:
      return "침실";
    case 1:
      return "거실";
    case 2:
      return "주방";
    case 3:
      return "홈오피스";
    case 4:
      return "아웃도어";
    case 5:
      return "욕실";
    case 6:
      return "어린이 IKEA";
    case 7:
      return "다이닝";
    case 8:
      return "현관";
    case 9:
      return "소품";
    default:
      throw new Error("unhandled categoryType");
  }
}

async function run(cateIndex = 0) {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  // 웹사이트 로딩
  await page.goto("https://www.ikea.com/kr/ko/?rooms=accessories", {
    timeout: 000,
    waitUntil: "domcontentloaded",
  });
  await page.setViewport({
    width: 1200,
    height: 800,
  });

  await autoScroll(page);
  //   await page.waitForSelector(
  //     ".ofeed-filter__container .ofeed-filter-bar button"
  //   );
  //   await clickCate(page, cateIndex);

  await page.waitForSelector(".ofeed-organic-feed__button-wrapper button");
  await autoClick(page);
  await page.waitForSelector(
    ".ofeed-intersection-area .ofeed-thumbnail-grid__item img"
  );

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
      const dot = div.querySelectorAll(".ofeed-shoppable-image__area");
      const imgData = {
        name: img.alt,
        src: img.src,
        srcset: img.srcset,
        sizes: img.sizes,
      };
      const dotData = [];
      dot.forEach((v) => {
        const link = v.querySelector(".ofeed-shoppable-image__dot").href;
        const position = {top: v.style.top, left: v.style.left};
        const fullId = link.split("/")[6];
        const computed = fullId.split("-");
        const shortId = computed[computed.length - 1];

        dotData.push({link, position, fullId, shortId});
      });

      return {
        imgData,
        link: divLink,
        dotData,
        categoryId: 9,
        cateName: "소품",
      };
    });
  });
  //상단 테이블의 th 제목을 가져오고 싶은경우
  console.log(arr.length);
  const path = "소품.json";
  fs.writeFileSync(path, JSON.stringify(arr));
  // 브라우저 닫기
  await browser.close();
}

// async function clickCate(page, i) {
//   console.log("카테고리 선택중..");
//   console.log("index:", i);
//   await page.evaluate(async () => {
//     await new Promise((resolve, reject) => {
//       const btnArr = document.querySelectorAll(
//         ".ofeed-filter__container .ofeed-filter-bar button"
//       );
//       console.log(btnArr[i].querySelector(".ofeed-btn__label").innerText);
//       btnArr[i].click();

//       resolve();
//     });
//   });
// }

// async function init() {
//   for (let i = 0; i < 10; i++) {
//     await run(i);
//   }
// }
// init();
run();
