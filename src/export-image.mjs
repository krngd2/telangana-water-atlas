export const COPERNICUS_CREDIT='Produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved.';
export const COPERNICUS_LIABILITY='The organisations in charge of the Copernicus programme by law or by delegation do not incur any liability for any use of the Copernicus WorldDEM-30.';

// A separate canvas preserves source/model context when an image leaves the app.
export function createExportImage(source,{layer,exaggeration,coordinates,terrainStatus,regional=false}){
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
  const width=source.width,pad=Math.max(16,Math.round(width*.02));
  const fontSize=Math.max(12,Math.min(19,Math.round(width/90))),lineHeight=Math.ceil(fontSize*1.5);
  ctx.font=`${fontSize}px sans-serif`;
  const wrap=text=>{
    const lines=[];let line='';
    for(const word of text.split(/\s+/)){
      if(ctx.measureText(word).width>width-pad*2){
        if(line){lines.push(line);line='';}
        for(const character of word){
          if(line&&ctx.measureText(line+character).width>width-pad*2){lines.push(line);line=character;}
          else line+=character;
        }
      }else{
        const next=line?line+' '+word:word;
        if(line&&ctx.measureText(next).width>width-pad*2){lines.push(line);line=word;}else line=next;
      }
    }
    if(line)lines.push(line);return lines;
  };
  const header=[
    'Telangana / Water atlas',
    `${layer} · vertical exaggeration ${exaggeration}× · release point ${coordinates}`,
    terrainStatus
  ].flatMap(wrap);
  const footer=[
    'Educational illustration · water routing ~900 m. No flood forecast or operating clearance. DOM map labels and legends are omitted.',
    regional?'Regional terrain: Mapzen / Tilezen; SRTM and GMTED2010 courtesy of USGS; global ETOPO1 from NOAA.':COPERNICUS_CREDIT,
    ...(regional?[]:[COPERNICUS_LIABILITY]),
    'Rivers: Natural Earth (public domain). Boundary: DataMeet / Election Commission of India via geoBoundaries (CC BY 2.5 IN). No source organisation endorses this atlas.',
    'Sources and data terms: github.com/krngd2/telangana-water-atlas/blob/main/DATA_LICENSES.md'
  ].flatMap(wrap);
  const top=pad*2+header.length*lineHeight,bottom=pad*2+footer.length*lineHeight;
  canvas.width=width;canvas.height=top+source.height+bottom;
  ctx.fillStyle='#f5f3e9';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(source,0,top);
  ctx.fillStyle='#193f38';ctx.font=`${fontSize}px sans-serif`;ctx.textBaseline='top';
  header.forEach((line,i)=>ctx.fillText(line,pad,pad+i*lineHeight));
  footer.forEach((line,i)=>ctx.fillText(line,pad,top+source.height+pad+i*lineHeight));
  canvas.dataset.sourceHeight=String(source.height);
  return canvas;
}
