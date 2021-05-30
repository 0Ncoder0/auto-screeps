/**
 * 查询路线最短的目标，返回下标值
 * @param origin 起始点
 * @param targets 目标列表
 * @returns index
 */
export const closest = (origin: RoomPosition, targets: RoomPosition[]): number => {
  let cost = -1;
  let target = -1;

  targets.forEach((pos, index) => {
    const c = PathFinder.search(origin, pos).cost;
    const isInit = cost === -1;
    const isLess = c < cost;

    if (isInit || isLess) {
      cost = c;
      target = index;
    }
  });

  return target;
};
