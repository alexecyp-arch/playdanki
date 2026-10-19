import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const events={},button={addEventListener:(name,fn)=>events.previous=fn};let mobile=true,selection='',next=0,previous=0,enabled=true;
const context=vm.createContext({window:{getSelection:()=>selection},matchMedia:()=>({matches:mobile}),document:{getElementById:()=>button,addEventListener:(name,fn)=>events[name]=fn}});
vm.runInContext(await fs.readFile('src/card-navigation.js','utf8'),context);
context.window.StudyNavigation.install({next:()=>next++,previous:()=>previous++,enabled:()=>enabled});
const tap=(extra={})=>events.click({button:0,target:{closest:()=>false},...extra});
tap();assert.equal(next,1);events.previous();assert.equal(previous,1);
for(const extra of [{defaultPrevented:true},{ctrlKey:true},{metaKey:true},{altKey:true},{shiftKey:true},{button:2},{target:{closest:()=>true}}])tap(extra);
assert.equal(next,1,'Controls, text fields, menus and modified clicks never advance');
selection='selected text';tap();selection='';mobile=false;tap();mobile=true;enabled=false;tap();assert.equal(next,1);
for(const file of ['src/app.js','src/programming.js','src/quant.js']){
 const source=await fs.readFile(file,'utf8'),root=file.endsWith('/app.js');
 const previousSource=source.match(root?/function previousCard\(\)\{[^\n]+/:/function previous\(\)\{[^\n]+/)[0];
 const advanceBranch=source.match(root?/if\(reviewCursor!==null\)\{[^\n]+/:/if\(reviewId!==null\)\{.*?return;\}/)[0];
 const harness=root?`let practiceActive=true,locked=false,shownCursor=4,reviewCursor=null,state={cursor:4},history={hidden:true},renders=0;function menuOpen(){return false}function render(){renders++;shownCursor=reviewCursor??state.cursor}`:`let busy=false,loadError=false,reviewId=null,state={current:{id:5}},renders=0;const $=()=>({hidden:true});function menuOpen(){return false}function render(){renders++}`;
 const c=vm.createContext({});vm.runInContext(harness+previousSource+`\nfunction next(){${advanceBranch}}`,c);
 vm.runInContext(root?'previousCard();previousCard();':'previous();previous();',c);
 assert.equal(vm.runInContext(root?'shownCursor':'reviewId',c),root?2:3);
 vm.runInContext('next();next();',c);assert.equal(vm.runInContext(root?'reviewCursor':'reviewId',c),null);
 assert.equal(vm.runInContext(root?'state.cursor':'state.current.id',c),root?4:5,'Review leaves saved progress unchanged');
}
console.log('Card navigation passed: phone taps, control exclusions, desktop exclusion, selected text, Previous and forward review without changing progress.');
