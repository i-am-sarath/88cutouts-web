/** Public model files download once; image pixels stay in this worker. */
const runtimeURL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js';
let runtime: Promise<any> | undefined;
let loaded: { mode: string; model: any; processor: any } | undefined;
const progress = (message: string) => self.postMessage({ type: 'progress', message });

async function engine(mode: string) {
  const lib = await (runtime ??= import(/* @vite-ignore */ runtimeURL).catch((error)=>{runtime=undefined;throw error;}));
  lib.env.allowLocalModels = false;
  lib.env.backends.onnx.wasm.numThreads = 1;
  if (loaded?.mode === mode) return { ...loaded, lib };
  await loaded?.model.dispose(); loaded = undefined;
  const id = mode === 'portrait' ? 'Xenova/modnet' : 'studioludens/birefnet-lite-512';
  const download = (p: any) => {
    if (p.status === 'progress' && p.file?.endsWith('.onnx'))
      progress(`Downloading cutout tool: ${Math.round(p.progress)}% (saved on this device)`);
  };
  const processor = await lib.AutoProcessor.from_pretrained(id);
  // The fp16 object export returned incorrect masks in QA. Keep full precision.
  const model = await lib.AutoModel.from_pretrained(id, {dtype:'fp32',device:'wasm',progress_callback:download});
  loaded = { mode, model, processor };
  return { ...loaded, lib };
}

self.onmessage = async ({ data }) => {
  try {
    const { lib, model, processor } = await engine(data.mode);
    progress('Refining the subject and soft edges on your device…');
    const image = new lib.RawImage(new Uint8ClampedArray(data.pixels),data.width,data.height,4);
    const { pixel_values } = await processor(image);
    let outputs;
    try { outputs = await model({ [data.mode === 'portrait' ? 'input' : 'input_image']: pixel_values }); }
    finally { pixel_values.dispose(); }
    const tensor: any = outputs.output ?? outputs.logits ?? Object.values(outputs)[0];
    const width = tensor.dims[tensor.dims.length-1], height=tensor.dims[tensor.dims.length-2];
    const alpha = new Uint8ClampedArray(width*height);
    for (let i=0;i<alpha.length;i++) {
      const raw = tensor.data[i];
      const value = data.mode === 'portrait' ? raw : 1/(1+Math.exp(-raw));
      alpha[i] = Math.round(Math.max(0,Math.min(1,value))*255);
    }
    for (const output of Object.values(outputs) as any[]) output.dispose?.();
    self.postMessage({type:'result',width,height,alpha:alpha.buffer}, {transfer:[alpha.buffer]});
  } catch (error) {
    const detail=error instanceof Error ? error.message : String(error);
    console.error('Local matting failed:',detail);
    const message=/memory|alloc|heap/i.test(detail)
      ? 'This device does not have enough memory for detailed cutouts. Try the portrait tool or a transparent PNG.'
      : /fetch|network|download|load|http/i.test(detail)
      ? 'The cutout tool could not download. Check your connection and try again.'
      : 'The cutout tool could not run on this device. Try another browser or add a transparent PNG.';
    self.postMessage({type:'error',message});
    await loaded?.model.dispose(); loaded=undefined;
  }
};
