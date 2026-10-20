# og:image (1200x630) per pagina, favicons en manifest-iconen. HTML -> PNG met headless Chrome.
# Alleen blogkaarten krijgen een foto (vrij gelicenseerd, zie src/assets/img/blog/BRONNEN.md). Geen personen.
import subprocess, os, tempfile, json
from PIL import Image
B='#2f7a3a';D='#15211a';S='#edf3ea';BG='#f8faf6';G='#1d4a31';P='#b6d3bb'
LOGO='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="11" fill="#2f7a3a"/><path d="M8 19.5 20 10l12 9.5V31a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2z" fill="#fff"/><path d="m14.5 23.5 4 4 7-7.5" fill="none" stroke="#2f7a3a" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="8" r="4" fill="#e7a33e"/></svg>'
cards={
 'home':('Welke warmtepomp past bij jouw huis?','Hybride of all-electric · 8 merken · ISDE 2026'),
 'match':('Doe de warmtepomp keuzehulp','6 vragen: advies, kosten, subsidie en merken'),
 'rekenhulp':('Terugverdientijd berekenen','Besparing, ISDE-subsidie en terugverdientijd'),
 'merken':('Alle warmtepompmerken','Aanbod, checklist-score en voor wie het past'),
 'vergelijken':('Warmtepompen vergelijken','8 merken op 10 vaste punten'),
 'merk-quatt':('Quatt','Aanbod, prijzen en checklist'),
 'merk-daikin':('Daikin','Aanbod en checklist'),
 'merk-mitsubishi':('Mitsubishi Electric','Aanbod en checklist'),
 'merk-vaillant':('Vaillant','Aanbod en checklist'),
 'merk-nefitbosch':('Nefit Bosch','Aanbod en checklist'),
 'merk-itho':('Itho Daalderop','Aanbod en checklist'),
 'merk-remeha':('Remeha','Aanbod en checklist'),
 'merk-panasonic':('Panasonic','Aanbod en checklist'),
 'vs-quatt-vs-remeha':('Quatt of Remeha?','Hybride warmtepomp vergelijken'),
 'vs-daikin-vs-mitsubishi-electric':('Daikin of Mitsubishi Electric?','Verschillen op een rij'),
 'vs-vaillant-vs-nefit-bosch':('Vaillant of Nefit Bosch?','Verschillen op een rij'),
 'warmtepomp-kosten':('Wat kost een warmtepomp in 2026?','Kosten per type en de subsidie'),
 'warmtepomp-terugverdientijd':('Terugverdientijd van een warmtepomp','Zo reken je het uit'),
 'isde-subsidie-warmtepomp-2026':('ISDE-subsidie warmtepomp 2026','Bedragen, voorwaarden en 2027'),
 'hybride-of-all-electric':('Hybride of all-electric?','Wat past bij jouw huis'),
 'hybride-warmtepomp-kosten':('Wat kost een hybride warmtepomp?','Prijs, ISDE 2026 en terugverdientijd'),
 'warmtepomp-geluid':('Warmtepomp en geluid','Regels, afstand en afscherming'),
 'is-mijn-huis-geschikt':('Is mijn huis geschikt?','Vijf punten om te checken'),
 'blog':('Blog: warmtepomp kiezen','Kosten, subsidie en merken, met bronnen'),
 'gidsen':('Gidsen over warmtepompen','Kosten, ISDE, geluid en geschiktheid'),
 'blog-warmtepomp-offerte-vergelijken':('Warmtepomp-offertes vergelijken','Checklist in 6 stappen'),
 'blog-beste-hybride-warmtepomp':('Beste hybride warmtepomp 2026','Zo kies je per situatie'),
}
# blogkaarten met kopfoto: kaart -> WebP in src/assets/img/blog
photo={'blog-warmtepomp-offerte-vergelijken':'warmtepomp-offerte-vergelijken-1200.webp','blog-beste-hybride-warmtepomp':'beste-hybride-warmtepomp-1200.webp'}
art=f'<svg viewBox="0 0 300 300" width="300" height="300"><path d="M30 140 150 45l120 95v120a10 10 0 0 1-10 10H40a10 10 0 0 1-10-10z" fill="#fff" stroke="{D}" stroke-width="6" stroke-linejoin="round"/><rect x="62" y="170" width="70" height="70" rx="8" fill="{P}"/><rect x="168" y="170" width="70" height="70" rx="8" fill="{G}"/><g fill="none" stroke="{B}" stroke-width="7" stroke-linecap="round"><path d="M84 150c0-14 12-14 12-28s-12-14-12-28"/><path d="M110 150c0-14 12-14 12-28s-12-14-12-28"/></g><circle cx="244" cy="66" r="28" fill="{G}"/><path d="m231 67 9 9 18-18" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
tmp=tempfile.mkdtemp()
def shot(html,out,w,h):
    f=os.path.join(tmp,'p.html');open(f,'w').write(html)
    subprocess.run(['google-chrome','--headless=new','--no-sandbox','--disable-gpu','--hide-scrollbars','--force-device-scale-factor=1',f'--window-size={w},{h}',f'--screenshot={out}','file://'+f],capture_output=True,check=True)
os.makedirs('src/assets/og',exist_ok=True);os.makedirs('src/assets/icons',exist_ok=True)
import sys
only=set(sys.argv[1:])  # optioneel: alleen deze kaarten maken, bv. python3 scripts/images.py blog
for k,(t,sub) in cards.items():
    if only and k not in only: continue
    html=f'''<html><body style="margin:0;width:1200px;height:630px;background:{BG};font-family:'DejaVu Sans',sans-serif;overflow:hidden">
<div style="position:absolute;left:0;top:0;width:1200px;height:18px;background:{B}"></div>
<div style="position:absolute;left:72px;top:70px;display:flex;align-items:center;gap:16px;font-size:40px;font-weight:700;color:{D}"><div style="width:64px;height:64px">{LOGO}</div><span>Warmtepompen<span style="color:{B}">Match</span>.nl</span></div>
<div style="position:absolute;left:72px;top:190px;width:700px;font-size:{64 if len(t)<26 else 50}px;line-height:1.12;font-weight:800;color:{D}">{t}</div>
<div style="position:absolute;left:72px;bottom:80px;width:720px;font-size:30px;color:{G};font-weight:700">{sub}</div>
<div style="position:absolute;right:70px;top:170px;background:{S};border-radius:28px;padding:20px">{art}</div></body></html>'''
    if k in photo:
        img='file://'+os.path.abspath('src/assets/img/blog/'+photo[k])
        html=f'''<html><body style="margin:0;width:1200px;height:630px;background:{BG};font-family:'DejaVu Sans',sans-serif;overflow:hidden">
<div style="position:absolute;right:0;top:0;width:530px;height:630px;background:url('{img}') 28% center/cover"></div>
<div style="position:absolute;left:0;top:0;width:670px;height:630px;background:{BG}"></div>
<div style="position:absolute;left:0;top:0;width:1200px;height:18px;background:{B}"></div>
<div style="position:absolute;left:64px;top:70px;display:flex;align-items:center;gap:16px;font-size:32px;font-weight:700;color:{D}"><div style="width:54px;height:54px">{LOGO}</div><span>Warmtepompen<span style="color:{B}">Match</span>.nl</span></div>
<div style="position:absolute;left:64px;top:180px;font-size:24px;font-weight:700;color:{B};letter-spacing:.06em">BLOG</div>
<div style="position:absolute;left:64px;top:220px;width:540px;font-size:52px;line-height:1.12;font-weight:800;color:{D}">{t}</div>
<div style="position:absolute;left:64px;bottom:76px;width:540px;font-size:28px;color:{G};font-weight:700">{sub}</div></body></html>'''
    shot(html,f'src/assets/og/{k}.png',1200,630)
if not only: open('src/assets/icons/favicon.svg','w').write(LOGO)
for size,name in (() if only else ((32,'favicon-32.png'),(180,'apple-touch-icon.png'),(192,'icon-192.png'),(512,'icon-512.png'))):
    shot(f'<html><body style="margin:0;width:{size}px;height:{size}px">{LOGO.replace("<svg ",f"<svg width=\"{size}\" height=\"{size}\" ")}</body></html>',f'src/assets/icons/{name}',size,size)
print('ok',len(cards))
