import { Injectable } from '@nestjs/common';
import WarehouseDetail from 'Stock/domain/models/WarehouseDetail';
import WarehouseDetailRepository from '../repository/WarehouseDetailRepository';

@Injectable()
export default class WarehouseDetailService {
  constructor(
    private readonly repository: WarehouseDetailRepository, // private readonly validator: WarehouseDetailValidations,
  ) {}

  async createWarehouseDetail(
    warehouseDetail: WarehouseDetail,
  ): Promise<WarehouseDetail> {
    const warehouseDetailCreated = await this.repository.insert({
      buyPrice: warehouseDetail.buyPrice,
      productId: warehouseDetail.productId,
      warehouseId: warehouseDetail.warehouseId,
      quantity: warehouseDetail.quantity,
      id: warehouseDetail.id,
      lastUpdate: warehouseDetail.lastUpdate,
    });
    return warehouseDetailCreated;
  }

  async updateWarehouse(
    id: number,
    warehouseDetail: WarehouseDetail,
  ): Promise<WarehouseDetail> {
    const warehouseDetailCreated = await this.repository.update(id, {
      buyPrice: warehouseDetail.buyPrice,
      productId: warehouseDetail.productId,
      warehouseId: warehouseDetail.warehouseId,
      quantity: warehouseDetail.quantity,
      lastUpdate: warehouseDetail.lastUpdate,
    });
    return warehouseDetailCreated;
  }

  async findAllByProductId(idProduct: number): Promise<WarehouseDetail[]> {
    const warehousesDetail = await this.repository.findAllByProduct(idProduct);
    return warehousesDetail;
  }

  async findManyByWarehouseId(warehouseId: number): Promise<WarehouseDetail[]> {
    const warehouseDetail = await this.repository.findAllByWarehouse(
      warehouseId,
    );
    return warehouseDetail;
  }

  async updateWarehouseDetailList(
    warehouseDetail: WarehouseDetail[],
  ): Promise<boolean> {
    try {
      const asd = await this.repository.updateMany(warehouseDetail);
      await asd;
      return true;
    } catch (error) {
      return error;
    }
  }

  async createWarehouseDetailList(
    warehouseDetail: WarehouseDetail[],
  ): Promise<boolean> {
    try {
      const warehouseDetailCreated = await this.repository.insertMany(
        warehouseDetail,
      );
      return warehouseDetailCreated;
    } catch (error) {
      throw error;
    }
  }

  async updateQuantity(id: number, quantity: number): Promise<boolean> {
    const updated = await this.repository.updateQuantity(id, quantity);
    return updated;
  }
}
