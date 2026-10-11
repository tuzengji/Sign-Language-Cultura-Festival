// Run with playwright-cli run-code --filename=tests/image_loading.js on the game URL.
// Mock registration so this check never writes player records to production.
async page => {
 const base=page.url().split('#')[0],results=[];
 for(const width of [1440,390,320]) {
  const context=await page.context().browser().newContext({viewport:{width,height:950},isMobile:width<500,hasTouch:width<500});
  try {
   const p=await context.newPage(),characters=[],errors=[];
   await p.bringToFront();p.on('pageerror',e=>errors.push(e.message));
   p.on('request',r=>{if(r.url().includes('/assets/characters/'))characters.push(r.url());});
   await p.route('**/api/users',route=>route.fulfill({json:{ok:true,seq:9999,displayUid:'#9999',nickname:'图片验收',mbti:'XXXX'}}));
   // A slow unused outfit must never hold up the cards needed to play.
   await p.route('**/assets/characters/*.png',async route=>{await new Promise(r=>setTimeout(r,250));await route.continue();});
   await p.goto(base,{waitUntil:'domcontentloaded'});
   await p.getByRole('textbox',{name:'✿ 写一个昵称 ✿'}).fill('图片验收');
   await p.getByRole('button',{name:'开始游戏'}).click();
   await p.waitForFunction(()=>[...document.querySelectorAll('.card__img,.stage-item__img')].every(i=>i.complete&&i.naturalWidth>0),null,{timeout:30000});
   if(characters.some(url=>!url.endsWith('/start.png')))throw Error('Unused outfits preloaded: '+characters.length);
   const slots=[];
   for(const slot of ['top','bottom','shoe']) {
    await p.locator(`.rail__category[data-slot="${slot}"] .rail__head-btn`).click();
    await p.locator(`.card[data-slot="${slot}"][data-value="1"]`).click();
    await p.waitForFunction(()=>[...document.querySelectorAll('.stage-item__img')].length===4&&[...document.querySelectorAll('.stage-item__img')].every(i=>i.complete&&i.naturalWidth>0),null,{timeout:30000});
    await p.waitForTimeout(800);
    const rendered=await p.locator(`.card[data-slot="${slot}"] img, .stage-item__img`).evaluateAll(images=>images.map(i=>({src:i.getAttribute('src'),width:i.naturalWidth,height:i.naturalHeight,rendered:i.getBoundingClientRect().width})));
    if(rendered.length!==8||rendered.some(i=>!i.width||i.rendered<=0))throw Error('Blank '+slot+' image');
    slots.push({slot,images:rendered.length});
    await p.screenshot({path:`output/deployment/image-fix-20261011/${base.startsWith('https:')?'live':'local'}-${width}-${slot}.png`});
   }
   if(errors.length)throw Error(errors.join('\n'));
   results.push({width,slots,characterRequests:characters.length,errors});
  }finally{await context.close();}
 }
 return {base,passed:true,results};
}
