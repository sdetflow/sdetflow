package io.sdetflow.api;

import java.util.*;

/** Dependency-free JSON parser used for response assertions. */
public final class Json {
    private Json() {}
    public static Object parse(String input) {
        if (input == null) throw new IllegalArgumentException("JSON input must not be null");
        Parser p = new Parser(input); Object value = p.value(); p.ws(); if (!p.end()) throw new IllegalArgumentException("Trailing JSON content at position " + p.i); return value;
    }
    public static Object path(Object root, String path) {
        if (path == null || path.isBlank() || path.equals("$")) return root;
        String p = path.startsWith("$.") ? path.substring(2) : path.startsWith("$") ? path.substring(1) : path;
        Object current = root;
        for (String token : tokenize(p)) {
            if (current instanceof Map<?,?> map) current = map.get(token);
            else if (current instanceof List<?> list && token.matches("\\d+")) { int idx=Integer.parseInt(token); current=idx>=0&&idx<list.size()?list.get(idx):null; }
            else return null;
        }
        return current;
    }
    private static List<String> tokenize(String p) {
        List<String> out=new ArrayList<>(); StringBuilder b=new StringBuilder();
        for(int i=0;i<p.length();i++){char c=p.charAt(i); if(c=='.'){if(!b.isEmpty()){out.add(b.toString());b.setLength(0);}} else if(c=='['){if(!b.isEmpty()){out.add(b.toString());b.setLength(0);} int end=p.indexOf(']',i); if(end<0)throw new IllegalArgumentException("Invalid JSON path: "+p); String x=p.substring(i+1,end).replace("'","").replace("\"",""); out.add(x); i=end;} else b.append(c);} if(!b.isEmpty())out.add(b.toString()); return out;
    }
    private static final class Parser {
        final String s; int i=0; Parser(String s){this.s=s;} boolean end(){return i>=s.length();} void ws(){while(!end()&&Character.isWhitespace(s.charAt(i)))i++;}
        Object value(){ws();if(end())throw err("Unexpected end");char c=s.charAt(i);if(c=='{')return object();if(c=='[')return array();if(c=='\"')return string();if(c=='t'){literal("true");return true;}if(c=='f'){literal("false");return false;}if(c=='n'){literal("null");return null;}if(c=='-'||Character.isDigit(c))return number();throw err("Unexpected character");}
        Map<String,Object> object(){expect('{');ws();Map<String,Object> m=new LinkedHashMap<>();if(peek('}')){i++;return m;}while(true){ws();String k=string();ws();expect(':');m.put(k,value());ws();if(peek('}')){i++;return m;}expect(',');}}
        List<Object> array(){expect('[');ws();List<Object> l=new ArrayList<>();if(peek(']')){i++;return l;}while(true){l.add(value());ws();if(peek(']')){i++;return l;}expect(',');}}
        String string(){expect('\"');StringBuilder b=new StringBuilder();while(!end()){char c=s.charAt(i++);if(c=='\"')return b.toString();if(c=='\\'){if(end())throw err("Invalid escape");char e=s.charAt(i++);switch(e){case '\"'->b.append('\"');case '\\'->b.append('\\');case '/'->b.append('/');case 'b'->b.append('\b');case 'f'->b.append('\f');case 'n'->b.append('\n');case 'r'->b.append('\r');case 't'->b.append('\t');case 'u'->{if(i+4>s.length())throw err("Invalid unicode escape");b.append((char)Integer.parseInt(s.substring(i,i+4),16));i+=4;}default->throw err("Invalid escape");}}else b.append(c);}throw err("Unterminated string");}
        Number number(){int start=i;if(peek('-'))i++;while(!end()&&Character.isDigit(s.charAt(i)))i++;boolean dec=false;if(!end()&&s.charAt(i)=='.'){dec=true;i++;while(!end()&&Character.isDigit(s.charAt(i)))i++;}if(!end()&&(s.charAt(i)=='e'||s.charAt(i)=='E')){dec=true;i++;if(!end()&&(s.charAt(i)=='+'||s.charAt(i)=='-'))i++;while(!end()&&Character.isDigit(s.charAt(i)))i++;}String n=s.substring(start,i);try{return dec?Double.valueOf(n):Long.valueOf(n);}catch(NumberFormatException e){throw err("Invalid number");}}
        void literal(String x){if(!s.startsWith(x,i))throw err("Invalid literal");i+=x.length();} void expect(char c){ws();if(end()||s.charAt(i)!=c)throw err("Expected '"+c+"'");i++;} boolean peek(char c){return!end()&&s.charAt(i)==c;} IllegalArgumentException err(String m){return new IllegalArgumentException(m+" at position "+i);}
    }
}
