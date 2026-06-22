// generate.mjs — CalcWise programmatic page generator
// Запуск:  node generate.mjs
// Создаёт long-tail страницы + sitemap.xml + robots.txt в текущей папке (корень проекта).

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

// ===== 1) НАСТРОЙ ПЕРЕД ЗАПУСКОМ =====
// Адрес сайта без слэша в конце. Пока pages.dev, позже — свой домен.
const DOMAIN = 'https://calcwise-2la.pages.dev'
const BRAND = 'CalcWise'

const CSS = `:root{--card:#fff;--ink:#0f172a;--muted:#64748b;--brand:#2563eb;--line:#e2e8f0;--bg:#f8fafc}*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:var(--ink);background:var(--bg);line-height:1.55}main{max-width:720px;margin:0 auto;padding:20px}a{color:var(--brand);text-decoration:none}h1{font-size:1.55rem;margin:.2em 0}.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px;margin:16px 0}.answer{font-size:1.5rem;font-weight:700;color:var(--brand)}.muted{color:var(--muted);font-size:.9rem}.ad-slot{min-height:90px;background:#f1f5f9;border:1px dashed #cbd5e1;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#94a3b8;margin:16px 0}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line)}nav.bc{font-size:.85rem;margin-bottom:10px;color:var(--muted)}.links a{display:inline-block;margin:4px 10px 4px 0}`

const urls = []
const money = n => '$' + Math.round(n).toLocaleString('en-US')
const write = (file, data) => { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, data) }

function render({ section, slug, title, description, h1, answer, rows, related }) {
  const path = `${section}/${slug}/`
  const canonical = `${DOMAIN}/${path}`
  urls.push(canonical)
  const rowsHtml = rows.map(r => `<div class="row"><span>${r[0]}</span><b>${r[1]}</b></div>`).join('')
  const linksHtml = related.map(r => `<a href="${r.href}">${r.label}</a>`).join('')
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<meta name="description" content="${description}" />
<link rel="canonical" href="${canonical}" />
<style>${CSS}</style>
</head>
<body>
<main>
<nav class="bc"><a href="/">${BRAND}</a> › <a href="/${section}/">${section}</a></nav>
<h1>${h1}</h1>
<div class="ad-slot">Ad slot (top)</div>
<div class="card"><div class="answer">${answer}</div></div>
<div class="card">${rowsHtml}</div>
<div class="card"><h2>Related</h2><div class="links">${linksHtml}</div></div>
<div class="ad-slot">Ad slot (bottom)</div>
<p class="muted">Estimate for educational purposes only — not financial advice.</p>
</main>
</body>
</html>
`
  write(`${path}index.html`, html)
}

const amortMonthly = (P, ratePct, months) => {
  const r = ratePct / 100 / 12
  return r > 0 ? P * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1) : P / months
}

// ===== Loan =====
for (const amt of [5000, 10000, 15000, 20000, 25000, 30000, 50000])
  for (const rate of [5, 6, 7, 8, 10])
    for (const yrs of [3, 5, 7]) {
      const m = amortMonthly(amt, rate, yrs * 12)
      const total = m * yrs * 12
      render({
        section: 'loan-calculator',
        slug: `loan-${amt}-at-${rate}-percent-for-${yrs}-years`,
        title: `${money(amt)} Loan at ${rate}% for ${yrs} Years — Monthly Payment`,
        description: `A ${money(amt)} loan at ${rate}% APR over ${yrs} years costs ${money(m)}/mo. See total interest and total cost.`,
        h1: `${money(amt)} loan at ${rate}% for ${yrs} years`,
        answer: `Monthly payment: ${money(m)}`,
        rows: [['Loan amount', money(amt)], ['Rate', `${rate}% APR`], ['Term', `${yrs} years`], ['Total interest', money(total - amt)], ['Total paid', money(total)]],
        related: [{ href: '/loan-calculator/', label: 'Loan calculator' }, { href: '/auto-loan-calculator/', label: 'Auto loan' }, { href: '/mortgage-calculator/', label: 'Mortgage' }],
      })
    }

// ===== Mortgage =====
for (const price of [200000, 250000, 300000, 350000, 400000, 500000])
  for (const rate of [5, 6, 7])
    for (const yrs of [15, 30]) {
      const m = amortMonthly(price, rate, yrs * 12)
      const total = m * yrs * 12
      render({
        section: 'mortgage-calculator',
        slug: `mortgage-${price}-at-${rate}-percent-for-${yrs}-years`,
        title: `${money(price)} Mortgage at ${rate}% for ${yrs} Years — Monthly Payment`,
        description: `Monthly payment on a ${money(price)} mortgage at ${rate}% over ${yrs} years is ${money(m)} (principal & interest).`,
        h1: `${money(price)} mortgage at ${rate}% for ${yrs} years`,
        answer: `Monthly payment: ${money(m)}`,
        rows: [['Home price', money(price)], ['Rate', `${rate}%`], ['Term', `${yrs} years`], ['Total interest', money(total - price)], ['Total paid', money(total)]],
        related: [{ href: '/mortgage-calculator/', label: 'Mortgage calculator' }, { href: '/loan-calculator/', label: 'Loan' }],
      })
    }

// ===== Compound interest =====
for (const P of [1000, 5000, 10000, 25000, 50000])
  for (const rate of [4, 6, 8, 10])
    for (const yrs of [10, 20, 30]) {
      const fv = P * Math.pow(1 + rate / 100, yrs)
      render({
        section: 'compound-interest',
        slug: `${P}-at-${rate}-percent-for-${yrs}-years`,
        title: `${money(P)} at ${rate}% for ${yrs} Years — Compound Interest`,
        description: `Invest ${money(P)} at ${rate}% for ${yrs} years and it grows to ${money(fv)} with annual compounding.`,
        h1: `${money(P)} at ${rate}% for ${yrs} years`,
        answer: `Future value: ${money(fv)}`,
        rows: [['Principal', money(P)], ['Rate', `${rate}%/yr`], ['Years', `${yrs}`], ['Interest earned', money(fv - P)], ['Future value', money(fv)]],
        related: [{ href: '/compound-interest/', label: 'Compound interest calculator' }, { href: '/debt-payoff/', label: 'Debt payoff' }],
      })
    }

// ===== Auto loan =====
for (const price of [20000, 25000, 30000, 35000, 40000])
  for (const rate of [5, 7, 9])
    for (const months of [48, 60, 72]) {
      const m = amortMonthly(price, rate, months)
      const total = m * months
      render({
        section: 'auto-loan-calculator',
        slug: `auto-loan-${price}-at-${rate}-percent-for-${months}-months`,
        title: `${money(price)} Auto Loan at ${rate}% for ${months} Months — Car Payment`,
        description: `A ${money(price)} car loan at ${rate}% APR over ${months} months is ${money(m)}/mo. See total interest and cost.`,
        h1: `${money(price)} auto loan at ${rate}% for ${months} months`,
        answer: `Monthly payment: ${money(m)}`,
        rows: [['Amount financed', money(price)], ['Rate', `${rate}% APR`], ['Term', `${months} months`], ['Total interest', money(total - price)], ['Total paid', money(total)]],
        related: [{ href: '/auto-loan-calculator/', label: 'Auto loan calculator' }, { href: '/loan-calculator/', label: 'Personal loan' }],
      })
    }

// ===== sitemap.xml + robots.txt =====
const staticPaths = ['', 'loan-calculator/', 'mortgage-calculator/', 'take-home-pay/', 'compound-interest/', 'debt-payoff/', 'auto-loan-calculator/']
const allUrls = staticPaths.map(p => `${DOMAIN}/${p}`).concat(urls)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`
writeFileSync('sitemap.xml', sitemap)
writeFileSync('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${DOMAIN}/sitemap.xml\n`)
console.log(`Done: ${urls.length} pages + sitemap.xml (${allUrls.length} URLs) + robots.txt`)