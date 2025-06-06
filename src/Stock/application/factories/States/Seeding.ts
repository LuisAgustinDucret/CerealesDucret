import WarehouseService from 'Stock/application/service/WarehouseService';
import { CreateStockMovementDto } from 'Stock/infrastructure/dto/StockMovement/CreateStockMovementDto';
import { AbstractStockMovement } from './AbstractStockMovement';
import StockMovement from 'Stock/domain/models/StockMovement';
import WarehouseDetailService from 'Stock/application/service/WarehouseDetailService';
import WarehouseValidations from 'Stock/application/validations/WarehouseValidations';
import WarehouseDetail from 'Stock/domain/models/WarehouseDetail';
import InsufficientQuantityException from 'Stock/application/exception/InsufficientQuantityException';
import ProductNotFoundToAplicationException from 'Stock/application/exception/ProductNotFoundToAplicationException';
import BatchService from 'Stock/application/service/BatchService';
import AplicatorService from 'Stock/application/service/AplicatorService';

export class Seeding extends AbstractStockMovement {
  warehouseDetailItems: WarehouseDetail[] = [];
  constructor(
    private readonly createStockMovementDto: CreateStockMovementDto,
    private readonly warehouseService: WarehouseService,
    private readonly warehouseDetailService: WarehouseDetailService,
    private readonly batchService: BatchService,
    private readonly aplicatorService: AplicatorService,
    private readonly warehouseValidations: WarehouseValidations,
  ) {
    super(createStockMovementDto);
  }

  public async generateMovement(): Promise<StockMovement> {
    const warehouseOrigin = await this.warehouseService.findWarehouseById(
      this.createStockMovementDto.warehouseOriginId,
    );

    const batch = await this.batchService.findBatchById(
      this.createStockMovementDto.batchId,
    );
    const aplicator = await this.aplicatorService.findAplicatorById(
      this.createStockMovementDto.aplicatorId,
    );
    this.warehouseValidations.validateExistingWarehouse(warehouseOrigin);

    await this.validateProductsInWarehouseDetail();
    await this.updateWarehouseDetail();

    return new StockMovement(
      this.createStockMovementDto.description,
      this.createStockMovementDto.value,
      this.createStockMovementDto.movementType,
      this.createStockMovementDto.stockMovementDetail,
      this.createStockMovementDto.user,
      this.createStockMovementDto.voucherDescription,
      warehouseOrigin,
      null,
      batch,
      aplicator,
    );
  }

  async validateProductsInWarehouseDetail() {
    const stockMovementDetails =
      this.createStockMovementDto.stockMovementDetail;
    this.warehouseDetailItems =
      await this.warehouseDetailService.findManyByWarehouseId(
        this.createStockMovementDto.warehouseOriginId,
      );

    for (const stockDetail of stockMovementDetails) {
      const matchingWarehouseDetail = this.warehouseDetailItems.find(
        (detail) => detail.productId === stockDetail.productId,
      );

      if (!matchingWarehouseDetail) {
        throw new ProductNotFoundToAplicationException();
      }

      if (stockDetail.quantity > matchingWarehouseDetail.quantity) {
        throw new InsufficientQuantityException();
      }
    }
  }

  async updateWarehouseDetail() {
    const productDetails = this.createStockMovementDto.stockMovementDetail.map(
      (detail) => ({
        productId: detail.productId,
        id: this.warehouseDetailItems.find(
          (item) => item.productId === detail.productId,
        )?.id,
        quantity: detail.quantity,
      }),
    );

    // Itera a través de productDetails y actualiza la cantidad para cada elemento
    for (const productDetail of productDetails) {
      if (
        !(await this.warehouseDetailService.updateQuantity(
          productDetail.id,
          productDetail.quantity,
        ))
      )
        throw new ProductNotFoundToAplicationException();
    }
  }
}
