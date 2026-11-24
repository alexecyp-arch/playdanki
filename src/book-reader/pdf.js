let job=0, task;
export async function readPdf(file,{progress,read}){
  const token=++job;
  if(task)await task.destroy();
  progress('Opening PDF…');
  const pdfjs=await import('./vendor/pdf.min.mjs');
  if(token!==job)return;
  pdfjs.GlobalWorkerOptions.workerSrc='./vendor/pdf.worker.min.mjs';
  const data=new Uint8Array(await file.arrayBuffer());
  if(token!==job)return;
  task=pdfjs.getDocument({data,isEvalSupported:false,useWorkerFetch:false,useSystemFonts:true,disableFontFace:true,isImageDecoderSupported:false,useWasm:false});
  const currentTask=task;
  currentTask.onPassword=(update,reason)=>{
    const password=prompt(reason===2?'Incorrect password. Enter the PDF password:':'Enter the PDF password:');
    if(password===null){currentTask.destroy();progress('PDF cancelled.');}else update(password);
  };
  try{
    const doc=await currentTask.promise;
    let empty=0;const pages=[];
    for(let pageNumber=1;pageNumber<=doc.numPages;pageNumber++){
      if(token!==job)return;
      progress(`Reading PDF text · page ${pageNumber} / ${doc.numPages}`);
      const page=await doc.getPage(pageNumber),content=await page.getTextContent();
      let pageText='';
      for(const item of content.items){if(typeof item.str==='string')pageText+=item.str+(item.hasEOL?'\n':' ');}
      pageText=pageText.replace(/([a-z])-\n([a-z])/gi,'$1$2').trim();
      if(!pageText)empty++;
      pages.push(pageText);page.cleanup();
    }
    if(empty===pages.length)throw Error('This PDF has no selectable text. Scanned image PDFs need OCR first.');
    if(token!==job)return;
    await read(file.name,pages);
    progress(`${file.name} · ${doc.numPages} pages${empty?` · ${empty} pages without readable text skipped`:''}`);
  }catch(error){if(token===job)throw error;}
  finally{await currentTask.destroy();if(task===currentTask)task=undefined;}
}
