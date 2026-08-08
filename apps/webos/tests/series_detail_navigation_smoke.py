from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[3]
NAV = (ROOT / 'apps/webos/app/js/navigation.js').read_text(encoding='utf-8').replace('</script>', '<\\/script>')

HTML = f'''<!doctype html>
<html><head><meta charset="utf-8"><style>
html,body{{margin:0;width:100%;height:100%;overflow:hidden;background:#071014;color:white;font-family:Arial}}
.detail-scroll{{height:520px;width:1400px;overflow-y:auto;padding:0 20px}}
.series-hero{{height:480px;padding:20px}}
.series-summary .detail-actions{{display:flex;gap:16px;margin-top:360px}}
.focusable{{width:180px;height:60px}}
.episode-section{{padding:30px 0 500px}}
.season-row{{display:flex;gap:14px;margin-bottom:24px}}
.episode-grid{{display:grid;grid-template-columns:1fr 1fr;gap:16px}}
.episode-card{{height:120px}}
:focus{{outline:4px solid cyan}}
</style></head><body>
<div class="scroll-view detail-scroll">
  <section class="series-hero">
    <div class="series-summary"><div></div><div>
      <div class="detail-actions">
        <button class="secondary-button focusable" id="favoriteSeries">Add favorite</button>
        <button class="secondary-button focusable" id="closeSeries">Back</button>
      </div>
    </div></div>
  </section>
  <section class="episode-section">
    <div class="season-row">
      <button class="season-button focusable active" id="season1">Season 1</button>
      <button class="season-button focusable" id="season2">Season 2</button>
      <button class="season-button focusable" id="season3">Season 3</button>
    </div>
    <div class="episode-grid">
      <button class="episode-card focusable" id="episode1">Episode 1</button>
      <button class="episode-card focusable" id="episode2">Episode 2</button>
      <button class="episode-card focusable" id="episode3">Episode 3</button>
      <button class="episode-card focusable" id="episode4">Episode 4</button>
    </div>
  </section>
</div>
<script>{NAV}</script>
</body></html>'''

with sync_playwright() as p:
    launch_options = {'headless': True}
    system_chromium = shutil.which('chromium') or shutil.which('chromium-browser')
    if system_chromium:
        launch_options.update({'executable_path': system_chromium, 'args': ['--no-sandbox']})
    browser = p.chromium.launch(**launch_options)
    page = browser.new_page(viewport={"width": 1920, "height": 1080})
    page.set_content(HTML)

    # Season row must stay horizontal instead of jumping to hero actions.
    page.locator('#season1').focus()
    page.keyboard.press('ArrowRight')
    assert page.evaluate('document.activeElement.id') == 'season2'

    # Episode row must stay horizontal instead of jumping to Add favorite.
    page.locator('#episode1').focus()
    page.keyboard.press('ArrowRight')
    assert page.evaluate('document.activeElement.id') == 'episode2'

    # Up from the first episode row returns to the active season.
    page.locator('#episode1').focus()
    page.keyboard.press('ArrowUp')
    assert page.evaluate('document.activeElement.id') == 'season1'

    # Up from the season row reaches the hero and resets the scroll to top.
    page.evaluate("document.querySelector('.detail-scroll').scrollTop = 700")
    page.locator('#season2').focus()
    page.keyboard.press('ArrowUp')
    assert page.evaluate('document.activeElement.id') in ('favoriteSeries', 'closeSeries')
    assert page.evaluate("document.querySelector('.detail-scroll').scrollTop") == 0

    # Up again at the hero remains trapped and keeps the top visible.
    page.evaluate("document.querySelector('.detail-scroll').scrollTop = 150")
    page.keyboard.press('ArrowUp')
    assert page.evaluate("document.querySelector('.detail-scroll').scrollTop") == 0

    browser.close()

print('series detail navigation smoke passed')
