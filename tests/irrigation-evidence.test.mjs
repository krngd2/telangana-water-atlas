import test from 'node:test';
import assert from 'node:assert/strict';
import {COMMAND_DISTRICTS,WATER_SOURCES,WATER_USES,REPORTED_LIFTS,CHAIN_REFERENCES,EVIDENCE_SOURCES,intakeScenario,cusecsFromTmcPerDay} from '../src/irrigation-evidence.mjs';

test('CWC budget reconciles sources and uses including the unexplained DPR gap',()=>{
  assert.equal(WATER_SOURCES.reduce((s,p)=>s+p[1],0),240);
  assert.equal(WATER_USES.reduce((s,p)=>s+p[1],0),240);
  assert.equal(WATER_USES.find(p=>p[0]==='Unexplained in DPR')[1],3);
  assert.equal(WATER_USES.slice(0,2).reduce((s,p)=>s+p[1],0),169);
});

test('historical intended district acreages reconcile with the I&CAD total',()=>{
  assert.equal(COMMAND_DISTRICTS.reduce((s,d)=>s+d.acres,0),1825700);
  assert.equal(new Set(COMMAND_DISTRICTS.map(d=>d.id)).size,13);
  assert.equal(COMMAND_DISTRICTS.find(d=>d.id==='karimnagar').acres,800);
  assert.ok(COMMAND_DISTRICTS.every(d=>d.acres>0&&d.lat>15&&d.lat<20&&d.lon>77&&d.lon<82));
});

test('illustrative intake model bounds inputs without claiming operational readiness',()=>{
  assert.deepEqual(intakeScenario('93.5'),{level:93.5,delta:0});
  assert.equal(intakeScenario(90).delta,-3.5);
  assert.equal(intakeScenario(99).delta,5.5);
  assert.equal(intakeScenario(Infinity).level,90);
  assert.equal(intakeScenario(-100).level,88);
  assert.equal(intakeScenario(1000).level,100);
  assert.equal(intakeScenario('bad').level,90);
  assert.equal(intakeScenario(95).safeToPump,undefined);
});

test('flow conversion uses seconds per day and reported annual series retains its rounding',()=>{
  assert.ok(Math.abs(cusecsFromTmcPerDay(1)-11574.074074)<0.0001);
  assert.equal(cusecsFromTmcPerDay(0),0);
  assert.ok(Math.abs(REPORTED_LIFTS.reduce((s,r)=>s+r[1],0)-160.72)<1e-8);
});

test('chain references preserve missingness and keep capacity separate from live storage',()=>{
  assert.equal(CHAIN_REFERENCES.at(-1).level-CHAIN_REFERENCES[0].level,518);
  assert.equal(CHAIN_REFERENCES.find(s=>s.name==='Yellampalli').storage,20.175);
  assert.equal(CHAIN_REFERENCES.find(s=>s.name==='Mallanna Sagar').level,557);
  assert.equal(CHAIN_REFERENCES.find(s=>s.name==='Ranganayaka Sagar').level,null);
  for(const s of CHAIN_REFERENCES){
    assert.ok(EVIDENCE_SOURCES[s.source]);
    assert.equal(s.liveStorage,undefined);
    assert.ok(s.level===null||s.level>=100);
  }
});
