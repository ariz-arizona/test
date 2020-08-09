const assert = require("assert");
const { expect } = require("chai");

const { Builder, By, Key, until } = require("selenium-webdriver");
var webdriver = require("selenium-webdriver");

// create chrome capabilities
var chromeCapabilities = webdriver.Capabilities.chrome();

// add the desired options
var chromeOptions = { 'args': ['--test-type', '--incognito'] };
chromeCapabilities.set('chromeOptions', chromeOptions);

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
    driver = new webdriver.Builder().forBrowser("chrome").withCapabilities(chromeCapabilities).build();
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

  it("Авторизация в кабинет покупателя", async () => {
    await clickToLogin(
      (login = "paul@atreides.dn"), 
      (password = "qqqqqqqq")
    );
    await driver.wait(webdriver.until.urlContains("cabinet"), 5000);
    const browserUrl = await driver.getCurrentUrl();
    expect(browserUrl).to.include("cabinet");
  });

  it("Оформление заказа", async () => {
    driver.findElement(By.css(".lnk.folders__img-wrap")).click();
    await driver.wait(until.urlContains('/t/'), 3000);

    driver.findElement(By.css('.goods__item .btn_buy')).click();
    await driver.wait(webdriver.until.elementLocated(webdriver.By.css(".msg-product")), 3000);

    driver.findElement(By.css('.msg-product .btn_msg-to-cart')).click();
    await driver.wait(webdriver.until.elementLocated(webdriver.By.css(".modal_cart")), 3000);

    const cartFirstSelector = '.modal_cart .cart__one:first-child';

    let disabled = await driver.findElement(By.css(`${cartFirstSelector} .btn_cart-checkout`)).getAttribute('disabled');
    let value = await driver.findElement(By.css(`${cartFirstSelector} .form__input`)).getAttribute('value');
    let summ = await driver.findElement(By.css(`${cartFirstSelector} .cart__product-summ-value`)).getText();
    if (disabled) {
      do {
        let newValue = parseInt(value) + 1;
        driver.findElement(By.css(`${cartFirstSelector} .form__input`)).sendKeys(newValue);
        value = await driver.findElement(By.css(`${cartFirstSelector} .form__input`)).getAttribute('value');
        await driver.wait(async function () {
          return (summ !== await driver.findElement(By.css(`${cartFirstSelector} .cart__product-summ-value`)).getText());
        }, 5000);
        disabled = await driver.findElement(By.css('.modal_cart .cart__one:first-child .btn_cart-checkout')).getAttribute('disabled');
      } while (disabled === true)
    }

    driver.findElement(By.css(`${cartFirstSelector} .btn_cart-checkout`)).click();
    await driver.wait(until.urlContains('/cart/'), 3000);

    let novayPochta = await driver.findElement(By.css('[name="delivery"][value="novaya_pochta"]')).getAttribute('id');
    driver.findElement(By.css(`[for="${novayPochta}"]`)).click();
    driver.findElement(By.css('[placeholder="Город доставки"]')).sendKeys('Х');
    driver.findElement(By.css('[placeholder="Город доставки"]')).sendKeys('е');
    driver.findElement(By.css('[placeholder="Город доставки"]')).sendKeys('р');
    driver.findElement(By.css('[placeholder="Город доставки"]')).click();
    await driver.wait(webdriver.until.elementLocated(webdriver.By.css(".form__input-autocomplete-item")), 5000);
    driver.findElement(By.xpath('//div.form__input-autocomplete-item[text()="Херсон"]')).click();
  })
});
