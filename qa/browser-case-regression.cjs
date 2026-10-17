'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {chromium}=require('playwright'),{withBrowserCase}=require('./browser-case.cjs');
test('failed interactions and navigation close every owned page/context before the next case',async()=>{
 const browser=await chromium.launch({headless:true}),outputDir=path.resolve('qa-artifacts/browser-case-regression');
 try{
  await assert.rejects(withBrowserCase(browser,'deliberate interaction failure',async session=>{
   const page=await session.newPage();await page.setContent('<button id="runAssessment">Assessment</button>');
   await page.locator('#missing').click({timeout:50});
  },{outputDir}),/Timeout/);
  assert.equal(browser.contexts().length,0);
  assert.ok(fs.existsSync(path.join(outputDir,'deliberate-interaction-failure/0/trace.zip')));
  await assert.rejects(withBrowserCase(browser,'deliberate navigation failure',async session=>{
   const page=await session.newPage();await page.goto('http://127.0.0.1:1');
  }),/net::ERR/);
  assert.equal(browser.contexts().length,0);
  await withBrowserCase(browser,'following case',async session=>{
   const page=await session.newPage({viewport:{width:390,height:844}});await page.setContent('<button>Working</button>');await page.getByRole('button',{name:'Working'}).click();
  });
  assert.equal(browser.contexts().length,0);
 }finally{await browser.close();}
});
