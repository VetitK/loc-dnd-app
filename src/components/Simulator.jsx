'use client';
// @ts-nocheck
import { useState, useCallback, useRef } from "react";

// ============ DEFAULT CONFIG ============
const DEFAULT_CFG = {
  // Player Classes
  classes: {
    Fighter: { hp:22, ac:7 },
    Priest: { hp:18, ac:6 },
    Mage: { hp:14, ac:6 },
  },
  // Skills: [dice array, damage type]
  skills: {
    "Sword Slash": { dice:"6,4", dmg:"Physical", cls:"Fighter", type:"atk" },
    "Stun Strike": { dice:"6,6,6,4", dmg:"Physical", cls:"Fighter", type:"atk", stun:true, singleUse:true },
    "Shield Wall": { dice:"", cls:"Fighter", type:"buff" },
    "Taunt": { dice:"", cls:"Fighter", type:"buff" },
    "Second Wind": { dice:"", cls:"Fighter", type:"selfheal" },
    "Heal": { dice:"6,4", cls:"Priest", type:"heal" },
    "Amplify": { dice:"6", cls:"Priest", type:"buff" },
    "Armor Break": { dice:"", cls:"Priest", type:"debuff" },
    "Daze": { dice:"", cls:"Priest", type:"debuff" },
    "Empower": { dice:"", cls:"Priest", type:"buff" },
    "Staff Strike": { dice:"6", dmg:"Physical", cls:"Mage", type:"atk" },
    "Fireball": { dice:"6,4", dmg:"Fire", cls:"Mage", type:"atk" },
    "Frost Bolt": { dice:"6,4", dmg:"Frost", cls:"Mage", type:"atk", unlock:true },
    "Lightning": { dice:"6,6", dmg:"Lightning", cls:"Mage", type:"atk", unlock:true },
    "Necrotic Blast": { dice:"6,6", dmg:"Necrotic", cls:"Mage", type:"atk", unlock:true },
    "Holy Strike": { dice:"6,6,6", dmg:"Holy", cls:"Mage", type:"atk", unlock:true },
  },
  // Monsters
  monsters: [
    { id:"goblin", name:"Goblin Scout", rank:"C", hp:18, ac:5, atk:"6,4", atkType:"Physical", target:"last_attacker", vuln:"", resist:"", immune:"", loot:15, aoeEvery:0, aoeDice:"", selfHealEvery:0, selfHealDice:"", drainEvery:0, drainDice:"", phase2Hp:0, phase2Atk:"" },
    { id:"skeleton", name:"Skeleton Warrior", rank:"C", hp:20, ac:6, atk:"6,6", atkType:"Physical", target:"init_cycle", vuln:"", resist:"", immune:"Necrotic", loot:20, aoeEvery:2, aoeDice:"6,4", selfHealEvery:0, selfHealDice:"", drainEvery:0, drainDice:"", phase2Hp:0, phase2Atk:"" },
    { id:"slime", name:"Slime", rank:"C", hp:16, ac:5, atk:"6,4", atkType:"Physical", target:"random", vuln:"", resist:"", immune:"", loot:20, aoeEvery:0, aoeDice:"", selfHealEvery:0, selfHealDice:"", drainEvery:0, drainDice:"", phase2Hp:0, phase2Atk:"" },
    { id:"dark_knight", name:"Dark Knight", rank:"B", hp:13, ac:8, atk:"6,6", atkType:"Physical", target:"last_attacker", vuln:"Holy,Lightning", resist:"Physical", immune:"Necrotic", loot:40, aoeEvery:0, aoeDice:"", selfHealEvery:0, selfHealDice:"", drainEvery:0, drainDice:"", phase2Hp:0, phase2Atk:"" },
    { id:"flame_serpent", name:"Flame Serpent", rank:"B", hp:40, ac:6, atk:"6,6,4", atkType:"Fire", target:"last_attacker", vuln:"Frost", resist:"", immune:"Fire", loot:45, aoeEvery:0, aoeDice:"", selfHealEvery:3, selfHealDice:"6", drainEvery:0, drainDice:"", phase2Hp:0, phase2Atk:"" },
    { id:"lich", name:"Lich King", rank:"A", hp:44, ac:7, atk:"6,6,4", atkType:"Necrotic", target:"highest_hp", vuln:"Holy", resist:"Frost", immune:"Necrotic", loot:65, aoeEvery:0, aoeDice:"", selfHealEvery:0, selfHealDice:"", drainEvery:3, drainDice:"6,6", phase2Hp:12, phase2Atk:"6,6,6" },
  ],
  // Duo
  duo: {
    queenHp:13, queenAc:4, queenAtk:"6", queenType:"Holy", queenVuln:"Necrotic", queenResist:"Frost,Physical", queenImmune:"Holy",
    kingHp:24, kingAc:7, kingAtk:"6,6", kingType:"Physical", kingVuln:"Holy,Lightning", kingResist:"Physical",
    kingAoeEvery:3, kingAoeDice:"6,6", queenDebuffEvery:2, queenBuffEvery:3,
    loot:100,
  },
  // Boss
  boss: { ac:7, atk:"6,6,6", atkType:"Fire", vuln:"Holy", resist:"Physical,Lightning", immune:"Necrotic,Fire", aoeEvery:2, aoeDice:"6,6", rageEvery:4, rageDice:"6,6,6,6" },
  // Shop prices
  shop: {
    potionHeal:15, fullHeal:30, ironRing:35, resistantCloak:35,
    scrollFrostBolt:30, scrollLightning:40, scrollNecroticBlast:40,
    scrollDaze:40, scrollEmpower:40, scrollArmorBreak:40,
    scrollTaunt:40, scrollSecondWind:40, scrollStunStrike:20,
    elixirPower:20, phoenixFeather:40, holyWater:15, whetstone:15, stunBomb:30,
  },
  // Time (seconds)
  time: { perTurn:120, shop:120, walk:60, bossTurn:150 },
};

// ============ HELPERS ============
const rl=(s)=>Math.floor(Math.random()*s)+1;
const parseDice=(s)=>(s||"").split(",").map(Number).filter(n=>n>0);
const rD=(arr)=>arr.reduce((s,d)=>s+rl(d),0);
const parseList=(s)=>(s||"").split(",").map(x=>x.trim()).filter(Boolean);
function atk2d6(){const d1=rl(6),d2=rl(6),t=d1+d2;return{total:t,cf:t===2,ch:t===12};}
function advAtk(){const a=atk2d6(),b=atk2d6();if(a.ch)return a;if(b.ch)return b;return a.total>=b.total?a:b;}
function disAtk(){const a=atk2d6(),b=atk2d6();if(a.cf)return a;if(b.cf)return b;return a.total<=b.total?a:b;}
function calcD(base,type,vuln,resist,immune){if(immune.includes(type))return 0;let d=base;if(vuln.includes(type))d*=2;if(resist.includes(type))d=Math.floor(d/2);return d;}
// Attack: 2=crit fail (miss), 12=crit hit (x2), <AC=glancing (dmg/2), >=AC=normal
function pAtk(adv,dis,dice,ac,amp){const ar=adv?advAtk():dis?disAtk():atk2d6();if(ar.cf)return{hit:false,dmg:0,type:"cf"};const d=rD(dice)+amp;if(ar.ch)return{hit:true,dmg:d*2,type:"crit"};if(ar.total>=ac)return{hit:true,dmg:d,type:"hit"};return{hit:true,dmg:Math.max(1,Math.floor(d/2)),type:"glance"};}
function mAtk(dice,tAc,dr=0){const ar=atk2d6();if(ar.cf)return{hit:false,dmg:0};const d=rD(dice);if(ar.ch)return{hit:true,dmg:Math.max(1,d*2-dr)};if(ar.total>=tAc)return{hit:true,dmg:Math.max(1,d-dr)};return{hit:true,dmg:Math.max(1,Math.floor(d/2)-dr)};}

// ============ SIMULATION ENGINE ============
function simGame(numSims, cfg) {
  const mr={};for(const m of cfg.monsters)mr[m.name]={wins:0,total:0,turns:0,tpks:0};mr["Duo"]={wins:0,total:0,turns:0,tpks:0};
  const aL=[],aB=[],aS=[],aT=[];

  // Schedule: 4 shop visits
  const sched=[];
  sched.push({type:"fight",mon:"goblin"});
  sched.push({type:"fight",mon:"slime"});
  sched.push({type:"shop",which:"early"});
  sched.push({type:"fight",mon:"skeleton"});
  sched.push({type:"fight",mon:"dark_knight"});
  sched.push({type:"shop",which:"mid"});
  sched.push({type:"fight",mon:"flame_serpent"});
  sched.push({type:"fight",mon:"lich"});
  sched.push({type:"shop",which:"late"});
  sched.push({type:"fight",mon:"duo"});
  sched.push({type:"shop",which:"boss_prep"});
  sched.push({type:"boss"});
  sched.push({type:"fullheal"});
  sched.push({type:"boss"});

  const schedNames=[];
  for(const s of sched){
    if(s.type==="fight"&&s.mon==="duo")schedNames.push("🗡 Duo (S)");
    else if(s.type==="fight"){const m=cfg.monsters.find(x=>x.id===s.mon);schedNames.push("🗡 "+(m?m.name:s.mon));}
    else if(s.type==="shop")schedNames.push("🛒 Shop");
    else if(s.type==="fullheal")schedNames.push("💊 Heal");
    else if(s.type==="boss")schedNames.push("👹 Boss");
  }
  const stepTimeSums=new Array(sched.length).fill(0);
  const stepTurnSums=new Array(sched.length).fill(0);

  // Preparse monster configs
  const monCfg={};
  for(const m of cfg.monsters){
    monCfg[m.id]={...m, atkD:parseDice(m.atk), vulnL:parseList(m.vuln), resistL:parseList(m.resist), immuneL:parseList(m.immune), aoeD:parseDice(m.aoeDice), shD:parseDice(m.selfHealDice), drD:parseDice(m.drainDice), p2D:parseDice(m.phase2Atk)};
  }
  const duoCfg={qAtk:parseDice(cfg.duo.queenAtk),kAtk:parseDice(cfg.duo.kingAtk),kAoe:parseDice(cfg.duo.kingAoeDice),qVuln:parseList(cfg.duo.queenVuln),qResist:parseList(cfg.duo.queenResist),qImmune:parseList(cfg.duo.queenImmune),kVuln:parseList(cfg.duo.kingVuln),kResist:parseList(cfg.duo.kingResist)};
  const bossCfg={atkD:parseDice(cfg.boss.atk),vulnL:parseList(cfg.boss.vuln),resistL:parseList(cfg.boss.resist),immuneL:parseList(cfg.boss.immune),aoeD:parseDice(cfg.boss.aoeDice),rageD:parseDice(cfg.boss.rageDice)};

  // Skill parsing
  const skMap={};for(const[k,v]of Object.entries(cfg.skills))skMap[k]={...v,diceArr:parseDice(v.dice)};
  const allScrollNames=["Frost Bolt","Lightning","Necrotic Blast","Daze","Empower","Armor Break","Taunt","Second Wind"];

  function getSkills(cls,team){
    const base=cls==="Fighter"?["Sword Slash","Shield Wall"]:cls==="Priest"?["Heal","Amplify"]:["Staff Strike","Fireball"];
    return[...base,...team.unlocked.filter(s=>skMap[s]?.cls===cls)];
  }
  // bestSkill: still used for Fighter/Priest in Phase2 and generic fallbacks
  function bestSkill(skills,vuln,resist,immune){
    let best=skills[0],be=0;
    for(const s of skills){const sk=skMap[s];if(!sk||sk.type!=="atk"||sk.singleUse)continue;const avg=sk.diceArr.reduce((a,d)=>a+(d+1)/2,0);const eff=immune.includes(sk.dmg)?0:vuln.includes(sk.dmg)?avg*2:resist.includes(sk.dmg)?avg/2:avg;if(eff>be){be=eff;best=s;}}
    return best;
  }
  // magePick: Mage trial-and-error without perfect knowledge
  function magePick(skills,mk){
    if(mk.locked)return mk.locked;
    const atks=skills.filter(s=>{const sk=skMap[s];return sk&&sk.type==="atk"&&!sk.singleUse&&!mk.immune.has(sk.dmg);});
    if(atks.length===0)return"Staff Strike";
    if(mk.tried.size===0)return atks.includes("Fireball")?"Fireball":atks[0];
    const untried=atks.filter(s=>!mk.tried.has(s));
    return untried.length>0?untried[0]:atks[0];
  }
  function makeChars(team){
    const lc=team.passives.lichCrown?5:0,ir=team.passives.ironRing?1:0;
    return[
      {cls:"Fighter",mxHp:cfg.classes.Fighter.hp+lc,hp:team.fHp,ac:cfg.classes.Fighter.ac+ir,skills:getSkills("Fighter",team),dd:0,adv:false,dis:false,amp:0},
      {cls:"Priest",mxHp:cfg.classes.Priest.hp+lc,hp:team.pHp,ac:cfg.classes.Priest.ac+ir,skills:getSkills("Priest",team),dd:0,adv:false,dis:false,amp:0},
      {cls:"Mage",mxHp:cfg.classes.Mage.hp+lc,hp:team.mHp,ac:cfg.classes.Mage.ac+ir,skills:getSkills("Mage",team),dd:0,adv:false,dis:false,amp:0},
    ];
  }

  // Item usage: 1 item per turn (team-shared). Priority: Phoenix Feather > Potion
  function useItem(team,cs){
    const dead=cs.find(c=>c.hp<=0);const pfIdx=team.items.indexOf("Phoenix Feather");
    if(dead&&pfIdx>=0){dead.hp=dead.mxHp;team.items.splice(pfIdx,1);return;}
    const potIdx=team.items.indexOf("Potion");const low=cs.filter(c=>c.hp>0&&c.hp<c.mxHp*0.3);
    if(low.length>0&&potIdx>=0){const t=low.reduce((a,b)=>a.hp<b.hp?a:b);t.hp=Math.min(t.mxHp,t.hp+rl(6)+rl(4));team.items.splice(potIdx,1);}
  }

  // Holy Water offensive use: after useItem, if nobody needs healing
  function useHolyWater(team,cs,mHpRef,vulnL,resistL,immuneL){
    const hwI=team.items.indexOf("Holy Water");
    if(hwI>=0&&!cs.find(c=>c.hp<=0)&&!cs.find(c=>c.hp>0&&c.hp<c.mxHp*0.3)){
      const d=calcD(rl(6)+rl(6),"Holy",vulnL,resistL,immuneL);mHpRef.v-=d;team.items.splice(hwI,1);return d;
    }
    return 0;
  }

  // Drop tables matching gameData.ts
  const DROP_TABLE={
    goblin:[{n:"Potion",ch:1}],
    skeleton:[{n:"Frost Bolt",ch:0.4,t:"scroll"},{n:"Daze",ch:0.3,t:"scroll"},{n:"Armor Break",ch:0.1,t:"scroll"}],
    slime:[{n:"Random Scroll",ch:0.25}],
    dark_knight:[{n:"Iron Ring",ch:1,t:"passive"},{n:"Lightning",ch:0.4,t:"scroll"},{n:"Armor Break",ch:0.2,t:"scroll"}],
    flame_serpent:[{n:"Necrotic Blast",ch:0.3,t:"scroll"},{n:"Potion",ch:1},{n:"Empower",ch:0.3,t:"scroll"}],
    lich:[{n:"Lich Crown",ch:1,t:"passive"},{n:"Taunt",ch:0.5,t:"scroll"}],
  };
  function applyDrops(t,mid){
    const drops=DROP_TABLE[mid];if(!drops)return;
    for(const dr of drops){
      if(Math.random()>=dr.ch)continue;
      if(dr.n==="Potion"){t.items.push("Potion");}
      else if(dr.n==="Iron Ring"){t.passives.ironRing=true;}
      else if(dr.n==="Lich Crown"){t.passives.lichCrown=true;const lc=5;t.fHp=Math.min(cfg.classes.Fighter.hp+lc,t.fHp+lc);t.pHp=Math.min(cfg.classes.Priest.hp+lc,t.pHp+lc);t.mHp=Math.min(cfg.classes.Mage.hp+lc,t.mHp+lc);}
      else if(dr.n==="Random Scroll"){const av=allScrollNames.filter(s=>!t.unlocked.includes(s));if(av.length)t.unlocked.push(av[Math.floor(Math.random()*av.length)]);}
      else if(dr.t==="scroll"){if(!t.unlocked.includes(dr.n))t.unlocked.push(dr.n);}
    }
  }

  // Smart shop with phase-specific priorities
  function doShop(t,which){
    const lc=()=>t.passives.lichCrown?5:0;
    const buyS=(s,c)=>{if(!t.unlocked.includes(s)&&t.loc>=c){t.unlocked.push(s);t.loc-=c;return true;}return false;};
    const buyItem=(name,cost)=>{if(t.loc>=cost){t.items.push(name);t.loc-=cost;return true;}return false;};
    const buyPot=()=>t.items.filter(i=>i==="Potion").length<3&&buyItem("Potion",cfg.shop.potionHeal);
    const buyHeal=()=>{const needsH=t.fHp<(cfg.classes.Fighter.hp+lc())*0.6||t.pHp<(cfg.classes.Priest.hp+lc())*0.6||t.mHp<(cfg.classes.Mage.hp+lc())*0.6;if(needsH&&t.loc>=cfg.shop.fullHeal){t.fHp=cfg.classes.Fighter.hp+lc();t.pHp=cfg.classes.Priest.hp+lc();t.mHp=cfg.classes.Mage.hp+lc();t.loc-=cfg.shop.fullHeal;}};
    if(which==="early"){
      // Priority: Frost Bolt (cheap, counters Flame Serpent later) → potion → heal
      buyS("Frost Bolt",cfg.shop.scrollFrostBolt);
      buyS("Daze",cfg.shop.scrollDaze);
      buyPot();buyPot();
      buyHeal();
    }else if(which==="mid"){
      // Priority: passives (long-term value) → key scrolls → stun strike → potions → heal
      if(!t.passives.ironRing&&t.loc>=cfg.shop.ironRing){t.passives.ironRing=true;t.loc-=cfg.shop.ironRing;}
      if(!t.passives.resistantCloak&&t.loc>=cfg.shop.resistantCloak){t.passives.resistantCloak=true;t.loc-=cfg.shop.resistantCloak;}
      buyS("Lightning",cfg.shop.scrollLightning);
      buyS("Armor Break",cfg.shop.scrollArmorBreak);
      buyS("Empower",cfg.shop.scrollEmpower);
      if(!t.hasStunStrike&&t.loc>=cfg.shop.scrollStunStrike){t.hasStunStrike=true;t.loc-=cfg.shop.scrollStunStrike;}
      buyPot();buyPot();
      buyHeal();
    }else if(which==="late"){
      // Priority: remaining scrolls → consumables → heal
      buyS("Necrotic Blast",cfg.shop.scrollNecroticBlast);
      buyS("Taunt",cfg.shop.scrollTaunt);
      buyS("Second Wind",cfg.shop.scrollSecondWind);
      // Passives if missed earlier
      if(!t.passives.ironRing&&t.loc>=cfg.shop.ironRing){t.passives.ironRing=true;t.loc-=cfg.shop.ironRing;}
      if(!t.passives.resistantCloak&&t.loc>=cfg.shop.resistantCloak){t.passives.resistantCloak=true;t.loc-=cfg.shop.resistantCloak;}
      buyItem("Holy Water",cfg.shop.holyWater);
      buyItem("Whetstone",cfg.shop.whetstone);
      buyPot();buyPot();buyPot();
      buyHeal();
    }else if(which==="boss_prep"){
      // Priority: Phoenix Feather → full heal → potions → consumables
      if(!t.items.includes("Phoenix Feather")&&t.loc>=cfg.shop.phoenixFeather)buyItem("Phoenix Feather",cfg.shop.phoenixFeather);
      // Always full heal before boss
      if(t.loc>=cfg.shop.fullHeal){t.fHp=cfg.classes.Fighter.hp+(t.passives.lichCrown?5:0);t.pHp=cfg.classes.Priest.hp+(t.passives.lichCrown?5:0);t.mHp=cfg.classes.Mage.hp+(t.passives.lichCrown?5:0);t.loc-=cfg.shop.fullHeal;}
      buyPot();buyPot();buyPot();
      buyItem("Holy Water",cfg.shop.holyWater);
      buyItem("Whetstone",cfg.shop.whetstone);
      // Any remaining scrolls
      for(const s of allScrollNames)buyS(s,40);
    }
  }

  // === FIGHT: Regular monsters ===
  function fight(team, mc){
    const cs=makeChars(team);let mHp=mc.hp,mAc=mc.ac,stun=false,sw=false,turn=0,td=0;
    const dr=team.passives.resistantCloak?1:0;const isSlime=mc.id==="slime";let stunUsed=!team.hasStunStrike;
    let tauntActive=false;const mk={immune:new Set(),locked:null,tried:new Set()};
    // Whetstone: apply +3 amp to Fighter at start of tough fights
    const wsI=team.items.indexOf("Whetstone");
    if(wsI>=0&&(mc.rank==="B"||mc.rank==="A")){cs[0].amp+=3;team.items.splice(wsI,1);}
    while(turn<15&&mHp>0&&cs.some(c=>c.hp>0)){
      turn++;sw=false;tauntActive=false;let curAc=mAc;
      if(isSlime)for(const c of cs)c.dis=true;
      for(const ch of cs){
        if(ch.hp<=0||mHp<=0)continue;
        if(ch.cls==="Priest"){
          // P1: Heal if critical (<25%)
          const crit=cs.filter(c=>c.hp>0&&c.hp<c.mxHp*0.25);
          if(crit.length>0){const t=crit.reduce((a,b)=>a.hp<b.hp?a:b);t.hp=Math.min(t.mxHp,t.hp+rD(skMap["Heal"].diceArr));continue;}
          // P2: Armor Break on B/A rank (turn 1 always, later only when team is healthy)
          const isTough=mc.rank==="B"||mc.rank==="A";
          if(ch.skills.includes("Armor Break")&&isTough&&(turn===1||!cs.find(c=>c.hp>0&&c.hp<c.mxHp*0.45))){curAc=Math.max(2,mAc-3);continue;}
          // P3: Heal if moderate (<45%)
          const w=cs.filter(c=>c.hp>0&&c.hp<c.mxHp*0.45);
          if(w.length>0){const t=w.reduce((a,b)=>a.hp<b.hp?a:b);t.hp=Math.min(t.mxHp,t.hp+rD(skMap["Heal"].diceArr));continue;}
          // P4: Daze / Empower / Amplify
          if(ch.skills.includes("Daze")&&!stun&&turn%2===0){continue;}
          if(ch.skills.includes("Empower")){const m=cs.find(c=>c.cls==="Mage"&&c.hp>0);if(m)m.adv=true;continue;}
          const dd=cs.find(c=>(c.cls==="Mage"||c.cls==="Fighter")&&c.hp>0);if(dd)dd.amp+=rD(skMap["Amplify"].diceArr);continue;
        }
        if(ch.cls==="Fighter"){
          // F1: Taunt if Mage is hurt
          const mage=cs.find(c=>c.cls==="Mage"&&c.hp>0);
          if(ch.skills.includes("Taunt")&&mage&&mage.hp<mage.mxHp*0.5){tauntActive=true;continue;}
          // F2: Second Wind if self low
          if(ch.skills.includes("Second Wind")&&ch.hp<ch.mxHp*0.3){ch.hp=Math.min(ch.mxHp,ch.hp+Math.floor(ch.mxHp*0.25));continue;}
          // F3: Shield Wall
          if(cs.filter(c=>c.hp>0&&c.hp<c.mxHp*0.4).length>=2){sw=true;continue;}
          // F4: Stun Strike turn 1 vs B+
          if(!stunUsed&&turn===1&&(mc.rank==="B"||mc.rank==="A")){
            stunUsed=true;const sk=skMap["Stun Strike"];const r=pAtk(ch.adv,ch.dis,sk.diceArr,curAc,ch.amp);ch.adv=false;ch.dis=false;ch.amp=0;
            if(r.hit){const d=calcD(r.dmg,sk.dmg,mc.vulnL,mc.resistL,mc.immuneL);mHp-=d;td+=d;ch.dd+=d;stun=true;}continue;}
          // F5: Sword Slash
          const sk=skMap["Sword Slash"];const r=pAtk(ch.adv,ch.dis,sk.diceArr,curAc,ch.amp);ch.adv=false;ch.dis=false;ch.amp=0;
          if(r.hit){const d=calcD(r.dmg,sk.dmg,mc.vulnL,mc.resistL,mc.immuneL);mHp-=d;td+=d;ch.dd+=d;}continue;
        }
        if(ch.cls==="Mage"){
          // Mage: trial-and-error skill selection
          const bs=magePick(ch.skills,mk);const sk=skMap[bs];if(!sk||sk.type!=="atk")continue;
          const r=pAtk(ch.adv,ch.dis,sk.diceArr,curAc,ch.amp);ch.adv=false;ch.dis=false;ch.amp=0;
          if(r.hit){
            const d=calcD(r.dmg,sk.dmg,mc.vulnL,mc.resistL,mc.immuneL);mHp-=d;td+=d;ch.dd+=d;
            mk.tried.add(bs);if(d===0&&sk.dmg)mk.immune.add(sk.dmg);else if(d>=r.dmg*1.5&&sk.dmg)mk.locked=bs;
          }else{mk.tried.add(bs);}
          continue;
        }
      }
      if(mHp<=0)break;
      if(stun){stun=false;continue;}
      // Monster attacks
      const al=cs.filter(c=>c.hp>0);if(al.length===0)break;
      let tgt;if(mc.target==="lowest_hp")tgt=al.reduce((a,b)=>a.hp<b.hp?a:b);else if(mc.target==="highest_hp")tgt=al.reduce((a,b)=>a.hp>b.hp?a:b);else if(mc.target==="most_dmg")tgt=al.reduce((a,b)=>a.dd>b.dd?a:b);else if(mc.target==="last_attacker"){const la=al.filter(c=>c.dd>0);tgt=la.length>0?la[la.length-1]:al[0];}else if(mc.target==="init_cycle")tgt=al[turn%al.length];else if(mc.target==="first_init")tgt=al[0];else if(mc.target==="lowest_ac")tgt=al.reduce((a,b)=>a.ac<b.ac?a:b);else tgt=al[Math.floor(Math.random()*al.length)];
      // Taunt override
      if(tauntActive){const ft=cs.find(c=>c.cls==="Fighter"&&c.hp>0);if(ft)tgt=ft;}
      const tAc=tgt.ac+(sw?2:0);const mr2=mAtk(mc.atkD,tAc,dr);if(mr2.hit)tgt.hp-=mr2.dmg;
      if(mc.aoeEvery>0&&turn%mc.aoeEvery===0&&mc.aoeD.length>0)for(const c of al){const ar=mAtk(mc.aoeD,c.ac+(sw?2:0),dr);if(ar.hit)c.hp-=ar.dmg;}
      if(mc.selfHealEvery>0&&turn%mc.selfHealEvery===0&&mc.shD.length>0)mHp=Math.min(mc.hp,mHp+rD(mc.shD));
      if(mc.drainEvery>0&&turn%mc.drainEvery===0&&mc.drD.length>0){const lo=al.reduce((a,b)=>a.hp<b.hp?a:b);const drA=mAtk(mc.drD,lo.ac+(sw?2:0),dr);if(drA.hit){lo.hp-=drA.dmg;mHp=Math.min(mc.hp,mHp+drA.dmg);}}
      useItem(team,cs);
      // Holy Water offensive
      const mHpRef={v:mHp};useHolyWater(team,cs,mHpRef,mc.vulnL,mc.resistL,mc.immuneL);const hwD=mHp-mHpRef.v;mHp=mHpRef.v;td+=hwD;
    }
    let won=mHp<=0;
    if(won&&mc.phase2Hp>0&&mc.p2D.length>0&&cs.some(c=>c.hp>0)){
      let p2=mc.phase2Hp,p2t=0;while(p2t<8&&p2>0&&cs.some(c=>c.hp>0)){p2t++;turn++;
        for(const c of cs.filter(cc=>cc.hp>0)){const bs=c.cls==="Mage"?magePick(c.skills,mk):bestSkill(c.skills,mc.vulnL,mc.resistL,mc.immuneL);const sk=skMap[bs];if(!sk||sk.type!=="atk")continue;const r=pAtk(false,false,sk.diceArr,mc.ac,0);if(r.hit){const d=calcD(r.dmg,sk.dmg,mc.vulnL,mc.resistL,mc.immuneL);p2-=d;td+=d;}}
        if(p2<=0)break;const al=cs.filter(c=>c.hp>0);if(al.length===0)break;const t=al.reduce((a,b)=>a.dd<=b.dd?a:b);const mr3=mAtk(mc.p2D,t.ac,dr);if(mr3.hit)t.hp-=mr3.dmg;}
      won=p2<=0;
    }
    return{won,turns:turn,totalDmg:td,tpk:cs.every(c=>c.hp<=0),hpLeft:cs.map(c=>({cls:c.cls,hp:Math.max(0,c.hp)}))};
  }

  // === FIGHT: Duo (Queen + King) ===
  function fightDuo(team){
    const cs=makeChars(team);const dc=cfg.duo;let qH=dc.queenHp,kH=dc.kingHp,kAc=dc.kingAc,turn=0,td=0;
    const dr=team.passives.resistantCloak?1:0;let lastAtk=null;let tauntActive=false;
    let mk={immune:new Set(),locked:null,tried:new Set()};
    // Whetstone for Duo
    const wsI=team.items.indexOf("Whetstone");if(wsI>=0){cs[0].amp+=3;team.items.splice(wsI,1);}
    while(turn<12&&(qH>0||kH>0)&&cs.some(c=>c.hp>0)){
      turn++;tauntActive=false;let abUsed=false;
      for(const ch of cs.filter(c=>c.hp>0)){if(qH<=0&&kH<=0)break;const isQ=qH>0;let tAc=isQ?dc.queenAc:kAc;const tV=isQ?duoCfg.qVuln:duoCfg.kVuln;const tR=isQ?duoCfg.qResist:duoCfg.kResist;const tI=isQ?duoCfg.qImmune:[];
        if(ch.cls==="Priest"){
          const crit=cs.filter(c=>c.hp>0&&c.hp<c.mxHp*0.25);
          if(crit.length>0){const t=crit.reduce((a,b)=>a.hp<b.hp?a:b);t.hp=Math.min(t.mxHp,t.hp+rD(skMap["Heal"].diceArr));continue;}
          if(ch.skills.includes("Armor Break")&&!isQ&&(turn===1||!cs.find(c=>c.hp>0&&c.hp<c.mxHp*0.45))&&!abUsed){tAc=Math.max(2,kAc-3);abUsed=true;continue;}
          const w=cs.filter(c=>c.hp>0&&c.hp<c.mxHp*0.45);
          if(w.length>0){const t=w.reduce((a,b)=>a.hp<b.hp?a:b);t.hp=Math.min(t.mxHp,t.hp+rD(skMap["Heal"].diceArr));continue;}
          if(ch.skills.includes("Daze")&&turn%3===0){continue;}
          if(ch.skills.includes("Empower")){const m=cs.find(c=>c.cls==="Mage"&&c.hp>0);if(m){m.adv=true;continue;}}
          const dd=cs.find(c=>(c.cls==="Mage"||c.cls==="Fighter")&&c.hp>0);if(dd)dd.amp+=rD(skMap["Amplify"].diceArr);continue;
        }
        if(ch.cls==="Fighter"){
          const mage=cs.find(c=>c.cls==="Mage"&&c.hp>0);
          if(ch.skills.includes("Taunt")&&mage&&mage.hp<mage.mxHp*0.5){tauntActive=true;continue;}
          if(ch.skills.includes("Second Wind")&&ch.hp<ch.mxHp*0.3){ch.hp=Math.min(ch.mxHp,ch.hp+Math.floor(ch.mxHp*0.25));continue;}
          const sk=skMap["Sword Slash"];const atkAc=(!isQ&&abUsed)?Math.max(2,kAc-3):tAc;
          const r=pAtk(ch.adv,ch.dis,sk.diceArr,atkAc,ch.amp);ch.adv=false;ch.dis=false;ch.amp=0;
          if(r.hit){const d=calcD(r.dmg,sk.dmg,tV,tR,tI);if(isQ)qH-=d;else kH-=d;td+=d;lastAtk=ch;}continue;
        }
        if(ch.cls==="Mage"){
          // Reset mage knowledge when switching from Queen to King
          const atkAc=(!isQ&&abUsed)?Math.max(2,kAc-3):tAc;
          const bs=magePick(ch.skills,mk);const sk=skMap[bs];if(!sk||sk.type!=="atk")continue;
          const r=pAtk(ch.adv,ch.dis,sk.diceArr,atkAc,ch.amp);ch.adv=false;ch.dis=false;ch.amp=0;
          if(r.hit){const d=calcD(r.dmg,sk.dmg,tV,tR,tI);if(isQ)qH-=d;else kH-=d;td+=d;lastAtk=ch;
            mk.tried.add(bs);if(d===0&&sk.dmg)mk.immune.add(sk.dmg);else if(d>=r.dmg*1.5&&sk.dmg)mk.locked=bs;
          }else{mk.tried.add(bs);}continue;
        }
      }
      // Reset mage knowledge when Queen dies (King has different immunities)
      if(qH<=0&&kH>0&&mk.locked){const sk=skMap[mk.locked];if(sk&&duoCfg.kResist.includes(sk.dmg))mk={immune:new Set(),locked:null,tried:new Set()};}

      if(qH>0){const al=cs.filter(c=>c.hp>0);if(al.length){
        let qt=lastAtk&&lastAtk.hp>0?lastAtk:al[0];
        if(tauntActive){const ft=cs.find(c=>c.cls==="Fighter"&&c.hp>0);if(ft)qt=ft;}
        {const mr3=mAtk(duoCfg.qAtk,qt.ac,dr);if(mr3.hit)qt.hp-=mr3.dmg;}
        if(dc.queenDebuffEvery>0&&turn%dc.queenDebuffEvery===0)for(const c of al)c.dis=true;
        if(dc.queenBuffEvery>0&&turn%dc.queenBuffEvery===0)kAc++;
      }}
      if(kH>0){const al=cs.filter(c=>c.hp>0);if(al.length){
        let kt=al.reduce((a,b)=>a.hp<b.hp?a:b);
        if(tauntActive){const ft=cs.find(c=>c.cls==="Fighter"&&c.hp>0);if(ft)kt=ft;}
        {const mr3=mAtk(duoCfg.kAtk,kt.ac,dr);if(mr3.hit)kt.hp-=mr3.dmg;}
        if(dc.kingAoeEvery>0&&turn%dc.kingAoeEvery===0)for(const c of al){const ar=mAtk(duoCfg.kAoe,c.ac,dr);if(ar.hit)c.hp-=ar.dmg;}
      }}
      useItem(team,cs);
    }
    return{won:qH<=0&&kH<=0,turns:turn,totalDmg:td,tpk:cs.every(c=>c.hp<=0),hpLeft:cs.map(c=>({cls:c.cls,hp:Math.max(0,c.hp)}))};
  }

  // === FIGHT: Boss ===
  function fightBoss(team){
    const cs=makeChars(team);const bc=cfg.boss;let td=0,turn=0;
    const dr=team.passives.resistantCloak?1:0;let tauntActive=false;
    const mk={immune:new Set(),locked:null,tried:new Set()};
    // Whetstone for Boss
    const wsI=team.items.indexOf("Whetstone");if(wsI>=0){cs[0].amp+=3;team.items.splice(wsI,1);}
    while(turn<5&&cs.some(c=>c.hp>0)){
      turn++;tauntActive=false;let bossAc=bc.ac;
      for(const ch of cs.filter(c=>c.hp>0)){
        if(ch.cls==="Priest"){
          const crit=cs.filter(c=>c.hp>0&&c.hp<c.mxHp*0.25);
          if(crit.length>0){const t=crit.reduce((a,b)=>a.hp<b.hp?a:b);t.hp=Math.min(t.mxHp,t.hp+rD(skMap["Heal"].diceArr));continue;}
          if(ch.skills.includes("Armor Break")&&(turn===1||!cs.find(c=>c.hp>0&&c.hp<c.mxHp*0.45))){bossAc=Math.max(2,bc.ac-3);continue;}
          const w=cs.filter(c=>c.hp>0&&c.hp<c.mxHp*0.45);
          if(w.length>0){const t=w.reduce((a,b)=>a.hp<b.hp?a:b);t.hp=Math.min(t.mxHp,t.hp+rD(skMap["Heal"].diceArr));continue;}
          if(ch.skills.includes("Empower")){const m=cs.find(c=>c.cls==="Mage"&&c.hp>0);if(m){m.adv=true;continue;}}
          const dd=cs.find(c=>(c.cls==="Mage"||c.cls==="Fighter")&&c.hp>0);if(dd)dd.amp+=rD(skMap["Amplify"].diceArr);continue;
        }
        if(ch.cls==="Fighter"){
          const mage=cs.find(c=>c.cls==="Mage"&&c.hp>0);
          if(ch.skills.includes("Taunt")&&mage&&mage.hp<mage.mxHp*0.5){tauntActive=true;continue;}
          if(ch.skills.includes("Second Wind")&&ch.hp<ch.mxHp*0.3){ch.hp=Math.min(ch.mxHp,ch.hp+Math.floor(ch.mxHp*0.25));continue;}
          const sk=skMap["Sword Slash"];const r=pAtk(ch.adv,ch.dis,sk.diceArr,bossAc,ch.amp);ch.adv=false;ch.dis=false;ch.amp=0;
          if(r.hit){const d=calcD(r.dmg,sk.dmg,bossCfg.vulnL,bossCfg.resistL,bossCfg.immuneL);td+=d;ch.dd+=d;}continue;
        }
        if(ch.cls==="Mage"){
          const bs=magePick(ch.skills,mk);const sk=skMap[bs];if(!sk||sk.type!=="atk")continue;
          const r=pAtk(ch.adv,ch.dis,sk.diceArr,bossAc,ch.amp);ch.adv=false;ch.dis=false;ch.amp=0;
          if(r.hit){const d=calcD(r.dmg,sk.dmg,bossCfg.vulnL,bossCfg.resistL,bossCfg.immuneL);td+=d;ch.dd+=d;
            mk.tried.add(bs);if(d===0&&sk.dmg)mk.immune.add(sk.dmg);else if(d>=r.dmg*1.5&&sk.dmg)mk.locked=bs;
          }else{mk.tried.add(bs);}continue;
        }
      }
      const al=cs.filter(c=>c.hp>0);if(al.length===0)break;
      let tgt=al.reduce((a,b)=>a.dd>b.dd?a:b);
      if(tauntActive){const ft=cs.find(c=>c.cls==="Fighter"&&c.hp>0);if(ft)tgt=ft;}
      const mr3=mAtk(bossCfg.atkD,tgt.ac,dr);if(mr3.hit)tgt.hp-=mr3.dmg;
      if(bc.aoeEvery>0&&turn%bc.aoeEvery===0)for(const c of al){const ar=mAtk(bossCfg.aoeD,c.ac,dr);if(ar.hit)c.hp-=ar.dmg;}
      if(bc.rageEvery>0&&turn%bc.rageEvery===0){const lo=al.reduce((a,b)=>a.ac<b.ac?a:b);const rr=mAtk(bossCfg.rageD,lo.ac,dr);if(rr.hit)lo.hp-=rr.dmg;}
      useItem(team,cs);
    }
    return{totalDmg:td,turns:turn,tpk:cs.every(c=>c.hp<=0)};
  }

  // === MAIN SIM LOOP ===
  for(let sim=0;sim<numSims;sim++){
    let t={loc:0,items:[],unlocked:[],hasStunStrike:false,fHp:cfg.classes.Fighter.hp,pHp:cfg.classes.Priest.hp,mHp:cfg.classes.Mage.hp,passives:{ironRing:false,resistantCloak:false,lichCrown:false},totalBossDmg:0};
    let tL=0,tT=0,si=0;
    for(const step of sched){
      let stepTime=0;
      if(step.type==="fight"){
        let res;
        if(step.mon==="duo"){res=fightDuo(t);mr["Duo"].total++;if(res.won){mr["Duo"].wins++;t.loc+=cfg.duo.loot;tL+=cfg.duo.loot;if(!t.unlocked.includes("Holy Strike"))t.unlocked.push("Holy Strike");t.items.push("Phoenix Feather");}mr["Duo"].turns+=res.turns;if(res.tpk)mr["Duo"].tpks++;}
        else{const mc=monCfg[step.mon];res=fight(t,mc);mr[mc.name].total++;
          if(res.won){mr[mc.name].wins++;t.loc+=mc.loot;tL+=mc.loot;applyDrops(t,step.mon);}
          mr[mc.name].turns+=res.turns;if(res.tpk)mr[mc.name].tpks++;
        }
        // TPK: wipe LOC + items, keep skills/passives, free full heal
        if(res.tpk){
          t.loc=0;t.items=[];t.hasStunStrike=false;
          const lc=t.passives.lichCrown?5:0;
          t.fHp=cfg.classes.Fighter.hp+lc;t.pHp=cfg.classes.Priest.hp+lc;t.mHp=cfg.classes.Mage.hp+lc;
        }else{t.fHp=Math.max(1,res.hpLeft[0].hp);t.pHp=Math.max(1,res.hpLeft[1].hp);t.mHp=Math.max(1,res.hpLeft[2].hp);}
        stepTime=cfg.time.walk+res.turns*cfg.time.perTurn;stepTurnSums[si]+=res.turns;
      }else if(step.type==="shop"){
        stepTime=cfg.time.walk+cfg.time.shop;
        doShop(t,step.which);
      }else if(step.type==="fullheal"){
        stepTime=cfg.time.shop;const lc=t.passives.lichCrown?5:0;
        if(t.loc>=cfg.shop.fullHeal){t.fHp=cfg.classes.Fighter.hp+lc;t.pHp=cfg.classes.Priest.hp+lc;t.mHp=cfg.classes.Mage.hp+lc;t.loc-=cfg.shop.fullHeal;}
      }else if(step.type==="boss"){
        // No free heal — team enters with current HP
        const br=fightBoss(t);t.totalBossDmg+=br.totalDmg;stepTime=cfg.time.walk+br.turns*cfg.time.bossTurn;stepTurnSums[si]+=br.turns;
      }
      tT+=stepTime;stepTimeSums[si]+=stepTime;si++;
    }
    aL.push(tL);aB.push(t.totalBossDmg);aS.push(t.unlocked.length);aT.push(tT);
  }

  const ms={};for(const[n,d]of Object.entries(mr))ms[n]={...d,winRate:d.total>0?(d.wins/d.total*100).toFixed(1):"N/A",avgTurns:d.total>0?(d.turns/d.total).toFixed(1):"N/A",tpkRate:d.total>0?(d.tpks/d.total*100).toFixed(1):"N/A",avgMin:d.total>0?((d.turns/d.total)*cfg.time.perTurn/60).toFixed(1):"N/A"};
  return{monStats:ms,avgLoc:(aL.reduce((a,b)=>a+b,0)/numSims).toFixed(0),avgBossDmg:(aB.reduce((a,b)=>a+b,0)/numSims).toFixed(0),avgSkills:(aS.reduce((a,b)=>a+b,0)/numSims).toFixed(1),bossDist:aB,avgTimeMin:(aT.reduce((a,b)=>a+b,0)/numSims/60).toFixed(0),numSims,
    route:schedNames.map((name,i)=>({name,avgMin:(stepTimeSums[i]/numSims/60).toFixed(1),avgTurns:(stepTurnSums[i]/numSims).toFixed(1)}))};
}

// ============ UI COMPONENTS ============
const S={panel:{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:16,marginBottom:14},h2:{fontSize:13,fontWeight:700,color:"#f8fafc",margin:"0 0 12px"},lbl:{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:0.5,marginBottom:2},inp:{background:"#1e293b",border:"1px solid #334155",borderRadius:6,padding:"4px 8px",color:"#e2e8f0",fontSize:12,fontFamily:"inherit",width:"100%",boxSizing:"border-box"},row:{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8},cell:{flex:"1 1 60px",minWidth:55}};

const Field=({label,value,onChange,w})=>(<div style={{...S.cell,...(w?{flex:`0 0 ${w}px`,minWidth:w}:{})}}><div style={S.lbl}>{label}</div><input style={S.inp} value={value} onChange={e=>onChange(e.target.value)}/></div>);

const Bar=({rate,label,target})=>{const n=parseFloat(rate)||0;const clr=n>=target-10&&n<=target+10?"#22c55e":n<target-10?"#ef4444":"#f59e0b";return(<div style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3,color:"#94a3b8"}}><span>{label}</span><span style={{color:clr,fontWeight:700}}>{rate}%</span></div><div style={{background:"#1e293b",borderRadius:6,height:16,overflow:"hidden",position:"relative"}}><div style={{width:`${Math.min(100,n)}%`,height:"100%",background:clr,borderRadius:6,transition:"width 0.4s"}}/><div style={{position:"absolute",left:`${target}%`,top:0,bottom:0,width:2,background:"#fbbf24",opacity:0.7}}/></div></div>);};
const Card=({title,value,sub,color="#60a5fa"})=>(<div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:"12px 14px",flex:"1 1 100px",minWidth:95}}><div style={{fontSize:9,color:"#64748b",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{title}</div><div style={{fontSize:20,fontWeight:800,color,lineHeight:1.1}}>{value}</div>{sub&&<div style={{fontSize:10,color:"#475569",marginTop:3}}>{sub}</div>}</div>);
const Verdict=({r})=>{const n=parseFloat(r);if(n>=60&&n<=75)return <span style={{color:"#22c55e",fontWeight:700}}>BALANCED</span>;if(n>=50&&n<60)return <span style={{color:"#f59e0b",fontWeight:700}}>HARD</span>;if(n>75&&n<=85)return <span style={{color:"#f59e0b",fontWeight:700}}>EASY</span>;if(n<50)return <span style={{color:"#ef4444",fontWeight:700}}>TOO HARD</span>;return <span style={{color:"#ef4444",fontWeight:700}}>TOO EASY</span>;};
const monRanks={"Goblin Scout":"C","Skeleton Warrior":"C","Slime":"C","Dark Knight":"B","Flame Serpent":"B","Lich King":"A","Duo":"S"};
const rankTargets={"C":[80,90],"B":[60,75],"A":[40,60],"S":[15,30]};

// ============ MAIN APP ============
export default function Simulator(){
  const[cfg,setCfg]=useState(JSON.parse(JSON.stringify(DEFAULT_CFG)));
  const[res,setRes]=useState(null);const[running,setRunning]=useState(false);const[nSims,setNSims]=useState(10000);const[prog,setProg]=useState(0);
  const[showCfg,setShowCfg]=useState(false);

  const upd=(path,val)=>{setCfg(prev=>{const next=JSON.parse(JSON.stringify(prev));let obj=next;const parts=path.split(".");for(let i=0;i<parts.length-1;i++)obj=obj[parts[i]];obj[parts[parts.length-1]]=val;return next;});};
  const updMon=(idx,key,val)=>{setCfg(prev=>{const next=JSON.parse(JSON.stringify(prev));next.monsters[idx][key]=val;return next;});};

  const run=useCallback(()=>{setRunning(true);setProg(0);const batches=nSims>=100000?50:nSims>=10000?20:4,bSize=Math.floor(nSims/batches);let merged=null,batch=0;
    const cfgSnap=JSON.parse(JSON.stringify(cfg));
    const doBatch=()=>{if(batch>=batches){setRunning(false);return;}setTimeout(()=>{const n=batch===batches-1?nSims-bSize*(batches-1):bSize;const r=simGame(n,cfgSnap);
      if(!merged)merged=r;else{for(const[k,v]of Object.entries(r.monStats)){const m=merged.monStats[k];if(!m){merged.monStats[k]=v;continue;}m.wins+=v.wins;m.total+=v.total;m.tpks+=v.tpks;m.turns+=v.turns;m.winRate=(m.wins/m.total*100).toFixed(1);m.avgTurns=(m.turns/m.total).toFixed(1);m.tpkRate=(m.tpks/m.total*100).toFixed(1);m.avgMin=((m.turns/m.total)*cfgSnap.time.perTurn/60).toFixed(1);}const nd=[...merged.bossDist,...r.bossDist];if(nd.length>5000){const st=Math.ceil(nd.length/5000);merged.bossDist=nd.filter((_,i)=>i%st===0);}else merged.bossDist=nd;merged.route=r.route;}
      setProg(Math.round((batch+1)/batches*100));setRes({...merged,numSims:nSims});batch++;doBatch();},30);};setTimeout(doBatch,50);
  },[nSims,cfg]);

  const overall=res?(Object.values(res.monStats).reduce((s,m)=>s+m.wins,0)/Math.max(1,Object.values(res.monStats).reduce((s,m)=>s+m.total,0))*100).toFixed(1):"0";

  return(<div style={{fontFamily:"'JetBrains Mono','SF Mono',monospace",background:"#020617",color:"#e2e8f0",minHeight:"100vh",padding:"16px 12px"}}>
    <div style={{maxWidth:920,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <h1 style={{fontSize:24,fontWeight:800,color:"#f8fafc",margin:"0 0 4px"}}>DnD Balance Simulator v8</h1>
        <div style={{fontSize:11,color:"#64748b"}}>2d6 | 2=miss | {"<"}AC=dmg/2 | {">"}=AC=full | 12=x2 | d4+d6 only</div>
      </div>

      {/* Config Toggle */}
      <div style={{textAlign:"center",marginBottom:12}}>
        <button onClick={()=>setShowCfg(!showCfg)} style={{padding:"6px 20px",borderRadius:8,border:"1px solid #334155",background:showCfg?"#1e3a5f":"#0f172a",color:showCfg?"#60a5fa":"#94a3b8",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
          {showCfg?"Hide Config Panel":"Show Config Panel"}
        </button>
      </div>

      {/* CONFIG PANEL */}
      {showCfg&&<>
        {/* Player Classes */}
        <div style={S.panel}><h2 style={S.h2}>PLAYER CLASSES</h2>
          {Object.entries(cfg.classes).map(([cls,v])=>(<div key={cls} style={S.row}>
            <div style={{...S.cell,flex:"0 0 80px"}}><div style={{...S.lbl,color:"#f8fafc",fontSize:12,marginTop:6}}>{cls}</div></div>
            <Field label="HP" value={v.hp} onChange={val=>upd(`classes.${cls}.hp`,parseInt(val)||0)}/>
            <Field label="AC" value={v.ac} onChange={val=>upd(`classes.${cls}.ac`,parseInt(val)||0)}/>
          </div>))}
        </div>

        {/* Skills */}
        <div style={S.panel}><h2 style={S.h2}>SKILLS (dice as comma-separated: 6,4 = 1d6+1d4)</h2>
          {Object.entries(cfg.skills).filter(([,v])=>v.type==="atk").map(([name,v])=>(<div key={name} style={S.row}>
            <div style={{...S.cell,flex:"0 0 110px"}}><div style={{...S.lbl,color:"#f8fafc",fontSize:11,marginTop:6}}>{name}</div></div>
            <Field label="Dice" value={v.dice} onChange={val=>{const next={...cfg};next.skills[name]={...v,dice:val};setCfg({...next});}} w={90}/>
            <Field label="Type" value={v.dmg||""} onChange={val=>{const next={...cfg};next.skills[name]={...v,dmg:val};setCfg({...next});}} w={80}/>
            <div style={{...S.cell,flex:"0 0 50px"}}><div style={S.lbl}>Class</div><div style={{fontSize:11,color:"#94a3b8",marginTop:4}}>{v.cls}</div></div>
          </div>))}
        </div>

        {/* Monsters */}
        <div style={S.panel}><h2 style={S.h2}>MONSTERS</h2>
          {cfg.monsters.map((m,i)=>(<div key={m.id} style={{borderBottom:"1px solid #1e293b",paddingBottom:10,marginBottom:10}}>
            <div style={{fontSize:12,color:"#f59e0b",fontWeight:700,marginBottom:6}}>{m.name} (Rank {m.rank})</div>
            <div style={S.row}>
              <Field label="HP" value={m.hp} onChange={v=>updMon(i,"hp",parseInt(v)||0)}/>
              <Field label="AC" value={m.ac} onChange={v=>updMon(i,"ac",parseInt(v)||0)}/>
              <Field label="Attack Dice" value={m.atk} onChange={v=>updMon(i,"atk",v)} w={80}/>
              <Field label="Loot LOC" value={m.loot} onChange={v=>updMon(i,"loot",parseInt(v)||0)}/>
            </div>
            <div style={S.row}>
              <Field label="Vuln" value={m.vuln} onChange={v=>updMon(i,"vuln",v)} w={100}/>
              <Field label="Resist" value={m.resist} onChange={v=>updMon(i,"resist",v)} w={100}/>
              <Field label="Immune" value={m.immune} onChange={v=>updMon(i,"immune",v)} w={100}/>
            </div>
            <div style={S.row}>
              <Field label="AoE Every" value={m.aoeEvery} onChange={v=>updMon(i,"aoeEvery",parseInt(v)||0)}/>
              <Field label="AoE Dice" value={m.aoeDice} onChange={v=>updMon(i,"aoeDice",v)}/>
              <Field label="SelfHeal Every" value={m.selfHealEvery} onChange={v=>updMon(i,"selfHealEvery",parseInt(v)||0)}/>
              <Field label="SelfHeal Dice" value={m.selfHealDice} onChange={v=>updMon(i,"selfHealDice",v)}/>
            </div>
            <div style={S.row}>
              <Field label="Drain Every" value={m.drainEvery} onChange={v=>updMon(i,"drainEvery",parseInt(v)||0)}/>
              <Field label="Drain Dice" value={m.drainDice} onChange={v=>updMon(i,"drainDice",v)}/>
              <Field label="Phase2 HP" value={m.phase2Hp} onChange={v=>updMon(i,"phase2Hp",parseInt(v)||0)}/>
              <Field label="Phase2 Atk" value={m.phase2Atk} onChange={v=>updMon(i,"phase2Atk",v)}/>
            </div>
          </div>))}
        </div>

        {/* Duo */}
        <div style={S.panel}><h2 style={S.h2}>DUO (RANK S)</h2>
          <div style={{fontSize:11,color:"#a78bfa",marginBottom:8}}>Queen Divine</div>
          <div style={S.row}>
            <Field label="HP" value={cfg.duo.queenHp} onChange={v=>upd("duo.queenHp",parseInt(v)||0)}/>
            <Field label="AC" value={cfg.duo.queenAc} onChange={v=>upd("duo.queenAc",parseInt(v)||0)}/>
            <Field label="Atk Dice" value={cfg.duo.queenAtk} onChange={v=>upd("duo.queenAtk",v)}/>
            <Field label="Vuln" value={cfg.duo.queenVuln} onChange={v=>upd("duo.queenVuln",v)}/>
            <Field label="Resist" value={cfg.duo.queenResist} onChange={v=>upd("duo.queenResist",v)}/>
            <Field label="Immune" value={cfg.duo.queenImmune} onChange={v=>upd("duo.queenImmune",v)}/>
          </div>
          <div style={S.row}>
            <Field label="Debuff Every" value={cfg.duo.queenDebuffEvery} onChange={v=>upd("duo.queenDebuffEvery",parseInt(v)||0)}/>
            <Field label="Buff King Every" value={cfg.duo.queenBuffEvery} onChange={v=>upd("duo.queenBuffEvery",parseInt(v)||0)}/>
          </div>
          <div style={{fontSize:11,color:"#f87171",marginBottom:8,marginTop:8}}>King Conquer</div>
          <div style={S.row}>
            <Field label="HP" value={cfg.duo.kingHp} onChange={v=>upd("duo.kingHp",parseInt(v)||0)}/>
            <Field label="AC" value={cfg.duo.kingAc} onChange={v=>upd("duo.kingAc",parseInt(v)||0)}/>
            <Field label="Atk Dice" value={cfg.duo.kingAtk} onChange={v=>upd("duo.kingAtk",v)}/>
            <Field label="Vuln" value={cfg.duo.kingVuln} onChange={v=>upd("duo.kingVuln",v)}/>
            <Field label="Resist" value={cfg.duo.kingResist} onChange={v=>upd("duo.kingResist",v)}/>
          </div>
          <div style={S.row}>
            <Field label="AoE Every" value={cfg.duo.kingAoeEvery} onChange={v=>upd("duo.kingAoeEvery",parseInt(v)||0)}/>
            <Field label="AoE Dice" value={cfg.duo.kingAoeDice} onChange={v=>upd("duo.kingAoeDice",v)}/>
            <Field label="Loot LOC" value={cfg.duo.loot} onChange={v=>upd("duo.loot",parseInt(v)||0)}/>
          </div>
        </div>

        {/* Boss */}
        <div style={S.panel}><h2 style={S.h2}>BOSS (Infernal Demon Lord)</h2>
          <div style={S.row}>
            <Field label="AC" value={cfg.boss.ac} onChange={v=>upd("boss.ac",parseInt(v)||0)}/>
            <Field label="Atk Dice" value={cfg.boss.atk} onChange={v=>upd("boss.atk",v)}/>
            <Field label="Vuln" value={cfg.boss.vuln} onChange={v=>upd("boss.vuln",v)}/>
            <Field label="Resist" value={cfg.boss.resist} onChange={v=>upd("boss.resist",v)}/>
            <Field label="Immune" value={cfg.boss.immune} onChange={v=>upd("boss.immune",v)}/>
          </div>
          <div style={S.row}>
            <Field label="AoE Every" value={cfg.boss.aoeEvery} onChange={v=>upd("boss.aoeEvery",parseInt(v)||0)}/>
            <Field label="AoE Dice" value={cfg.boss.aoeDice} onChange={v=>upd("boss.aoeDice",v)}/>
            <Field label="Rage Every" value={cfg.boss.rageEvery} onChange={v=>upd("boss.rageEvery",parseInt(v)||0)}/>
            <Field label="Rage Dice" value={cfg.boss.rageDice} onChange={v=>upd("boss.rageDice",v)}/>
          </div>
        </div>

        {/* Shop & Time */}
        <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
          <div style={{...S.panel,flex:"1 1 300px"}}><h2 style={S.h2}>SHOP PRICES</h2>
            <div style={S.row}>
              <Field label="Potion" value={cfg.shop.potionHeal} onChange={v=>upd("shop.potionHeal",parseInt(v)||0)}/>
              <Field label="Full Heal" value={cfg.shop.fullHeal} onChange={v=>upd("shop.fullHeal",parseInt(v)||0)}/>
              <Field label="Iron Ring" value={cfg.shop.ironRing} onChange={v=>upd("shop.ironRing",parseInt(v)||0)}/>
              <Field label="Res. Cloak" value={cfg.shop.resistantCloak} onChange={v=>upd("shop.resistantCloak",parseInt(v)||0)}/>
            </div>
            <div style={S.row}>
              <Field label="Holy Water" value={cfg.shop.holyWater} onChange={v=>upd("shop.holyWater",parseInt(v)||0)}/>
              <Field label="Phoenix" value={cfg.shop.phoenixFeather} onChange={v=>upd("shop.phoenixFeather",parseInt(v)||0)}/>
              <Field label="Stun Bomb" value={cfg.shop.stunBomb} onChange={v=>upd("shop.stunBomb",parseInt(v)||0)}/>
              <Field label="Whetstone" value={cfg.shop.whetstone} onChange={v=>upd("shop.whetstone",parseInt(v)||0)}/>
            </div>
          </div>
          <div style={{...S.panel,flex:"1 1 200px"}}><h2 style={S.h2}>TIME (seconds)</h2>
            <div style={S.row}>
              <Field label="Per Turn" value={cfg.time.perTurn} onChange={v=>upd("time.perTurn",parseInt(v)||0)}/>
              <Field label="Shop" value={cfg.time.shop} onChange={v=>upd("time.shop",parseInt(v)||0)}/>
              <Field label="Walk" value={cfg.time.walk} onChange={v=>upd("time.walk",parseInt(v)||0)}/>
              <Field label="Boss Turn" value={cfg.time.bossTurn} onChange={v=>upd("time.bossTurn",parseInt(v)||0)}/>
            </div>
          </div>
        </div>
        <div style={{textAlign:"center",marginBottom:8}}><button onClick={()=>setCfg(JSON.parse(JSON.stringify(DEFAULT_CFG)))} style={{padding:"4px 16px",borderRadius:6,border:"1px solid #334155",background:"#0f172a",color:"#ef4444",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Reset to Defaults</button></div>
      </>}

      {/* Run Controls */}
      <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center",justifyContent:"center",flexWrap:"wrap"}}>
        {[1000,10000,100000,1000000].map(n=>(<button key={n} onClick={()=>setNSims(n)} style={{padding:"4px 12px",borderRadius:6,border:nSims===n?"1px solid #3b82f6":"1px solid #1e293b",background:nSims===n?"#1e3a5f":"#0f172a",color:nSims===n?"#60a5fa":"#64748b",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{n.toLocaleString()}</button>))}
        <button onClick={run} disabled={running} style={{padding:"6px 20px",borderRadius:8,border:"none",background:running?"#1e293b":"linear-gradient(135deg,#3b82f6,#8b5cf6)",color:"#fff",fontSize:13,fontWeight:700,cursor:running?"default":"pointer",fontFamily:"inherit"}}>{running?`${prog}%`:"Run"}</button>
      </div>
      {running&&<div style={{background:"#1e293b",borderRadius:6,height:4,marginBottom:16,overflow:"hidden"}}><div style={{width:`${prog}%`,height:"100%",background:"linear-gradient(90deg,#3b82f6,#8b5cf6)",transition:"width 0.3s"}}/></div>}

      {/* RESULTS */}
      {res&&<>
        <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
          <Card title="Win%" value={`${overall}%`} sub={<Verdict r={overall}/>} color={parseFloat(overall)>=60&&parseFloat(overall)<=75?"#22c55e":"#f59e0b"}/>
          <Card title="Time" value={`${res.avgTimeMin}m`} sub={parseInt(res.avgTimeMin)<=95?<span style={{color:"#22c55e"}}>OK</span>:<span style={{color:"#ef4444"}}>Over!</span>} color={parseInt(res.avgTimeMin)<=95?"#22c55e":"#ef4444"}/>
          <Card title="LOC" value={res.avgLoc} color="#fbbf24"/>
          <Card title="Boss" value={res.avgBossDmg} sub="dmg" color="#f87171"/>
          <Card title="Skills" value={res.avgSkills} color="#a78bfa"/>
        </div>

        {/* Route Timeline */}
        {res.route&&<div style={S.panel}><h2 style={S.h2}>ROUTE TIMELINE</h2>
          <div style={{position:"relative",paddingLeft:38}}>
            <div style={{position:"absolute",left:16,top:4,bottom:4,width:2,background:"#1e293b"}}/>
            {(()=>{let cum=0;const mx=Math.max(...res.route.map(r=>parseFloat(r.avgMin)));return res.route.map((step,i)=>{
              cum+=parseFloat(step.avgMin);const pct=parseFloat(step.avgMin)/mx;
              const iF=step.name.includes("🗡"),iS=step.name.includes("🛒"),iH=step.name.includes("💊"),iB=step.name.includes("👹");
              const dc=iF?"#f59e0b":iS?"#22c55e":iH?"#60a5fa":iB?"#ef4444":"#94a3b8";
              const over=parseFloat(step.avgMin)>6&&iF;
              return(<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,position:"relative"}}>
                <div style={{position:"absolute",left:-24,width:10,height:10,borderRadius:"50%",background:dc,border:"2px solid #0f172a",zIndex:1}}/>
                <div style={{width:34,textAlign:"right",fontSize:10,color:"#64748b",fontWeight:600,flexShrink:0}}>{cum.toFixed(0)}m</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:1}}>
                    <span style={{fontSize:11,color:over?"#ef4444":"#e2e8f0",fontWeight:iB?700:400}}>{step.name}</span>
                    <span style={{fontSize:10,color:over?"#ef4444":"#94a3b8",whiteSpace:"nowrap"}}>{step.avgMin}m{parseFloat(step.avgTurns)>0?` (${step.avgTurns}r)`:""}</span>
                  </div>
                  <div style={{background:"#1e293b",borderRadius:4,height:8,overflow:"hidden"}}><div style={{width:`${Math.max(3,pct*100)}%`,height:"100%",background:dc,borderRadius:4,opacity:0.7}}/></div>
                </div>
              </div>);});})()}
            <div style={{marginTop:10,paddingTop:6,borderTop:"1px dashed #334155",display:"flex",justifyContent:"space-between",fontSize:10}}>
              <span style={{color:"#94a3b8"}}>Total</span><span style={{color:parseInt(res.avgTimeMin)<=95?"#22c55e":"#ef4444",fontWeight:700}}>{res.avgTimeMin}min / 95min</span>
            </div>
          </div>
        </div>}

        {/* Monster Win Rates */}
        <div style={S.panel}><h2 style={S.h2}>MONSTER WIN RATES</h2>
          {[{l:"RANK C (80-90%)",ms:cfg.monsters.filter(m=>m.rank==="C").map(m=>m.name),t:85},
            {l:"RANK B (60-75%)",ms:cfg.monsters.filter(m=>m.rank==="B").map(m=>m.name),t:67},
            {l:"RANK A (40-60%)",ms:cfg.monsters.filter(m=>m.rank==="A").map(m=>m.name),t:50},
            {l:"RANK S (15-30%)",ms:["Duo"],t:22},
          ].map(g=>(<div key={g.l}><div style={{fontSize:10,color:"#475569",marginBottom:6,marginTop:10,fontWeight:600}}>{g.l}</div>
            {g.ms.map(m=>{const d=res.monStats[m];if(!d)return null;return <Bar key={m} label={`${m} (${d.total.toLocaleString()}, ${d.avgTurns}r ≈${d.avgMin}m, TPK ${d.tpkRate}%)`} rate={d.winRate} target={g.t}/>;})}</div>))}
        </div>

        {/* Boss Distribution */}
        <div style={S.panel}><h2 style={S.h2}>BOSS DAMAGE</h2>
          <div style={{display:"flex",height:70,alignItems:"flex-end",gap:1}}>
            {(()=>{const d=res.bossDist.filter(v=>v>0);if(!d.length)return null;const mx=Math.max(...d),mn=Math.min(...d),bk=30,rng=mx-mn||1,bs=rng/bk,cnt=Array(bk).fill(0);d.forEach(v=>{cnt[Math.min(bk-1,Math.floor((v-mn)/bs))]++;});const mc=Math.max(...cnt);return cnt.map((c,i)=><div key={i} style={{flex:1,background:`hsl(${220+i*4},70%,${35+c/mc*35}%)`,height:`${c/mc*100}%`,borderRadius:"2px 2px 0 0",minHeight:c>0?2:0}}/>);})()}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#475569",marginTop:3}}>
            <span>{Math.min(...res.bossDist.filter(v=>v>0))||0}</span>
            <span>med: {(()=>{const s=[...res.bossDist].sort((a,b)=>a-b);return s[Math.floor(s.length/2)]||0;})()}</span>
            <span>{Math.max(...res.bossDist)||0}</span>
          </div>
        </div>

        {/* Recommendations */}
        <div style={S.panel}><h2 style={S.h2}>RECOMMENDATIONS</h2>
          <div style={{fontSize:11,color:"#94a3b8",lineHeight:1.8}}>
            {Object.entries(res.monStats).map(([name,data])=>{const wr=parseFloat(data.winRate);if(isNaN(wr))return null;const rank=monRanks[name]||"C";const[lo,hi]=rankTargets[rank]||[60,75];
              if(wr<lo)return <div key={name} style={{color:"#fbbf24"}}>⚠️ <b>{name}</b> too hard ({wr}%). HP -{Math.ceil((lo-wr)/4)*2} or AC -1</div>;
              if(wr>hi)return <div key={name} style={{color:"#fb923c"}}>⚠️ <b>{name}</b> too easy ({wr}%). HP +{Math.ceil((wr-hi)/4)*2} or AC +1</div>;
              return <div key={name} style={{color:"#4ade80"}}>✅ <b>{name}</b> OK ({wr}%)</div>;})}
            <div style={{borderTop:"1px solid #1e293b",marginTop:8,paddingTop:8}}>
              {parseInt(res.avgTimeMin)>95&&<div style={{color:"#ef4444"}}>🕐 {res.avgTimeMin}min OVER budget!</div>}
              {parseInt(res.avgTimeMin)<=95&&<div style={{color:"#4ade80"}}>🕐 {res.avgTimeMin}min OK</div>}
            </div>
          </div>
        </div>
      </>}
    </div>
  </div>);
}
