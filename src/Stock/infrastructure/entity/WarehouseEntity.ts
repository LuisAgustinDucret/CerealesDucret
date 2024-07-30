import { AutoMap } from '@automapper/classes';
import { Warehouse as IWarehouseEntity } from '@prisma/client';
import WarehouseDetailEntity from './WarehouseDetailEntity';

class WarehouseEntity implements IWarehouseEntity {
  @AutoMap()
  id: number;
  @AutoMap()
  description: string;
  @AutoMap(() => WarehouseDetailEntity)
  warehouseDetails: WarehouseDetailEntity[];
}

export default WarehouseEntity;
