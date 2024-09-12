import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import PrismaClient from 'Base/config/prisma/PrismaClient';

import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import WarehouseDetail from 'Stock/domain/models/WarehouseDetail';
import WarehouseDetailEntity from '../entity/WarehouseDetailEntity';
import WarehouseDescriptionAlreadyInUseException from 'Stock/application/exception/WarehouseDescriptionAlreadyInUseException';
import WarehouseDetailRepository from 'Stock/application/repository/WarehouseDetailRepository';
import ProductNotFoundException from 'Stock/application/exception/ProductNotFoundException';

@Injectable()
export default class WarehouseDetailDataProvider
  implements WarehouseDetailRepository
{
  client: Prisma.WarehouseDetailDelegate<
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation
  >;
  transactions: any;
  prisma: PrismaClient;

  constructor(
    prisma: PrismaClient,
    @InjectMapper() private readonly classMapper: Mapper,
  ) {
    this.transactions = prisma.$transaction;
    this.client = prisma.warehouseDetail;
    this.prisma = prisma;
  }
  async findManyByWarehouseIdAndProductsIds(
    idWarehouse: number,
    idsProduct: number[],
  ): Promise<WarehouseDetail[]> {
    const warehouses = await this.client.findMany({
      where: {
        productId: {
          in: idsProduct,
        },
        warehouseId: idWarehouse,
      },
    });
    return this.classMapper.mapArrayAsync(
      warehouses,
      WarehouseDetailEntity,
      WarehouseDetail,
    );
  }

  async findAll(): Promise<WarehouseDetail[]> {
    const warehouses = await this.client.findMany();

    return this.classMapper.mapArrayAsync(
      warehouses,
      WarehouseDetailEntity,
      WarehouseDetail,
    );
  }

  async insert(warehouseDetail: WarehouseDetail): Promise<WarehouseDetail> {
    try {
      const warehouseDetailEntity = await this.client.create({
        data: {
          buyPrice: warehouseDetail.buyPrice,
          quantity: warehouseDetail.quantity,
          product: { connect: { id: warehouseDetail.productId } },
          warehouse: { connect: { id: warehouseDetail.warehouseId } },
        },
      });

      return this.classMapper.mapAsync(
        warehouseDetailEntity,
        WarehouseDetailEntity,
        WarehouseDetail,
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new WarehouseDescriptionAlreadyInUseException();
        }
        throw new Error(error.message);
      }
      throw new Error('Unkwown error');
    }
  }

  async update(
    id: number,
    warehouseDetail: WarehouseDetail,
  ): Promise<WarehouseDetail> {
    try {
      const warehouseDetailEntity = await this.client.update({
        where: { id: id },
        data: {
          quantity: warehouseDetail.quantity,
          product: { connect: { id: warehouseDetail.productId } },
          warehouse: { connect: { id: warehouseDetail.warehouseId } },
        },
      });

      return this.classMapper.mapAsync(
        warehouseDetailEntity,
        WarehouseDetailEntity,
        WarehouseDetail,
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new WarehouseDescriptionAlreadyInUseException();
        }
        throw new Error(error.message);
      }
      throw new Error('Unkwown error');
    }
  }

  async insertMany(warehouseDetail: WarehouseDetail[]): Promise<boolean> {
    try {
      await this.client.createMany({
        data: warehouseDetail,
      });

      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new WarehouseDescriptionAlreadyInUseException();
        }
        throw new Error(error.message);
      }
      throw new Error('Unkwown error');
    }
  }

  async updateMany(warehouseDetail: WarehouseDetail[]): Promise<boolean> {
    try {
      //todo chequear esto
      const updates = warehouseDetail.map((detail) => ({
        data: {
          quantity: detail.quantity,
          buyPrice: detail.buyPrice,
        },
        where: {
          id: detail.id,
        },
      }));

      // warehouseDetailToUpdate.push(
      updates.forEach(async (element) => {
        await this.client.update({
          data: {
            quantity: element.data.quantity,
            buyPrice: element.data.buyPrice,
          },
          where: {
            id: element.where.id,
          },
        });
      });
      // );

      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new WarehouseDescriptionAlreadyInUseException();
        }
        throw new Error(error.message);
      }
      throw new Error('Unkwown error');
    }
  }

  async findById(warehouseDetailId: number): Promise<WarehouseDetail | null> {
    const warehouseEntity = await this.client.findUnique({
      where: { id: warehouseDetailId },
    });
    return this.classMapper.mapAsync(
      warehouseEntity,
      WarehouseDetailEntity,
      WarehouseDetail,
    );
  }

  async findAllByWarehouse(idWarehouse: number): Promise<WarehouseDetail[]> {
    console.log(idWarehouse);
    const warehouses = await this.client.findMany({
      where: { warehouseId: idWarehouse },
    });

    return this.classMapper.mapArrayAsync(
      warehouses,
      WarehouseDetailEntity,
      WarehouseDetail,
    );
  }

  async findAllByProduct(idProduct: number): Promise<WarehouseDetail[]> {
    const warehouses = await this.client.findMany({
      where: { productId: idProduct },
    });

    return this.classMapper.mapArrayAsync(
      warehouses,
      WarehouseDetailEntity,
      WarehouseDetail,
    );
  }

  async updateQuantity(id: number, quantity: number): Promise<WarehouseDetail> {
    try {
      console.log(id);
      const warehouseDetailEntity = await this.client.update({
        where: { id: id },
        data: {
          quantity: { decrement: quantity },
        },
      });

      return this.classMapper.mapAsync(
        warehouseDetailEntity,
        WarehouseDetailEntity,
        WarehouseDetail,
      );
    } catch (error) {
      console.log(error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ProductNotFoundException();
        }
        throw new Error(error.message);
      }
      throw new Error('Unkwown error');
    }
  }
}
