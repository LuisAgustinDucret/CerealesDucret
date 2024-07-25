import { Injectable } from '@nestjs/common';
import { Prisma, StockMovementType } from '@prisma/client';
import PrismaClient from 'Base/config/prisma/PrismaClient';
import StockMovement from 'Stock/domain/models/StockMovement';
import StockMovementRepository from 'Stock/application/repository/StockMovementRepository';
import StockMovementEntity from '../entity/StockMovementEntity';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

@Injectable()
export default class StockMovementDataProvider
  implements StockMovementRepository
{
  client: Prisma.StockMovementDelegate<
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation
  >;

  constructor(
    prisma: PrismaClient,
    @InjectMapper() private readonly classMapper: Mapper,
  ) {
    this.client = prisma.stockMovement;
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
}
