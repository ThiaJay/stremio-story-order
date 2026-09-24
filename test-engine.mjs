import assert from "node:assert/strict";
import {
  integrateStoryOrder,
  planStoryOrder,
  verifyIdentityInvariant,
  verifyCanonicalVideoCoordinatesInvariant,
  verifyWatchedIdentityOrder,
  watchedIdentityOrder,
  upstreamFallbackCandidates
} from "./story-order.js";

const regular=(id,season,episode,released,runtime=50,title=`E${episode}`)=>({id,season,episode,number:episode,released,runtime,title});
const special=(id,title,released,runtime)=>({id,season:0,episode:1,number:1,released,runtime,title});
const provider=(id,name,airdate,runtime,season,type="significant_special",number=null)=>({id,name,airdate,runtime,season,type,number});

{
  const videos=[
    regular("show:1:1",1,1,"2020-01-01",50,"One"),
    regular("show:1:2",1,2,"2020-01-08",50,"Two"),
    special("show:0:7","Holiday Story","2020-01-05",55)
  ];
  const eps=[provider(77,"Holiday Story","2020-01-05",55,1)];
  const out=integrateStoryOrder(videos,eps,{order:{profile:"safe"}});
  assert.equal(out.mode,"watched-state-safe-passthrough");
  assert.deepEqual(out.videos,videos);
  assert.equal(out.blocked?.[0]?.id,"show:0:7");
  assert.equal(out.blockedReason,"STREMIO_WATCHED_IDENTITY_ORDER_WOULD_CHANGE");
  assert.equal(verifyIdentityInvariant(videos,out.videos),true);
  assert.equal(verifyWatchedIdentityOrder(videos,out.videos),true);
}

{
  const before=[
    special("x:0:1","Special","2020-01-05",50),
    regular("x:1:1",1,1,"2020-01-01",50,"One"),
    regular("x:1:2",1,2,"2020-01-08",50,"Two")
  ];
  const unsafe=[
    regular("x:1:1",1,1,"2020-01-01",50,"One"),
    {...before[0],season:1,episode:2,number:2},
    {...before[2],episode:3,number:3}
  ];
  assert.equal(verifyIdentityInvariant(before,unsafe),true,"IDs alone are insufficient");
  assert.equal(verifyWatchedIdentityOrder(before,unsafe),false,"watched identity order change must be detected");
}

{
  const videos=[
    regular("f:1:1",1,1,"2020-01-01",50),
    special("f:0:1","Behind the Scenes","2020-01-02",50),
    special("f:0:2","Tiny Prequel","2020-01-03",5)
  ];
  assert.deepEqual(upstreamFallbackCandidates(videos).map(v=>v.id),[]);
  const out=integrateStoryOrder(videos,[],{});
  assert.deepEqual(out.videos,videos);
}

{
  const videos=[
    regular("dc:1:1",1,1,"2025-05-05",50,"Power Equals Power"),
    special("dc:0:1",'Episode Insider "Power Equals Power"',"2025-05-06",50),
    special("dc:0:2","Inside The Walking Dead: Dead City Season 2","2025-09-10",50),
    special("dc:0:3","Holiday Story","2025-12-25",50),
    special("dc:0:4","Inside No. 9 Christmas Special","2025-12-26",50)
  ];
  assert.deepEqual(
    upstreamFallbackCandidates(videos).map(v=>v.id),
    ["dc:0:3","dc:0:4"],
    "ancillary Insider/Inside-season material must not be mistaken for narrative specials"
  );
}

{
  const videos=[
    regular("m:1:1",1,1,"2020-01-01",50,"One"),
    regular("m:1:2",1,2,"2020-01-08",50,"Two"),
    special("m:0:3","Tiny Prequel",null,3)
  ];
  const forced=integrateStoryOrder(videos,[],{
    order:{upstreamFallback:false},
    override:{include:[{id:"m:0:3",beforeId:"m:1:2"}]}
  });
  assert.equal(forced.mode,"watched-state-safe-passthrough");
  assert.deepEqual(forced.videos,videos);
  assert.equal(forced.blocked?.[0]?.id,"m:0:3");
}

{
  const videos=[
    regular("u:1:1",1,1,"2020-01-01",50),
    special("u:0:1","Future Special","2999-01-01",60)
  ];
  const eps=[provider(1,"Future Special","2999-01-01",60,1)];
  const safe=integrateStoryOrder(videos,eps,{order:{future:"leave"}});
  assert.deepEqual(safe.videos,videos);
  const include=integrateStoryOrder(videos,eps,{order:{future:"include"}});
  assert.equal(include.mode,"watched-state-safe-passthrough");
  assert.deepEqual(include.videos,videos);
}

{
  const source=[
    special("jc:0:1","Black Canary","1998-12-24",120),
    regular("jc:1:1",1,1,"1997-05-10",120,"The Wrestler's Tomb"),
    regular("jc:1:2",1,2,"1997-05-17",60,"Jack in the Box"),
    regular("jc:2:1",2,1,"1998-01-24",60,"Danse Macabre")
  ];
  const ids=watchedIdentityOrder(source);
  assert.deepEqual(ids,["jc:0:1","jc:1:1","jc:1:2","jc:2:1"]);
  const out=integrateStoryOrder(source,[provider(9,"Black Canary","1998-12-24",120,2)],{});
  assert.equal(out.mode,"watched-state-safe-passthrough");
  assert.deepEqual(watchedIdentityOrder(out.videos),ids);
}

{
  const before=[
    regular("coord:1:1",1,1,"2020-01-01",50,"One"),
    regular("coord:1:2",1,2,"2020-01-08",50,"Two")
  ];
  const sameIdentityOrder=[
    {...before[0],episode:10,number:10},
    {...before[1],episode:20,number:20}
  ];
  assert.equal(verifyIdentityInvariant(before,sameIdentityOrder),true);
  assert.equal(verifyWatchedIdentityOrder(before,sameIdentityOrder),true,"relative watched identity order alone is not a sufficient production guard");
  assert.equal(verifyCanonicalVideoCoordinatesInvariant(before,sameIdentityOrder),false,"canonical episode coordinates must remain immutable in safety mode");
}

{
  const duplicateBefore=[
    regular("dup:1:1",1,1,"2020-01-01",50,"One"),
    regular("dup:1:1",1,2,"2020-01-08",50,"Duplicate")
  ];
  const duplicateAfter=structuredClone(duplicateBefore);
  assert.equal(verifyIdentityInvariant(duplicateBefore,duplicateAfter),false,"duplicate stable IDs make watched identity ambiguous");
  assert.equal(verifyWatchedIdentityOrder(duplicateBefore,duplicateAfter),false);
}

{
  const videos=[
    regular("immutable:1:1",1,1,"2020-01-01",50,"One"),
    regular("immutable:1:2",1,2,"2020-01-08",50,"Two"),
    special("immutable:0:7","Holiday Story","2020-01-05",55)
  ];
  const snapshot=structuredClone(videos);
  const out=integrateStoryOrder(videos,[provider(77,"Holiday Story","2020-01-05",55,1)],{order:{profile:"safe"}});
  assert.deepEqual(videos,snapshot,"ordering analysis must never mutate upstream video metadata");
  assert.deepEqual(out.videos,snapshot,"blocked relocation must return the canonical video array unchanged");
}


{
  const videos=[
    regular("who:1:13",1,13,"2005-06-18",45,"The Parting of the Ways"),
    regular("who:2:1",2,1,"2006-04-15",45,"New Earth"),
    special("who:0:1","The Christmas Invasion","2005-12-25",60),
    special("who:0:2","Episode Insider: Christmas","2005-12-26",60)
  ];
  const plan=planStoryOrder(videos,[
    provider(501,"The Christmas Invasion","2005-12-25",60,1,"significant_special")
  ],{order:{profile:"safe"},nowMs:Date.parse("2006-05-01T00:00:00Z")});
  assert.deepEqual(plan.ids,["who:1:13","who:0:1","who:2:1"]);
  assert.equal(plan.inserted.length,1);
  assert.equal(plan.inserted[0].id,"who:0:1");
  assert.equal(videos.find(v=>v.id==="who:0:1").season,0,"planning must not rewrite canonical Season 0 identity");
}

{
  const videos=[
    regular("short:1:1",1,1,"2020-01-01",50,"One"),
    regular("short:1:2",1,2,"2020-01-08",50,"Two"),
    special("short:0:1","Webisode Prequel","2020-01-05",6)
  ];
  const eps=[provider(601,"Webisode Prequel","2020-01-05",6,1,"significant_special")];
  assert.deepEqual(
    planStoryOrder(videos,eps,{order:{shortForm:"exclude"},nowMs:Date.parse("2021-01-01")}).ids,
    [],
    "Safe-style short-form exclusion must not publish a story hint"
  );
  assert.deepEqual(
    planStoryOrder(videos,eps,{order:{shortForm:"significant"},nowMs:Date.parse("2021-01-01")}).ids,
    ["short:1:1","short:0:1","short:1:2"]
  );
}

{
  const videos=[
    regular("repair:1:1",1,1,"2020-01-01",50,"One"),
    regular("repair:1:3",1,3,"2020-01-15",50,"Three"),
    special("repair:0:2","Two","2020-01-08",50)
  ];
  const eps=[provider(701,"Two","2020-01-08",50,1,"regular",2)];
  const plan=planStoryOrder(videos,eps,{order:{providerRegularRepairs:true},nowMs:Date.parse("2021-01-01")});
  assert.deepEqual(plan.ids,["repair:1:1","repair:0:2","repair:1:3"]);
  assert.equal(plan.inserted[0].source,"provider");
}

{
  const videos=[
    regular("future:1:1",1,1,"2020-01-01",50,"One"),
    regular("future:1:2",1,2,"2020-01-08",50,"Two"),
    special("future:0:1","Future Christmas","2999-12-25",60)
  ];
  const eps=[provider(801,"Future Christmas","2999-12-25",60,1,"significant_special")];
  assert.deepEqual(
    planStoryOrder(videos,eps,{order:{future:"leave"},nowMs:Date.parse("2026-09-24")}).ids,
    [],
    "future narrative material stays out of the current story sequence"
  );
}

{
  const videos=[
    regular("manual:1:1",1,1,"2020-01-01",50,"One"),
    regular("manual:1:2",1,2,"2020-01-08",50,"Two"),
    special("manual:0:9","Feature","2021-12-01",90)
  ];
  const plan=planStoryOrder(videos,[],{
    order:{upstreamFallback:false},
    override:{include:[{id:"manual:0:9",beforeId:"manual:1:2"}]},
    nowMs:Date.parse("2022-01-01")
  });
  assert.deepEqual(plan.ids,["manual:1:1","manual:0:9","manual:1:2"]);
}

{
  const videos=[
    regular("post:1:1",1,1,"2016-01-01",60,"One"),
    regular("post:1:2",1,2,"2016-01-08",60,"Two"),
    special("post:0:1","Daemons' Roost","2016-12-28",90)
  ];
  const plan=planStoryOrder(videos,[],{
    order:{upstreamFallback:true},
    nowMs:Date.parse("2017-01-01")
  });
  assert.deepEqual(plan.ids,["post:1:1","post:1:2","post:0:1"]);
}

console.log("PASS: Story Order expanded narrative regression corpus");

console.log("PASS: Story Order watched-state-safe engine suite");
