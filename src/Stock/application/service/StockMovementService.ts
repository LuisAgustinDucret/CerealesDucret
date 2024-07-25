import { Injectable } from '@nestjs/common';
import StockMovement from 'Stock/domain/models/StockMovement';
import { CreateStockMovementDto } from 'Stock/infrastructure/dto/StockMovement/CreateStockMovementDto';
import { StockMovementGenerator } from '../factories/StockMovementGenerator';
import StockMovementRepository from '../repository/StockMovementRepository';

@Injectable()
export default class StockMovementService {
  constructor(
    private readonly repository: StockMovementRepository,
    private readonly movementGenerator: StockMovementGenerator,
  ) {}

  async createStockMovement(
    createStockMovementDto: CreateStockMovementDto,
  ): Promise<StockMovement> {
    const movimiento = this.movementGenerator.createMovement(
      createStockMovementDto,
    );
    return await this.repository.insert(await movimiento.generateMovement());
  }

  async findStockMovementById(stockMovementId: number): Promise<StockMovement> {
    const stockMovement = await this.repository.findById(stockMovementId);
    return stockMovement;
  }

  async fetchAllMovimientosStock(): Promise<StockMovement[]> {
    const stockMovement = await this.repository.findAll();

    return stockMovement;
  }
}
