import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './entities/pet.entity';
import { PetShopItem } from './entities/pet-shop-item.entity';
import { UserPetItem } from './entities/user-pet-item.entity';
import { CreatePetDto } from './dto/create-pet.dto';
import { UseItemDto } from './dto/use-item.dto';
import { PetGateway } from './pet.gateway';

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(Pet)
    private petsRepo: Repository<Pet>,
    @InjectRepository(PetShopItem)
    private shopItemsRepo: Repository<PetShopItem>,
    @InjectRepository(UserPetItem)
    private userItemsRepo: Repository<UserPetItem>,
    @Inject(forwardRef(() => PetGateway))
    private petGateway: PetGateway,
  ) {}

  async getUserPet(userId: string): Promise<Pet | null> {
    const pet = await this.petsRepo.findOne({
      where: { userId, ranAwayAt: null },
    });

    if (pet) {
      // Update stats based on time passed
      await this.updatePetStats(pet);
    }

    return pet;
  }

  async createPet(userId: string, createPetDto: CreatePetDto): Promise<Pet> {
    // Check if user already has a pet
    const existingPet = await this.getUserPet(userId);
    if (existingPet) {
      throw new BadRequestException('User already has a pet');
    }

    const pet = this.petsRepo.create({
      userId,
      ...createPetDto,
      hunger: 100,
      thirst: 100,
      happiness: 100,
      lastFedAt: new Date(),
      lastWateredAt: new Date(),
      lastPlayedAt: new Date(),
    });

    const savedPet = await this.petsRepo.save(pet);
    this.petGateway.notifyPetCreated(userId, savedPet);
    
    return savedPet;
  }

  async feedPet(userId: string): Promise<Pet> {
    const pet = await this.getPetOrThrow(userId);

    pet.hunger = Math.min(100, pet.hunger + 30);
    pet.lastFedAt = new Date();

    const savedPet = await this.petsRepo.save(pet);
    this.petGateway.notifyPetFed(userId, savedPet);
    
    return savedPet;
  }

  async waterPet(userId: string): Promise<Pet> {
    const pet = await this.getPetOrThrow(userId);

    pet.thirst = Math.min(100, pet.thirst + 30);
    pet.lastWateredAt = new Date();

    const savedPet = await this.petsRepo.save(pet);
    this.petGateway.notifyPetWatered(userId, savedPet);
    
    return savedPet;
  }

  async playWithPet(userId: string): Promise<Pet> {
    const pet = await this.getPetOrThrow(userId);

    pet.happiness = Math.min(100, pet.happiness + 20);
    pet.lastPlayedAt = new Date();

    const savedPet = await this.petsRepo.save(pet);
    this.petGateway.notifyPetPlayed(userId, savedPet);
    
    return savedPet;
  }

  async useItemOnPet(userId: string, useItemDto: UseItemDto): Promise<Pet> {
    const pet = await this.getPetOrThrow(userId);

    // Check if user has the item
    const userItem = await this.userItemsRepo.findOne({
      where: { userId, itemId: useItemDto.itemId },
      relations: ['item'],
    });

    if (!userItem || userItem.quantity < 1) {
      throw new BadRequestException('Item not found in inventory');
    }

    // Apply item effects
    pet.hunger = Math.min(100, pet.hunger + userItem.item.statEffectHunger);
    pet.thirst = Math.min(100, pet.thirst + userItem.item.statEffectThirst);
    pet.happiness = Math.min(100, pet.happiness + userItem.item.statEffectHappiness);

    // Remove item if consumable
    if (userItem.item.isConsumable) {
      userItem.quantity -= 1;
      if (userItem.quantity <= 0) {
        await this.userItemsRepo.remove(userItem);
      } else {
        await this.userItemsRepo.save(userItem);
      }
    }

    const savedPet = await this.petsRepo.save(pet);
    this.petGateway.notifyPetItemUsed(userId, savedPet, userItem.item);
    
    return savedPet;
  }

  async getShopItems(): Promise<PetShopItem[]> {
    return this.shopItemsRepo.find();
  }

  async getUserItems(userId: string): Promise<UserPetItem[]> {
    return this.userItemsRepo.find({
      where: { userId },
      relations: ['item'],
    });
  }

  private async getPetOrThrow(userId: string): Promise<Pet> {
    const pet = await this.getUserPet(userId);
    if (!pet) {
      throw new NotFoundException('Pet not found');
    }
    return pet;
  }

  private async updatePetStats(pet: Pet): Promise<void> {
    const now = Date.now();
    const hourInMs = 3600000;

    // Decrease stats over time (1 point per hour)
    const hoursSinceFed = Math.floor(
      (now - new Date(pet.lastFedAt).getTime()) / hourInMs,
    );
    const hoursSinceWatered = Math.floor(
      (now - new Date(pet.lastWateredAt).getTime()) / hourInMs,
    );
    const hoursSincePlayed = Math.floor(
      (now - new Date(pet.lastPlayedAt).getTime()) / hourInMs,
    );

    pet.hunger = Math.max(0, pet.hunger - hoursSinceFed);
    pet.thirst = Math.max(0, pet.thirst - hoursSinceWatered);
    pet.happiness = Math.max(0, pet.happiness - hoursSincePlayed);

    // Check if pet should run away
    const dayInMs = 86400000;
    const maxLastInteraction = Math.max(
      new Date(pet.lastFedAt).getTime(),
      new Date(pet.lastWateredAt).getTime(),
      new Date(pet.lastPlayedAt).getTime(),
    );

    if (
      pet.hunger <= 0 ||
      pet.thirst <= 0 ||
      pet.happiness <= 0 ||
      now - maxLastInteraction > 14 * dayInMs
    ) {
      pet.ranAwayAt = new Date();
      this.petGateway.notifyPetRanAway(pet.userId, pet.id);
    } else {
      this.petGateway.notifyPetStatsUpdate(pet.userId, pet);
    }

    await this.petsRepo.save(pet);
  }
}
