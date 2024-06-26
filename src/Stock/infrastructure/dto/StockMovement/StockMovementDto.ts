import { AutoMap } from '@automapper/classes';
import User from 'Authentication/domain/models/User';
import StockMovementType from 'Stock/domain/models/StockMovementType';
import Warehouse from 'Stock/domain/models/Warehouse';
import StockMovementDetail from 'Stock/domain/models/StockMovementDetail';

export class StockMovementDto {
  @AutoMap()
  value: number;
  @AutoMap()
  id?: number;
  @AutoMap()
  description: string;
  @AutoMap()
  voucherDescription: string;
  @AutoMap()
  movementType: StockMovementType;
  @AutoMap(() => StockMovementDetail)
  stockMovementsDetail: StockMovementDetail[];
  @AutoMap()
  date: Date;
  @AutoMap()
  warehouseOriginId: number;
  @AutoMap(() => Warehouse)
  warehouseOrigin: Warehouse;
  @AutoMap()
  warehouseDestinyId: number;
  @AutoMap(() => Warehouse)
  warehouseDestiny: Warehouse;
  @AutoMap()
  user?: User;
  @AutoMap()
  batchId?: number;
  @AutoMap()
  aplicatorId?: number;
}
