import fs from 'fs';
import path from 'path';
import { test, describe, expect } from '@jest/globals';
import { HEScoreJSONSchema } from "../../src/types/HomeEnergyScore.type";
import { validate } from '../../src/home_audit';

const regressions_dir = path.resolve(__dirname, '../buildings');
const regressions:string[] = fs.readdirSync(regressions_dir);

describe('Ensure all regression buildings pass validation', () => {
    regressions.forEach((file) => {
        test(file, () => {
            const building = JSON.parse(fs.readFileSync(`${regressions_dir}/${file}`).toString()).building_unit as HEScoreJSONSchema;
            const r = validate(building);
            expect(r).toStrictEqual({});
        });
    })
});