"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),{chromium}=require("playwright");

const questions=Array.from({length:5},(_,i)=>({id:`q${i+1}`,question:`How would you apply capability ${i+1} in this role?`,chinese:`你会如何在岗位中运用能力 ${i+1}？`,competency:`Capability ${i+1}`,jd_connection:"Required by the JD."}));
const feedback={relevance_score:4,structure_score:4,evidence_score:3,action_result_score:3,clarity_score:4,english_score:4,total_score:22,overall_diagnosis:"回答与岗位相关，但还需要更具体的证据。",strengths:["回答明确连接了岗位要求。"],biggest_weakness:"结果仍然不够具体。",improvement_advice:["补充真实结果。"],language_fixes:[],better_structure:["Point：先说明核心观点","Evidence：给出具体经历","Action：说明个人行动","Result：补充真实结果","Tie-back：回扣岗位"],suggested_answer:"I used [add your real action] and achieved [add your real result].",suggested_answer_rationale:"先明确个人行动，再补充真实结果并回扣岗位。",retry_focus:["补充真实结果"],improved:[],still_missing:[]};
const url="http://127.0.0.1:4173/";

async function openMock(page){await page.goto(url,{waitUntil:"networkidle"});await page.click('[data-route="mock"]')}
async function resume(page){await page.waitForSelector("text=继续上次模拟");await page.locator('[data-resume-id]').first().click()}

test("mobile persistence restores answers, retry, summary and history without touching learning progress",async()=>{
  const browser=await chromium.launch({headless:true,executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"}),context=await browser.newContext({viewport:{width:390,height:844}}),errors=[];
  let generateCalls=0,evaluateCalls=0;
  await context.addInitScript(()=>{if(!localStorage.getItem("interview-sprint-v2"))localStorage.setItem("interview-sprint-v2",JSON.stringify({version:2,items:{sentinel:{status:"known"}},questions:{},daily:{date:"2099-01-01",count:7},goal:12}))});
  await context.route("**/api/mock-interview",async route=>{const body=route.request().postDataJSON();if(body.action==="generate"){generateCalls++;return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({ok:true,data:{questions}})})}evaluateCalls++;const retry=Boolean(body.previous_answer);return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({ok:true,data:{...feedback,improved:retry?["个人行动比第一次更清楚。"]:[],still_missing:retry?["仍需补充一个真实结果。"]:[]}})})});
  const track=page=>{page.on("console",message=>{if(message.type()==="error")errors.push(message.text())});page.on("pageerror",error=>errors.push(error.message))};
  let page=await context.newPage();track(page);await page.goto(url,{waitUntil:"networkidle"});
  assert.equal(await page.evaluate(()=>navigator.serviceWorker.ready.then(reg=>reg.active?.state)),"activated");
  assert.deepEqual(await page.evaluate(()=>caches.keys()),["interview-sprint-v0.3.2"]);
  await page.click('[data-route="study"]');await page.waitForSelector("text=中文 → 英文");await page.click("#reveal");await page.waitForSelector("text=不会");await page.locator("[data-speak]").first().click();await page.click('[data-route="home"]');await page.click('[data-route="mock"]');
  await page.fill("#mockCompany","Example Co");await page.fill("#mockPosition","Product Operations Intern");await page.fill("#mockJd","Analyze campaign data, research user needs, and coordinate content execution.");await page.click('#mockSetup button[type="submit"]');
  await page.waitForSelector("text=Question 1 / 5");assert.equal(generateCalls,1);

  const draft="I reviewed the campaign data and shared the findings with my team.";
  await page.fill("#mockAnswer",draft);await page.reload({waitUntil:"networkidle"});await page.click('[data-route="mock"]');await resume(page);
  assert.equal(await page.inputValue("#mockAnswer"),draft);assert.equal(generateCalls,1);
  await page.click('#mockAnswerForm button[type="submit"]');await page.waitForSelector("text=Biggest Weakness");assert.equal(evaluateCalls,1);

  await page.close();page=await context.newPage();track(page);await openMock(page);await resume(page);
  await page.waitForSelector("text=Biggest Weakness");assert.equal(evaluateCalls,1);
  await page.click("#mockRetry");await page.fill("#mockAnswer","I reviewed the data, presented my findings, and helped the team choose the next action.");await page.click('#mockAnswerForm button[type="submit"]');await page.waitForSelector("text=Improved");await page.waitForSelector("text=Still Missing");assert.equal(evaluateCalls,2);
  await page.reload({waitUntil:"networkidle"});await page.click('[data-route="mock"]');await resume(page);await page.waitForSelector("text=个人行动比第一次更清楚。");await page.waitForSelector("text=回答思路");assert.equal(evaluateCalls,2);

  for(let i=1;i<5;i++){await page.click("#mockNext");await page.fill("#mockAnswer","I would use the role requirements to choose a clear action and explain the result.");await page.click('#mockAnswerForm button[type="submit"]');await page.waitForSelector("text=Biggest Weakness")}
  await page.click("#mockNext");await page.waitForSelector("text=本轮模拟面试完成");assert.equal(evaluateCalls,6);
  const completed=JSON.parse(await page.evaluate(()=>localStorage.getItem("eit-mock-interview-v1"))).records[0];
  assert.equal(completed.completed,true);assert.equal(completed.attempts[0].length,2);assert.equal(completed.summary.latest.length,5);

  await page.close();page=await context.newPage();track(page);await openMock(page);await resume(page);await page.waitForSelector("text=本轮模拟面试完成");assert.equal(generateCalls,1);assert.equal(evaluateCalls,6);
  await page.click("#mockRestart");await page.waitForSelector("text=历史模拟");await page.waitForSelector("text=已完成 · 平均 22 / 30");

  for(let i=1;i<=4;i++){await page.fill("#mockPosition",`History Role ${i}`);await page.fill("#mockJd",`History JD ${i}`);await page.click('#mockSetup button[type="submit"]');await page.waitForSelector("text=Question 1 / 5");await page.click("#mockSessions")}
  assert.equal(await page.locator(".history-item").count(),5);assert.equal(generateCalls,5);
  page.once("dialog",dialog=>dialog.accept());await page.locator(".history-delete").first().click();await page.waitForFunction(()=>document.querySelectorAll(".history-item").length===4);
  const saved=await page.evaluate(()=>({learning:JSON.parse(localStorage.getItem("interview-sprint-v2")),mock:JSON.parse(localStorage.getItem("eit-mock-interview-v1"))}));
  assert.equal(saved.learning.items.sentinel.status,"known");assert.equal(saved.mock.version,1);assert.equal(saved.mock.records.length,4);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);assert.equal(overflow,false);assert.deepEqual(errors,[]);
  await browser.close();
});
