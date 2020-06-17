import { join } from "https://deno.land/std/path/mod.ts";
import { BufReader } from "https://deno.land/std/io/bufio.ts";
import { parse } from "https://deno.land/std/encoding/csv.ts";

import * as _ from "https://deno.land/x/lodash@4.17.15-es/lodash.js";
import * as log from "https://deno.land/std/log/mod.ts";

interface Planet {
  [ key : string ] : string
};

var planets : Array<Planet>;
export function filterHabitablePlanets(planets : Array<Planet>) {
  return planets.filter((planet) => {
    const planetaryDisposition = planet["koi_disposition"];
    const planetaryRadius = Number(planet["koi_prad"]);
    const stellarMass = Number(planet["koi_smass"]);
    const stellarRadius = Number(planet["koi_srad"]);

    return planetaryDisposition === "CONFIRMED"
      && planetaryRadius > 0.5 && planetaryRadius < 1.5
      && stellarMass > 0.78 && stellarMass < 1.04
      && stellarRadius > 0.99 && stellarRadius < 1.01;
  });
}


async function loadPlanetsData(...rest: any) {
  const path = join(...rest);
  const file = await Deno.open(path);
  const bufReader = new BufReader(file);
  const result = await parse(bufReader, {
    header: true,
    comment: '#'
  });
  Deno.close(file.rid);

  const planets = filterHabitablePlanets(result as Array<Planet>);
  return planets.map((planet: any) => {
    return _.pick(planet, [
      "kepler_name",
      "koi_prad",
      "koi_smass",
      "koi_srad",
      "koi_count",
      "koi_steff"
    ]);
  })
}

planets = await loadPlanetsData("data", "kepler-mission.csv");
log.info(`${planets.length} habitable planets found!`);

export function getAllPlanets() {
  return planets;
}