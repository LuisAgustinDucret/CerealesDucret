import { AutoMap } from '@automapper/classes';
import { WarehouseDetail as IWarehouseDetailEntity } from '@prisma/client';
import ProductEntity from './ProductEntity';

class WarehouseDetailEntity implements IWarehouseDetailEntity {
  @AutoMap()
  id: number;
  @AutoMap()
  productId: number;
  @AutoMap(() => ProductEntity)
  product: ProductEntity;
  @AutoMap()
  warehouseId: number;
  @AutoMap()
  quantity: number;
  @AutoMap()
  buyPrice: number;
  @AutoMap()
  lastUpdate: Date;
}
export default WarehouseDetailEntity;
