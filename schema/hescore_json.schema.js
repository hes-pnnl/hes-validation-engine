const JSONSchema = require('./_base.schema.js');

// TODO: There is a PR open to make this change to the base schema: https://github.com/NREL/hescore-hpxml/pull/228
//  When that has been merged and hescore_json_schema.js has been updated, we can remove this code.
JSONSchema.properties.address.properties.state.enum = [
    "AA", "AE", "AL", "AK", "AP", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "FM", "GA", "GU", "HI",
    "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MH", "MI", "MN", "MP", "MS", "MO", "MT", "NE",
    "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "PR", "PW", "RI", "SC", "SD", "TN", "TX",
    "UT", "VT", "VA", "WA", "WV", "WI", "WY"
]

/**
 * Assessment type is under PNNL's control, so we don't want NREL to be responsible for validating it.
 */
JSONSchema.properties.about.properties.assessment_type.enum = [
    "initial",
    "final",
    "qa",
    "alternative",
    "test",
    "corrected",
    "mentor",
    "preconstruction"
];

module.exports = JSONSchema;