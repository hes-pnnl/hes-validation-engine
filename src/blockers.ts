// Maps building jsonpath to values mappings that will fail database constraints
const strLength = (val:string, [min, max]:[number, number]) => val.length > max || val.length < min 
    ? `The text length for this value should be between ${min} and ${max}.  Current length is ${val.length}`
    : undefined;

export default {
    '$.address.address': (val:string) => strLength(val, [0, 254]),
    '$.address.city': (val:string) => strLength(val, [0, 40]),
    '$.address.state': (val:string) => strLength(val, [0, 3]),
    '$.address.external_building_id': (val:string) => strLength(val, [0, 254]),
    '$.about.comments': (val:string) => strLength(val, [0, 254])
} as Record<string, (val:any) => string | undefined>;