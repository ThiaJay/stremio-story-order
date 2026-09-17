import assert from "node:assert/strict";
import { integrateStoryOrder, verifyIdentityInvariant, upstreamFallbackCandidates } from "./story-order.js";

const regular = (id, season, episode, released, runtime=50, title=`E${episode}`) => ({ id, season, episode, number:episode, released, runtime, title });
const special = (id, title, released, runtime) => ({ id, season:0, episode:1, number:1, released, runtime, title });
const provider = (id, name, airdate, runtime, season, type="significant_special", number=null) => ({ id, name, airdate, runtime, season, type, number });

function byId(result, id){ return result.videos.find(v=>v.id===id); }
function positive(result){ return result.videos.filter(v=>Number(v.season)>0); }
function assertIds(before,result){ assert.equal(verifyIdentityInvariant(before,result.videos),true,"video IDs changed"); }

{
  const videos=[regular("show:1:1",1,1,"2020-01-01",50,"One"),regular("show:1:2",1,2,"2020-01-08",50,"Two"),special("show:0:7","Holiday Story","2020-01-05",55)];
  const eps=[provider(77,"Holiday Story","2020-01-05",55,1)];
  const out=integrateStoryOrder(videos,eps,{order:{profile:"safe"}});
  assert.deepEqual(positive(out).map(v=>v.id),["show:1:1","show:0:7","show:1:2"]);
  assert.equal(byId(out,"show:0:7").episode,2); assertIds(videos,out);
}

{
  const videos=[regular("x:1:1",1,1,"2020-01-01"),special("x:0:2","The Minisode","2020-01-02",5)];
  const eps=[provider(2,"The Minisode","2020-01-02",5,1)];
  const safe=integrateStoryOrder(videos,eps,{order:{shortForm:"exclude"}});
  assert.equal(byId(safe,"x:0:2").season,0);
  const balanced=integrateStoryOrder(videos,eps,{order:{shortForm:"significant"}});
  assert.equal(byId(balanced,"x:0:2").season,1); assertIds(videos,balanced);
}{
  const videos=[regular("n:1:1",1,1,"2020-01-01",45),special("n:0:1","Making of the Series","2020-01-02",60)];
  const eps=[provider(10,"Making of the Series","2020-01-02",60,1)];
  const normal=integrateStoryOrder(videos,eps,{order:{shortForm:"all",includeNonStory:false}});
  assert.equal(byId(normal,"n:0:1").season,0);
  const opted=integrateStoryOrder(videos,eps,{order:{shortForm:"all",includeNonStory:true}});
  assert.equal(byId(opted,"n:0:1").season,1);
}

{
  const videos=[regular("r:2:1",2,1,"2021-01-01",50,"Return"),special("r:0:9","Finale","2021-01-08",50)];
  const eps=[provider(90,"Finale","2021-01-08",50,2,"regular",2)];
  const out=integrateStoryOrder(videos,eps,{order:{providerRegularRepairs:true}});
  assert.equal(byId(out,"r:0:9").season,2); assert.equal(byId(out,"r:0:9").episode,2); assertIds(videos,out);
}

{
  const videos=[regular("jc:5:1",5,1,"2014-02-28",90,"Episode 1"),regular("jc:5:2",5,2,"2014-03-07",90,"Episode 2"),regular("jc:5:3",5,3,"2014-03-14",90,"Episode 3"),special("jc:0:6","Daemons' Roost","2016-12-28",90)];
  const out=integrateStoryOrder(videos,[],{order:{upstreamFallback:true}});
  assert.equal(byId(out,"jc:0:6").season,5); assert.equal(byId(out,"jc:0:6").episode,4);
  assert.equal(out.mode,"upstream-fallback"); assertIds(videos,out);
}

{
  const videos=[regular("f:1:1",1,1,"2020-01-01",50),special("f:0:1","Behind the Scenes","2020-01-02",50),special("f:0:2","Tiny Prequel","2020-01-03",5)];
  assert.deepEqual(upstreamFallbackCandidates(videos).map(v=>v.id),[]);
}{
  const futureDate="2999-01-01";
  const videos=[regular("u:1:1",1,1,"2020-01-01",50),special("u:0:1","Future Special",futureDate,60)];
  const eps=[provider(1,"Future Special",futureDate,60,1)];
  const safe=integrateStoryOrder(videos,eps,{order:{future:"leave"}});
  assert.equal(byId(safe,"u:0:1").season,0);
  const include=integrateStoryOrder(videos,eps,{order:{future:"include"}});
  assert.equal(byId(include,"u:0:1").season,1);
}

{
  const videos=[regular("i:1:1",1,1,"2020-01-01",45),special("i:0:1","Bonus Story","2020-01-02",45)];
  const eps=[provider(2,"Bonus Story","2020-01-02",45,1,"insignificant_special")];
  assert.equal(byId(integrateStoryOrder(videos,eps,{order:{includeInsignificant:false}}),"i:0:1").season,1,"fallback should still include full-length story-like episode");
  const disabledFallback=integrateStoryOrder(videos,eps,{order:{includeInsignificant:false,upstreamFallback:false}});
  assert.equal(byId(disabledFallback,"i:0:1").season,0);
  const opted=integrateStoryOrder(videos,eps,{order:{includeInsignificant:true,upstreamFallback:false}});
  assert.equal(byId(opted,"i:0:1").season,1);
}

{
  const videos=[regular("m:1:1",1,1,"2020-01-01",50,"One"),regular("m:1:2",1,2,"2020-01-08",50,"Two"),special("m:0:3","Tiny Prequel",null,3)];
  const forced=integrateStoryOrder(videos,[],{order:{upstreamFallback:false},override:{include:[{id:"m:0:3",beforeId:"m:1:2"}]}});
  assert.deepEqual(positive(forced).map(v=>v.id),["m:1:1","m:0:3","m:1:2"]); assertIds(videos,forced);
  const excluded=integrateStoryOrder(videos,[provider(3,"Tiny Prequel","2020-01-03",3,1)],{order:{shortForm:"all"},override:{exclude:["m:0:3"]}});
  assert.equal(byId(excluded,"m:0:3").season,0);
}

console.log("PASS: Story Order engine adversarial unit suite");