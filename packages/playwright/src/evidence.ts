import type { EvidenceBuffer, LocatorTelemetry, RedactionPolicy } from './types.js';
import { redactText } from './redaction.js';
export class EvidenceCollector {
  private readonly buffer:EvidenceBuffer={console:[],network:[],locators:[]};
  public constructor(private readonly maxEntries=200,private readonly redaction:Partial<RedactionPolicy>={}){if(!Number.isInteger(maxEntries)||maxEntries<1)throw new Error('maxEntries must be >= 1')}
  private push(list:string[],value:string){list.push(redactText(value,this.redaction));if(list.length>this.maxEntries)list.splice(0,list.length-this.maxEntries)}
  public console(message:string):void{this.push(this.buffer.console,message)}
  public network(message:string):void{this.push(this.buffer.network,message)}
  public locator(event:LocatorTelemetry):void{this.buffer.locators.push(event);if(this.buffer.locators.length>this.maxEntries)this.buffer.locators.splice(0,this.buffer.locators.length-this.maxEntries)}
  public snapshot():EvidenceBuffer{return{console:[...this.buffer.console],network:[...this.buffer.network],locators:this.buffer.locators.map(e=>({...e,attempts:e.attempts.map(a=>({...a}))}))}}
  public clear():void{this.buffer.console=[];this.buffer.network=[];this.buffer.locators=[]}
}
