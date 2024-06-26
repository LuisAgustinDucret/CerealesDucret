import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import PrismaClient from 'Base/config/prisma/PrismaClient';

import ProductEntity from '../entity/ProductEntity';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import ProductRepository from 'Stock/application/repository/ProductRepository';
import Product from 'Stock/domain/models/Product';
import ProductNotFoundException from 'Stock/application/exception/ProductNotFoundException';

@Injectable()
export default class ProductDataProvider implements ProductRepository {
  client: Prisma.ProductDelegate<
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation
  >;

  constructor(
    prisma: PrismaClient,
    @InjectMapper() private readonly classMapper: Mapper,
  ) {
    this.client = prisma.product;
  }

  async findProductByDescription(description: string): Promise<Product | null> {
    const productEntity = await this.client.findUnique({
      where: { description },
    });
    return this.classMapper.mapAsync(productEntity, ProductEntity, Product);
  }

  async insert(product: Product): Promise<Product> {
    try {
      const productEntity = await this.client.create({
        data: {
          buyPrice: product.buyPrice,
          description: product.description,
          minimumQuantity: product.minimumQuantity,
        },
      });
      return this.classMapper.mapAsync(productEntity, ProductEntity, Product);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(error.message);
      }
      throw new Error('Unkwown error');
    }
  }

  async findById(id: number): Promise<Product | null> {
    const productEntity = await this.client.findUnique({
      where: { id },
    });
    return this.classMapper.mapAsync(productEntity, ProductEntity, Product);
  }

  async findAll(): Promise<Product[]> {
    const products = await this.client.findMany();

    return this.classMapper.mapArrayAsync(products, ProductEntity, Product);
  }

  async delete(id: number): Promise<Product> {
    const productEntity = await this.client.delete({ where: { id } });

    return this.classMapper.mapAsync(productEntity, ProductEntity, Product);
  }

  async update(id: number, partialProduct: Partial<Product>): Promise<Product> {
    try {
      const productEntity = await this.client.update({
        data: {
          buyPrice: partialProduct.buyPrice,
          description: partialProduct.description,
          minimumQuantity: partialProduct.minimumQuantity,
        },
        where: {
          id,
        },
      });
      return this.classMapper.mapAsync(productEntity, ProductEntity, Product);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ProductNotFoundException();
        }
        throw new Error(error.message);
      }
      throw new Error('Unkwown error');
    }
  }

  async validateProductsIds(ids: number[]): Promise<Product[] | null> {
    const productEntity = await this.client.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });

    return this.classMapper.mapArrayAsync(
      productEntity,
      ProductEntity,
      Product,
    );
  }
}
