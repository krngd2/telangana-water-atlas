// Display context only. Never pass this expanded mask to routing or storage.
export const CONTEXT_BUFFER_KM=8;
export function displayMask(mask,width,height,cellWidthM,cellHeightM,bufferKm=CONTEXT_BUFFER_KM){
  const result=new Uint8Array(mask),radius=bufferKm*1000,offsets=[];
  for(let dy=-Math.ceil(radius/cellHeightM);dy<=Math.ceil(radius/cellHeightM);dy++)for(let dx=-Math.ceil(radius/cellWidthM);dx<=Math.ceil(radius/cellWidthM);dx++){
    if(Math.hypot(dx*cellWidthM,dy*cellHeightM)<=radius)offsets.push([dx,dy]);
  }
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=y*width+x;if(!mask[i])continue;
    if(x>0&&x<width-1&&y>0&&y<height-1&&mask[i-1]&&mask[i+1]&&mask[i-width]&&mask[i+width])continue;
    for(const [dx,dy]of offsets){const px=x+dx,py=y+dy;if(px>=0&&px<width&&py>=0&&py<height)result[py*width+px]=1;}
  }
  return result;
}
