const fs = require("fs");
const puppeteer = require("puppeteer");
const jsonData = require("./home-funising/침실.json");

const productData = [];
async function getSummary(page) {
  return await page.evaluate(() => {
    const summaryTag = document.querySelector(
      ".range-revamp-header-section__description-text"
    );
    return summaryTag ? summaryTag.innerHTML : "";
  });
}
async function getSize(page) {
  return await page.evaluate(() => {
    const sizeTag = document.querySelector(
      ".range-revamp-header-section__description-measurement"
    );
    return sizeTag ? sizeTag.innerHTML : "";
  });
}
async function getTitle(page) {
  return await page.evaluate(() => {
    const titleTag = document.querySelector(
      ".range-revamp-header-section__title--big"
    );
    return titleTag ? titleTag.innerHTML : "";
  });
}
async function getPrice(page) {
  return await page.evaluate(() => {
    const result = document.querySelectorAll(".range-revamp-price__integer")[0]
      .innerHTML;
    return result ? parseInt(result.replace(",", "")) : 0;
  });
}
async function getInfo(page) {
  return await page.evaluate(() => {
    const infoTag = document.querySelector(
      ".range-revamp-product-summary__description"
    );
    return infoTag ? infoTag.innerHTML : "";
  });
}
async function getBigCate(page) {
  return await page.evaluate(() => {
    const bcTag = document.querySelector(
      "#content > div > div.range-revamp-page-container__inner > div > div:nth-child(1) > div > nav > ol > li:nth-child(2) > a > span"
    );
    return bcTag ? bcTag.innerHTML : "";
  });
}

async function getSmallCate(page) {
  return await page.evaluate(() => {
    const scTag = document.querySelector(
      "#content > div > div.range-revamp-page-container__inner > div > div:nth-child(1) > div > nav > ol > li:nth-child(3) > a > span"
    );
    return scTag ? scTag.innerHTML : "";
  });
}
async function getImages(page) {
  return await page.evaluate(() => {
    const arr = [];
    const container = document.querySelector(".range-revamp-media-grid__grid ");
    const imgBox = container.querySelectorAll(
      ".range-revamp-aspect-ratio-image__image"
    );
    imgBox.forEach((v) => {
      const imgData = {
        name: v.alt,
        srcset: v.srcset,
        sizes: v.sizes,
        src: v.src,
      };
      arr.push(imgData);
    });
    return arr;
  });
}
async function run(page, data) {
  const valid = productData.find(v=>v.product_id === data.shortId)
  if(valid)return;
  await page.goto(data.link, {
    waitUntil: "domcontentloaded",
  });
  await page.setViewport({
    width: 1200,
    height: 800,
  });
  await page.waitForSelector(".range-revamp-header-section__description-text");
  const title = await getTitle(page);
  const summary = await getSummary(page);
  const size = await getSize(page);
  const price = await getPrice(page);
  const images = await getImages(page);
  const info = await getInfo(page);
  const bigCate = await getBigCate(page);
  const smallCate = await getSmallCate(page);
  const product_id = data.shortId;

  await productData.push({
    title,
    price,
    summary,
    size,
    bigCate,
    smallCate,
    info,
    images,
    product_id
  });
  console.log(`${data.shortId}상품 끝`);
  console.log(`현재까지 ${productData.length} 개 완료~~!`);
}

function delay() {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

async function getData() {
  const browser = await puppeteer.launch({headless: false});

  const page = await browser.newPage();
  for (let i = 0; i < jsonData.length; i++) {
    for (let j = 0; j < jsonData[i].dotData.length; j++) {
      await run(page, jsonData[i].dotData[j]);
      await delay();
    }
  }
  //   jsonData.forEach(async (v) => {
  //     await v.dotData.forEach(async (dot) => {
  //       await run(dot); //크롤링함수
  //       await delay();
  //     });
  //   });
  await browser.close();

  const path = "침실 상품.json";
  fs.writeFileSync(path, JSON.stringify(productData));
}
getData();
