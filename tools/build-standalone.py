"""Build a self-contained HTML file; no dependencies beyond Python 3 and Node."""
from pathlib import Path
import subprocess, json, base64, re
root=Path(__file__).resolve().parents[1]
def data_uri(path):
 mime={'.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.svg':'image/svg+xml'}[path.suffix]
 return 'data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode()
source=subprocess.check_output(['node','-e',"global.window={};require('./slides.js');process.stdout.write(JSON.stringify(window.DEFAULT_DECK))"],cwd=root,text=True)
deck=json.loads(source)
for slide in deck['slides']:
 for node in slide['nodes']:
  if node['type']=='image':node['src']=data_uri(root/node['src'])
css=(root/'style.css').read_text()
css=re.sub(r"url\('([^']+)'\)",lambda m:"url('"+data_uri(root/m.group(1))+"')",css)
html=(root/'index.html').read_text()
html=html.replace('href="assets/favicon.svg"','href="'+data_uri(root/'assets/favicon.svg')+'"')
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>')
html=html.replace('<script src="slides.js"></script>','<script>window.DEFAULT_DECK='+json.dumps(deck,ensure_ascii=False).replace('</','<\\/')+';</script>')
html=html.replace('<script src="app.js"></script>','<script>'+(root/'app.js').read_text().replace('</script','<\\/script')+'</script>')
(root/'offline.html').write_text(html)
print('Built offline.html:',len(html.encode()),'bytes')
