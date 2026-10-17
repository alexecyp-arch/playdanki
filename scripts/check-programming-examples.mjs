import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const root=new URL('../',import.meta.url),rows=[];
for(let band=1;band<=10;band++)for(const line of (await fs.readFile(new URL('src/programming/lessons-'+band+'.txt',root),'utf8')).split(/\r?\n/).filter(Boolean)){const [,term,,,sample,result]=line.split('¦');rows.push({term,sample,result})}
let jsCount=0,compared=0;const failures=[];
const expected=result=>{if(/^It prints 0, 1 and 2/.test(result))return '0\n1\n2';if(/^It prints ABC, XYZ\./.test(result))return 'ABC, XYZ';const two=result.match(/^It prints (-?\d+(?:\.\d+)?) and then (-?\d+(?:\.\d+)?)/);if(two)return two[1]+'\n'+two[2];return result.match(/^It prints (true|false|True|False|None|undefined|null|NaN|-?\d+(?:\.\d+)?|Hello|Ready|Reader|Alex|ABC|price|Missing symbol)(?=\.(?!\d)|;|, | because| in this| after| to the)/)?.[1]};
for(const row of rows){const code=row.sample.slice(3).trim().replaceAll('\\n','\n');if(!row.sample.startsWith('JS:')||!code.includes('console.log')||/\b(document|window|localStorage|fetch|AbortController|speechSynthesis|SpeechSynthesisUtterance|AudioContext|Worker|setInterval|setTimeout|requestAnimationFrame|WebSocket|performance|worker)\b/.test(code))continue;const logs=[];
 try{vm.runInNewContext(code,{console:{log:(...args)=>logs.push(args.map(String).join(' '))},structuredClone,URL,URLSearchParams},{timeout:1000,microtaskMode:'afterEvaluate'});jsCount++;const value=expected(row.result);if(value!==undefined){compared++;if(logs.join('\n')!==value)failures.push({term:row.term,expected:value,actual:logs.join('\n')})}}
 catch(e){failures.push({term:row.term,error:e.message})}
}
const python=process.env.PROGRAMMING_PYTHON||'C:/Users/alexe/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const examples=rows.filter(r=>r.sample.startsWith('PY:')&&r.sample.includes('print(')).map(r=>({term:r.term,code:r.sample.slice(3).trim().replaceAll('\\n','\n'),result:r.result}));
const pythonReports=JSON.parse(execFileSync(python,[new URL('scripts/check-programming-examples.py',root).pathname.replace(/^\/(\w:)/,'$1')],{input:JSON.stringify(examples),encoding:'utf8',timeout:30000}));
for(const row of pythonReports){if(row.error)failures.push(row);const value=expected(row.result);if(value!==undefined){compared++;if(row.output!==value)failures.push({term:row.term,expected:value,actual:row.output})}}
if(failures.length)console.log(JSON.stringify(failures,null,2));assert.equal(failures.length,0,'Self-contained course examples failed');
console.log(JSON.stringify({javascriptExamplesExecuted:jsCount,pythonExamplesExecuted:pythonReports.length,outputChecks:compared,externalApiAndDeviceExamples:'not executed'}));
