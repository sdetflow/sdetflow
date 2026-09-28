#!/usr/bin/env node
import fs from 'node:fs';
import { parsePlaywrightJson, parseJUnitXml, parseCucumberJson, parseAllureResult, summarizeRun, clusterFailures } from '../dist/index.js';
const args=process.argv.slice(2);const value=(name)=>{const i=args.indexOf(name);return i>=0?args[i+1]:undefined};
if(args.includes('--help')||args.length===0){console.log('Usage: sdetflow-insights --format <playwright|junit|cucumber|allure> --input <file> [--run-id <id>]');process.exit(0)}
const format=value('--format'),file=value('--input'),runId=value('--run-id')??`cli-${Date.now()}`;if(!format||!file)throw new Error('--format and --input are required');const text=fs.readFileSync(file,'utf8');let results;
switch(format){case'playwright':results=parsePlaywrightJson(text,runId);break;case'junit':results=parseJUnitXml(text,runId);break;case'cucumber':results=parseCucumberJson(text,runId);break;case'allure':results=parseAllureResult(JSON.parse(text),runId);break;default:throw new Error(`Unsupported format: ${format}`)}
console.log(JSON.stringify({summary:summarizeRun(results),failureClusters:clusterFailures(results),results},null,2));
