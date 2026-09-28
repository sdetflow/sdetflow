import type { InsightsSnapshot, NormalizedTestResult } from './types.js';
export interface TextPersistence { read():Promise<string|undefined>; write(text:string):Promise<void>; }
export class JsonlInsightsStore {
  private loaded=false; private rows:NormalizedTestResult[]=[];
  public constructor(private readonly persistence:TextPersistence){}
  private async ensure(){if(this.loaded)return;const text=await this.persistence.read();if(text){for(const line of text.split(/\r?\n/)){if(!line.trim())continue;const parsed:any=JSON.parse(line);if(parsed?.schemaVersion==='1.0'&&Array.isArray(parsed.results))this.rows.push(...parsed.results)}}this.loaded=true}
  public async add(results:NormalizedTestResult[]):Promise<void>{await this.ensure();this.rows.push(...results.map(r=>({...r})));const snap:InsightsSnapshot={schemaVersion:'1.0',results:results.map(r=>({...r}))};const existing=await this.persistence.read();await this.persistence.write(`${existing?.trim()?`${existing.trim()}\n`:''}${JSON.stringify(snap)}\n`)}
  public async all(){await this.ensure();return this.rows.map(r=>({...r}))} public async byTest(id:string){return(await this.all()).filter(r=>r.testId===id)} public async byRun(id:string){return(await this.all()).filter(r=>r.runId===id)}
}
