import { Injectable } from '@nestjs/common';
import { Prisma, StockMovementType } from '@prisma/client';
import PrismaClient from 'Base/config/prisma/PrismaClient';
import StockMovement from 'Stock/domain/models/StockMovement';
import StockMovementRepository from 'Stock/application/repository/StockMovementRepository';
import StockMovementEntity from '../entity/StockMovementEntity';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import StockMovementDetailDataProvider from './StockMovementDetailDataProvider';

@Injectable()
export default class StockMovementDataProvider
  implements StockMovementRepository
{
  client: Prisma.StockMovementDelegate<
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation
  >;
  clientDetail: Prisma.StockMovementDetailDelegate<
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation
  >;
  clientWarehouseDetail: Prisma.StockMovementDetailDelegate<
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation
  >;

  constructor(
    prisma: PrismaClient,
    @InjectMapper() private readonly classMapper: Mapper,
    @InjectMapper()
    private readonly detailDataProvider: StockMovementDetailDataProvider,
  ) {
    this.client = prisma.stockMovement;
    this.clientDetail = prisma.stockMovementDetail;
  }

  async findById(id: number): Promise<StockMovement> {
    const stockMovementEntity = await this.client.findUnique({
      where: { id },
      include: {
        warehouseDestiny: true,
        warehouseOrigin: true,
        stockMovementDetail: { include: { product: true } },
        user: true,
        batch: true,
        aplicator: true,
      },
    });
    return this.classMapper.mapAsync(
      stockMovementEntity,
      StockMovementEntity,
      StockMovement,
    );
  }

  async findAll(): Promise<StockMovement[]> {
    const stockMovementEntities = await this.client.findMany({
      include: {
        warehouseDestiny: true,
        warehouseOrigin: true,
        user: true,
        stockMovementDetail: { include: { product: true } },
      },
    });
    return this.classMapper.mapArrayAsync(
      stockMovementEntities,
      StockMovementEntity,
      StockMovement,
    );
  }

  async updateById(
    id: number,
    partialStockMovement: Partial<StockMovement>,
  ): Promise<StockMovement> {
    // Obtener los productIds de los detalles existentes para manejar la lógica de actualización/creación
    const movement = await this.client.findFirst({
      where: {
        id: id,
      },
      select: {
        stockMovementDetail: { include: { product: true } },
      },
    });

    const existingDetails = movement.stockMovementDetail.map(
      (detail) => detail.id,
    );

    const detailsToUpdate = partialStockMovement.stockMovementDetail.filter(
      (detail) => existingDetails.includes(detail.id),
    );

    const detailsToCreate = partialStockMovement.stockMovementDetail.filter(
      (detail) => !existingDetails.includes(detail.id),
    );
    try {
      //updateamos los existentes
      const updatePromises = detailsToUpdate.map((detail) => {
        return this.clientDetail.update({
          where: { id: detail.id },
          data: {
            buyPrice: detail.buyPrice,
            id: detail.id,
            quantity: detail.quantity,
            productId: detail.productId,
            stockMovementId: id,
          },
        });
      });
      // Espera que todas las promesas se resuelvan
      const updatedDetails = await Promise.all(updatePromises);
      console.log('updated', updatedDetails);

      const createPromises = detailsToCreate.map((detail) => {
        return this.clientDetail.create({
          data: {
            buyPrice: detail.buyPrice,
            quantity: detail.quantity,
            product: { connect: { id: detail.productId } },
            stockMovement: { connect: { id: id } },
          },
        });
      });
      const createdDetails = await Promise.all(createPromises);
    } catch (error) {
      console.log(error);
    }

    return this.classMapper.mapAsync(
      partialStockMovement,
      StockMovementEntity,
      StockMovement,
    );
  }
  catch(error) {
    console.log(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new Error(error.message);
      }
      throw new Error(error.message);
    }
    throw new Error('Unkwown error');
  }

  async insert(stockMovement: StockMovement): Promise<StockMovement> {
    try {
      const stockMovementEntity = await this.client.create({
        data: {
          description: stockMovement.description,
          stockMovementDetail: {
            create: stockMovement.stockMovementDetail,
          },
          movementType: StockMovementType[stockMovement.movementType],
          value: stockMovement.value,
          warehouseDestiny: stockMovement.warehouseDestiny
            ? { connect: { id: stockMovement.warehouseDestiny.id } }
            : undefined,
          warehouseOrigin: stockMovement.warehouseOrigin
            ? { connect: { id: stockMovement.warehouseOrigin.id } }
            : undefined,
          user: { connect: { id: stockMovement.user.id } },
          voucherDescription: stockMovement.voucherDescription,
          batch: stockMovement.batch?.id
            ? { connect: { id: stockMovement.batch.id } }
            : undefined,
          aplicator: stockMovement.aplicator?.id
            ? { connect: { id: stockMovement.aplicator.id } }
            : undefined,
        },
        include: {
          warehouseDestiny: true,
          warehouseOrigin: true,
          stockMovementDetail: true,
          user: true,
        },
      });
      return this.classMapper.mapAsync(
        stockMovementEntity,
        StockMovementEntity,
        StockMovement,
      );
    } catch (error) {
      throw error;
    }
  }
  private async updateWarehouseDetail(
    productQuantity: number,
    editQuantity: number,
    detail,
    stockMovementId: number,
  ) {
    let newQuantity = 0;

    if (productQuantity > editQuantity)
      newQuantity = productQuantity - editQuantity;
    if (productQuantity < editQuantity) {
      newQuantity = editQuantity - productQuantity;
    }

    return await this.clientWarehouseDetail.update({
      where: { id: detail.id },
      data: {
        buyPrice: detail.buyPrice,
        id: detail.id,
        quantity: newQuantity,
        productId: detail.productId,
        stockMovementId: stockMovementId,
      },
    });
  }
}
