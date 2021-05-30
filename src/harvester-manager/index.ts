import { closest } from "utils";

export default class HarvesterManager {
  private static readonly ROLE = "harvester";
  private controller: StructureController;
  private spawn: StructureSpawn;
  private source: Source;
  private harvesters: Creep[] = [];

  public constructor() {
    const { spawns, creeps } = Game;
    this.spawn = Object.values(spawns).pop() as StructureSpawn;
    this.harvesters = Object.values(creeps).filter(creep => creep.memory.role === HarvesterManager.ROLE);
    this.controller = Object.values(Game.structures).find(
      str => str.structureType === "controller"
    ) as StructureController;

    const sources = Object.values(this.spawn.room.find(FIND_SOURCES));
    const sourceIndex = closest(
      this.spawn.pos,
      sources.map(src => src.pos)
    );
    this.source = sources[sourceIndex];
    this.run();
  }

  private createHarvester(spawn: StructureSpawn) {
    const body = ["work", "carry", "move"] as BodyPartConstant[];
    const name = `${HarvesterManager.ROLE}-${Game.time}`;
    const memory = { role: HarvesterManager.ROLE, room: spawn.room.name, work: "harvest" } as CreepMemory;
    return spawn?.spawnCreep(body, name, { memory });
  }

  private reproduce() {
    const { spawn } = this;
    if (!spawn.spawning) this.createHarvester(spawn);
  }

  private harvest(harvester: Creep) {
    const { source, controller } = this;
    const isFull = harvester.store.getFreeCapacity() === 0;
    const isEmpty = harvester.store.getFreeCapacity() === 50;
    const isUpgrading = () => harvester.memory.work === "upgrade";
    const isHarvesting = () => harvester.memory.work === "harvest";

    if (isFull && isHarvesting()) {
      harvester.memory.work = "upgrade";
    }
    if (isEmpty && isUpgrading()) {
      harvester.memory.work = "harvest";
    }

    if (isUpgrading()) {
      const notInRange = harvester.transfer(controller, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE;
      if (notInRange) harvester.moveTo(controller);
    }
    if (isHarvesting()) {
      const notInRange = harvester.harvest(source) === ERR_NOT_IN_RANGE;
      if (notInRange) harvester.moveTo(source);
    }
  }

  private run() {
    this.reproduce();
    this.harvesters.forEach(this.harvest.bind(this));
    return;
  }
}
