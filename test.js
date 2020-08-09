const assert = require('assert');
const { expect } = require('chai');

const { Builder, By, Key, until } = require('selenium-webdriver');
var webdriver = require('selenium-webdriver');

const hostname = 'https://zakupka.p8/';

describe('Первая попытка тестирования', function () {
  const driver = new webdriver.Builder().forBrowser('chrome').build();
  driver.manage().window().maximize();

  async function clickToLogin(login, password) {
    driver.findElement(By.css('.lnk_login.auth__link')).click();
    await driver.wait(webdriver.until.elementLocated(webdriver.By.name("login")), 3000);

    driver.findElement(By.name('login')).sendKeys(login);
    driver.findElement(By.name('pass')).sendKeys(password);
    driver.findElement(By.css('.btn_login')).click();
  }

  it('Авторизация в кабинет компании', async () => {
    // const login = 'testovtest545@gmail.com';
    // const password = '125resrsers';
    // const login = 'aslan@narnia.com';
    // const password = 'qqqqqqqq';

    await driver.get(hostname);

    await clickToLogin((login = "aslan@narnia.com"), (password = "qqqqqqqq"));
    
    await driver.wait(webdriver.until.urlContains('cabinet'), 3000);

    // todo негативное поведение
    const browserUrl = await driver.getCurrentUrl();
    expect(browserUrl).to.include('cabinet');
  });
});