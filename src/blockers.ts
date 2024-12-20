// Maps building jsonpath to values mappings that will fail database constraints
const strLengthOptional = (val:string, [min, max]:[number, number]) => val?.length > max || val?.length < min
    ? `The text length for this value should be between ${min} and ${max}.  Current length is ${val.length}`
    : undefined;

const strLengthRequired = (val:string, [min, max]:[number, number]) => val ?
    ((val.length > max || val.length < min)
    ? `The text length for this value should be between ${min} and ${max}.  Current length is ${val.length}`
    : undefined) : `Value is required`;

const addressCheck = (input: string): boolean => /\d/.test(input) && /[a-zA-Z]/.test(input);

export default {
    '$.address.address': (val:string) => strLengthRequired(val, [0, 254]) ?? addressCheck(val),
    '$.address.address2': (val:string) => strLengthOptional(val, [0, 254]),
    '$.address.city': (val:string) => strLengthRequired(val, [0, 40]),
    '$.address.state': (val:string) => strLengthRequired(val, [0, 3]),
    '$.address.external_building_id': (val:string) => strLengthOptional(val, [0, 254]),
    '$.about.comments': (val:string) => strLengthOptional(val, [0, 254])
} as Record<string, (val:any) => string | undefined>;