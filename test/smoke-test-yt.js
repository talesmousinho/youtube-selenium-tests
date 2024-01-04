import { Builder, By, until } from 'selenium-webdriver'
import { expect, assert } from 'chai'
import { describe, it, before, after } from 'mocha'

describe('YouTube Smoke Tests', () => {
  let driver

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build()
  })

  after(async () => {
    await driver.quit()
  })

  it('should load the homepage and assert the title', async () => {
    await driver.get('https://www.youtube.com')
    const title = await driver.getTitle()
    expect(title).to.equal('YouTube')
  })

  it('should load the consent dialog and click the "Accept all" button', async function () {
    // Wait and find the dialog
    const dialog = await driver.wait(until.elementLocated(By.xpath('//ytd-consent-bump-v2-lightbox/tp-yt-paper-dialog/div[@id="content"]')), 1000)

    // Check if the dialog is displayed
    const isDisplayed = await dialog.isDisplayed()
    assert.strictEqual(isDisplayed, true, 'Consent dialog should be displayed')

    // Find and click the "Accept all" button
    const acceptButton = await dialog.findElement(By.xpath('.//span[contains(text(), "Accept all")]/ancestor::button'))
    await acceptButton.click()

    // Wait for the dialog to disappear
    await driver.wait(until.stalenessOf(dialog), 1000, 'Consent dialog should disappear')
  })

  it('should search for a video', async () => {
    // Find the seach box
    const searchBox = await driver.findElement(By.xpath('//ytd-searchbox'))
    // Find the search input
    const searchInput = await searchBox.findElement(By.xpath('.//input'))
    // Type "selenium" into the search input
    await searchInput.sendKeys('selenium')
    // Click search button
    const searchButton = await searchBox.findElement(By.xpath(".//button[@id='search-icon-legacy']"))
    await searchButton.click()

    // Wait for the search results to load
    await driver.wait(
      until.elementLocated(By.xpath("//ytd-search//ytd-section-list-renderer/div[@id='contents' and .//ytd-video-renderer]")),
      10000,
      'Search results should be displayed'
    )
  })

  it('should load the first video from the search results', async () => {
    // Find the search results
    const searchResults = await driver.findElement(By.xpath("//ytd-search//ytd-section-list-renderer/div[@id='contents' and .//ytd-video-renderer]"))

    // Find the first video in the search results
    const firstVideo = await searchResults.findElement(By.xpath(".//a[@id='video-title'][1]"))
    await firstVideo.click()

    // Wait for the video to load
    await driver.wait(until.elementLocated(By.css('.html5-video-container')), 1000, 'Video should be displayed')
  })
})
