import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chartValue,shiftChartDay} from '../src/temponotes/timebox-model.mjs';
import {calendarLabel} from '../src/temponotes/calendar.mjs';
process.env.TZ='Asia/Nicosia';
assert.equal(shiftChartDay('2026-10-29',-1,'2026-10-29'),'2026-10-28');
assert.equal(shiftChartDay('2026-10-28',-1,'2026-10-29'),'2026-10-27');
assert.equal(shiftChartDay('2026-10-28',1,'2026-10-29'),'2026-10-29');
assert.equal(shiftChartDay('2026-10-29',1,'2026-10-29'),'2026-10-29','Cannot move beyond today');
assert.equal(shiftChartDay('2026-01-01',-1,'2026-10-29'),'2025-12-31');
assert.equal(shiftChartDay('2024-03-01',-1,'2026-10-29'),'2024-02-29');
assert.equal(shiftChartDay('2026-03-29',-1,'2026-10-29'),'2026-03-28','Spring clock change');
assert.equal(shiftChartDay('2026-10-25',-1,'2026-10-29'),'2026-10-24','Autumn clock change');
assert.equal(shiftChartDay('0001-01-01',-1,'2026-10-29'),'0001-01-01');
const now=new Date(2026,9,29,12).getTime(),task={days:{'2025-12-31':500,'2026-01-01':100,'2026-10-28':200,'2026-10-29':300,'2026-10-30':999},runningSince:null};
for(const kind of ['time','reps']){
 assert.equal(chartValue(task,now,'day','2026-10-28',kind),200);
 assert.equal(chartValue(task,now,'day','2026-10-30',kind),0);
 assert.equal(chartValue(task,now,'day','2026-10-20',kind),0);
 assert.equal(chartValue(task,now,'ytd',undefined,kind),600);
 assert.equal(chartValue(task,new Date(2027,0,1,12).getTime(),'ytd',undefined,kind),0);
}
assert.equal(chartValue({...task,runningSince:now-60000},now,'day','2026-10-29'),60300);
assert.equal(chartValue({...task,runningSince:now-60000},now,'ytd'),60600);
assert.equal(calendarLabel(now),'THURSDAY - 29 OCTOBER - AUTUMN');
for(const [month,season]of [[0,'WINTER'],[2,'SPRING'],[5,'SUMMER'],[8,'AUTUMN'],[11,'WINTER']])assert(calendarLabel(new Date(2026,month,1)).endsWith(season));
for(const file of ['dist/programming.html','dist/quant.html'])assert(!(await fs.readFile(file,'utf8')).includes('\r'),'Browser CSP hash input must use normalized line endings');
console.log('Calendar/YTD passed: selected day, empty/future dates, year boundary, live timers, both task types, seasons and browser line-ending normalization.');
