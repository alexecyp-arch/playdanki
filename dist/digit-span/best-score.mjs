export const BEST_KEY='digit-span-best:v1';
export function readBest(storage){try{const value=JSON.parse(storage.getItem(BEST_KEY));return Number.isSafeInteger(value?.best)&&value.best>=5?value.best:0;}catch{return 0;}}
export function recordBest(storage,achieved){const previous=readBest(storage);if(!Number.isSafeInteger(achieved)||achieved<5)return previous;const best=Math.max(previous,achieved);if(best!==previous)storage.setItem(BEST_KEY,JSON.stringify({v:1,best}));return best;}
