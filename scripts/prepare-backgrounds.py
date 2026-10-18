"""Prepare only the 34 user-supplied photographs; normal site builds copy the results."""
from pathlib import Path
from PIL import Image, ImageOps
import hashlib, json, io, sys

root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
names = [
 '111.jpg','11.jpg','avoriaz-amara_2024-08-22-14-20-00.jpg','pexels-lukas-lussi-930564355-20035232.jpg',
 'montriond-lac_2025-04-17-06-20-00 - Copy (2).jpg','bbbbbbbbbb.jpg','7878787.jpg','31231ure.PNG',
 'unnamed (8).jpg','1111111111111111 - Copy (5).jpg','avoriaz-amara_2024-11-20-15-50-00.jpg','gegegegege.jpg',
 'fhjnws.jpg','morzine-office-de-tourisme_2024-12-23-05-30-00.jpg','unnamed (1) - Copy.jpg','train-aerial.jpg',
 'CG_2305_FK_AmericanBar_0151_low-scaled.jpg','22222222222222222222.jpg','avoriaz-amara_2024-11-20-15-50-00 - Copy (2).jpg',
 'avoriaz-pistes_2025-11-27-17-20-00.jpg','chatel-lac-de-vonnes_2024-12-27-17-30-00.jpg','11111111111111.jpg',
 'arosarosa - Copy.jpg','Avoriaz-skiresort-virtual-reality-travel.jpg','gdfgd.jpg','wall.jfif',
 'station-avoriaz-design-alpes-2048x1152 - Copy.jpg','Harder_Kulm-2026_0409_154000.jpg','222222313131re.PNG',
 'montriond-lac_2025-04-03-18-40-00 - Copy.jpg','alps-wallpaper-3840x2160-outdoor-adventures-travel-destinations-27242.jpg',
 '313131ure.PNG','gegegegege1111111111111 - Copy - Copy.jpg','2022-langenwaldsee-01-2556199.jpg'
]
output = root/'src/temponotes/backgrounds'
output.mkdir(exist_ok=True)
records=[]
for index,name in enumerate(names,1):
    path=source/name
    with Image.open(path) as image:
        image=ImageOps.exif_transpose(image).convert('RGB')
        record={'id':index,'source':name,'originalBytes':path.stat().st_size,'variants':{}}
        for label,width,limit in [('desktop',1920,200000),('mobile',800,65000)]:
            for scale in [1,.83,.71,.60,.50]:
                frame=image.copy()
                frame.thumbnail((round(width*scale),round(width*scale)),Image.Resampling.LANCZOS)
                for quality in [76,70,64]:
                    encoded=io.BytesIO();frame.save(encoded,format='WEBP',quality=quality,method=4)
                    data=encoded.getvalue()
                    if len(data)<=limit:break
                if len(data)<=limit:break
            assert len(data)<=limit, name+' exceeds its image budget'
            digest=hashlib.sha256(data).hexdigest()[:12]
            filename=f'{index:02d}-{label}-{digest}.webp'
            (output/filename).write_bytes(data)
            record['variants'][label]={'url':'backgrounds/'+filename,'bytes':len(data),'width':frame.width,'height':frame.height}
        records.append(record)
(root/'src/temponotes/backgrounds.json').write_text(json.dumps([{'desktop':r['variants']['desktop']['url'],'mobile':r['variants']['mobile']['url']} for r in records],separators=(',',':')),encoding='utf-8')
retained={Path(v['url']).name for r in records for v in r['variants'].values()}
for file in output.glob('*.webp'):
    if file.name not in retained:file.unlink()
(root/'../../qa/daily-backgrounds-manifest.json').resolve().write_text(json.dumps(records,indent=2),encoding='utf-8')
print(json.dumps({'pictures':len(records),'originalBytes':sum(r['originalBytes'] for r in records),'desktopTotalBytes':sum(r['variants']['desktop']['bytes'] for r in records),'desktopMaxBytes':max(r['variants']['desktop']['bytes'] for r in records),'mobileAverageBytes':round(sum(r['variants']['mobile']['bytes'] for r in records)/len(records))}))
