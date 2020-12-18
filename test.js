const assert = require("assert");
const { expect } = require("chai");

const { Builder, By, Key, until, Capabilities } = require("selenium-webdriver");

// create chrome capabilities
var chromeCapabilities = Capabilities.chrome();

// add the desired options
var chromeOptions = {
  args: ["--test-type", "--incognito", "--disable-gpu"],
};
chromeCapabilities.set("chromeOptions", chromeOptions);

const hostname = "https://zakupka.p8/";
const testCompany =
  "https://zakupka.com/sumy/g/10730846-ooo-eho-shamanih-pesen-mangust/";

describe("Первая попытка тестирования", function () {
  let driver;

  async function clickToLogin(login, password) {
    driver.findElement(By.css(".lnk_login.auth__link")).click();
    await driver.wait(until.urlContains("login"), 3000);

    driver.findElement(By.css("[name='login'] + input")).sendKeys(login);
    await driver.sleep(1 * 1000);
    driver.findElement(By.css("[name='pass']")).sendKeys(password);
    await driver.sleep(1 * 1000);
    driver.findElement(By.css(".btn_login")).click();
  }

  async function autocompleteList(element, sendKeys = "") {
    // скроллим элемент к центру экрана
    driver.executeScript(
      "arguments[0].scrollIntoView({block: 'center'})",
      element
    );
    await driver.sleep(1 * 1000);

    element.sendKeys(sendKeys);
    await driver.sleep(1 * 1000);

    await driver.wait(
      until.elementLocated(By.css(".form__input-autocomplete-item")),
      3000
    );
  }

  beforeEach(async function () {
    driver = new Builder()
      .forBrowser("chrome")
      .withCapabilities(chromeCapabilities)
      .build();

    await driver
      .manage()
      .window()
      .setRect({ x: 0, y: 0, width: 1600, height: 1600 });
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
    await driver.wait(until.urlContains("cabinet"), 5000);
    const browserUrl = await driver.getCurrentUrl();
    //todo сравнить заголовок и найти слово Продавца
    expect(browserUrl).to.include("cabinet");
  });

  it("Неудачная авторизация в кабинет компании", async () => {
    await clickToLogin(
      (login = "testovtest545@gmail.com"),
      (password = "125resrsers")
    );
    await driver.wait(until.elementLocated(By.css(".msg")), 5000);
    const errorMsg = await driver.findElement(By.css(".msg")).getText();
    expect(errorMsg).to.not.be.empty;
  });

  it("Авторизация в кабинет покупателя", async () => {
    await clickToLogin(
      (login = "paul@atreides.dn"),
      (password = "qqqqqqqq")
    );
    await driver.wait(until.urlContains("cabinet"), 5000);
    const browserUrl = await driver.getCurrentUrl();
    //todo сравнить заголовок и найти слово Покупателя
    expect(browserUrl).to.include("cabinet");
  });

  it("Оформление заказа", async () => {
    const targetCity = "Херсон";
    const targetEmail = "test@gmail.com";
    const payment = 'Оплата по реквизитам на расчетный счет';

    await driver.get(testCompany);

    driver
      .findElement(By.css(".lnk.folders__img-wrap"))
      .click();
    await driver.wait(until.urlContains("/t/"), 3000);

    driver.findElement(By.css(".goods__item .btn_buy")).click();
    driver.findElement(By.css(".goods-card .btn_buy")).click();

    await driver.wait(until.elementLocated(By.css(".modal_cart")), 3000);

    const cartFirstSelector = ".modal_cart .cart__one:first-child";

    let disabled =
      (await driver
        .findElement(By.css(`${cartFirstSelector} .btn_cart-checkout`))
        .getAttribute("disabled")) === "true";
    let value = await driver
      .findElement(By.css(`${cartFirstSelector} .form__input`))
      .getAttribute("value");
    let summ = await driver
      .findElement(By.css(`${cartFirstSelector} .cart__product-summ-value`))
      .getText();

    while (disabled == true) {
      driver
        .findElement(By.css(`${cartFirstSelector} .form__input`))
        .sendKeys(Key.HOME, Key.chord(Key.SHIFT, Key.END), parseInt(value) + 1);
      await driver.wait(async function () {
        return (
          summ !==
          (await driver
            .findElement(
              By.css(`${cartFirstSelector} .cart__product-summ-value`)
            )
            .getText())
        );
      }, 5000);

      disabled =
        (await driver
          .findElement(By.css(`${cartFirstSelector} .btn_cart-checkout`))
          .getAttribute("disabled")) === "true";
      value = await driver
        .findElement(By.css(`${cartFirstSelector} .form__input`))
        .getAttribute("value");
      summ = await driver
        .findElement(By.css(`${cartFirstSelector} .cart__product-summ-value`))
        .getText();
    }

    driver
      .findElement(By.css(`${cartFirstSelector} .btn_cart-checkout`))
      .click();
    await driver.wait(until.urlContains("/cart/"), 3000);

    // оплата
    // выбираем элемент по тексту и кликаем на второго родителя
    const paymentElementLabel = await driver.findElement(
      By.xpath(
        `//*[contains(text(), '${payment}')]`
      )
    );
    paymentElementLabel.findElement(By.xpath("./../..")).click();

    // доставка
    const deliveryElementId = await driver
      .findElement(By.css('[name="delivery"][value="novaya_pochta"]'))
      .getAttribute("id");
    driver.findElement(By.css(`[for="${deliveryElementId}"]`)).click();

    // новая почта
    const npCityElement = driver.findElement(By.css("[name=npCityId] + input"));
    await autocompleteList(npCityElement, targetCity);
    driver
      .findElement(
        By.xpath(
          `//*[@class='form__input-autocomplete-item'][contains(text(), ${Buffer.from(
            targetCity,
            "utf-8"
          )})]`
        )
      )
      .click();

    const npWarehouse = driver.findElement(
      By.css("[name=npWarehouseId] + input")
    );
    await autocompleteList(npWarehouse);
    driver
      .findElement(By.xpath(`//*[@class='form__input-autocomplete-item']`))
      .click();

    // email является автозаполнением, но пока просто вводим значение
    driver.findElement(By.css("[name='email'] + input")).sendKeys(targetEmail);

    driver.findElement(By.css("[name='phone']")).sendKeys("123456789");
    driver
      .findElement(By.css("[name='lastname']"))
      .sendKeys("Константинопольский");
    driver.findElement(By.css("[name='name']")).sendKeys("Константин");

    // подтверждаем заказ
    driver.findElement(By.css(".btn_form")).click();
    await driver.sleep(1 * 1000);

    // успех, если перешли на страницу благодарности
    await driver.wait(until.urlContains("cart/order/"), 5000);
    const browserUrl = await driver.getCurrentUrl();
    expect(browserUrl).to.include("cart/order/");
  });
});
