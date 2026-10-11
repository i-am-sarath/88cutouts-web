import { registerCanvas, sourceOf } from './scene';

let worker: Worker | undefined;
let pending = false;
let abort: (()=>void)|undefined;
type Progress = (message: string) => void;

export function cancelCutout() { abort?.(); }

function photoCanvas(src: string) {
  const source = sourceOf(src);
  if (!source) throw new Error('Photo unavailable');
  const canvas = document.createElement('canvas');
  const scale = Math.min(1,1800/Math.max(source.w,source.h));
  canvas.width=Math.round(source.w*scale); canvas.height=Math.round(source.h*scale);
  canvas.getContext('2d')!.drawImage(source.img,0,0,canvas.width,canvas.height);
  return canvas;
}

/** No upload or inference API: a cached model runs locally in a worker. */
async function matte(src: string, mode: 'portrait'|'object', onProgress?: Progress): Promise<string> {
  if (pending) throw new Error('Another cutout is being made. Try again when it finishes.');
  pending=true;
  try {
    const canvas=photoCanvas(src), ctx=canvas.getContext('2d',{willReadFrequently:true})!;
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
    onProgress?.(mode==='portrait' ? 'Loading portrait matting… First use downloads about 25 MB.' : 'Loading detailed cutouts… First use downloads about 190 MB.');
    worker ??= new Worker(new URL('./matting.worker.ts',import.meta.url),{type:'module'});
    const result = await new Promise<{width:number;height:number;alpha:ArrayBuffer}>((resolve,reject)=>{
      const timer=setTimeout(()=>{worker?.terminate();worker=undefined;reject(new Error('The cutout took too long. Try a smaller image or another browser.'));},300000);
      abort=()=>{clearTimeout(timer);worker?.terminate();worker=undefined;reject(new Error('Cutout cancelled.'));};
      worker!.onmessage=({data})=>{
        if(data.type==='progress') {onProgress?.(data.message);return;}
        clearTimeout(timer);
        if(data.type==='error') reject(new Error(data.message)); else resolve(data);
      };
      worker!.onerror=()=>{clearTimeout(timer);worker?.terminate();worker=undefined;reject(new Error('The cutout tool could not load. Check your connection and try again.'));};
      const copy=pixels.data.slice();
      worker!.postMessage({mode,width:canvas.width,height:canvas.height,pixels:copy.buffer},[copy.buffer]);
    });
    const low=document.createElement('canvas');low.width=result.width;low.height=result.height;
    const lc=low.getContext('2d')!,mask=lc.createImageData(low.width,low.height);
    const alpha=new Uint8ClampedArray(result.alpha);
    let visible=0;
    for(let i=0;i<alpha.length;i++) { mask.data[i*4+3]=alpha[i];if(alpha[i]>128)visible++; }
    if(visible<alpha.length*.003) throw new Error('No subject found. Try a closer, clearer photo.');
    lc.putImageData(mask,0,0);
    ctx.globalCompositeOperation='destination-in';
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    // Keep continuous alpha rather than thresholding away wispy hair.
    ctx.drawImage(low,0,0,canvas.width,canvas.height);
    ctx.globalCompositeOperation='source-over';
    return registerCanvas(canvas,true);
  } finally {pending=false;abort=undefined;}
}

export const personCutout = (src:string,onProgress?:Progress) => matte(src,'portrait',onProgress);
export const objectCutout = (src:string,onProgress?:Progress) => matte(src,'object',onProgress);
