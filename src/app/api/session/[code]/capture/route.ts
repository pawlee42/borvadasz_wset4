import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'
import { existsSync } from 'fs'

function findChrome(): string | null {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
  ]
  return paths.find(p => existsSync(p)) ?? null
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const port = (request.headers.get('host') ?? 'localhost:3000').split(':')[1] ?? '3000'
  const baseUrl = `http://localhost:${port}`

  const chromePath = findChrome()
  if (!chromePath) {
    return NextResponse.json(
      { error: 'Chrome/Edge not found on system' },
      { status: 500 }
    )
  }

  let browser
  try {
    browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    })

    const page = await browser.newPage()
    await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 })

    const url = `${baseUrl}/session/${code}/leader/results?capture=1`
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

    // Wait for charts to render — retry with longer timeout
    await page.waitForSelector('[data-wine-card]', { timeout: 15000 }).catch(async () => {
      // If cards not found, wait longer for client-side hydration
      await new Promise(r => setTimeout(r, 5000))
    })
    await new Promise(r => setTimeout(r, 2000))

    const screenshot = await page.screenshot({
      fullPage: true,
      type: 'png',
    })

    await browser.close()

    return new NextResponse(screenshot, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="borertekeles-${code}.png"`,
      },
    })
  } catch (err: any) {
    if (browser) await browser.close().catch(() => {})
    return NextResponse.json(
      { error: 'Screenshot failed', details: err.message },
      { status: 500 }
    )
  }
}
