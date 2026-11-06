import { chromium, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const baseUrl = process.env.TEST_URL || 'http://127.0.0.1:5186'
const failures = []
const checks = []
const auditResults = []
let server
let browser
const sleep = (ms) => new Promise((done) => setTimeout(done, ms))

async function check(name, action) {
  try {
    await action()
    checks.push({ name, passed: true })
    console.log(`✓ ${name}`)
  } catch (error) {
    checks.push({ name, passed: false, error: error.message })
    failures.push(error)
    console.error(`✗ ${name}: ${error.message}`)
    for (const context of browser?.contexts() || []) {
      for (const page of context.pages()) {
        if (await page.locator('dialog[open]').count())
          await page.keyboard.press('Escape')
      }
    }
  }
}

async function revealAll(page) {
  for (const section of [
    '#projects',
    '#journey',
    '#honors',
    '#about',
    '#contact',
  ]) {
    await page.locator(section).scrollIntoViewIfNeeded()
    await page.waitForTimeout(150)
  }
  await page.waitForTimeout(900)
}

async function audit(page, name) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  auditResults.push({ name, violations: results.violations })
  assert.deepEqual(
    results.violations.map((item) => ({
      id: item.id,
      impact: item.impact,
      nodes: item.nodes.map((node) => node.target),
    })),
    [],
  )
}

try {
  await mkdir(resolve(root, 'artifacts'), { recursive: true })
  if (!process.env.TEST_URL) {
    server = spawn(
      process.execPath,
      [
        resolve(root, 'node_modules/vite/bin/vite.js'),
        'preview',
        '--host',
        '127.0.0.1',
        '--port',
        '5186',
        '--strictPort',
      ],
      { cwd: root, stdio: 'ignore', windowsHide: true },
    )
    for (let attempt = 0; attempt < 70; attempt++) {
      try {
        const response = await fetch(baseUrl)
        if (response.ok) break
      } catch {
        /* Wait for the local server. */
      }
      if (attempt === 69) throw new Error('Preview server failed to start')
      await sleep(150)
    }
  }
  const channels = process.env.BROWSER_CHANNEL
    ? [process.env.BROWSER_CHANNEL]
    : ['msedge', 'chrome', undefined]
  for (const channel of channels) {
    try {
      browser = await chromium.launch({
        headless: true,
        ...(channel ? { channel } : {}),
      })
      break
    } catch (error) {
      if (channel === channels.at(-1)) throw error
    }
  }
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    permissions: ['clipboard-read', 'clipboard-write'],
  })
  const page = await context.newPage()
  page.setDefaultTimeout(7000)
  const errors = []
  const requestFailures = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('response', (response) => {
    if (response.status() >= 400)
      requestFailures.push(`${response.status()} ${response.url()}`)
  })
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1100)

  await check('个人信息、6 张项目卡片与 6 条示例经历正确呈现', async () => {
    await expect(page).toHaveTitle(/林予星/)
    await expect(page.locator('.project-card')).toHaveCount(6)
    await expect(page.locator('.timeline-item')).toHaveCount(6)
    await expect(page.locator('.project-demo-badge')).toHaveText(
      Array(6).fill('CONCEPT DEMO'),
    )
    assert.ok(
      await page.evaluate(() =>
        document.fonts.check('600 24px "Noto Sans SC"'),
      ),
    )
    assert.ok(
      await page.evaluate(() => document.fonts.check('500 24px Manrope')),
    )
  })
  await page.screenshot({ path: resolve(root, 'artifacts/desktop-hero.png') })

  await check('线框球体在桌面持续绘制、响应指针', async () => {
    const before = await page
      .locator('canvas')
      .evaluate((canvas) => canvas.toDataURL())
    await page.locator('.sphere-scene').hover({ position: { x: 90, y: 150 } })
    await page.waitForTimeout(250)
    const after = await page
      .locator('canvas')
      .evaluate((canvas) => canvas.toDataURL())
    assert.notEqual(before, after)
  })

  await check('项目三种分类均显示 2 张，切回全部恢复 6 张', async () => {
    for (const label of ['Web 应用', '开发工具', '创意实验']) {
      await page.getByRole('button', { name: new RegExp(`^${label}`) }).click()
      await expect(page.locator('.project-card')).toHaveCount(2)
    }
    await page.getByRole('button', { name: /^全部作品/ }).click()
    await expect(page.locator('.project-card')).toHaveCount(6)
  })

  await check('鼠标倾斜与离开复位正常', async () => {
    const card = page.locator('.project-card').first()
    await card.scrollIntoViewIfNeeded()
    await card.hover({ position: { x: 35, y: 60 } })
    await page.waitForTimeout(120)
    const value = await card.evaluate((element) =>
      element.style.getPropertyValue('--rotate-y'),
    )
    assert.notEqual(value, '')
    assert.notEqual(value, '0deg')
    await page.mouse.move(5, 100)
    await page.waitForTimeout(100)
    assert.equal(
      await card.evaluate((element) =>
        element.style.getPropertyValue('--rotate-y'),
      ),
      '0deg',
    )
  })

  await check('项目弹窗、Demo 声明、焦点锁定与 Escape 还原焦点', async () => {
    const trigger = page.getByRole('button', {
      name: '预览灵感工作台概念 Demo',
    })
    await trigger.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(
      page.getByText('上线地址待补充', { exact: true }),
    ).toBeVisible()
    await expect(
      page.getByText('GitHub 仓库待补充', { exact: true }),
    ).toBeVisible()
    await expect(page.locator('.modal-disclaimer')).toContainText(
      '不代表已上线或已开源',
    )
    await page.waitForTimeout(300)
    await page.screenshot({
      path: resolve(root, 'artifacts/project-modal.png'),
    })
    await audit(page, 'Desktop project dialog')
    for (let i = 0; i < 5; i++) await page.keyboard.press('Tab')
    assert.ok(
      await page.evaluate(() =>
        document.querySelector('dialog').contains(document.activeElement),
      ),
    )
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(trigger).toBeFocused()
    assert.equal(await page.evaluate(() => document.body.style.overflow), '')
  })

  await check('6 个不同项目的详情均可打开和关闭', async () => {
    for (const button of await page.locator('.project-title').all()) {
      await button.click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await page.getByRole('button', { name: '关闭弹窗' }).click()
      await expect(page.getByRole('dialog')).toHaveCount(0)
    }
  })

  await check('工作 / 校园筛选、校园展开与 6 项荣誉弹窗', async () => {
    await page.getByRole('button', { name: /^工作经历/ }).click()
    await expect(page.locator('.timeline-item')).toHaveCount(3)
    await page.getByRole('button', { name: /^校园时光/ }).click()
    await expect(page.locator('.timeline-item')).toHaveCount(3)
    await page.locator('.timeline-details summary').first().click()
    await expect(page.locator('.timeline-details').first()).toHaveAttribute(
      'open',
      '',
    )
    await page.getByRole('button', { name: /^全部历程/ }).click()
    await expect(page.locator('.timeline-item')).toHaveCount(6)
    await page.getByRole('button', { name: '查看全部 6 项' }).click()
    await expect(page.locator('.award-row')).toHaveCount(6)
    await page.waitForTimeout(300)
    await audit(page, 'Desktop awards dialog')
    await page.screenshot({
      path: resolve(root, 'artifacts/awards-modal.png'),
    })
    await page.keyboard.press('Escape')
  })

  await check('邮箱复制、mailto 和外链安全属性', async () => {
    await page.getByRole('button', { name: /^复制邮箱/ }).click()
    await expect(page.getByRole('status')).toContainText('已复制')
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      'alex.lin@example.com',
    )
    const mailto = await page
      .getByRole('link', { name: /试用邮件入口/ })
      .getAttribute('href')
    assert.equal(mailto, 'mailto:alex.lin@example.com')
    for (const anchor of await page.locator('a[target="_blank"]').all()) {
      const rel = await anchor.getAttribute('rel')
      assert.ok(rel?.includes('noopener') && rel?.includes('noreferrer'))
    }
    assert.equal(await page.locator('a[href="#"]').count(), 0)
  })

  await revealAll(page)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(300)
  await page.screenshot({
    path: resolve(root, 'artifacts/desktop-full.png'),
    fullPage: true,
  })
  await check('桌面 WCAG A / AA 自动检查无检测到的违规', () =>
    audit(page, 'Desktop full page'),
  )

  await check('320–1920px 共 11 档宽度，无页面横向溢出', async () => {
    for (const width of [
      320, 360, 390, 480, 600, 768, 820, 1024, 1280, 1440, 1920,
    ]) {
      await page.setViewportSize({ width, height: 900 })
      await page.waitForTimeout(100)
      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      )
      assert.ok(
        scrollWidth <= width + 1,
        `${width}px viewport overflowed to ${scrollWidth}px`,
      )
    }
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(400)
  await page.screenshot({ path: resolve(root, 'artifacts/mobile-hero.png') })
  await check('手机导航可打开、Escape 关闭，并能跳到项目区', async () => {
    const menuButton = page.getByRole('button', { name: '打开导航' })
    await menuButton.click()
    await expect(page.locator('#mobile-nav')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('#mobile-nav')).toHaveCount(0)
    await expect(menuButton).toBeFocused()
    await menuButton.click()
    await page.locator('#mobile-nav a[href="#projects"]').click()
    await expect(page.locator('#mobile-nav')).toHaveCount(0)
    await expect(page).toHaveURL(/#projects$/)
  })
  await revealAll(page)
  await page.screenshot({
    path: resolve(root, 'artifacts/mobile-full.png'),
    fullPage: true,
  })
  await check('手机 WCAG A / AA 自动检查无检测到的违规', () =>
    audit(page, 'Mobile full page'),
  )

  await check('手机详情弹窗与荣誉列表均不横向溢出', async () => {
    await page.locator('.project-title').first().click()
    await page.waitForTimeout(300)
    await audit(page, 'Mobile project dialog')
    const dialog = page.getByRole('dialog')
    assert.ok(
      await dialog.evaluate(
        (element) => element.scrollWidth <= element.clientWidth + 1,
      ),
    )
    await page.screenshot({
      path: resolve(root, 'artifacts/mobile-modal.png'),
    })
    await page.getByRole('button', { name: '关闭弹窗' }).click()
    await page.getByRole('button', { name: '查看全部 6 项' }).click()
    assert.ok(
      await page
        .getByRole('dialog')
        .evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
    )
    await page.waitForTimeout(300)
    await audit(page, 'Mobile awards dialog')
    await page.getByRole('dialog').evaluate((element) => {
      element.scrollTop = element.scrollHeight
    })
    await expect(
      page.getByRole('button', { name: '关闭弹窗' }),
    ).toBeInViewport()
    await page.getByRole('button', { name: '关闭弹窗' }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  await check('减少动态效果模式：球体静止、倾斜禁用、内容可见', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto(baseUrl, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)
    const before = await page
      .locator('canvas')
      .evaluate((canvas) => canvas.toDataURL())
    await page.waitForTimeout(200)
    assert.equal(
      await page.locator('canvas').evaluate((canvas) => canvas.toDataURL()),
      before,
    )
    const card = page.locator('.project-card').first()
    await card.hover({ position: { x: 30, y: 60 } })
    assert.equal(
      await card.evaluate((element) => getComputedStyle(element).transform),
      'none',
    )
    assert.equal(
      await page
        .locator('.projects-grid')
        .evaluate((element) => getComputedStyle(element).opacity),
      '1',
    )
  })
  await check('点击弹窗外的遮罩可关闭并恢复页面滚动', async () => {
    await page.locator('.project-title').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.mouse.click(5, 5)
    await expect(page.getByRole('dialog')).toHaveCount(0)
    assert.equal(await page.evaluate(() => document.body.style.overflow), '')
  })
  await check('触屏设备：导航、点击预览正常，不启用鼠标倾斜', async () => {
    const touchContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    })
    try {
      const touchPage = await touchContext.newPage()
      touchPage.setDefaultTimeout(7000)
      touchPage.on('pageerror', (error) => errors.push(error.message))
      await touchPage.goto(baseUrl, { waitUntil: 'networkidle' })
      await touchPage.waitForTimeout(1000)
      assert.ok(
        await touchPage.evaluate(() => matchMedia('(hover: none)').matches),
      )
      await touchPage.getByRole('button', { name: '打开导航' }).tap()
      await touchPage.locator('#mobile-nav a[href="#projects"]').tap()
      await expect(touchPage.locator('#mobile-nav')).toHaveCount(0)
      await touchPage.locator('.project-art-button').first().tap()
      await expect(touchPage.getByRole('dialog')).toBeVisible()
      const touchTilt = await touchPage
        .locator('.project-card')
        .first()
        .evaluate((element) => element.style.getPropertyValue('--rotate-y'))
      assert.ok(['', '0deg'].includes(touchTilt))
      await touchPage.getByRole('button', { name: '关闭弹窗' }).tap()
      await expect(touchPage.getByRole('dialog')).toHaveCount(0)
    } finally {
      await touchContext.close()
    }
  })
  await check('剪贴板不可用时显示手动复制提示，不抛出异常', async () => {
    await page.evaluate(() => {
      Object.defineProperty(navigator.clipboard, 'writeText', {
        value: async () => {
          throw new Error('Simulated clipboard denial')
        },
        configurable: true,
      })
    })
    await page.getByRole('button', { name: /^复制邮箱/ }).click()
    await expect(page.getByRole('status')).toContainText('无法自动复制')
  })
  await check('无浏览器异常、无资源加载失败', async () => {
    assert.deepEqual(errors, [])
    assert.deepEqual(requestFailures, [])
  })
} finally {
  await browser?.close()
  server?.kill()
  await writeFile(
    resolve(root, 'artifacts/test-results.json'),
    JSON.stringify(
      {
        checks,
        audits: auditResults,
        passed: checks.filter((item) => item.passed).length,
        failed: failures.length,
      },
      null,
      2,
    ),
  )
}
if (failures.length) process.exitCode = 1
console.log(
  `\n${checks.filter((item) => item.passed).length}/${checks.length} checks passed. Report: artifacts/test-results.json`,
)
