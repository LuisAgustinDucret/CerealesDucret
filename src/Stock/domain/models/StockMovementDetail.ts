import { AutoMap } from '@automapper/classes';
import StockMovement from './StockMovement';
import Product from './Product';

export default class StockMovementDetail {
  @AutoMap()
  id?: number;
  @AutoMap()
  productId: number;
  @AutoMap()
  quantity: number;
  @AutoMap()
  buyPrice: number;
  @AutoMap()
  stockMovementId: number;
  @AutoMap(() => StockMovement)
  stockMovement: StockMovement;
  @AutoMap(() => Product)
  product: Product;

  constructor(
    quantity: number,
    productId: number,
    stockMovementId: number,
    buyPrice: number,
    product?: Product,
    id?: number,
  ) {
    this.quantity = quantity;
    this.id = id;
    this.productId = productId;
    this.buyPrice = buyPrice;
    this.product = product;
    this.stockMovementId = stockMovementId;
  }
}
