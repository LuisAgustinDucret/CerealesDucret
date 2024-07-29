import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import PrismaClient from 'Base/config/prisma/PrismaClient';

import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import WarehouseRepository from 'Stock/application/repository/WarehouseRepository';
import Warehouse from 'Stock/domain/models/Warehouse';
import WarehouseEntity from '../entity/WarehouseEntity';
import WarehouseDescriptionAlreadyInUseException from 'Stock/application/exception/WarehouseDescriptionAlreadyInUseException';
import WarehouseNotFoundException from 'Stock/application/exception/WarehouseNotFoundException';

@Injectable()
export default class WarehouseDataProvider implements WarehouseRepository {
  client: Prisma.WarehouseDelegate<
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation
  >;

  constructor(
    prisma: PrismaClient,
    @InjectMapper() private readonly classMapper: Mapper,
  ) {
    this.client = prisma.warehouse;
  }

  async findWarehouseByDescription(
    description: string,
  ): Promise<Warehouse | null> {
    const warehouseEntity = await this.client.findUnique({
      where: { description },
    });
    return this.classMapper.mapAsync(
      warehouseEntity,
      WarehouseEntity,
      Warehouse,
    );
  }
  async insert(warehouse: Warehouse): Promise<Warehouse> {
    try {
      const warehouseEntity = await this.client.create({
        data: {
          description: warehouse.description,
        },
      });

      return this.classMapper.mapAsync(
        warehouseEntity,
        WarehouseEntity,
        Warehouse,
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

  async findById(id: number): Promise<Warehouse | null> {
    const warehouseEntity = await this.client.findUnique({
      where: { id },
      include: { warehouseDetails: { include: { product: true } } },
    });
    return this.classMapper.mapAsync(
      warehouseEntity,
      WarehouseEntity,
      Warehouse,
    );
  }

  async findAll(): Promise<Warehouse[]> {
    const warehouses = await this.client.findMany();

    return this.classMapper.mapArrayAsync(
      warehouses,
      WarehouseEntity,
      Warehouse,
    );
  }

  async delete(id: number): Promise<Warehouse> {
    const warehouseEntity = await this.client.delete({ where: { id } });

    return this.classMapper.mapAsync(
      warehouseEntity,
      WarehouseEntity,
      Warehouse,
    );
  }

  async update(
    id: number,
    partialWarehouse: Partial<Warehouse>,
  ): Promise<Warehouse> {
    try {
      const warehouseEntity = await this.client.update({
        data: {
          description: partialWarehouse.description,
        },
        where: {
          id,
        },
      });
      return this.classMapper.mapAsync(
        warehouseEntity,
        WarehouseEntity,
        Warehouse,
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new WarehouseNotFoundException();
        }
        throw new Error(error.message);
      }
      throw new Error('Unkwown error');
    }
  }
}
