import { AutoMap } from '@automapper/classes';
import User from 'Authentication/domain/models/User';
import StockMovementType from 'Stock/domain/models/StockMovementType';
import Warehouse from 'Stock/domain/models/Warehouse';
import StockMovementDetail from 'Stock/domain/models/StockMovementDetail';
import Batch from 'Stock/domain/models/Batch';
import Aplicator from 'Stock/domain/models/Aplicator';

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
  stockMovementDetail: StockMovementDetail[];
  @AutoMap()
  date: Date;
  @AutoMap()
  createdAt: Date;
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
  batch?: Batch;
  @AutoMap()
  aplicatorId?: number;
  @AutoMap()
  aplicator?: Aplicator;
}
