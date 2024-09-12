import WarehouseService from 'Stock/application/service/WarehouseService';
import { CreateStockMovementDto } from 'Stock/infrastructure/dto/StockMovement/CreateStockMovementDto';
import { AbstractStockMovement } from './AbstractStockMovement';
import StockMovement from 'Stock/domain/models/StockMovement';
import WarehouseDetailService from 'Stock/application/service/WarehouseDetailService';
import WarehouseValidations from 'Stock/application/validations/WarehouseValidations';
import WarehouseDetail from 'Stock/domain/models/WarehouseDetail';
import StockMovementDetail from 'Stock/domain/models/StockMovementDetail';
import ProductService from 'Stock/application/service/ProductService';

export class Buy extends AbstractStockMovement {
  constructor(
    private readonly createStockMovementDto: CreateStockMovementDto,
    private readonly warehouseService: WarehouseService,
    private readonly warehouseDetailService: WarehouseDetailService,
    private readonly productService: ProductService,
    private readonly warehouseValidations: WarehouseValidations,
  ) {
    super(createStockMovementDto);
  }

  public async generateMovement(): Promise<StockMovement> {
    const warehouseDestiny = await this.warehouseService.findWarehouseById(
      this.createStockMovementDto.warehouseDestinyId,
    );
    this.warehouseValidations.validateExistingWarehouse(warehouseDestiny);
    await this.validateProducts();
    await this.updateProductsInWarehouseDetail();

    return new StockMovement(
      this.createStockMovementDto.description,
      this.createStockMovementDto.value,
      this.createStockMovementDto.movementType,
      this.createStockMovementDto.stockMovementDetail,
      this.createStockMovementDto.user,
      null,
      null,
      warehouseDestiny,
    );
  }

  async updateProductsInWarehouseDetail() {
    try {
      const productsInWarehouseId =
        await this.warehouseDetailService.findManyByWarehouseId(
          this.createStockMovementDto.warehouseDestinyId,
        );

      const warehouseDetailToUpdate: WarehouseDetail[] = [];
      const warehouseDetailToCreate: WarehouseDetail[] = [];

      const productMap = new Map(
        productsInWarehouseId.map((product) => [product.productId, product]),
      );

      for (const detail of this.createStockMovementDto.stockMovementDetail) {
        const existingDetail = productMap.get(detail.productId);

        if (existingDetail) {
          const newQuantity = existingDetail.quantity + detail.quantity;
          const updatedDetail: WarehouseDetail = {
            ...existingDetail,
            buyPrice: detail.buyPrice,
            lastUpdate: new Date(),
            quantity: newQuantity,
          };
          warehouseDetailToUpdate.push(updatedDetail);
        } else {
          const newWarehouseDetail = new WarehouseDetail(
            detail.quantity,
            this.createStockMovementDto.warehouseDestinyId,
            detail.buyPrice,
            detail.productId,
            new Date(),
          );
          warehouseDetailToCreate.push(newWarehouseDetail);
        }
      }

      if (warehouseDetailToUpdate.length > 0) {
        this.warehouseDetailService.updateWarehouseDetailList(
          warehouseDetailToUpdate,
        );
      }

      if (warehouseDetailToCreate.length > 0) {
        this.warehouseDetailService.createWarehouseDetailList(
          warehouseDetailToCreate,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async validateProducts() {
    const ids = this.createStockMovementDto.stockMovementDetail.map(
      (detail) => detail.productId,
    );
    const productsDatabase = await this.productService.validateProductsIds(ids);

    this.productService.validateProductsIdsAgainstProductList(
      productsDatabase,
      ids,
    );
  }
}
