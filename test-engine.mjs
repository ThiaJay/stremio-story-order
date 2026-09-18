import assert from "node:assert/strict";
import {
  integrateStoryOrder,
  verifyIdentityInvariant,
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

console.log("PASS: Story Order watched-state-safe engine suite");
