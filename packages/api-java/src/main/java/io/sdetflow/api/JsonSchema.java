package io.sdetflow.api;

import java.util.*;

/** Lightweight assertion schema for common API contract checks without external dependencies. */
public final class JsonSchema {
    public enum Type { STRING, NUMBER, BOOLEAN, OBJECT, ARRAY, NULL }
    private final Map<String, Type> required = new LinkedHashMap<>();
    public JsonSchema require(String path, Type type) { if(path==null||path.isBlank())throw new IllegalArgumentException("path is required"); required.put(path, Objects.requireNonNull(type)); return this; }
    public List<String> validate(Object root) { List<String> errors=new ArrayList<>(); for(var e:required.entrySet()){Object v=Json.path(root,e.getKey()); if(v==null && e.getValue()!=Type.NULL){errors.add("Missing required path: "+e.getKey()); continue;} if(!matches(v,e.getValue()))errors.add("Expected "+e.getValue()+" at "+e.getKey()+" but was "+(v==null?"null":v.getClass().getSimpleName()));} return errors; }
    private boolean matches(Object v, Type t){return switch(t){case STRING->v instanceof String;case NUMBER->v instanceof Number;case BOOLEAN->v instanceof Boolean;case OBJECT->v instanceof Map;case ARRAY->v instanceof List;case NULL->v==null;};}
}
