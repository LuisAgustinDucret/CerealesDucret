import User from 'Authentication/domain/models/User';
import StockMovementType from './StockMovementType';
import Warehouse from './Warehouse';
import StockMovementDetail from './StockMovementDetail';
import { AutoMap } from '@automapper/classes';
import Batch from './Batch';
import Aplicator from './Aplicator';

export default class StockMovement {
  @AutoMap()
  description: string;
  @AutoMap()
  voucherDescription: string;
  @AutoMap()
  value: number;
  @AutoMap()
  id?: number;
  @AutoMap()
  user: User;
  @AutoMap()
  warehouseOrigin?: Warehouse;
  @AutoMap()
  warehouseDestiny?: Warehouse;
  @AutoMap()
  MovementType: StockMovementType;
  @AutoMap()
  date: Date;
  @AutoMap(() => StockMovementDetail)
  stockMovementDetail: StockMovementDetail[];
  @AutoMap()
  batch?: Batch;
  @AutoMap()
  aplicator?: Aplicator;

  constructor(
    description: string,
    value: number,
    MovementType: StockMovementType,
    warehouseMovementsDetail: StockMovementDetail[],
    user: User,
    voucherDescription?: string,
    warehouseOrigin?: Warehouse,
    warehouseDestiny?: Warehouse,
    batch?: Batch,
    aplicator?: Aplicator,
    id?: number,
  ) {
    this.description = description;
    this.value = value;
    this.user = user;
    this.warehouseOrigin = warehouseOrigin;
    this.warehouseDestiny = warehouseDestiny;
    this.id = id;
    this.MovementType = MovementType;
    this.stockMovementDetail = warehouseMovementsDetail;
    this.batch = batch;
    this.voucherDescription = voucherDescription;
    this.aplicator = aplicator;
  }
}
