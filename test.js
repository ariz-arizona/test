const assert = require("assert");
const { expect } = require("chai");

const { Builder, By, Key, until } = require("selenium-webdriver");
var webdriver = require("selenium-webdriver");

const hostname = "https://zakupka.p8/";

describe("Первая попытка тестирования", function () {
  let driver;

  async function clickToLogin(login, password) {
    driver.findElement(By.css(".lnk_login.auth__link")).click();
    await driver.wait(until.urlContains('login'), 3000);

    driver.findElement(By.name("login")).sendKeys(login);
    driver.findElement(By.name("pass")).sendKeys(password);
    driver.findElement(By.css(".btn_login")).click();
  }

  beforeEach(async function () {
    driver = new webdriver.Builder().forBrowser("chrome").build();
    driver.manage().window().maximize();
    await driver.get(hostname);
  });

  afterEach(function () {
    driver.close();
  });

  it("Авторизация в кабинет компании", async () => {
    await clickToLogin(
      (login = "aslan@narnia.com"), 
      (password = "qqqqqqqq")
    );
    await driver.wait(webdriver.until.urlContains("cabinet"), 5000);
    const browserUrl = await driver.getCurrentUrl();
    expect(browserUrl).to.include("cabinet");
  });

  it("Неудачная авторизация в кабинет компании", async () => {
    await clickToLogin(
      (login = "testovtest545@gmail.com"),
      (password = "125resrsers")
    );
    await driver.wait(webdriver.until.elementLocated(webdriver.By.css(".msg")), 5000);
    const errorMsg = await driver.findElement(By.css(".msg")).getText();
    expect(errorMsg).to.not.be.empty;
  });
});
